import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getIncentiveConfig } from '@/lib/incentives';

export async function GET() {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'STAFF'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
    }

    const config = await getIncentiveConfig();
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب إعدادات الحوافز' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'غير مصرح لك بتعديل إعدادات الحوافز، للأدمن فقط' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      isEnabled,
      pointsPerOrder,
      pointsPerEdit,
      pointsPerSerial,
      pointsPerPayment,
      egpPerPoint,
    } = body;

    const updatedConfig = await prisma.incentiveConfig.upsert({
      where: { id: 'default' },
      update: {
        ...(isEnabled !== undefined ? { isEnabled: Boolean(isEnabled) } : {}),
        ...(pointsPerOrder !== undefined ? { pointsPerOrder: Number(pointsPerOrder) } : {}),
        ...(pointsPerEdit !== undefined ? { pointsPerEdit: Number(pointsPerEdit) } : {}),
        ...(pointsPerSerial !== undefined ? { pointsPerSerial: Number(pointsPerSerial) } : {}),
        ...(pointsPerPayment !== undefined ? { pointsPerPayment: Number(pointsPerPayment) } : {}),
        ...(egpPerPoint !== undefined ? { egpPerPoint: Number(egpPerPoint) } : {}),
      },
      create: {
        id: 'default',
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
        pointsPerOrder: pointsPerOrder !== undefined ? Number(pointsPerOrder) : 10,
        pointsPerEdit: pointsPerEdit !== undefined ? Number(pointsPerEdit) : 5,
        pointsPerSerial: pointsPerSerial !== undefined ? Number(pointsPerSerial) : 5,
        pointsPerPayment: pointsPerPayment !== undefined ? Number(pointsPerPayment) : 10,
        egpPerPoint: egpPerPoint !== undefined ? Number(egpPerPoint) : 1.0,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حفظ إعدادات الحوافز بنجاح',
      config: updatedConfig,
    });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث إعدادات الحوافز' }, { status: 500 });
  }
}
