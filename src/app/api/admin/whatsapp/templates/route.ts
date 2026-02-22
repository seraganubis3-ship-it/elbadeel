import { NextRequest, NextResponse } from 'next/server';
import { requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET: list all active templates
export async function GET() {
  try {
    await requireAdminOrStaff();
    const templates = await (prisma as any).whatsAppTemplate.findMany({
      orderBy: [{ category: 'asc' }, { orderIndex: 'asc' }, { createdAt: 'asc' }],
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
    const { title, trigger, body, category } = await req.json();
    if (!title?.trim() || !body?.trim() || (category !== 'MANUAL' && !trigger?.trim())) {
      return NextResponse.json({ success: false, error: 'العنوان والنص والزناد مطلوبان' }, { status: 400 });
    }
    const count = await (prisma as any).whatsAppTemplate.count();
    const template = await (prisma as any).whatsAppTemplate.create({
      data: { 
        title: title.trim(), 
        trigger: category === 'MANUAL' ? null : (trigger?.trim() || null),
        category: category || 'AUTOMATIC',
        body: body.trim(), 
        orderIndex: count 
      },
    });

    return NextResponse.json({ success: true, template });
  } catch {
    return NextResponse.json({ success: false, error: 'فشل الحفظ' }, { status: 500 });
  }
}
