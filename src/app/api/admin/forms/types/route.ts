import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdminOrStaff } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await requireAdminOrStaff();

    const formTypes = await (prisma as any).formType.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, formTypes });
  } catch (error: any) {
    if (error?.message === 'Unauthorized') {
      return NextResponse.json({ error: 'غير مسجل الدخول' }, { status: 401 });
    }
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب أنواع الاستمارات' }, { status: 500 });
  }
}

// Creation disabled per business rule: return 405 Method Not Allowed
export async function POST(_request: NextRequest) {
  return NextResponse.json({ error: 'إضافة أنواع جديدة غير مسموح بها' }, { status: 405 });
}
