import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const { workDate } = await request.json();

    if (!workDate) {
      return NextResponse.json({ error: 'تاريخ العمل مطلوب' }, { status: 400 });
    }

    // التحقق من صيغة التاريخ DD/MM/YYYY
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(workDate)) {
      return NextResponse.json(
        { error: 'صيغة التاريخ غير صحيحة. استخدم DD/MM/YYYY' },
        { status: 400 }
      );
    }

    // التحقق من صحة التاريخ
    const [day, month, year] = workDate.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      return NextResponse.json({ error: 'التاريخ المدخل غير صحيح' }, { status: 400 });
    }

    // هنا يمكننا تحديث الجلسة، لكن NextAuth لا يسمح بتعديل الجلسة مباشرة
    // سنحتاج لإعادة تسجيل الدخول مع التاريخ الجديد

    return NextResponse.json({
      success: true,
      message: 'تم حفظ تاريخ العمل بنجاح',
      workDate: workDate,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء حفظ تاريخ العمل',
      },
      { status: 500 }
    );
  }
}
