import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { awardSupervisorPoints } from '@/lib/incentives';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and role
    const session = await requireAdminOrStaff();

    const { id } = params;
    const body = await request.json();
    const { serialNumber } = body;
    const provider: string = body.provider || 'AL_BADEL';

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

    // If order already has form serials, unconsume them first
    if (order.formSerials.length > 0) {
      await (prisma as any).formSerial.updateMany({
        where: { orderId: order.id },
        data: {
          consumed: false,
          consumedAt: null,
          orderId: null,
          consumedByAdminId: null,
        },
      });
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

    // Check if the serial number exists and is available FOR THE GIVEN PROVIDER
    const formSerial = await (prisma as any).formSerial.findFirst({
      where: {
        formTypeId: formTypeVariant.formTypeId,
        serialNumber: serialNumber,
        provider: provider, // ← must match provider
        consumed: false,
      },
    });

    if (!formSerial) {
      return NextResponse.json(
        {
          error: `رقم الاستمارة غير موجود أو تم استخدامه (المزود: ${provider === 'AL_WAFI' ? 'الوافي' : 'البديل'})`,
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

    // 🏆 منح نقاط للمشرف على ربط السيريال
    try {
      await awardSupervisorPoints({
        userId: session.user.id,
        actionType: 'SERIAL_BOUND',
        orderId: order.id,
        description: `ربط سيريال استمارة (${formSerial.serialNumber}) بالطلب`,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'تم ربط رقم الاستمارة بالطلب بنجاح',
      formSerial: {
        id: formSerial.id,
        serialNumber: formSerial.serialNumber,
        provider: formSerial.provider,
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
