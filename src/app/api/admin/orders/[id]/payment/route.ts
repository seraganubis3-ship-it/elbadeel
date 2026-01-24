import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, getWorkDate } from '@/lib/auth';
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
    // Check authentication and admin role
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const {
      amount,
      method,
      senderPhone,
      notes,
      workDate: clientWorkDate,
    } = paymentUpdateSchema.parse(body);

    // Get work date for admin
    let workDate = getWorkDate(session);
    if (clientWorkDate && session.user.role === 'ADMIN') {
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
