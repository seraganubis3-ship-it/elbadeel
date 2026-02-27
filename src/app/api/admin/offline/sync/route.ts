import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueOrderNumber } from '@/lib/orderNumbering';
import { logger } from '@/lib/logger';
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
          }
        }

        // 3. Create the Order
        const orderId = await generateUniqueOrderNumber();
        const parsedCreatedAt = new Date(offlineOrder.createdAt);
        const createdAt = isNaN(parsedCreatedAt.getTime()) ? new Date() : parsedCreatedAt;

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
