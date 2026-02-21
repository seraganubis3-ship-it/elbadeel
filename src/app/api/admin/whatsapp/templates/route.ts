import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: list all active templates
export async function GET() {
  try {
    await requireAdminOrStaff();
    const templates = await (prisma as any).whatsAppTemplate.findMany({
      where: { active: true },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
    return NextResponse.json({ success: true, templates });
  } catch {
    return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 401 });
  }
}

// POST: create a new template
export async function POST(req: NextRequest) {
  try {
    await requireAdminOrStaff();
    const { title, body } = await req.json();
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ success: false, error: 'العنوان والنص مطلوبان' }, { status: 400 });
    }
    const count = await (prisma as any).whatsAppTemplate.count();
    const template = await (prisma as any).whatsAppTemplate.create({
      data: { title: title.trim(), body: body.trim(), orderIndex: count },
    });
    return NextResponse.json({ success: true, template });
  } catch {
    return NextResponse.json({ success: false, error: 'فشل الحفظ' }, { status: 500 });
  }
}
