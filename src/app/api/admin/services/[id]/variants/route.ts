import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { id: serviceId } = await params;
    const body = await request.json();

    const { name, priceCents, etaDays, active = true } = body;

    if (!name || !priceCents || !etaDays) {
      return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
    }

    const variant = await prisma.serviceVariant.create({
      data: {
        name,
        priceCents: parseInt(priceCents),
        etaDays: parseInt(etaDays),
        active,
        serviceId,
      },
    });

    return NextResponse.json({ success: true, variant });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء نوع الخدمة' }, { status: 500 });
  }
}
