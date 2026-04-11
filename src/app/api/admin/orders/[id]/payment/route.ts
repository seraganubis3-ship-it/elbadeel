import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdminOrStaff, getWorkDate } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const paymentUpdateSchema = z.object({
  amount: z.number().min(0),
  method: z.string(),
  senderPhone: z.string().optional(),
  notes: z.string().optional(),
  workDate: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and staff permissions
    const session = await requireAdminOrStaff();

    const { id } = params;
    const body = await request.json();
    const {
      amount,
      method,
      senderPhone,
      notes,
      workDate: clientWorkDate,
    } = paymentUpdateSchema.parse(body);

    // معالجة تاريخ العمل
    let workDate = getWorkDate(session);
    if (clientWorkDate && hasPermission(session.user, 'MANAGE_ORDERS')) {
      try {
        // تحويل من DD/MM/YYYY إلى Date
        if (clientWorkDate.includes('/')) {
          const dateParts = clientWorkDate.split('/');
          if (dateParts.length === 3) {
            const day = dateParts[0]!;
            const month = dateParts[1]!;
            const year = dateParts[2]!;
            const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));

            // التحقق من صحة التاريخ
            if (!isNaN(parsedDate.getTime())) {
              workDate = parsedDate;
            }
          }
        }
      } catch (error) {
        // استخدم workDate الافتراضي في حالة الخطأ
      }
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    let payment;

    if (order.payment) {
      // Update existing payment
      payment = await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          amount,
          method,
          senderPhone: senderPhone || null,
          notes: notes || null,
          status: amount > 0 ? 'CONFIRMED' : 'PENDING',
        },
      });
    } else {
      // Create new payment
      payment = await prisma.payment.create({
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
    }

    // Update order status based on payment
    let newOrderStatus = order.status;
    if (amount >= order.totalCents) {
      newOrderStatus = 'paid';
    } else if (amount > 0) {
      newOrderStatus = 'waiting_payment';
    }

    if (newOrderStatus !== order.status) {
      await prisma.order.update({
        where: { id },
        data: { status: newOrderStatus },
      });
    }

    // Create Audit Log for payment change
    await prisma.auditLog.create({
      data: {
        action: 'PAYMENT_UPDATE',
        entityType: 'ORDER',
        entityId: id,
        userId: session.user.id,
        oldValues: JSON.stringify({
          paymentAmount: order.payment?.amount || 0,
          paymentMethod: order.payment?.method || 'لا يوجد',
          paymentStatus: order.payment?.status || 'لا يوجد',
        }),
        newValues: JSON.stringify({
          paymentAmount: amount,
          paymentMethod: method,
          paymentStatus: amount > 0 ? 'CONFIRMED' : 'PENDING',
          ...(senderPhone ? { senderPhone } : {}),
          ...(notes ? { paymentNotes: notes } : {}),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث معلومات الدفع بنجاح',
      payment,
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
