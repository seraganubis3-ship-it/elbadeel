import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(_request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();

    if (!['ADMIN', 'STAFF'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { name } = await _request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'اسم التابع مطلوب' }, { status: 400 });
    }

    // Check if dependent already exists
    const existingDependent = await prisma.dependent.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existingDependent) {
      return NextResponse.json({
        success: true,
        dependent: existingDependent,
        message: 'التابع موجود بالفعل',
      });
    }

    // Create new dependent
    const dependent = await prisma.dependent.create({
      data: {
        name: name.trim(),
        createdByAdminId: session.user.id,
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      dependent,
      message: 'تم إنشاء التابع بنجاح',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء إنشاء التابع',
      },
      { status: 500 }
    );
  }
}
