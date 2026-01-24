import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    // Check authentication and role
    const session = await requireAdminOrStaff();

    const { serialNumber, serviceId, variantId } = await _request.json();

    if (!serialNumber || !serviceId || !variantId) {
      return NextResponse.json(
        { error: 'رقم الاستمارة والخدمة ونوع الخدمة مطلوبة' },
        { status: 400 }
      );
    }

    // Find the form type linked to this service variant
    const formTypeVariant = await (prisma as any).formTypeVariant.findFirst({
      where: { serviceVariantId: variantId },
      include: { formType: true },
    });

    if (!formTypeVariant) {
      return NextResponse.json({
        success: false,
        error: 'لا يوجد نوع استمارة مرتبط بهذا النوع من الخدمة',
      });
    }

    // Check if the serial number exists and is available
    const formSerial = await (prisma as any).formSerial.findFirst({
      where: {
        formTypeId: formTypeVariant.formTypeId,
        serialNumber: serialNumber,
        consumed: false,
      },
    });

    if (!formSerial) {
      return NextResponse.json({
        success: false,
        error: 'رقم الاستمارة غير موجود أو تم استخدامه',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'رقم الاستمارة متاح',
      formSerial: {
        id: formSerial.id,
        serialNumber: formSerial.serialNumber,
        formType: formTypeVariant.formType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء التحقق من رقم الاستمارة',
      },
      { status: 500 }
    );
  }
}
