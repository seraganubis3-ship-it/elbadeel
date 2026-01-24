import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendVerificationCodeEmail, generateVerificationCode } from '@/lib/email';

const resendCodeSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صحيح'),
  userId: z.string().optional(),
  action: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, userId, action } = resendCodeSchema.parse(body);

    // التحقق من وجود البيانات المطلوبة
    if (!email || email.trim() === '') {
      return NextResponse.json({ error: 'البريد الإلكتروني مطلوب' }, { status: 400 });
    }

    // تحديد نوع العملية
    const isVerifyingExisting = action === 'verify_existing';

    // البحث عن المستخدم
    let user;
    if (userId && isVerifyingExisting) {
      // إذا كان لدينا معرف المستخدم، استخدمه للبحث
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } else {
      // البحث بالبريد الإلكتروني
      user = await prisma.user.findUnique({
        where: { email },
      });
    }

    if (!user) {
      return NextResponse.json({ error: 'البريد الإلكتروني غير موجود' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'البريد الإلكتروني مؤكد بالفعل' }, { status: 400 });
    }

    // Generate new verification code
    const newVerificationCode = generateVerificationCode();
    const newVerificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with new code
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode: newVerificationCode, // Use verificationCode field
        verificationCodeExpiry: newVerificationCodeExpiry, // Use verificationCodeExpiry field
      },
    });

    // Send new verification code email
    try {
      await sendVerificationCodeEmail(email, user.name || 'المستخدم', newVerificationCode);
    } catch (emailError) {
      //
      return NextResponse.json({ error: 'فشل في إرسال كود التفعيل' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: isVerifyingExisting
          ? 'تم إرسال كود جديد إلى بريدك الإلكتروني لتفعيل الحساب الموجود'
          : 'تم إرسال كود جديد إلى بريدك الإلكتروني',
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      );
    }

    //
    return NextResponse.json({ error: 'حدث خطأ في إعادة إرسال الكود' }, { status: 500 });
  }
}
