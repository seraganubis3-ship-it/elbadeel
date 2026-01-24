import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();

    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    });

    return NextResponse.json({ success: true, promoCodes });
  } catch (error) {
    logger.error('Fetch Promo Codes Error', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الكوبونات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    const {
      code,
      type,
      value,
      minOrderAmount, // in cents
      maxDiscount, // in cents
      startDate,
      endDate,
      usageLimit,
    } = body;

    if (!code || !type || value === undefined) {
      return NextResponse.json({ error: 'البيانات الأساسية ناقصة' }, { status: 400 });
    }

    // Check if code exists
    const existing = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (existing) {
      return NextResponse.json({ error: 'هذا الكود موجود بالفعل' }, { status: 400 });
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        code,
        type,
        value,
        minOrderAmount,
        maxDiscount,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, promoCode });
  } catch (error) {
    logger.error('Create Promo Code Error', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الكوبون' }, { status: 500 });
  }
}
