import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();

    if (!['ADMIN', 'STAFF', 'VIEWER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { searchParams } = new URL(_request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 1) {
      return NextResponse.json({ dependents: [] });
    }

    // Search for dependents by name
    const dependents = await prisma.dependent.findMany({
      where: {
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc',
      },
      take: 10,
    });

    return NextResponse.json({
      success: true,
      dependents,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء البحث عن التابعين',
      },
      { status: 500 }
    );
  }
}
