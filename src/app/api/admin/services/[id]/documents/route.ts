import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { id } = params;
    const documents = await prisma.serviceDocument.findMany({
      where: { serviceId: id },
      orderBy: { orderIndex: 'asc' },
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب مستندات الخدمة' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const { title, description, required = true, active = true } = body;

    if (!title) {
      return NextResponse.json({ error: 'عنوان المستند مطلوب' }, { status: 400 });
    }

    // Get the next order index
    const lastDocument = await prisma.serviceDocument.findFirst({
      where: { serviceId: id },
      orderBy: { orderIndex: 'desc' },
    });

    const orderIndex = lastDocument ? lastDocument.orderIndex + 1 : 0;

    const document = await prisma.serviceDocument.create({
      data: {
        serviceId: id,
        title,
        description,
        required,
        active,
        orderIndex,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء مستند الخدمة' }, { status: 500 });
  }
}
