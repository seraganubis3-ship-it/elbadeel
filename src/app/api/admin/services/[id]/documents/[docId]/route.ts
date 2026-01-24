import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const resolvedParams = await params;
    const body = await request.json();

    const { title, description, required, active, orderIndex } = body;

    if (!title) {
      return NextResponse.json({ error: 'عنوان المستند مطلوب' }, { status: 400 });
    }

    const document = await prisma.serviceDocument.update({
      where: {
        id: resolvedParams.docId,
        serviceId: resolvedParams.id,
      },
      data: {
        title,
        description,
        required,
        active,
        orderIndex: orderIndex !== undefined ? orderIndex : undefined,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث مستند الخدمة' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const resolvedParams = await params;

    await prisma.serviceDocument.delete({
      where: {
        id: resolvedParams.docId,
        serviceId: resolvedParams.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف مستند الخدمة' }, { status: 500 });
  }
}
