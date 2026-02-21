import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// DELETE: soft-delete a template
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminOrStaff();
    await (prisma as any).whatsAppTemplate.update({
      where: { id: params.id },
      data: { active: false },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'فشل الحذف' }, { status: 500 });
  }
}

// PATCH: update title / body
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdminOrStaff();
    const { title, body } = await req.json();
    const template = await (prisma as any).whatsAppTemplate.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(body !== undefined && { body: body.trim() }),
      },
    });
    return NextResponse.json({ success: true, template });
  } catch {
    return NextResponse.json({ success: false, error: 'فشل التحديث' }, { status: 500 });
  }
}
