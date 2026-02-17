import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

const paymentSchema = z.object({
  method: z.enum(['VODAFONE_CASH', 'INSTA_PAY']),
  senderPhone: z.string().min(11, 'رقم الهاتف يجب أن يكون 11 رقم على الأقل'),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { service: true, variant: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذا الطلب' }, { status: 403 });
    }

    if (order.status !== 'waiting_payment') {
      return NextResponse.json({ error: 'لا يمكن الدفع لهذا الطلب' }, { status: 400 });
    }

    const body = await request.json();
    const { method, senderPhone, paymentScreenshot, fileSize, fileType } = body;

    // Validate textual data
    paymentSchema.parse({ method, senderPhone });

    // Handle Payment Screenshot (Already uploaded to B2 via client)
    if (paymentScreenshot) {
      // Create Document record for the receipt
      await prisma.document.create({
        data: {
          orderId: id,
          fileName: `payment_${method}_${Date.now()}.jpg`, // Construct a name that implies type if needed, or just descriptive
          filePath: paymentScreenshot,
          fileSize: fileSize || 0,
          fileType: fileType || 'image/jpeg',
          // Document model doesn't have documentType, but we can infer or just accept it's a doc.
          // To mimic the 'PAYMENT_RECEIPT' logic, we might need to rely on filename convention if we use that inference.
          // The inference uses LastIndexOf('_'). 'payment_VODAFONE_CASH_123.jpg' -> 'payment_VODAFONE_CASH'.
          // Or just 'payment_receipt_123.jpg'.
        },
      });
    }

    // Create or update payment
    const payment = await prisma.payment.upsert({
      where: { orderId: id },
      update: {
        method,
        senderPhone,
        paymentScreenshot: paymentScreenshot || null,
        status: 'PENDING',
        updatedAt: new Date(),
      },
      create: {
        orderId: id,
        amount: order.totalCents,
        currency: 'EGP',
        method,
        status: 'PENDING',
        senderPhone,
        paymentScreenshot: paymentScreenshot || null,
      },
    });

    await prisma.order.update({
      where: { id },
      data: { status: 'payment_review' },
    });

    return NextResponse.json({
      success: true,
      paymentId: payment.id,
      message: 'تم إرسال بيانات الدفع بنجاح',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      );
    }
    // console.error('Payment Error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء معالجة الدفع' }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    const { id } = params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { service: true, variant: true, payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذا الطلب' }, { status: 403 });
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
  } catch {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب بيانات الطلب' }, { status: 500 });
  }
}
