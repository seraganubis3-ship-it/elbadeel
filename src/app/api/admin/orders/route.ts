import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdminOrStaff, getWorkDate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueOrderNumber } from '@/lib/orderNumbering';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';
// [FORCE_RELOAD] Updated Prisma client integration

interface OrderResponse {
  id: string;
  service: { name: string; slug: string } | null;
  variant: { name: string; priceCents: number; etaDays: number } | null;
  status: string;
  totalCents: number;
  deliveryType: string | null;
  deliveryFee: number;
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  address: string | null;
  notes: string | null;
  adminNotes: string | null;
  user: { id: string; name: string | null; email: string | null; phone: string | null } | null;
  createdByAdmin: { id: string; name: string | null; email: string | null } | null;
  payment: {
    id: string;
    amount: number;
    method: string;
    status: string;
    senderPhone: string | null;
  } | null;
  documentsCount: number;
  birthDate: Date | null;
  motherName: string | null;
  idNumber: string | null;
  quantity: number;
  customerFollowUp: string | null;
  selectedFines: string | null;
  finesDetails: string | null;
  servicesDetails: string | null;
  serviceDetails: string | null;
  policeStation: string | null;
  pickupLocation: string | null;
  marriageDate: Date | null;
  divorceDate: Date | null;
  wifeMotherName: string | null;
  wifeName: string | null;
  destination: string | null;
  title: string | null;
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminOrStaff();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const createdByAdminId = searchParams.get('createdByAdminId') || undefined;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const serviceIds = searchParams.getAll('serviceIds');
    const categoryId = searchParams.get('categoryId');
    const createdByAdmin = searchParams.get('createdByAdmin');

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const skip = (page - 1) * limit;

    const whereClause: any = {
      ...(userId ? { userId } : {}),
      ...(createdByAdminId ? { createdByAdminId } : {}),
      ...(from && to
        ? {
            createdAt: {
              gte: new Date(from.split('/').reverse().join('-')),
              lte: new Date(to.split('/').reverse().join('-') + 'T23:59:59.999Z'),
            },
          }
        : {}),
      ...(serviceIds.length > 0 ? { serviceId: { in: serviceIds } } : {}),
      ...(categoryId ? { service: { categoryId } } : {}),
      ...(createdByAdmin === 'true' && !createdByAdminId ? { createdByAdminId: { not: null } } : {}),
      ...(createdByAdmin === 'false' ? { createdByAdminId: null } : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          service: { select: { name: true, slug: true } },
          variant: { select: { name: true, priceCents: true, etaDays: true } },
          createdByAdmin: { select: { id: true, name: true, email: true } },
          user: { select: { id: true, name: true, email: true, phone: true } },
          payment: {
            select: { id: true, amount: true, method: true, status: true, senderPhone: true },
          },
          _count: { select: { orderDocuments: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    let mappedOrders: OrderResponse[] = [];
    try {
      mappedOrders = orders.map(order => ({
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
        adminNotes: order.adminNotes,
        user: order.user,
        createdByAdmin: order.createdByAdmin,
        payment: order.payment,
        documentsCount: order._count?.orderDocuments || 0,
        birthDate: order.birthDate,
        motherName: order.motherName,
        idNumber: order.idNumber,
        quantity: order.quantity,
        customerFollowUp: order.customerFollowUp,
        selectedFines: order.selectedFines,
        finesDetails: order.finesDetails,
        servicesDetails: order.servicesDetails,
        serviceDetails: order.serviceDetails,
        policeStation: order.policeStation,
        pickupLocation: order.pickupLocation,
        marriageDate: (order as any).marriageDate,
        divorceDate: (order as any).divorceDate,
        wifeMotherName: (order as any).wifeMotherName,
        wifeName: (order as any).wifeName,
        destination: (order as any).destination,
        title: (order as any).title,
      }));
    } catch (mapError) {
      logger.error('Error mapping orders in GET API', mapError);
      return NextResponse.json(
        {
          success: false,
          error: 'حدث خطأ أثناء معالجة بيانات الطلبات',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: mappedOrders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Admin Orders GET API Error', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ أثناء جلب الطلبات',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminOrStaff();

    const adminUserId = session.user.id || (session.user as any).sub;
    if (!adminUserId) {
      logger.warn('Admin ID missing from session', { user: session.user });
    }
    const body = await request.json();
    const {
      serviceId,
      variantId,
      customerName,
      customerPhone,
      additionalPhone,
      customerEmail,
      address,
      governorate,
      city,
      district,
      street,
      buildingNumber,
      apartmentNumber,
      landmark,
      notes,
      adminNotes,
      deliveryType,
      deliveryFee,
      discount,
      totalCents,
      birthDate,
      fatherName,
      idNumber,
      motherName,
      nationality,
      gender,
      wifeName,
      paymentMethod,
      paidAmount,
      photographyLocation,
      photographyDate,
      quantity,
      attachedDocuments,
      hasAttachments,
      originalDocuments,
      policeStation,
      pickupLocation,
      selectedFines,
      finesDetails,
      servicesDetails,
      customerFollowUp,
      workDate: clientWorkDate,
      dynamicAnswers,
      marriageDate,
      divorceDate,
      wifeMotherName,
      destination,
      title,
    } = body;

    let finalServiceDetails = body.serviceDetails || '';
    if (dynamicAnswers && typeof dynamicAnswers === 'object' && serviceId) {
      const serviceObj = await prisma.service.findUnique({
        where: { id: serviceId },
        include: { fields: true },
      });

      const answersList = Object.entries(dynamicAnswers)
        .map(([key, value]) => {
          const field = serviceObj?.fields.find(f => f.name === key || f.id === key);
          const displayLabel = field?.label || key;
          return `• ${displayLabel}: ${value}`;
        })
        .join('\n');

      if (answersList) {
        finalServiceDetails = `📋 تفاصيل الخدمة:\n${answersList}\n\n${finalServiceDetails}`.trim();
      }
    }

    const formSerialNumber = body.formSerialNumber as string | undefined;
    if (formSerialNumber) {
      const link = await (prisma as any).formTypeVariant.findFirst({
        where: { serviceVariantId: variantId },
        select: { formTypeId: true },
      });
      if (!link) {
        return NextResponse.json(
          { success: false, error: 'لا يوجد نوع استمارة مرتبط بهذا النوع من الخدمة' },
          { status: 400 }
        );
      }
      const availableSerial = await (prisma as any).formSerial.findFirst({
        where: { formTypeId: link.formTypeId, serialNumber: formSerialNumber, consumed: false },
      });
      if (!availableSerial) {
        return NextResponse.json(
          { success: false, error: 'رقم الاستمارة غير موجود أو تم استخدامه' },
          { status: 400 }
        );
      }
    }

    if (!serviceId || !variantId || !customerName || !customerPhone) {
      return NextResponse.json(
        {
          success: false,
          error: 'الخدمة ونوع الخدمة واسم العميل ورقم الهاتف مطلوبة',
        },
        { status: 400 }
      );
    }

    const safeParseDate = (dateStr: string | null | undefined): Date | null => {
      if (!dateStr || dateStr === '') return null;
      let d;
      if (dateStr.includes('/')) {
        const [day, month, year] = dateStr.split('/');
        d = new Date(`${year}-${month}-${day}`);
      } else {
        d = new Date(dateStr);
      }
      return isNaN(d.getTime()) ? null : d;
    };

    if (birthDate && birthDate !== '') {
      if (!safeParseDate(birthDate)) {
        return NextResponse.json(
          { success: false, error: 'تاريخ الميلاد غير صحيح' },
          { status: 400 }
        );
      }
    }

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: { variants: true },
    });

    if (!service) {
      return NextResponse.json({ success: false, error: 'الخدمة غير موجودة' }, { status: 400 });
    }

    const variant = service.variants.find((v: any) => v.id === variantId);
    if (!variant) {
      return NextResponse.json({ success: false, error: 'نوع الخدمة غير موجود' }, { status: 400 });
    }

    const normalizePhone = (p?: string) => (p ? p.replace(/\D/g, '') : undefined);
    const normalizedPhone = normalizePhone(customerPhone);

    let userId: string | null = null;
    let existingUser = null;

    if (customerEmail && customerEmail.trim() !== '') {
      existingUser = await prisma.user.findFirst({
        where: { email: { equals: customerEmail, mode: 'insensitive' } },
      });
    }

    if (!existingUser && normalizedPhone) {
      existingUser = await prisma.user.findFirst({
        where: { phone: { equals: normalizedPhone } },
      });
    }

    if (!existingUser && idNumber) {
      existingUser = await prisma.user.findFirst({
        where: { idNumber: { equals: idNumber, mode: 'insensitive' } },
      });
    }

    if (!existingUser) {
      const created = await prisma.user.create({
        data: {
          name: customerName,
          email: customerEmail && customerEmail.trim() !== '' ? customerEmail : undefined,
          phone: normalizedPhone || customerPhone || undefined,
          additionalPhone: additionalPhone || undefined,
          address: address || undefined,
          governorate: governorate || undefined,
          city: city || undefined,
          district: district || undefined,
          street: street || undefined,
          buildingNumber: buildingNumber || undefined,
          apartmentNumber: apartmentNumber || undefined,
          landmark: landmark || undefined,
          birthDate:
            birthDate && birthDate !== ''
              ? (() => {
                  if (birthDate.includes('/')) {
                    const [day, month, year] = birthDate.split('/');
                    return new Date(`${year}-${month}-${day}`);
                  }
                  return new Date(birthDate);
                })()
              : null,
          fatherName: fatherName || undefined,
          idNumber: idNumber || undefined,
          motherName: motherName || undefined,
          nationality: nationality || undefined,
          gender: gender || undefined,
          wifeName: wifeName || undefined,
          wifeMotherName: wifeMotherName || undefined,
          createdByAdminId: adminUserId,
          role: 'USER',
        } as any,
        select: { id: true },
      });
      userId = created.id;
    } else {
      const u = existingUser;
      const updates: any = {};
      const assignIfMissing = (key: string, value?: any) => {
        const current = (u as any)[key];
        const isEmpty = current === null || current === undefined || current === '';
        if (isEmpty && value !== undefined && value !== '') updates[key] = value;
      };
      // Always update name and address info if provided in the order
      if (customerName) updates.name = customerName;
      if (!(u as any).email && customerEmail) updates.email = customerEmail;
      
      assignIfMissing('phone', normalizedPhone || customerPhone);
      assignIfMissing('additionalPhone', additionalPhone);

      // Upsert address fields if provided
      if (address) updates.address = address;
      if (governorate) updates.governorate = governorate;
      if (city) updates.city = city;
      if (district) updates.district = district;
      if (street) updates.street = street;
      if (buildingNumber) updates.buildingNumber = buildingNumber;
      if (apartmentNumber) updates.apartmentNumber = apartmentNumber;
      if (landmark) updates.landmark = landmark;

      if ((u as any).birthDate == null && birthDate && birthDate !== '') {
        const parsed = safeParseDate(birthDate);
        if (parsed) updates.birthDate = parsed;
      }
      
      assignIfMissing('fatherName', fatherName);
      assignIfMissing('idNumber', idNumber);
      assignIfMissing('motherName', motherName);
      assignIfMissing('nationality', nationality);
      assignIfMissing('gender', gender);
      assignIfMissing('wifeName', wifeName);
      assignIfMissing('wifeMotherName', wifeMotherName);

      if (Object.keys(updates).length > 0) {
        await (prisma.user as any).update({ where: { id: u.id }, data: updates });
      }
      userId = u.id;
    }

    let orderStatus = 'processing';
    const promoCode = body.promoCode as string | undefined;
    let discountAmountCents = 0;
    let promoCodeId: string | undefined = undefined;

    if (promoCode) {
      const codeRecord = await prisma.promoCode.findUnique({ where: { code: promoCode } });
      if (!codeRecord)
        return NextResponse.json({ success: false, error: 'كود الخصم غير صحيح' }, { status: 400 });
      if (!codeRecord.isActive)
        return NextResponse.json({ success: false, error: 'كود الخصم غير فعال' }, { status: 400 });
      const now = new Date();
      if (codeRecord.startDate && now < codeRecord.startDate)
        return NextResponse.json(
          { success: false, error: 'كود الخصم لم يبدأ بعد' },
          { status: 400 }
        );
      if (codeRecord.endDate && now > codeRecord.endDate)
        return NextResponse.json(
          { success: false, error: 'كود الخصم منتهي الصلاحية' },
          { status: 400 }
        );
      if (codeRecord.usageLimit && codeRecord.currentUsage >= codeRecord.usageLimit)
        return NextResponse.json(
          { success: false, error: 'تم تجاوز حد الاستخدام لهذا الكوبون' },
          { status: 400 }
        );
      if (codeRecord.minOrderAmount && totalCents < codeRecord.minOrderAmount)
        return NextResponse.json(
          {
            success: false,
            error: `يجب أن يكون إجمالي الطلب ${codeRecord.minOrderAmount / 100} جنيه على الأقل`,
          },
          { status: 400 }
        );

      if (codeRecord.type === 'FIXED') {
        discountAmountCents = codeRecord.value;
      } else {
        discountAmountCents = Math.round((totalCents * codeRecord.value) / 100);
        if (codeRecord.maxDiscount && discountAmountCents > codeRecord.maxDiscount)
          discountAmountCents = codeRecord.maxDiscount;
      }
      if (discountAmountCents > totalCents) discountAmountCents = totalCents;
      promoCodeId = codeRecord.id;
      await prisma.promoCode.update({
        where: { id: codeRecord.id },
        data: { currentUsage: { increment: 1 } },
      });
    }

    const manualDiscountCents = (discount || 0) * 100;
    const finalTotalCents = Math.max(0, totalCents - manualDiscountCents - discountAmountCents);

    if (paidAmount && paidAmount >= finalTotalCents) {
      orderStatus = 'PAYMENT_CONFIRMED';
    } else if (paidAmount && paidAmount > 0) {
      orderStatus = 'PARTIAL_PAYMENT';
    }

    const orderId = await generateUniqueOrderNumber();
    let workDate: Date;
    if (clientWorkDate && session.user.role === 'ADMIN') {
      try {
        if (clientWorkDate.includes('/')) {
          const [day, month, year] = clientWorkDate.split('/');
          workDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          if (isNaN(workDate.getTime())) workDate = getWorkDate(session);
        } else {
          workDate = new Date(clientWorkDate);
          if (isNaN(workDate.getTime())) workDate = getWorkDate(session);
        }
      } catch {
        workDate = getWorkDate(session);
      }
    } else {
      workDate = getWorkDate(session);
    }

    const order = await prisma.order.create({
      data: {
        id: orderId,
        userId: userId!,
        serviceId,
        variantId,
        createdByAdminId: adminUserId,
        createdAt: workDate,
        status: orderStatus,
        totalPrice: totalCents,
        totalCents,
        customerName,
        customerPhone,
        additionalPhone: additionalPhone || '',
        customerEmail: customerEmail || '',
        address: address || '',
        governorate: governorate || '',
        city: city || '',
        district: district || '',
        street: street || '',
        buildingNumber: buildingNumber || '',
        apartmentNumber: apartmentNumber || '',
        landmark: landmark || '',
        notes: notes || '',
        adminNotes: adminNotes || '',
        deliveryType: deliveryType || 'OFFICE',
        deliveryFee: deliveryFee || 0,
        discount: (discount || 0) * 100,
        promoCodeId: promoCodeId || null,
        discountAmount: discountAmountCents,
        birthDate: safeParseDate(birthDate),
        fatherName: fatherName || '',
        idNumber: idNumber || '',
        motherName: motherName || '',
        nationality: nationality || '',
        wifeName: wifeName || '',
        photographyLocation: photographyLocation || '',
        photographyDate: photographyDate ? new Date(photographyDate) : null,
        customerFollowUp: customerFollowUp || '',
        policeStation: policeStation || '',
        pickupLocation: pickupLocation || '',
        attachedDocuments: attachedDocuments ? JSON.stringify(attachedDocuments) : null,
        hasAttachments: hasAttachments || false,
        originalDocuments: originalDocuments || '',
        quantity: quantity || 1,
        selectedFines: selectedFines ? JSON.stringify(selectedFines) : null,
        finesDetails: finesDetails ? JSON.stringify(finesDetails) : null,
        servicesDetails: servicesDetails ? JSON.stringify(servicesDetails) : null,
        serviceDetails: finalServiceDetails,
        marriageDate: safeParseDate(marriageDate),
        divorceDate: safeParseDate(divorceDate),
        wifeMotherName: wifeMotherName || '',
        destination: destination || '',
        title: title || '',
      } as any,
      include: {
        service: { select: { name: true, slug: true } },
        variant: { select: { name: true, priceCents: true, etaDays: true } },
        createdByAdmin: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    if (formSerialNumber) {
      const link = await (prisma as any).formTypeVariant.findFirst({
        where: { serviceVariantId: variantId },
        select: { formTypeId: true },
      });
      if (link) {
        await (prisma as any).formSerial.updateMany({
          where: { formTypeId: link.formTypeId, serialNumber: formSerialNumber, consumed: false },
          data: {
            consumed: true,
            consumedAt: workDate,
            orderId: order.id,
            consumedByAdminId: session.user.id,
          },
        });
      }
    }

    if (paidAmount && paidAmount > 0) {
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: paidAmount,
          method: paymentMethod || 'CASH',
          status: 'CONFIRMED',
          senderPhone: customerPhone,
          notes: `دفع من الإدارة - ${paymentMethod || 'كاش'}`,
          createdAt: workDate,
        },
      });
    }

    if (customerFollowUp) {
      try {
        const depName = customerFollowUp.trim();
        if (depName) {
           const existing = await prisma.dependent.findFirst({ where: { name: { equals: depName, mode: 'insensitive' } } });
           if (!existing) {
             await prisma.dependent.create({ data: { name: depName } });
           }
        }
      } catch (e) {
        // Ignore dependent save errors
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        service: (order as any).service,
        variant: (order as any).variant,
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
        adminNotes: order.adminNotes,
        user: (order as any).user,
        photographyLocation: order.photographyLocation,
      },
    });
  } catch (error) {
    logger.error('Admin Orders POST API Error', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ غير متوقع',
      },
      { status: 500 }
    );
  }
}
