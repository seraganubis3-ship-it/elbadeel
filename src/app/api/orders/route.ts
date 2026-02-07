import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateOrderNumber } from '@/lib/orderNumbering';
import { sendWhatsAppMessage, NotificationTemplates, checkWhatsAppStatus } from '@/lib/whatsapp';
import { logger } from '@/lib/logger';

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export const dynamic = 'force-dynamic';

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
  try {
    const session = await requireAuth();
    const formData = await request.formData();

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
          await prisma.promoCode.update({
            where: { id: promo.id },
            data: { currentUsage: { increment: 1 } },
          });
        }
      }
    }

    // Apply Discount
    totalCents = totalCents - discountAmount;

    const orderData = {
      status: 'waiting_confirmation',
      serviceId,
      variantId,
      notes,
      totalPrice: totalCents, // Legacy field support if needed
      totalCents: totalCents,
      customerName: session.user.name || 'Unknown',
      customerPhone: (session.user as any).phone || 'Unknown',
      customerEmail: session.user.email || 'Unknown',
      userId: session.user.id,
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

    // تحديث بيانات المستخدم لو فيه حاجة ناقصة
    if (wifeName || fatherName || motherName || birthDate || nationality || idNumber) {
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
        await prisma.user.update({
          where: { id: session.user.id },
          data: userUpdateData,
        });
      } catch {
        // تجاهل لو حصل خطأ
      }
    }

    // رفع الملفات
    const uploadedFiles: any[] = [];
    for (const [key, value] of formData.entries()) {
      if (value instanceof File && value.size > 0) {
        try {
          const uploadsDir = join(process.cwd(), 'public', 'uploads', 'orders', order.id);
          if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
          }

          const timestamp = Date.now();
          const fileExtension = value.name.split('.').pop();
          const fileName = `${key}_${timestamp}.${fileExtension}`;
          const filePath = join(uploadsDir, fileName);

          const buffer = Buffer.from(await value.arrayBuffer());
          await writeFile(filePath, buffer);

          await prisma.orderDocument.create({
            data: {
              orderId: order.id,
              fileName: value.name,
              filePath: `/uploads/orders/${order.id}/${fileName}`,
              fileSize: value.size,
              fileType: value.type,
              documentType: key,
            },
          });

          uploadedFiles.push({
            originalName: value.name,
            savedPath: `/uploads/orders/${order.id}/${fileName}`,
            size: value.size,
            type: value.type,
          });
        } catch {
          // تجاهل لو فيه مشكلة في رفع ملف
        }
      }
    }

    // 📱 إرسال رسالة واتساب للعميل
    try {
      const whatsappStatus = await checkWhatsAppStatus();
      if (
        whatsappStatus.status === 'connected' &&
        orderData.customerPhone &&
        orderData.customerPhone !== 'Unknown'
      ) {
        const notification = NotificationTemplates.newOrder(
          orderData.customerName,
          order.id,
          service.name,
          orderData.totalCents
        );

        await sendWhatsAppMessage({
          phone: orderData.customerPhone,
          message: notification.message,
        });
      }
    } catch {
      // WhatsApp notification failed silently
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      filesUploaded: uploadedFiles.length,
      message: 'تم إنشاء الطلب بنجاح',
      redirectUrl: `/order-success?orderId=${order.id}&filesUploaded=${uploadedFiles.length}`,
    });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الطلب' }, { status: 500 });
  }
}
