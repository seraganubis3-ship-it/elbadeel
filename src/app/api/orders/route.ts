import { NextRequest, NextResponse } from 'next/server';
import { getSession, requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { generateOrderNumber } from '@/lib/orderNumbering';
import {
  checkWhatsAppStatus,
  sendWhatsAppMessage,
  NotificationTemplates,
  sendWhatsAppByTrigger,
} from '@/lib/whatsapp';
import { logger } from '@/lib/logger';
import { hash } from 'bcryptjs';

import { s3Client } from '@/lib/s3';
import { Upload } from '@aws-sdk/lib-storage';

export const dynamic = 'force-dynamic';

const MAX_TOTAL_UPLOAD_MB = 20;
const MAX_TOTAL_UPLOAD_BYTES = MAX_TOTAL_UPLOAD_MB * 1024 * 1024;

const getOrderCreationErrorResponse = (error: unknown, stage: string) => {
  const isDev = process.env.NODE_ENV !== 'production';
  const rawMessage = error instanceof Error ? error.message : String(error);

  let status = 500;
  let message = 'حدث خطأ أثناء إنشاء الطلب';

  if (stage === 'reading_request' || /body|payload|formdata|request/i.test(rawMessage)) {
    status = 413;
    message = 'حجم بيانات الطلب أو الملفات كبير جداً. قلل حجم الملفات ثم حاول مرة أخرى.';
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      status = 409;
      const targetValue = error.meta?.target;
      const target = Array.isArray(targetValue) ? targetValue.join(', ') : '';
      message = target.includes('email')
        ? 'البريد الإلكتروني مستخدم بالفعل. سجل الدخول أو استخدم بيانات حسابك المسجل.'
        : 'توجد بيانات مكررة بالفعل. راجع رقم الهاتف أو البيانات المدخلة ثم حاول مرة أخرى.';
    } else if (error.code === 'P2003') {
      status = 400;
      message =
        'بيانات الطلب غير مكتملة أو غير مرتبطة بخدمة صحيحة. أعد اختيار نوع الخدمة ثم حاول مرة أخرى.';
    } else if (error.code === 'P2025') {
      status = 404;
      message = 'لم يتم العثور على أحد عناصر الطلب المطلوبة.';
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(isDev
        ? {
            debug: {
              stage,
              message: rawMessage,
              code: error instanceof Prisma.PrismaClientKnownRequestError ? error.code : undefined,
              meta: error instanceof Prisma.PrismaClientKnownRequestError ? error.meta : undefined,
            },
          }
        : {}),
    },
    { status }
  );
};

// ================== GET ==================
export async function GET() {
  try {
    const session = await requireAuth();

    const orders = await prisma.order.findMany({
      where: { userId: session.user.id },
      include: {
        service: { select: { name: true, slug: true } },
        variant: { select: { name: true, priceCents: true, etaDays: true } },
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        service: order.service,
        variant: order.variant,
        status: order.status,
        totalCents: order.totalCents,
        deliveryType: order.deliveryType,
        deliveryFee: order.deliveryFee,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        address: order.address,
        notes: order.notes,
        payment: order.payment
          ? {
              method: order.payment.method,
              status: order.payment.status,
              senderPhone: order.payment.senderPhone,
            }
          : undefined,
      })),
    });
  } catch (error) {
    logger.error('GET Orders Error', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء جلب الطلبات' },
      { status: 500 }
    );
  }
}

// ================== POST ==================
export async function POST(request: NextRequest) {
  let stage = 'auth_session';

  try {
    const session = await getSession();
    stage = 'reading_request';
    const formData = await request.formData();

    const customerPhone = formData.get('customerPhone')?.toString() || '';
    const customerName = formData.get('customerName')?.toString() || '';
    const customerEmail = formData.get('customerEmail')?.toString() || '';
    const password = formData.get('password')?.toString() || '';

    stage = 'validate_files';
    let totalUploadSize = 0;
    for (const value of formData.values()) {
      if (value instanceof File) {
        totalUploadSize += value.size;
      }
    }

    if (totalUploadSize > MAX_TOTAL_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          success: false,
          error: `إجمالي حجم الملفات كبير. الحد الأقصى ${MAX_TOTAL_UPLOAD_MB}MB لكل طلب.`,
        },
        { status: 413 }
      );
    }

    let userId = session?.user?.id;

    // Guest checkout logic: Auto-register if not logged in
    if (!userId) {
      if (!customerPhone || customerPhone === 'Unknown') {
        return NextResponse.json({ success: false, error: 'رقم الهاتف مطلوب' }, { status: 400 });
      }

      stage = 'guest_lookup';
      // Check if user already exists
      let user = await prisma.user.findFirst({
        where: { phone: customerPhone },
      });

      if (!user) {
        // Create new user if password provided
        if (password && password.length >= 6) {
          stage = 'guest_create';
          const hashedPassword = await hash(password, 12);
          user = await prisma.user.create({
            data: {
              name: customerName,
              phone: customerPhone,
              email: customerEmail || null,
              passwordHash: hashedPassword,
              role: 'USER',
              emailVerified: new Date(), // Auto-verify for simplicity
            },
          });
          userId = user.id;
        } else {
          return NextResponse.json(
            { success: false, error: 'يجب تسجيل الدخول أو إدخال كلمة مرور لإنشاء حساب' },
            { status: 401 }
          );
        }
      } else {
        // User exists, link to it
        userId = user.id;
      }
    }

    const serviceId = formData.get('serviceId')?.toString() || '';
    const variantId = formData.get('variantId')?.toString() || '';
    const notes = formData.get('notes')?.toString() || '';
    const deliveryType = formData.get('deliveryType')?.toString() || 'OFFICE';
    let deliveryFee = parseInt(formData.get('deliveryFee') as string) || 0;

    // If no delivery fee provided and delivery type is not OFFICE, fetch from settings
    if (deliveryFee === 0 && deliveryType !== 'OFFICE') {
      try {
        const settings = await prisma.systemSettings.findUnique({
          where: { id: 'main' },
          select: { defaultDeliveryFee: true },
        });
        if (settings?.defaultDeliveryFee) {
          deliveryFee = settings.defaultDeliveryFee;
        }
      } catch (error) {
        // If settings fetch fails, continue with 0
        logger.error('Failed to fetch default delivery fee', error);
      }
    }

    // بيانات إضافية
    const wifeName = formData.get('wifeName')?.toString() || null;
    const fatherName = formData.get('fatherName')?.toString() || null;
    const motherName = formData.get('motherName')?.toString() || null;
    const birthDateRaw = formData.get('birthDate')?.toString() || null;
    const nationality = formData.get('nationality')?.toString() || null;
    const idNumber = formData.get('idNumber')?.toString() || null;
    const policeStation = formData.get('policeStation')?.toString() || null;
    const pickupLocation = formData.get('pickupLocation')?.toString() || null;
    const promoCode = formData.get('promoCode')?.toString() || null;
    const serviceDetailsRaw = formData.get('serviceDetails')?.toString() || null;
    const marriageDateRaw = formData.get('marriageDate')?.toString() || null;
    const wifeMotherName = formData.get('wifeMotherName')?.toString() || null;

    // Process Dynamic Answers into serviceDetails if provided
    let finalServiceDetails = '';
    if (serviceDetailsRaw && serviceId) {
      try {
        const dynamicAnswers = JSON.parse(serviceDetailsRaw);
        if (typeof dynamicAnswers === 'object' && dynamicAnswers !== null) {
          stage = 'service_details_lookup';
          // Get service fields to match labels
          const serviceObj = await prisma.service.findUnique({
            where: { id: serviceId },
            include: {
              fields: {
                include: { options: true },
              },
            },
          });

          const answersList = Object.entries(dynamicAnswers)
            .map(([key, value]) => {
              const field = serviceObj?.fields.find(f => f.name === key || f.id === key);
              const displayLabel = field?.label || key;

              // Try to find option label if it's a value
              const option = field?.options.find(o => o.value === value || o.label === value);
              const displayValue = option?.label || value;

              return `• ${displayLabel}: ${displayValue}`;
            })
            .join('\n');

          if (answersList) {
            finalServiceDetails = `📋 تفاصيل الخدمة:\n${answersList}`.trim();
          }
        }
      } catch (e) {
        // If not JSON, use as raw string
        finalServiceDetails = serviceDetailsRaw;
      }
    }

    let marriageDate: Date | null = null;
    if (marriageDateRaw) {
      const date = new Date(marriageDateRaw);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        marriageDate = date;
      }
    }

    let birthDate: Date | null = null;
    if (birthDateRaw) {
      const date = new Date(birthDateRaw);
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
        birthDate = date;
      }
    }

    stage = 'service_lookup';
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { variants: true },
    });

    if (!service) {
      return NextResponse.json({ success: false, error: 'الخدمة غير موجودة' }, { status: 404 });
    }

    const variant = service.variants.find(v => v.id === variantId);
    if (!variant) {
      return NextResponse.json({ success: false, error: 'نوع الخدمة غير صحيح' }, { status: 400 });
    }

    // Calculate Initial Total
    let totalCents = variant.priceCents + deliveryFee;
    let discountAmount = 0;
    let promoCodeId: string | null = null;

    // Handle Promo Code
    if (promoCode) {
      stage = 'promo_lookup';
      const promo = await prisma.promoCode.findUnique({
        where: { code: promoCode },
      });

      if (promo) {
        // Validate Promo Code
        const now = new Date();
        let isValid = true;

        if (!promo.isActive) isValid = false;
        if (promo.startDate && now < promo.startDate) isValid = false;
        if (promo.endDate && now > promo.endDate) isValid = false;
        if (promo.usageLimit && promo.currentUsage >= promo.usageLimit) isValid = false;
        if (promo.minOrderAmount && totalCents < promo.minOrderAmount) isValid = false;

        if (isValid) {
          // Calculate Discount
          if (promo.type === 'FIXED') {
            discountAmount = promo.value;
          } else if (promo.type === 'PERCENTAGE') {
            discountAmount = Math.round((totalCents * promo.value) / 100);
            if (promo.maxDiscount && discountAmount > promo.maxDiscount) {
              discountAmount = promo.maxDiscount;
            }
          }

          // Ensure discount doesn't exceed total
          if (discountAmount > totalCents) {
            discountAmount = totalCents;
          }

          promoCodeId = promo.id;

          // Increment Usage
          stage = 'promo_update';
          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { currentUsage: { increment: 1 } },
          });
        }
      }
    }

    // Apply Discount
    totalCents = totalCents - discountAmount;

    const finalUserId = userId as string; // Guaranteed to be string by logic above

    const orderData = {
      status: 'waiting_confirmation',
      serviceId,
      variantId,
      notes,
      totalPrice: totalCents, // Legacy field support if needed
      totalCents: totalCents,
      customerName: customerName || session?.user?.name || 'Unknown',
      customerPhone: customerPhone || session?.user?.phone || 'Unknown',
      customerEmail: customerEmail || session?.user?.email || 'Unknown',
      userId: finalUserId,
      deliveryType,
      deliveryFee,
      discount: 0, // Manual discount field
      discountAmount, // System/Promo discount field
      promoCodeId,
      wifeName,
      wifeMotherName,
      birthDate, // Use validated date
      marriageDate,
      nationality,
      idNumber,
      policeStation,
      pickupLocation,
      serviceDetails: finalServiceDetails,
    };

    let attempts = 0;
    const maxAttempts = 5;
    let order;

    while (attempts < maxAttempts) {
      try {
        let orderId;

        // On last attempt, force timestamp to ensure creation
        if (attempts === maxAttempts - 1) {
          orderId = `${new Date().getFullYear()}${Date.now().toString().slice(-6)}`;
        } else {
          orderId = await generateOrderNumber();
        }

        const orderDataWithId = { ...orderData, id: orderId };

        stage = 'order_create';
        order = await prisma.order.create({ data: orderDataWithId });
        break; // Success
      } catch (error: any) {
        if (error.code === 'P2002') {
          // Catch any unique constraint violation to be safe, assuming ID is the main unique field being generated
          attempts++;
          // Random jitter wait to prevent lockstep retries
          const waitTime = Math.floor(Math.random() * 200) + 100 * attempts;
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        }
        throw error; // Other errors
      }
    }

    if (!order) throw new Error('Failed to create order after multiple attempts');

    // تحديث بيانات المستخدم لو فيه حاجة ناقصة (في حالة الـ Session فقط لضمان الملكية)
    if (
      session?.user?.id &&
      (wifeName || fatherName || motherName || birthDate || nationality || idNumber)
    ) {
      const userUpdateData: Record<string, any> = {};
      if (wifeName) userUpdateData.wifeName = wifeName;
      if (fatherName) userUpdateData.fatherName = fatherName;
      if (motherName) userUpdateData.motherName = motherName;
      if (birthDate) userUpdateData.birthDate = birthDate;
      if (marriageDate) (userUpdateData as any).marriageDate = marriageDate;
      if (wifeMotherName) (userUpdateData as any).wifeMotherName = wifeMotherName;
      if (nationality) userUpdateData.nationality = nationality;
      if (idNumber) userUpdateData.idNumber = idNumber;

      try {
        stage = 'user_update';
        await prisma.user.update({
          where: { id: session.user.id },
          data: userUpdateData,
        });
      } catch {
        // تجاهل لو حصل خطأ
      }
    }

    // رفع الملفات
    stage = 'file_uploads';
    const uploadedFiles: any[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        try {
          const timestamp = Date.now();
          const fileExtension = value.name.split('.').pop();
          const fileName = `${key}_${timestamp}.${fileExtension}`;

          // Upload to B2
          const buffer = Buffer.from(await value.arrayBuffer());
          const upload = new Upload({
            client: s3Client,
            params: {
              Bucket: process.env.B2_BUCKET_NAME,
              Key: `orders/${order.id}/${fileName}`,
              Body: buffer,
              ContentType: value.type,
            },
          });

          const result = await upload.done();
          // For Private Bucket, store the Key, avoiding the inaccessible public URL.
          const filePath = `orders/${order.id}/${fileName}`;

          // Save to Document table (New B2 System)
          await prisma.document.create({
            data: {
              orderId: order.id,
              fileName: value.name, // Store original name for display
              filePath: filePath,
              fileSize: value.size,
              fileType: value.type,
            },
          });

          uploadedFiles.push({
            originalName: value.name,
            savedPath: filePath,
            size: value.size,
            type: value.type,
          });
        } catch (uploadError) {
          logger.error('Error uploading file to B2', uploadError);
          // Continue with other files even if one fails
        }
      }
    }

    // 📱 إرسال رسالة واتساب للعميل
    stage = 'whatsapp_trigger';
    try {
      const whatsappStatus = await checkWhatsAppStatus();
      if (
        whatsappStatus.status === 'connected' &&
        orderData.customerPhone &&
        orderData.customerPhone !== 'Unknown'
      ) {
        // Fetch full order for placeholders
        const fullOrder = await prisma.order.findUnique({
          where: { id: order.id },
          include: {
            service: { select: { name: true } },
            variant: { select: { name: true } },
            user: { select: { phone: true, email: true } },
            payment: { select: { amount: true, status: true } },
          },
        });

        if (fullOrder) {
          await sendWhatsAppByTrigger('NEW_ORDER', fullOrder);
        }
      }
    } catch (err) {
      logger.error('WhatsApp trigger error', err);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      filesUploaded: uploadedFiles.length,
      message: 'تم إنشاء الطلب بنجاح',
      redirectUrl: `/order-success?orderId=${order.id}&filesUploaded=${uploadedFiles.length}`,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    logger.error('POST Orders Error', error, { stage });
    return getOrderCreationErrorResponse(error, stage);
  }
}
