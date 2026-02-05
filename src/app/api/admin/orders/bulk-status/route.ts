import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff, getWorkDate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const bulkStatusUpdateSchema = z.object({
  orderIds: z.array(z.string()).min(1, 'يجب اختيار طلب واحد على الأقل'),
  status: z.string(),
  adminNotes: z.string().optional(),
  workDate: z.string().optional(),
  workOrderNumber: z.string().optional(),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdminOrStaff();

    const body = await request.json();
    const {
      orderIds,
      status,
      adminNotes,
      workDate: clientWorkDate,
      workOrderNumber,
    } = bulkStatusUpdateSchema.parse(body);

    let workDate = getWorkDate(session);
    if (clientWorkDate && (session.user.role === 'ADMIN' || session.user.role === 'STAFF')) {
      try {
        if (clientWorkDate.includes('/')) {
          const dateParts = clientWorkDate.split('/');
          const day = dateParts[0]!;
          const month = dateParts[1]!;
          const year = dateParts[2]!;
          const parsedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (!isNaN(parsedDate.getTime())) {
            workDate = parsedDate;
          }
        }
      } catch (error) {}
    }

    const orders = await prisma.order.findMany({
      where: {
        id: { in: orderIds },
      },
      include: { payment: true },
    });

    if (orders.length !== orderIds.length) {
      return NextResponse.json(
        {
          error: 'بعض الطلبات غير موجودة',
        },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async tx => {
      const updatePromises = orderIds.map(async orderId => {
        const order = orders.find(o => o.id === orderId);
        if (!order) return null;

        const updatedOrder = await tx.order.update({
          where: { id: orderId },
          data: {
            status,
            adminNotes: adminNotes || order.adminNotes,
            ...(workOrderNumber && { workOrderNumber: parseInt(workOrderNumber) }),
          },
        });

        if (status === 'cancelled' && order.payment) {
          await tx.payment.update({
            where: { id: order.payment.id },
            data: {
              status: 'CANCELLED',
              notes: order.payment.notes
                ? `${order.payment.notes}\n\n[تم إلغاء الدفع من قبل الإدارة]`
                : '[تم إلغاء الدفع من قبل الإدارة]',
            },
          });
        }

        if (status === 'delivery') {
          await tx.order.update({
            where: { id: orderId },
            data: { completedAt: workDate },
          });
        }

        if (status === 'settlement' && order.variantId) {
          const estimatedCompletion = new Date(workDate);
          estimatedCompletion.setDate(estimatedCompletion.getDate() + 7);

          await tx.order.update({
            where: { id: orderId },
            data: {
              estimatedCompletionDate: estimatedCompletion,
            },
          });
        }

        return updatedOrder;
      });

      return Promise.all(updatePromises);
    });

    const updatedOrders = result.filter(order => order !== null);

    return NextResponse.json({
      success: true,
      message: `تم تحديث حالة ${updatedOrders.length} طلب بنجاح`,
      updatedCount: updatedOrders.length,
      orders: updatedOrders,
    });
  } catch (error) {
    // console.error('Bulk Status Update Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث حالات الطلبات' }, { status: 500 });
  }
}
