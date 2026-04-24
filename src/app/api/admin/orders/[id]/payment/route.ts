import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff, getWorkDate } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { awardSupervisorPoints } from '@/lib/incentives';

const paymentUpdateSchema = z.object({
  amount: z.number().min(0),
  discount: z.number().min(0).optional(),
  method: z.string(),
  senderPhone: z.string().optional(),
  notes: z.string().optional(),
  workDate: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminOrStaff();
    const { id } = params;
    const body = await request.json();
    const {
      amount,
      discount,
      method,
      senderPhone,
      notes,
      workDate: clientWorkDate,
    } = paymentUpdateSchema.parse(body);

    let workDate = getWorkDate(session);
    if (clientWorkDate && hasPermission(session.user, 'MANAGE_ORDERS')) {
      try {
        if (clientWorkDate.includes('/')) {
          const dateParts = clientWorkDate.split('/');
          if (dateParts.length === 3) {
            const day = dateParts[0]!;
            const month = dateParts[1]!;
            const year = dateParts[2]!;
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

            if (!isNaN(parsedDate.getTime())) {
              workDate = parsedDate;
            }
          }
        }
      } catch (error) {
        // Keep the session work date if the client value is malformed.
      }
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const nextDiscount = discount ?? order.discount ?? 0;
    const promoDiscount = order.discountAmount ?? 0;
    const payableTotal = Math.max(0, order.totalCents - nextDiscount - promoDiscount);

    let newOrderStatus = order.status;
    if (amount >= payableTotal) {
      newOrderStatus = 'paid';
    } else if (amount > 0) {
      newOrderStatus = 'waiting_payment';
    }

    const result = await prisma.$transaction(async tx => {
      const payment = order.payment
        ? await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              amount,
              method,
              senderPhone: senderPhone || null,
              notes: notes || null,
              status: amount > 0 ? 'CONFIRMED' : 'PENDING',
            },
          })
        : await tx.payment.create({
            data: {
              orderId: order.id,
              amount,
              method,
              senderPhone: senderPhone || null,
              notes: notes || null,
              status: amount > 0 ? 'CONFIRMED' : 'PENDING',
              createdAt: workDate,
            },
          });

      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          discount: nextDiscount,
          ...(newOrderStatus !== order.status ? { status: newOrderStatus } : {}),
        },
        select: {
          status: true,
          discount: true,
          discountAmount: true,
          totalCents: true,
        },
      });

      await tx.auditLog.create({
        data: {
          action: 'PAYMENT_UPDATE',
          entityType: 'ORDER',
          entityId: id,
          userId: session.user.id,
          oldValues: JSON.stringify({
            paymentAmount: order.payment?.amount || 0,
            paymentMethod: order.payment?.method || 'لا يوجد',
            paymentStatus: order.payment?.status || 'لا يوجد',
            discount: order.discount || 0,
          }),
          newValues: JSON.stringify({
            paymentAmount: amount,
            paymentMethod: method,
            paymentStatus: amount > 0 ? 'CONFIRMED' : 'PENDING',
            discount: nextDiscount,
            ...(senderPhone ? { senderPhone } : {}),
            ...(notes ? { paymentNotes: notes } : {}),
          }),
        },
      });

      return { payment, order: updatedOrder };
    });

    // 🏆 منح نقاط المشرف عند تسديد الدفع
    try {
      await awardSupervisorPoints({
        userId: session.user.id,
        actionType: 'PAYMENT_SETTLED',
        orderId: id,
        description: `تأكيد وتسديد مبلغ مالى (${(amount / 100).toFixed(2)} ج.م)`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'تم تحديث معلومات الدفع بنجاح',
      payment: result.payment,
      order: {
        ...result.order,
        paidAmount: result.payment.amount,
        remainingAmount: Math.max(
          0,
          result.order.totalCents -
            (result.order.discount || 0) -
            (result.order.discountAmount || 0) -
            result.payment.amount
        ),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث معلومات الدفع' }, { status: 500 });
  }
}
