import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and role
    const session = await requireAdminOrStaff();

    const { id } = params;
    const { serialNumber } = await request.json();

    if (!serialNumber) {
      return NextResponse.json({ error: 'رقم الاستمارة مطلوب' }, { status: 400 });
    }

    // Get the order with its variant
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        variant: true,
        formSerials: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Check if order already has a form serial
    if (order.formSerials.length > 0) {
      return NextResponse.json({ error: 'الطلب يحتوي بالفعل على رقم استمارة' }, { status: 400 });
    }

    // Find the form type linked to this service variant
    const formTypeVariant = await (prisma as any).formTypeVariant.findFirst({
      where: { serviceVariantId: order.variantId },
      include: { formType: true },
    });

    if (!formTypeVariant) {
      return NextResponse.json(
        {
          error: 'لا يوجد نوع استمارة مرتبط بهذا النوع من الخدمة',
        },
        { status: 400 }
      );
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
      return NextResponse.json(
        {
          error: 'رقم الاستمارة غير موجود أو تم استخدامه',
        },
        { status: 400 }
      );
    }

    // Mark the form serial as consumed and link it to the order
    await (prisma as any).formSerial.update({
      where: { id: formSerial.id },
      data: {
        consumed: true,
        consumedAt: new Date(),
        orderId: order.id,
        consumedByAdminId: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم ربط رقم الاستمارة بالطلب بنجاح',
      formSerial: {
        id: formSerial.id,
        serialNumber: formSerial.serialNumber,
        formType: formTypeVariant.formType,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء ربط رقم الاستمارة بالطلب',
      },
      { status: 500 }
    );
  }
}
