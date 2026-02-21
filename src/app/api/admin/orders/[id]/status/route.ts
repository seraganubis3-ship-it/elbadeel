import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff, getWorkDate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const statusUpdateSchema = z.object({
  status: z.string(),
  adminNotes: z.string().optional(),
  workDate: z.string().optional(),
  workOrderNumber: z.string().optional(),
  statusReason: z.string().optional(),
});

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminOrStaff();
    const { id } = params;
    const body = await request.json();
    const {
      status,
      adminNotes,
      workDate: clientWorkDate,
      workOrderNumber,
      statusReason,
    } = statusUpdateSchema.parse(body);

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

    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: {
        status,
        adminNotes: adminNotes || order.adminNotes,
        ...(workOrderNumber && { workOrderNumber: parseInt(workOrderNumber) }),
        ...((status === 'settlement' || status === 'returned') && statusReason !== undefined
          ? { statusReason }
          : {}),
      },
      include: {
        service: {
          select: {
            name: true,
            slug: true,
          },
        },
        variant: {
          select: {
            name: true,
            priceCents: true,
            etaDays: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        payment: true,
        formSerials: {
          include: {
            formType: true,
          },
        },
      },
    });

    if (status === 'cancelled' && order.payment) {
      await prisma.payment.update({
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
      await prisma.order.update({
        where: { id },
        data: { completedAt: workDate },
      });
    }

    if (status === 'settlement') {
      const orderWithVariant = await prisma.order.findUnique({
        where: { id },
        include: { variant: true },
      });

      if (orderWithVariant?.variant?.etaDays) {
        const estimatedCompletion = new Date(workDate);
        estimatedCompletion.setDate(
          estimatedCompletion.getDate() + orderWithVariant.variant.etaDays
        );

        await prisma.order.update({
          where: { id },
          data: {
            estimatedCompletionDate: estimatedCompletion,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث حالة الطلب بنجاح',
      order: updatedOrder,
    });
  } catch (error) {
    // console.error('Status Update Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث حالة الطلب' }, { status: 500 });
  }
}
