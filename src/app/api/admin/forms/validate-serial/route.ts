import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Validate a form serial number for a given service variant
// GET /api/admin/forms/validate-serial?variantId=...&serial=...
export async function GET(_request: NextRequest) {
  try {
    const session = await requireAdminOrStaff();

    const { searchParams } = new URL(_request.url);
    const variantId = searchParams.get('variantId') || '';
    const serial = (searchParams.get('serial') || '').trim();

    if (!variantId || !serial) {
      return NextResponse.json({ valid: false, message: 'البيانات غير مكتملة' }, { status: 400 });
    }

    // Find linked form types for this variant
    const links: Array<{ formTypeId: string }> = await (prisma as any).formTypeVariant.findMany({
      where: { serviceVariantId: variantId },
      select: { formTypeId: true },
    });

    if (!links || links.length === 0) {
      return NextResponse.json({ valid: false, message: 'لا يوجد نوع استمارة مرتبط بهذا النوع' });
    }

    // Check if any linked form type has this serial available
    const formTypeIds = links.map(l => l.formTypeId);
    const available = await (prisma as any).formSerial.findFirst({
      where: {
        formTypeId: { in: formTypeIds },
        serialNumber: serial,
        consumed: false,
      },
      include: { formType: true },
    });

    if (!available) {
      return NextResponse.json({ valid: false, message: 'رقم الاستمارة غير موجود أو تم استخدامه' });
    }

    return NextResponse.json({
      valid: true,
      message: 'رقم الاستمارة متاح',
      formTypeId: available.formTypeId,
      formTypeName: available.formType?.name,
    });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ valid: false, message: 'غير مسجل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ valid: false, message: 'حدث خطأ أثناء التحقق' }, { status: 500 });
  }
}
