import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();

    if (!['ADMIN', 'STAFF'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { userId, newName } = await request.json();

    if (!userId || !newName) {
      return NextResponse.json({ error: 'معرف العميل والاسم الجديد مطلوبان' }, { status: 400 });
    }

    // Update user name
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name: newName },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        birthDate: true,
        fatherName: true,
        motherName: true,
        nationality: true,
        wifeName: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء تحديث اسم العميل',
      },
      { status: 500 }
    );
  }
}
