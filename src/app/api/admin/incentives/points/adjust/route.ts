import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { awardSupervisorPoints } from '@/lib/incentives';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بتعديل النقاط، للأدمن فقط' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, points, description, orderId } = body;

    if (!userId || points === undefined) {
      return NextResponse.json({ error: 'يرجى تزويد معرف المشرف وعدد النقاط' }, { status: 400 });
    }

    await awardSupervisorPoints({
      userId,
      actionType: 'MANUAL_ADJUSTMENT',
      customPoints: Number(points),
      orderId: orderId || undefined,
      description: description || 'تعديل يدوي من الإدارة',
    });

    return NextResponse.json({
      success: true,
      message: 'تم إضافة/خصم النقاط بنجاح',
    });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء تعديل النقاط' }, { status: 500 });
  }
}
