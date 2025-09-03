import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // التحقق من API key (اختياري للأمان)
    const apiKey = request.headers.get('x-api-key');
    if (apiKey !== process.env.CRON_API_KEY) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // البحث عن الطلبات التي لم يتم دفعها خلال 30 دقيقة
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    
    const pendingOrders = await prisma.order.findMany({
      where: {
        status: "PENDING",
        createdAt: {
          lt: thirtyMinutesAgo
        }
      },
      include: {
        payment: true
      }
    });

    let cancelledCount = 0;
    const cancelledOrders = [];

    for (const order of pendingOrders) {
      // التحقق من عدم وجود دفع مكتمل
      if (!order.payment || order.payment.status === "PENDING") {
        // إلغاء الطلب
        await prisma.order.update({
          where: { id: order.id },
          data: { 
            status: "CANCELLED",
            notes: order.notes ? `${order.notes}\n\n[تم إلغاء الطلب تلقائياً - انتهت مهلة الدفع (30 دقيقة)]` : "[تم إلغاء الطلب تلقائياً - انتهت مهلة الدفع (30 دقيقة)]"
          }
        });

        // إذا كان هناك دفع معلق، تحديث حالته
        if (order.payment) {
          await prisma.payment.update({
            where: { id: order.payment.id },
            data: { 
              status: "CANCELLED",
              notes: "تم إلغاء الدفع تلقائياً - انتهت مهلة الدفع"
            }
          });
        }

        cancelledCount++;
        cancelledOrders.push({
          id: order.id,
          customerName: order.customerName,
          totalAmount: (order.totalCents / 100).toFixed(2),
          createdAt: order.createdAt,
          cancelledAt: new Date()
        });

        console.log(`Order ${order.id} auto-cancelled due to payment timeout`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `تم إلغاء ${cancelledCount} طلب تلقائياً`,
      cancelledCount,
      cancelledOrders,
      processedAt: new Date().toISOString(),
      nextRun: new Date(Date.now() + 5 * 60 * 1000).toISOString() // التالي خلال 5 دقائق
    });

  } catch (error) {
    console.error("Auto-cancel cron job error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء الإلغاء التلقائي" },
      { status: 500 }
    );
  }
}

// POST endpoint للاختبار
export async function POST(request: NextRequest) {
  return GET(request);
}
