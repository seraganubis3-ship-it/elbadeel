import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueOrderNumber } from '@/lib/orderNumbering';
import { logger } from '@/lib/logger';
import { checkWhatsAppStatus, sendWhatsAppByTrigger } from '@/lib/whatsapp';
import bcrypt from 'bcryptjs';

interface OfflineSyncResult {
  offlineId: string;
  status: 'synced' | 'created' | 'error';
  id?: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminOrStaff();
    const adminUserId = session.user.id;
    const body = await request.json();
    const { orders } = body;

    if (!Array.isArray(orders)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const results: OfflineSyncResult[] = [];

    for (const offlineOrder of orders) {
      const offlineId = String(offlineOrder?.offlineId ?? '');
      try {
        // 1. Check if this offlineId already exists to prevent duplicates
        const existing = await prisma.order.findFirst({
          where: { offlineId },
        });

        if (existing) {
          results.push({ offlineId, status: 'synced', id: existing.id });
          continue;
        }

        // 2. Handle User Creation/Mapping (Similar to main POST)
        let userId = offlineOrder.userId;
        let isNewUserCreated = false;
        const normalizedPhone = offlineOrder.customerPhone.replace(/\D/g, '');

        if (!userId) {
          const existingUser = await prisma.user.findFirst({
            where: {
              OR: [
                { phone: normalizedPhone },
                { idNumber: offlineOrder.idNumber || undefined },
              ].filter(c => c.phone || c.idNumber),
            },
          });

          if (existingUser) {
            userId = existingUser.id;
          } else {
            const hashedPassword = await bcrypt.hash(normalizedPhone, 10);
            const newUser = await prisma.user.create({
              data: {
                name: offlineOrder.customerName,
                phone: normalizedPhone,
                passwordHash: hashedPassword,
                role: 'USER',
                createdByAdminId: adminUserId,
              },
            });
            userId = newUser.id;
            isNewUserCreated = true;
          }
        }

        // 3. Create the Order
        const orderId = await generateUniqueOrderNumber();
        const parseWorkDate = (value: unknown): Date | null => {
          if (!value) return null;
          if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
          if (typeof value === 'string') {
            if (value.includes('/')) {
              const [day, month, year] = value.split('/');
              const parsed = new Date(Number(year), Number(month) - 1, Number(day));
              return isNaN(parsed.getTime()) ? null : parsed;
            }
            const parsed = new Date(value);
            return isNaN(parsed.getTime()) ? null : parsed;
          }
          return null;
        };

        const timeSourceRaw = new Date(offlineOrder.createdAt);
        const timeSource = isNaN(timeSourceRaw.getTime()) ? new Date() : timeSourceRaw;
        const baseDate =
          parseWorkDate(offlineOrder.workDate) ?? parseWorkDate(offlineOrder.createdAt);

        const createdAt = baseDate
          ? new Date(
              baseDate.getFullYear(),
              baseDate.getMonth(),
              baseDate.getDate(),
              timeSource.getHours(),
              timeSource.getMinutes(),
              timeSource.getSeconds()
            )
          : timeSource;

        // Sanitize data for Prisma
        const sanitizeDate = (dateStr: any) => {
          if (!dateStr || dateStr === '' || dateStr === 'undefined') return null;
          let d;
          if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const [day, month, year] = dateStr.split('/');
            d = new Date(`${year}-${month}-${day}`);
          } else {
            d = new Date(dateStr);
          }
          return isNaN(d.getTime()) ? null : d;
        };

        const sanitizeString = (val: any) => {
          if (Array.isArray(val)) return JSON.stringify(val);
          if (typeof val === 'object' && val !== null) return JSON.stringify(val);
          return val || '';
        };

        const sanitizeNumber = (val: any, defaultVal: number = 0) => {
          if (val === undefined || val === null || val === '') return defaultVal;
          const num = parseInt(val);
          return isNaN(num) ? defaultVal : num;
        };

        const sanitizedData = {
          // Fields defined in prisma.order.create according to schema.prisma
          id: orderId,
          userId,
          serviceId: offlineOrder.serviceId,
          variantId: offlineOrder.variantId,
          createdByAdminId: adminUserId,
          createdAt,
          totalPrice: sanitizeNumber(offlineOrder.totalCents),
          totalCents: sanitizeNumber(offlineOrder.totalCents),
          deliveryFee: sanitizeNumber(offlineOrder.deliveryFee),
          discount: sanitizeNumber(offlineOrder.discount),
          quantity: sanitizeNumber(offlineOrder.quantity, 1),
          otherFees: sanitizeNumber(offlineOrder.otherFees),
          status: offlineOrder.status || 'PROCESSING',
          customerName: offlineOrder.customerName,
          customerPhone: offlineOrder.customerPhone,
          additionalPhone: offlineOrder.additionalPhone || '',
          customerEmail: offlineOrder.customerEmail || '',
          address: offlineOrder.address || '',
          governorate: offlineOrder.governorate || '',
          city: offlineOrder.city || '',
          district: offlineOrder.district || '',
          street: offlineOrder.street || '',
          buildingNumber: offlineOrder.buildingNumber || '',
          apartmentNumber: offlineOrder.apartmentNumber || '',
          landmark: offlineOrder.landmark || '',
          notes: offlineOrder.notes || '',
          adminNotes: offlineOrder.adminNotes || '',
          deliveryType: offlineOrder.deliveryType || 'OFFICE',
          idNumber: offlineOrder.idNumber || '',
          fatherName: offlineOrder.fatherName || '',
          motherName: offlineOrder.motherName || '',
          nationality: offlineOrder.nationality || '',
          wifeName: offlineOrder.wifeName || '',
          wifeMotherName: offlineOrder.wifeMotherName || '',
          photographyLocation: offlineOrder.photographyLocation || '',
          deceasedName: offlineOrder.deceasedName || '',
          serviceDetails: offlineOrder.serviceDetails || '',
          gender: offlineOrder.gender || '',
          policeStation: offlineOrder.policeStation || '',
          pickupLocation: offlineOrder.pickupLocation || '',
          originalDocuments: offlineOrder.originalDocuments || '',
          customerFollowUp: offlineOrder.customerFollowUp || '',
          destination: offlineOrder.destination || '',
          title: offlineOrder.title || '',
          hasAttachments: !!offlineOrder.hasAttachments,
          offlineId,
          // Sanitize Dates
          birthDate: sanitizeDate(offlineOrder.birthDate),
          photographyDate: sanitizeDate(offlineOrder.photographyDate),
          marriageDate: sanitizeDate(offlineOrder.marriageDate),
          divorceDate: sanitizeDate(offlineOrder.divorceDate),
          deathDate: sanitizeDate(offlineOrder.deathDate),
          // Sanitize Arrays/Objects to Strings
          selectedFines: sanitizeString(offlineOrder.selectedFines),
          finesDetails: sanitizeString(offlineOrder.finesDetails),
          servicesDetails: sanitizeString(offlineOrder.servicesDetails),
          attachedDocuments: sanitizeString(offlineOrder.attachedDocuments),
        };

        const newOrder = await prisma.order.create({
          data: sanitizedData,
        });

        // 4. Handle Payment if exists
        if (offlineOrder.paidAmount > 0) {
          await prisma.payment.create({
            data: {
              orderId: newOrder.id,
              amount: offlineOrder.paidAmount,
              method: offlineOrder.paymentMethod || 'CASH',
              status: 'CONFIRMED',
              senderPhone: offlineOrder.customerPhone,
              createdAt: sanitizedData.createdAt,
            },
          });
        }

        // 📱 إرسال واتساب بعد المزامنة (نفس منطق إنشاء الطلب أونلاين)
        try {
          const whatsappStatus = await checkWhatsAppStatus();
          if (whatsappStatus.status === 'connected' && offlineOrder.customerPhone) {
            const fullOrder = await prisma.order.findUnique({
              where: { id: newOrder.id },
              include: {
                service: { select: { name: true } },
                variant: { select: { name: true } },
                user: { select: { phone: true, email: true } },
                payment: { select: { amount: true, status: true } },
              },
            });

            if (fullOrder) {
              if (isNewUserCreated) {
                await sendWhatsAppByTrigger('NEW_CUSTOMER', fullOrder);
              }
              await sendWhatsAppByTrigger('NEW_ORDER_ADMIN', fullOrder);
            }
          }
        } catch (whatsappError) {
          logger.error(
            `WhatsApp trigger error in offline sync for order ${offlineId}`,
            whatsappError
          );
        }

        results.push({ offlineId, status: 'created', id: newOrder.id });
      } catch (err) {
        logger.error(`Sync error for order ${offlineId}`, err);
        results.push({ offlineId, status: 'error', error: String(err) });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    logger.error('System Offline Sync Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
