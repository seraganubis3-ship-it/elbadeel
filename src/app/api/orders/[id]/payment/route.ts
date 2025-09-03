import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const paymentSchema = z.object({
  method: z.enum(["VODAFONE_CASH", "INSTA_PAY"]),
  senderPhone: z.string().min(11, "رقم الهاتف يجب أن يكون 11 رقم على الأقل"),
  paymentScreenshot: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { service: true, variant: true },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // Check if user owns this order
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذا الطلب" }, { status: 403 });
    }

    // Check if order is pending
    if (order.status !== "PENDING") {
      return NextResponse.json({ error: "لا يمكن الدفع لهذا الطلب" }, { status: 400 });
    }

    // Parse request body
    const body = await request.json();
    const { method, senderPhone, paymentScreenshot } = paymentSchema.parse(body);

    // Create or update payment
    const payment = await prisma.payment.upsert({
      where: { orderId: id },
      update: {
        method,
        senderPhone,
        paymentScreenshot,
        status: "PENDING",
        updatedAt: new Date(),
      },
      create: {
        orderId: id,
        amount: order.totalCents,
        currency: "EGP",
        method,
        status: "PENDING",
        senderPhone,
        paymentScreenshot,
      },
    });

    // Update order status
    await prisma.order.update({
      where: { id },
      data: { status: "PAYMENT_PENDING" },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      message: "تم إرسال بيانات الدفع بنجاح",
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    console.error("Payment error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الدفع" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Get order with payment
    const order = await prisma.order.findUnique({
      where: { id },
      include: { 
        service: true, 
        variant: true,
        payment: true 
      },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // Check if user owns this order
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذا الطلب" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        totalCents: order.totalCents,
        deliveryType: order.deliveryType,
        deliveryFee: order.deliveryFee,
        service: order.service,
        variant: order.variant,
        payment: order.payment,
      },
    });

  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء جلب بيانات الطلب" },
      { status: 500 }
    );
  }
}
