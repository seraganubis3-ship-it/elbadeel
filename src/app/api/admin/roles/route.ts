import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try {
    await requireAdmin();

    const roles = await prisma.adminRole.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    return NextResponse.json(roles);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Fetching roles error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الرتب' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = await req.json();

    if (!data.name || !Array.isArray(data.permissions)) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    const role = await prisma.adminRole.create({
      data: {
        name: data.name,
        permissions: data.permissions,
      },
    });

    return NextResponse.json(role);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Creating role error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الرتبة' }, { status: 500 });
  }
}
