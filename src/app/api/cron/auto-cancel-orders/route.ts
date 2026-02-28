import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyCronRequest } from '@/lib/cron-auth';

interface CancelledOrderInfo {
  id: string;
  customerName: string;
  totalAmount: string;
  createdAt: Date;
  cancelledAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const auth = verifyCronRequest(request);
    if (!auth.isValid) {
      return NextResponse.json(
        { error: auth.error || 'غير مصرح' },
        { status: 401 }
      );
    }

    // البحث عن الطلبات التي لم يتم دفعها خلال 30 دقيقة
    const thirtyMinutesAgo = new Date(Date.now() - 600 * 60 * 1000);

    const pendingOrders = await prisma.order.findMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: thirtyMinutesAgo,
        },
        // استثناء الطلبات التي أنشأها الأدمن لأنها قد تكون مؤرخة بتاريخ عمل قديم
        createdByAdminId: null,
      },
      include: {
        payment: true,
      },
    });

    let cancelledCount = 0;
    const cancelledOrders: CancelledOrderInfo[] = [];

    for (const order of pendingOrders) {
      // التحقق من عدم وجود دفع مكتمل
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
        cancelledOrders.push({
          id: order.id,
          customerName: order.customerName,
          totalAmount: (order.totalCents / 100).toFixed(2),
          createdAt: order.createdAt,
          cancelledAt: new Date(),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم إلغاء ${cancelledCount} طلب تلقائياً`,
      cancelledCount,
      cancelledOrders,
      processedAt: new Date().toISOString(),
      nextRun: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // التالي خلال 5 دقائق
    });
  } catch (error) {
    //
    return NextResponse.json({ error: 'حدث خطأ أثناء الإلغاء التلقائي' }, { status: 500 });
  }
}

// POST endpoint للاختبار
export async function POST(request: NextRequest) {
  return GET(request);
}
