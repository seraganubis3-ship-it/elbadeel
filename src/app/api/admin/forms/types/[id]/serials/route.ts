import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminOrStaff();

    const { id } = params;
    const serials = await (prisma as any).formSerial.findMany({
      where: { formTypeId: id },
      orderBy: [{ consumed: 'asc' }, { createdAt: 'desc' }],
      include: {
        addedByAdmin: { select: { id: true, name: true, email: true } },
        consumedByAdmin: { select: { id: true, name: true, email: true } },
      },
    });
    return NextResponse.json({ success: true, serials });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'غير مسجل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الأرقام' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminOrStaff();

    const { id } = params;
    const body = await request.json();
    const serials: string[] = Array.isArray(body.serials) ? body.serials : [];
    if (serials.length === 0) {
      return NextResponse.json({ error: 'يجب إدخال أرقام واحدة على الأقل' }, { status: 400 });
    }

    const data = serials.map(s => ({
      formTypeId: id,
      serialNumber: s,
      addedByAdminId: session.user.id,
    }));
    const created = await (prisma as any).formSerial.createMany({ data, skipDuplicates: true });

    // Return the actually created rows (best-effort reload)
    const createdRows = await (prisma as any).formSerial.findMany({
      where: { formTypeId: id, serialNumber: { in: serials } },
      orderBy: { createdAt: 'desc' },
      include: {
        addedByAdmin: { select: { id: true, name: true, email: true } },
        consumedByAdmin: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ success: true, createdCount: created.count, created: createdRows });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'غير مسجل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء إضافة الأرقام' }, { status: 500 });
  }
}
