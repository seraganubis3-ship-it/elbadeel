import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(_request: NextRequest) {
  try {
    // البحث عن الطلبات التي لم يتم دفعها خلال 30 دقيقة
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: thirtyMinutesAgo,
        },
      },
      include: {
        payment: true,
      },
    });

    let cancelledCount = 0;

    for (const order of pendingOrders) {
      // التحقق من عدم وجود دفع أو أن الدفع معلق
      if (!order.payment || order.payment.status === 'PENDING') {
        // إلغاء الطلب
        await prisma.order.update({
          where: { id: order.id },
          data: {
            status: 'CANCELLED',
            notes: order.notes
              ? `${order.notes}\n\n[تم إلغاء الطلب تلقائياً - انتهت مهلة الدفع (30 دقيقة)]`
              : '[تم إلغاء الطلب تلقائياً - انتهت مهلة الدفع (30 دقيقة)]',
          },
        });

        // إذا كان هناك دفع معلق، تحديث حالته
        if (order.payment) {
          await prisma.payment.update({
            where: { id: order.payment.id },
            data: {
              status: 'CANCELLED',
              notes: 'تم إلغاء الدفع تلقائياً - انتهت مهلة الدفع',
            },
          });
        }

        cancelledCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم إلغاء ${cancelledCount} طلب تلقائياً`,
      cancelledCount,
      processedAt: new Date().toISOString(),
    });
  } catch (error) {
    //
    return NextResponse.json({ error: 'حدث خطأ أثناء الإلغاء التلقائي' }, { status: 500 });
  }
}

// GET endpoint لفحص الطلبات المؤهلة للإلغاء
export async function GET(request: NextRequest) {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: thirtyMinutesAgo,
        },
      },
      select: {
        id: true,
        createdAt: true,
        customerName: true,
        totalCents: true,
      },
    });

    return NextResponse.json({
      success: true,
      orders: pendingOrders.map(order => ({
        ...order,
        minutesSinceCreation: Math.floor(
          (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60)
        ),
      })),
    });
  } catch (error) {
    //
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الطلبات' }, { status: 500 });
  }
}
