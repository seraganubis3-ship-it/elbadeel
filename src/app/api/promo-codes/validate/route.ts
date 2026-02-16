import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, orderTotal, userId, phone } = body; // orderTotal in cents

    if (!code) {
      return NextResponse.json({ success: false, error: 'كود الخصم مطلوب' }, { status: 400 });
    }

    const promoCode = await prisma.promoCode.findUnique({
      where: { code },
    });

    if (!promoCode) {
      return NextResponse.json({ success: false, valid: false, error: 'كود الخصم غير صحيح' });
    }

    if (!promoCode.isActive) {
      return NextResponse.json({ success: false, valid: false, error: 'كود الخصم غير فعال' });
    }

    const now = new Date();
    if (promoCode.startDate && now < promoCode.startDate) {
      return NextResponse.json({ success: false, valid: false, error: 'كود الخصم لم يبدأ بعد' });
    }

    if (promoCode.endDate && now > promoCode.endDate) {
      return NextResponse.json({ success: false, valid: false, error: 'كود الخصم منتهي الصلاحية' });
    }

    if (promoCode.usageLimit && promoCode.currentUsage >= promoCode.usageLimit) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'تم تجاوز حد الاستخدام لهذا الكوبون',
      });
    }

    // Check usage limit per user
    if ((promoCode as any).usageLimitPerUser && (userId || phone)) {
      const userUsageCount = await prisma.order.count({
        where: {
          promoCodeId: promoCode.id,
          OR: [
            ...(userId ? [{ userId }] : []),
            ...(phone ? [{ customerPhone: phone }] : []),
          ],
        },
      });

      if (userUsageCount >= (promoCode as any).usageLimitPerUser) {
        return NextResponse.json({
          success: false,
          valid: false,
          error: `عفواً، لقد تجاوزت الحد المسموح لاستخدام هذا الكوبون (${(promoCode as any).usageLimitPerUser} مرة)`,
        });
      }
    }

    if (promoCode.minOrderAmount && orderTotal < promoCode.minOrderAmount) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: `يجب أن يكون إجمالي الطلب ${promoCode.minOrderAmount / 100} جنيه على الأقل لاستخدام هذا الكوبون`,
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promoCode.type === 'FIXED') {
      discountAmount = promoCode.value; // value is in cents
    } else if (promoCode.type === 'PERCENTAGE') {
      discountAmount = Math.round((orderTotal * promoCode.value) / 100);
      if (promoCode.maxDiscount && discountAmount > promoCode.maxDiscount) {
        discountAmount = promoCode.maxDiscount;
      }
    }

    // Ensure discount doesn't exceed order total
    if (discountAmount > orderTotal) {
      discountAmount = orderTotal;
    }

    // Calculate new total
    const newTotal = orderTotal - discountAmount;

    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      id: promoCode.id,
      discountAmount,
      newTotal,
      message: 'تم تطبيق كود الخصم بنجاح',
    });
  } catch (error) {
    logger.error('Validate Promo Code Error', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء التحقق من الكوبون' },
      { status: 500 }
    );
  }
}
