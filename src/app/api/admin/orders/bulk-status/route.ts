import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff, getWorkDate } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
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
  const tStart = performance.now();
  try {
    const tAuthStart = performance.now();
    const session = await requireAdminOrStaff({ skipDB: true });
    const tAuthEnd = performance.now();

    const body = await request.json();
    const {
      orderIds,
      status,
      adminNotes,
      workDate: clientWorkDate,
      workOrderNumber,
    } = bulkStatusUpdateSchema.parse(body);

    const tPrepStart = performance.now();
    let workDate = getWorkDate(session);
    if (clientWorkDate && hasPermission(session.user, 'MANAGE_ORDERS')) {
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
    const tPrepEnd = performance.now();

    const tDbStart = performance.now();
    const result = await prisma.$transaction(async tx => {
      const orders = await tx.order.findMany({
        where: { id: { in: orderIds } },
        select: {
          id: true,
          adminNotes: true,
          payment: { select: { id: true, notes: true } },
          variant: { select: { etaDays: true } },
        },
      });

      if (orders.length !== orderIds.length) {
        throw new Error('Some orders were not found');
      }

      const updatePromises = orders.map(async order => {
        const updateData: any = {
          status,
          adminNotes: adminNotes || order.adminNotes,
          updatedAt: new Date(),
        };

        if (workOrderNumber) updateData.workOrderNumber = workOrderNumber;

        if (status === 'delivery') {
          updateData.completedAt = workDate;
        }

        if (status === 'settlement') {
          const etaDays = order.variant?.etaDays || 7;
          const estimatedCompletion = new Date(workDate);
          estimatedCompletion.setDate(estimatedCompletion.getDate() + etaDays);
          updateData.estimatedCompletionDate = estimatedCompletion;
        }

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

        return await tx.order.update({
          where: { id: order.id },
          data: updateData,
          select: { id: true, status: true },
        });
      });

      return Promise.all(updatePromises);
    });
    const tDbEnd = performance.now();

    const tTotal = performance.now() - tStart;
    console.log(`[PERF] Bulk status update for ${orderIds.length} orders: Total=${tTotal.toFixed(2)}ms, Auth=${(tAuthEnd-tAuthStart).toFixed(2)}ms, Prep=${(tPrepEnd-tPrepStart).toFixed(2)}ms, DB=${(tDbEnd-tDbStart).toFixed(2)}ms`);

    const updatedOrders = result.filter(order => order !== null);

    return NextResponse.json({
      success: true,
      message: `تم تحديث حالة ${updatedOrders.length} طلب بنجاح`,
      updatedCount: updatedOrders.length,
      orders: updatedOrders,
    });
  } catch (error) {
    const tError = performance.now() - tStart;
    console.error(`[PERF] Bulk status ERROR after ${tError.toFixed(2)}ms:`, error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث حالات الطلبات' }, { status: 500 });
  }
}
