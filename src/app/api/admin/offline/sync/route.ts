import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateUniqueOrderNumber } from '@/lib/orderNumbering';
import { logger } from '@/lib/logger';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminOrStaff();
    const adminUserId = session.user.id;
    const body = await request.json();
    const { orders } = body;

    if (!Array.isArray(orders)) {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }

    const results = [];

    for (const offlineOrder of orders) {
      try {
        // 1. Check if this offlineId already exists to prevent duplicates
        const existing = await prisma.order.findFirst({
          where: { offlineId: offlineOrder.offlineId },
        });

        if (existing) {
          results.push({ offlineId: offlineOrder.offlineId, status: 'synced', id: existing.id });
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
        const newOrder = await prisma.order.create({
          data: {
            ...offlineOrder,
            id: orderId,
            userId,
            createdByAdminId: adminUserId,
            createdAt: new Date(offlineOrder.createdAt),
            // Ensure status logic is consistent or use the one from offline
            status: offlineOrder.status || 'PROCESSING',
          },
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
              createdAt: new Date(offlineOrder.createdAt),
            },
          });
        }

        results.push({ offlineId: offlineOrder.offlineId, status: 'created', id: newOrder.id });
      } catch (err) {
        logger.error(`Sync error for order ${offlineOrder.offlineId}`, err);
        results.push({ offlineId: offlineOrder.offlineId, status: 'error', error: String(err) });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    logger.error('System Offline Sync Error', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
