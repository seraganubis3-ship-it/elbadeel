import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'البيانات غير صالحة' }, { status: 400 });
    }

    // Update orders in transaction
    await prisma.$transaction(
      items.map((item: any) =>
        prisma.service.update({
          where: { id: item.id },
          data: { orderIndex: item.orderIndex },
        })
      )
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الترتيب' }, { status: 500 });
  }
}
