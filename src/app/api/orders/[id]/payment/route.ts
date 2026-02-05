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

    const formData = await request.formData();
    const method = formData.get('method') as 'VODAFONE_CASH' | 'INSTA_PAY';
    const senderPhone = formData.get('senderPhone') as string;
    const file = formData.get('screenshot') as File | null;

    // Validate textual data
    paymentSchema.parse({ method, senderPhone });

    let screenshotPath = null;

    // Handle File Upload
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const filename = `payment-${id}-${uniqueSuffix}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
      const uploadDir = join(process.cwd(), 'public', 'uploads', 'payments');
      
      await mkdir(uploadDir, { recursive: true });
      await writeFile(join(uploadDir, filename), buffer);
      
      screenshotPath = `/uploads/payments/${filename}`;

      // Create OrderDocument for the receipt
      await prisma.orderDocument.create({
        data: {
          orderId: id,
          fileName: `إيصال دفع - ${method === 'VODAFONE_CASH' ? 'فودافون' : 'انستا'}`,
          filePath: screenshotPath,
          fileSize: file.size,
          fileType: file.type || 'image/jpeg',
          documentType: 'PAYMENT_RECEIPT',
        },
      });
    }

    // Create or update payment
    const payment = await prisma.payment.upsert({
      where: { orderId: id },
      update: {
        method,
        senderPhone,
        paymentScreenshot: screenshotPath,
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
        paymentScreenshot: screenshotPath,
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
