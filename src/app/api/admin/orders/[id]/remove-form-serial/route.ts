import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and role
    const session = await requireAdminOrStaff();

    const { id } = params;
    const url = new URL(request.url);
    const serialId = url.searchParams.get('serialId');

    if (!serialId) {
      return NextResponse.json({ error: 'معرف الاستمارة مطلوب' }, { status: 400 });
    }

    // Check if the form serial belongs to this order
    const formSerial = await (prisma as any).formSerial.findFirst({
      where: {
        id: serialId,
        orderId: id,
      },
    });

    if (!formSerial) {
      return NextResponse.json({ error: 'رقم الاستمارة غير مرتبط بهذا الطلب' }, { status: 404 });
    }

    // Unconsume the form serial
    await (prisma as any).formSerial.update({
      where: { id: serialId },
      data: {
        consumed: false,
        consumedAt: null,
        orderId: null,
        consumedByAdminId: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم إزالة رقم الاستمارة من الطلب بنجاح',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء إزالة رقم الاستمارة',
      },
      { status: 500 }
    );
  }
}
