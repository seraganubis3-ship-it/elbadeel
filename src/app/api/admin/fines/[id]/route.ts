import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const { name, description, amountCents, category, isActive } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (amountCents !== undefined) data.amountCents = Number(amountCents);
    if (category !== undefined) data.category = category;
    if (isActive !== undefined) data.isActive = isActive;

    const fine = await prisma.fine.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, fine });
  } catch (error) {
    console.error('Error updating fine:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تحديث الرسم/الغرامة' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    // Check if used? We'll just soft delete or physically delete if not heavily integrated yet.
    await prisma.fine.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting fine:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء حذف الرسم/الغرامة' },
      { status: 500 }
    );
  }
}
