import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import { compare, hash } from 'bcryptjs';
import { z } from 'zod';

// Schema للتحقق من صحة البيانات
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
  newPassword: z.string().min(6, 'كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل'),
});

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();

    // التحقق من صحة البيانات
    const validationResult = changePasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'بيانات غير صحيحة',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validationResult.data;

    // جلب المستخدم من قاعدة البيانات
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: 'لا يمكن تغيير كلمة المرور لهذا الحساب' }, { status: 400 });
    }

    // التحقق من كلمة المرور الحالية
    const isCurrentPasswordValid = await compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
    }

    // تشفير كلمة المرور الجديدة
    const hashedNewPassword = await hash(newPassword, 12);

    // تحديث كلمة المرور في قاعدة البيانات
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: hashedNewPassword,
      },
    });

    return NextResponse.json({
      message: 'تم تغيير كلمة المرور بنجاح',
    });
  } catch (error) {
    //
    return NextResponse.json({ error: 'حدث خطأ في تغيير كلمة المرور' }, { status: 500 });
  }
}
