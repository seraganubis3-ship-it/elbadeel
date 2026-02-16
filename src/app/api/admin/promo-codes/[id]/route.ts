import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { id } = params;

    const {
      type,
      value,
      minOrderAmount,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      usageLimitPerUser,
      isActive,
    } = body;

    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: {
        type,
        value,
        minOrderAmount,
        maxDiscount,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        usageLimit,
        usageLimitPerUser,
        isActive,
      },
    });

    return NextResponse.json({ success: true, promoCode });
  } catch (error) {
    logger.error('Update Promo Code Error', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الكوبون' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdmin();
    const { id } = params;

    // Check usage before delete
    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
      include: { _count: { select: { orders: true } } },
    });

    if (!promoCode) {
      return NextResponse.json({ error: 'الكوبون غير موجود' }, { status: 404 });
    }

    // If used, just deactivate
    if (promoCode._count.orders > 0) {
      await prisma.promoCode.update({
        where: { id },
        data: { isActive: false },
      });
      return NextResponse.json({ success: true, message: 'تم إيقاف الكوبون (لأنه مستخدم سابقاً)' });
    }

    // If not used, delete
    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'تم حذف الكوبون' });
  } catch (error) {
    logger.error('Delete Promo Code Error', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الكوبون' }, { status: 500 });
  }
}
