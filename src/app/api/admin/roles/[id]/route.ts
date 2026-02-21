import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const data = await req.json();
    const { id } = await params;

    if (!data.name || !Array.isArray(data.permissions)) {
      return NextResponse.json({ error: 'البيانات غير مكتملة' }, { status: 400 });
    }

    const updatedRole = await prisma.adminRole.update({
      where: { id },
      data: {
        name: data.name,
        permissions: data.permissions,
      },
    });

    return NextResponse.json(updatedRole);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Updating role error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث الرتبة' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    // First check if role is assigned to any users
    const usersCount = await prisma.user.count({
      where: { adminRoleId: id },
    });

    if (usersCount > 0) {
      return NextResponse.json(
        { error: 'لا يمكن حذف هذه الرتبة لوجود مستخدمين مرتبطين بها. يرجى نقل المستخدمين أولاً.' },
        { status: 400 }
      );
    }

    await prisma.adminRole.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error('Deleting role error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء حذف الرتبة' }, { status: 500 });
  }
}
