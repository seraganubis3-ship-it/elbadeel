import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminOrStaff();

    const { id } = params;
    const links = await (prisma as any).formTypeVariant.findMany({
      where: { formTypeId: id },
      select: { serviceVariantId: true },
    });
    return NextResponse.json({
      success: true,
      variantIds: (links as any[]).map((l: any) => l.serviceVariantId),
    });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'غير مسجل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الربط' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAdminOrStaff();

    const { id } = params;
    const body = await request.json();
    const variantIds: string[] = Array.isArray(body.variantIds) ? body.variantIds : [];

    // Replace all links atomically
    await (prisma as any).$transaction([
      (prisma as any).formTypeVariant.deleteMany({ where: { formTypeId: id } }),
      (prisma as any).formTypeVariant.createMany({
        data: variantIds.map(vId => ({ formTypeId: id, serviceVariantId: vId })),
        skipDuplicates: true,
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'غير مسجل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ الربط' }, { status: 500 });
  }
}
