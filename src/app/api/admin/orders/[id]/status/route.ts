import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff, getWorkDate } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { checkWhatsAppStatus, sendWhatsAppByTrigger } from '@/lib/whatsapp';
import { logger } from '@/lib/logger';

const statusUpdateSchema = z.object({
  status: z.string(),
  adminNotes: z.string().optional(),
  workDate: z.string().optional(),
  workOrderNumber: z.string().optional(),
  statusReason: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const tStart = performance.now();
  const { id } = params;

  try {
    const tAuthStart = performance.now();
    const session = await requireAdminOrStaff({ skipDB: true });
    const tAuthEnd = performance.now();

    const body = await request.json();
    const {
      status,
      adminNotes,
      workDate: clientWorkDate,
      workOrderNumber,
      statusReason,
    } = statusUpdateSchema.parse(body);

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

    const tFetchStart = performance.now();
    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        adminNotes: true,
        payment: { select: { id: true, notes: true } },
        variant: { select: { etaDays: true } },
      },
    });
    const tFetchEnd = performance.now();

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const tUpdateStart = performance.now();
    const updateData: any = {
      status,
      adminNotes: adminNotes || order.adminNotes,
      updatedAt: new Date(),
    };

    if (order.status === 'settlement' && status === 'processing') {
      updateData.workOrderNumber = null;
    } else if (workOrderNumber) {
      updateData.workOrderNumber = workOrderNumber;
    }

    if (['fulfillment', 'returned', 'settlement'].includes(status) && statusReason !== undefined) {
      updateData.statusReason = statusReason;
    }

    if (status === 'delivered') {
      updateData.completedAt = workDate;
    }

    if (status === 'settlement') {
      updateData.photographyDate = new Date();

      if (order.variant?.etaDays) {
        const estimatedCompletion = new Date(); // Use current date for estimation base
        estimatedCompletion.setDate(estimatedCompletion.getDate() + order.variant.etaDays);
        updateData.estimatedCompletionDate = estimatedCompletion;
      }
    }

    // Use transaction to ensure data consistency
    const updatedOrder = await prisma.$transaction(async tx => {
      // 1. Update Payment if cancelled
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

      // 2. Release any consumed form serials when the order is finally cancelled.
      if (status === 'cancelled') {
        await tx.formSerial.updateMany({
          where: { orderId: id },
          data: {
            orderId: null,
            consumed: false,
            consumedAt: null,
            consumedByAdminId: null,
          },
        });
      }

      // 3. Create Status History Log
      // We log the change regardless of whether the status value is different,
      // as it might involve note updates or re-confirmation of status.
      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          status: status,
          changedBy: session.user.id,
          changedAt: new Date(),
        },
      });

      // 4. Create Audit Log for status change
      await tx.auditLog.create({
        data: {
          action: 'STATUS_CHANGE',
          entityType: 'ORDER',
          entityId: id,
          userId: session.user.id,
          oldValues: JSON.stringify({ status: order.status }),
          newValues: JSON.stringify({
            status,
            ...(workOrderNumber ? { workOrderNumber } : {}),
            ...(statusReason ? { statusReason } : {}),
          }),
        },
      });

      // 5. Update Order
      return await tx.order.update({
        where: { id },
        data: updateData,
        include: {
          service: { select: { name: true } },
          variant: { select: { name: true } },
          user: { select: { phone: true } },
          payment: { select: { amount: true, status: true } },
        },
      });
    });

    // 📱 إرسال رسالة واتساب للعميل عند تغيير الحالة
    try {
      const whatsappStatus = await checkWhatsAppStatus();
      if (
        whatsappStatus.status === 'connected' &&
        updatedOrder.customerPhone &&
        updatedOrder.customerPhone !== 'Unknown'
      ) {
        // Trigger generic status template: STATUS_{status}
        await sendWhatsAppByTrigger(`STATUS_${status}`, updatedOrder);
      }
    } catch (err) {
      // console.log('Updating order status', params.id, body.status)
    }

    const tUpdateEnd = performance.now();

    const tTotal = performance.now() - tStart;
    logger.debug('Order status update perf', {
      id,
      totalMs: Number(tTotal.toFixed(2)),
      authMs: Number((tAuthEnd - tAuthStart).toFixed(2)),
      prepMs: Number((tPrepEnd - tPrepStart).toFixed(2)),
      fetchMs: Number((tFetchEnd - tFetchStart).toFixed(2)),
      updateMs: Number((tUpdateEnd - tUpdateStart).toFixed(2)),
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      order: updatedOrder,
    });
  } catch (error) {
    const tError = performance.now() - tStart;
    logger.error('Order status update error', error, {
      id,
      totalMs: Number(tError.toFixed(2)),
    });
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث حالة الطلب' }, { status: 500 });
  }
}
