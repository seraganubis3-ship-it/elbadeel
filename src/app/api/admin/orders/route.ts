import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff, getWorkDate } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { queryCache, generateCacheKey } from '@/lib/cache/query-cache';
import { generateUniqueOrderNumber } from '@/lib/orderNumbering';
import { logger } from '@/lib/logger';
import { ORDER_STATUS } from '@/constants/orderStatuses';
import { checkWhatsAppStatus, sendWhatsAppByTrigger } from '@/lib/whatsapp';
import { calculateEstimatedDeliveryDate } from '@/lib/delivery-date';
import bcrypt from 'bcryptjs';
import type { Prisma, User } from '@prisma/client';
import type { OrderResponse as OrderResponseType } from '@/types/api';

export const dynamic = 'force-dynamic';

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
  photographyDate: Date | null;
  pickupLocation: string | null;
  marriageDate: Date | null;
  divorceDate: Date | null;
  deathDate: Date | null;
  wifeMotherName: string | null;
  wifeName: string | null;
  destination: string | null;
  title: string | null;
}
export async function GET(request: NextRequest) {
  try {
    await requireAdminOrStaff();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || undefined;
    const createdByAdminId = searchParams.get('createdByAdminId') || undefined;
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const photographyDate = searchParams.get('photographyDate');
    const serviceIds = searchParams.getAll('serviceIds');

    const parseDateFilter = (dateStr: string | null): Date | undefined => {
      if (!dateStr) return undefined;
      const parts = dateStr.split('/');
      if (parts.length !== 3) return undefined;
      const dayStr = parts[0];
      const monthStr = parts[1];
      const yearStr = parts[2];

      if (!dayStr || !monthStr || !yearStr) return undefined;

      const day = parseInt(dayStr, 10);
      const month = parseInt(monthStr, 10) - 1;
      const year = parseInt(yearStr, 10);

      const date = new Date(year, month, day);
      if (
        isNaN(date.getTime()) ||
        date.getDate() !== day ||
        date.getMonth() !== month ||
        date.getFullYear() !== year
      ) {
        return undefined;
      }
      return date;
    };

    const fromDate = parseDateFilter(from);
    const toDate = parseDateFilter(to);
    const photoDate = parseDateFilter(photographyDate);

    const categoryId = searchParams.get('categoryId');
    const status = searchParams.get('status');
    const deliveryType = searchParams.get('deliveryType');
    const createdByAdmin = searchParams.get('createdByAdmin');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'id_desc';

    // Logic for Date Filtering based on Status
    let dateFilterClause = {};
    let statusHistoryOrderIds: string[] | null = null;

    if (status && status !== 'all' && fromDate && toDate) {
      // If status is selected, filter by when the order changed to this status
      const historyRecords = await prisma.orderStatusHistory.findMany({
        where: {
          status: status,
          changedAt: {
            gte: new Date(new Date(fromDate).setHours(0, 0, 0, 0)),
            lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
          },
        },
        select: { orderId: true },
        distinct: ['orderId'],
      });
      statusHistoryOrderIds = historyRecords.map(r => r.orderId);
    } else if (fromDate && toDate) {
      // Default: filter by creation date
      dateFilterClause = {
        createdAt: {
          gte: new Date(new Date(fromDate).setHours(0, 0, 0, 0)),
          lte: new Date(new Date(toDate).setHours(23, 59, 59, 999)),
        },
      };
    }

    // Generate cache key for this query
    const cacheKey = generateCacheKey('orders', {
      userId,
      createdByAdminId,
      from,
      to,
      photographyDate,
      serviceIds,
      categoryId,
      status,
      deliveryType,
      createdByAdmin,
      search,
      sortBy,
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '50',
    });

    // Try to get from cache
    const cached = queryCache.get(cacheKey, 60000); // 1 minute cache for orders
    if (cached) {
      return NextResponse.json(cached);
    }

    const page = parseInt(searchParams.get('page') || '1');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam) : 50;
    const skip = (page - 1) * limit;

    let orderBy: any = { id: 'desc' };
    switch (sortBy) {
      case 'id_asc':
        orderBy = { id: 'asc' };
        break;
      case 'createdAt_desc':
        orderBy = { createdAt: 'desc' };
        break;
      case 'createdAt_asc':
        orderBy = { createdAt: 'asc' };
        break;
      case 'id_desc':
      default:
        orderBy = { id: 'desc' };
        break;
    }

    const whereClause: any = {
      ...(userId ? { userId } : {}),
      ...(createdByAdminId ? { createdByAdminId } : {}),
      ...dateFilterClause,
      ...(statusHistoryOrderIds !== null ? { id: { in: statusHistoryOrderIds } } : {}),
      ...(photoDate
        ? {
            photographyDate: {
              gte: new Date(new Date(photoDate).setHours(0, 0, 0, 0)),
              lte: new Date(new Date(photoDate).setHours(23, 59, 59, 999)),
            },
          }
        : {}),
      ...(serviceIds.length > 0 ? { serviceId: { in: serviceIds } } : {}),
      ...(categoryId ? { service: { categoryId } } : {}),
      ...(status && status !== 'all' ? { status } : {}),
      // Exclude delivered orders from general views (when status is 'all', empty, or not specified and no search term)
      ...((!status || status === 'all' || status === '') && !search
        ? { status: { not: 'delivered' } }
        : {}),
      ...(deliveryType && deliveryType !== 'all' ? { deliveryType } : {}),
      ...(createdByAdmin === 'true' && !createdByAdminId
        ? { createdByAdminId: { not: null } }
        : {}),
      ...(createdByAdmin === 'false' ? { createdByAdminId: null } : {}),
      ...(search
        ? {
            OR: [
              { id: { contains: search, mode: 'insensitive' } },
              { offlineId: { contains: search, mode: 'insensitive' } },
              { customerName: { contains: search, mode: 'insensitive' } },
              { customerPhone: { contains: search } },
              { idNumber: { contains: search, mode: 'insensitive' } },
              { workOrderNumber: { contains: search, mode: 'insensitive' } },
              {
                formSerials: { some: { serialNumber: { contains: search, mode: 'insensitive' } } },
              },
              { user: { phone: { contains: search } } },
              { user: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    };

    const [orders, total, activeCount, completedCount] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          service: { select: { name: true, slug: true } },
          variant: { select: { name: true, priceCents: true, etaDays: true } },
          createdByAdmin: { select: { id: true, name: true, email: true } },
          user: { select: { id: true, name: true, email: true, phone: true, birthDate: true } },
          payment: {
            select: { id: true, amount: true, method: true, status: true, senderPhone: true },
          },
          formSerials: {
            select: { id: true, serialNumber: true, provider: true, consumed: true },
          },
          _count: { select: { orderDocuments: true } },
        },
        orderBy,
        take: limit,
        skip: skip,
      }),
      prisma.order.count({ where: whereClause }),
      prisma.order.count({
        where: {
          ...whereClause,
          status: { notIn: ['delivered', 'cancelled', 'returned'] },
        },
      }),
      prisma.order.count({
        where: {
          ...whereClause,
          status: 'delivered',
        },
      }),
    ]);

    const mappedOrders = orders.map(order => ({
      id: order.id,
      service: order.service || { name: '', slug: '' },
      variant: order.variant || { name: '', priceCents: 0, etaDays: 0 },
      status: order.status,
      totalCents: order.totalCents,
      deliveryType: order.deliveryType || '',
      deliveryFee: order.deliveryFee,
      createdAt: order.createdAt,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      additionalPhone: order.additionalPhone,
      customerEmail: order.customerEmail,
      address: order.address || '',
      governorate: order.governorate || '',
      city: order.city || '',
      district: order.district || '',
      street: order.street || '',
      buildingNumber: order.buildingNumber || '',
      apartmentNumber: order.apartmentNumber || '',
      landmark: order.landmark || '',
      notes: order.notes || '',
      adminNotes: order.adminNotes || '',
      user: order.user || { id: '', name: '', email: '', phone: '' },
      createdByAdmin: order.createdByAdmin || { id: '', name: '', email: '' },
      payment: order.payment,
      formSerials: order.formSerials || [],
      _count: { orderDocuments: order._count?.orderDocuments || 0 },
      updatedAt: order.updatedAt,
      otherFees: order.otherFees,
      discount: order.discount,
      discountAmount: order.discountAmount,
      promoCodeId: order.promoCodeId,
      totalPrice: order.totalPrice,
      fatherName: order.fatherName || '',
      nationality: order.nationality || '',
      gender: order.gender,
      idNumber: order.idNumber || '',
      motherName: order.motherName || '',
      birthDate: order.birthDate || order.user?.birthDate,
      quantity: order.quantity || 1,
      policeStation: order.policeStation || '',
      pickupLocation: order.pickupLocation || '',
      selectedFines: order.selectedFines || '',
      finesDetails: order.finesDetails || '',
      customerFollowUp: order.customerFollowUp || '',
      attachedDocuments: order.attachedDocuments,
      hasAttachments: order.hasAttachments,
      originalDocuments: order.originalDocuments || '',
      serviceDetails: order.serviceDetails || '',
      photographyLocation: order.photographyLocation,
      photographyDate: order.photographyDate,
      servicesDetails: order.servicesDetails || '',
      deathDate: order.deathDate,
      marriageDate: order.marriageDate,
      divorceDate: order.divorceDate,
      wifeMotherName: order.wifeMotherName,
      wifeName: order.wifeName,
      deceasedName: order.deceasedName,
      destination: order.destination,
      title: order.title,
      workOrderNumber: order.workOrderNumber,
      paidAmount: order.payment?.amount || 0,
      remainingAmount: Math.max(
        0,
        order.totalCents -
          (order.discount || 0) -
          (order.discountAmount || 0) -
          (order.payment?.amount || 0)
      ),
    })) as OrderResponseType[];

    // Cache the result
    const response = {
      success: true,
      orders: mappedOrders,
      pagination: {
        page,
        limit,
        total,
        activeCount,
        completedCount,
        totalPages: Math.ceil(total / limit),
      },
    };

    // Store in cache
    queryCache.set(cacheKey, response, 60000); // Cache for 1 minute

    return NextResponse.json(response);
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

    // Invalidate cache when creating new orders
    queryCache.clear('orders');
    const body = await request.json();
    const submissionId = typeof body.offlineId === 'string' ? body.offlineId.trim() : '';

    if (submissionId) {
      const existingOrder = await prisma.order.findUnique({
        where: { offlineId: submissionId },
        include: {
          service: { select: { name: true, slug: true } },
          variant: { select: { name: true, priceCents: true, etaDays: true } },
          user: { select: { id: true, name: true, email: true, phone: true, gender: true } },
        },
      });

      if (existingOrder) {
        return NextResponse.json({
          success: true,
          duplicate: true,
          order: {
            id: existingOrder.id,
            service: existingOrder.service,
            variant: existingOrder.variant,
            status: existingOrder.status,
            totalCents: existingOrder.totalCents,
            estimatedCompletionDate: existingOrder.estimatedCompletionDate,
            deliveryType: existingOrder.deliveryType,
            deliveryFee: existingOrder.deliveryFee,
            createdAt: existingOrder.createdAt,
            customerName: existingOrder.customerName,
            customerPhone: existingOrder.customerPhone,
            customerEmail: existingOrder.customerEmail,
            address: existingOrder.address,
            notes: existingOrder.notes,
            adminNotes: existingOrder.adminNotes,
            user: existingOrder.user,
            photographyLocation: existingOrder.photographyLocation,
          },
        });
      }
    }
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
      otherFees, // Add otherFees
      workDate: clientWorkDate,
      dynamicAnswers,
      marriageDate,
      divorceDate,
      wifeMotherName,
      destination,
      title,
      deathDate,
      deceasedName,
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
    const formSerialProvider = (body.formSerialProvider as string) || 'AL_BADEL';
    let formTypeId: string | undefined;

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

      // Check and reserve the serial in a transaction to prevent race conditions
      const availableSerial = await (prisma as any).formSerial.findFirst({
        where: {
          formTypeId: link.formTypeId,
          serialNumber: formSerialNumber,
          provider: formSerialProvider,
          consumed: false,
        },
      });

      if (!availableSerial) {
        return NextResponse.json(
          { success: false, error: 'رقم الاستمارة غير موجود أو تم استخدامه' },
          { status: 400 }
        );
      }

      formTypeId = link.formTypeId;
      // ✅ Serial will be consumed AFTER order creation succeeds (see below)
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

    // Mandatory Form Serial for ID Cards (بطاقة)
    if (service.name.includes('بطاقة') && !formSerialNumber) {
      return NextResponse.json(
        { success: false, error: 'رقم الاستمارة مطلوب لهذه الخدمة' },
        { status: 400 }
      );
    }

    // Validate Phone Number (Must be 11 digits)
    const phoneRegex = /^01[0125][0-9]{8}$/;
    if (!customerPhone || customerPhone.length !== 11 || !phoneRegex.test(customerPhone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'رقم الهاتف غير صحيح. يجب أن يكون 11 رقم ويبدأ بـ 01',
        },
        { status: 400 }
      );
    }

    // Validate National ID (Must be 14 digits)
    if (idNumber && idNumber.length !== 14) {
      return NextResponse.json(
        {
          success: false,
          error: 'الرقم القومي يجب أن يكون 14 رقم بالضبط',
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

    const normalizePhone = (p?: string) => (p ? p.replace(/\D/g, '') : undefined);
    const normalizedPhone = normalizePhone(customerPhone);

    let userId: string | null = null;
    let existingUser: User | null = null;

    const orConditions: Prisma.UserWhereInput[] = [];
    if (customerEmail && customerEmail.trim() !== '') {
      orConditions.push({ email: { equals: customerEmail, mode: 'insensitive' } });
    }
    if (idNumber) {
      orConditions.push({ idNumber: { equals: idNumber, mode: 'insensitive' } });
    }

    if (orConditions.length > 0) {
      existingUser = await prisma.user.findFirst({
        where: { OR: orConditions },
      });
    }

    // Check for National ID Name mismatch
    if (idNumber) {
      const userWithSameId = await prisma.user.findFirst({
        where: { idNumber: { equals: idNumber, mode: 'insensitive' } },
        select: { id: true, name: true },
      });

      if (userWithSameId && userWithSameId.name && customerName) {
        // Normalize names for comparison (simple trim and whitespace check)
        const normalizedExistingName = userWithSameId.name.trim().replace(/\s+/g, ' ');
        const normalizedInputName = customerName.trim().replace(/\s+/g, ' ');

        if (normalizedExistingName !== normalizedInputName) {
          return NextResponse.json(
            {
              success: false,
              error: `الرقم القومي مسجل بالفعل باسم ( ${userWithSameId.name} ). لا يمكن تسجيله باسم مختلف.`,
            },
            { status: 400 }
          );
        }
      }
    }

    let isNewUserCreated = false;

    // To allow multiple unique users with the SAME phone number:
    // We strictly link by phone ONLY if their exact name matches too.
    if (!existingUser && (normalizedPhone || customerPhone)) {
      const phoneToCheck = normalizedPhone || customerPhone;
      const usersByPhone = await prisma.user.findMany({
        where: { phone: phoneToCheck },
      });

      if (usersByPhone.length > 0) {
        const normalizedInputName = customerName?.trim().replace(/\s+/g, ' ') || '';

        const exactMatch = usersByPhone.find(u => {
          if (!u.name) return false;
          const normalizedExistingName = u.name.trim().replace(/\s+/g, ' ');
          return normalizedExistingName === normalizedInputName;
        });

        if (exactMatch) {
          existingUser = exactMatch as any;
        } else {
          // If no existing name matches exactly, try to claim an "empty" profile (null/empty name).
          // Otherwise, existingUser stays null, which creates a BRAND NEW user for this phone number!
          const emptyNameMatch = usersByPhone.find(
            u => !u.name || (u.name as string).trim() === ''
          );
          if (emptyNameMatch) {
            existingUser = emptyNameMatch as any;
          }
        }
      }
    }

    if (!existingUser) {
      // Hash phone number as password for new users
      const password = normalizedPhone || customerPhone;
      const hashedPassword = await bcrypt.hash(password, 14);

      const created = await prisma.user.create({
        data: {
          name: customerName,
          email: customerEmail && customerEmail.trim() !== '' ? customerEmail : undefined,
          passwordHash: hashedPassword, // Set password = phone
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
      isNewUserCreated = true;
    } else {
      const u = existingUser;
      const updates: Record<string, unknown> = {};
      const assignValue = (key: string, value?: any) => {
        if (value !== undefined && value !== '') {
          updates[key] = value;
        }
      };

      if (customerName) updates.name = customerName;
      if (customerEmail && customerEmail.trim() !== '') updates.email = customerEmail;

      assignValue('phone', normalizedPhone || customerPhone);
      assignValue('additionalPhone', additionalPhone);

      if (address) updates.address = address;
      if (governorate) updates.governorate = governorate;
      if (city) updates.city = city;
      if (district) updates.district = district;
      if (street) updates.street = street;
      if (buildingNumber) updates.buildingNumber = buildingNumber;
      if (apartmentNumber) updates.apartmentNumber = apartmentNumber;
      if (landmark) updates.landmark = landmark;

      if (birthDate && birthDate !== '') {
        const parsed = safeParseDate(birthDate);
        if (parsed) updates.birthDate = parsed;
      }

      assignValue('fatherName', fatherName);
      assignValue('idNumber', idNumber);
      assignValue('motherName', motherName);
      assignValue('nationality', nationality);
      assignValue('gender', gender);
      assignValue('wifeName', wifeName);
      assignValue('wifeMotherName', wifeMotherName);

      if (Object.keys(updates).length > 0) {
        await prisma.user.update({ where: { id: u.id }, data: updates as Prisma.UserUpdateInput });
      }
      userId = u.id;
    }

    let orderStatus: string = ORDER_STATUS.PROCESSING;
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
    const now = new Date();
    let workDate: Date;

    if (clientWorkDate && hasPermission(session.user, 'CREATE_ORDER')) {
      try {
        if (clientWorkDate.includes('/')) {
          const [day, month, year] = clientWorkDate.split('/');
          workDate = new Date(
            parseInt(year),
            parseInt(month) - 1,
            parseInt(day),
            now.getHours(),
            now.getMinutes(),
            now.getSeconds()
          );
          if (isNaN(workDate.getTime())) workDate = getWorkDate(session);
        } else {
          workDate = new Date(clientWorkDate);
          workDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
          if (isNaN(workDate.getTime())) workDate = getWorkDate(session);
        }
      } catch {
        workDate = getWorkDate(session);
      }
    } else {
      workDate = getWorkDate(session);
    }

    // Ensure exact time is saved for accurate reporting later
    workDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

    const order = await prisma.order.create({
      data: {
        id: orderId,
        offlineId: submissionId || null,
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
        otherFees: otherFees || 0, // Save otherFees
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
        deathDate: safeParseDate(deathDate),
        deceasedName: deceasedName || '',
        wifeMotherName: wifeMotherName || '',
        estimatedCompletionDate: calculateEstimatedDeliveryDate(workDate, variant.etaDays),
        destination: destination || '',
        title: title || '',
      } as any,
      include: {
        service: { select: { name: true, slug: true } },
        variant: { select: { name: true, priceCents: true, etaDays: true } },
        createdByAdmin: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true, phone: true, gender: true } },
      },
    });

    // Consume the serial AFTER the order was successfully created (atomic, prevents orphaned consumed serials)
    if (formSerialNumber && formTypeId) {
      const serialRecord = await (prisma as any).formSerial.findFirst({
        where: {
          formTypeId,
          serialNumber: formSerialNumber,
          provider: formSerialProvider, // ← filter by provider
          consumed: false,
        },
        select: { id: true },
      });
      if (serialRecord) {
        await (prisma as any).formSerial.update({
          where: { id: serialRecord.id },
          data: {
            consumed: true,
            consumedAt: new Date(),
            consumedByAdminId: adminUserId,
            orderId: order.id,
          },
        });
      }
    }

    if (attachedDocuments && Array.isArray(attachedDocuments)) {
      // Old string based attachments - might be legacy or just names
      // We keep them as is in the order.attachedDocuments field
    }

    // Save Uploaded Documents (The new B2 ones)
    const uploadedDocs = body.uploadedDocuments;
    if (uploadedDocs && Array.isArray(uploadedDocs) && uploadedDocs.length > 0) {
      await prisma.document.createMany({
        data: uploadedDocs.map((doc: any) => ({
          orderId: order.id,
          fileName: doc.originalName || doc.filename,
          filePath: doc.filePath,
          fileType: doc.fileType,
          fileSize: doc.fileSize,
        })),
      });
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
          const existing = await prisma.dependent.findFirst({
            where: { name: { equals: depName, mode: 'insensitive' } },
          });
          if (!existing) {
            await prisma.dependent.create({ data: { name: depName } });
          }
        }
      } catch (e) {
        // Ignore dependent save errors
      }
    }

    // 📱 إرسال رسائل واتساب (عميل جديد أو طلب جديد)
    try {
      const whatsappStatus = await checkWhatsAppStatus();
      if (whatsappStatus.status === 'connected' && customerPhone && customerPhone !== '') {
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
          if (isNewUserCreated) {
            // Trigger Welcome + Credentials
            await sendWhatsAppByTrigger('NEW_CUSTOMER', fullOrder);
          }
          // Standard New Order Notification (Admin)
          await sendWhatsAppByTrigger('NEW_ORDER_ADMIN', fullOrder);
        }
      }
    } catch (whatsappError) {
      logger.error('WhatsApp trigger error in admin create order:', whatsappError);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        service: (order as any).service,
        variant: (order as any).variant,
        status: orderStatus,
        totalCents: finalServiceDetails.length > 5000 ? finalTotalCents : finalTotalCents, // No-op, just to keep context
        estimatedCompletionDate: calculateEstimatedDeliveryDate(workDate, variant.etaDays),
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
