import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const verifyCodeSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('بريد إلكتروني غير صحيح'),
  code: z.string().min(1, 'الكود مطلوب').length(6, 'الكود يجب أن يكون 6 أرقام'),
  userId: z.string().optional(),
  action: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, userId, action } = verifyCodeSchema.parse(body);

    // التحقق من وجود البيانات المطلوبة
    if (!email || !code) {
      return NextResponse.json({ error: 'البريد الإلكتروني والكود مطلوبان' }, { status: 400 });
    }

    // تحديد نوع العملية
    const isVerifyingExisting = action === 'verify_existing';

    // البحث عن المستخدم
    let user;
    if (userId && isVerifyingExisting) {
      // إذا كان لدينا معرف المستخدم، استخدمه للبحث
      user = await prisma.user.findFirst({
        where: {
          id: userId,
          verificationCode: code, // Use verificationCode field
          verificationCodeExpiry: {
            gt: new Date(), // Code not expired
          },
        },
      });
    } else {
      // البحث بالبريد الإلكتروني
      user = await prisma.user.findFirst({
        where: {
          email,
          verificationCode: code, // Use verificationCode field
          verificationCodeExpiry: {
            gt: new Date(), // Code not expired
          },
        },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'كود التفعيل غير صحيح أو منتهي الصلاحية' },
        { status: 400 }
      );
    }

    // Verify the user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationCode: null, // Use verificationCode field
        verificationCodeExpiry: null, // Use verificationCodeExpiry field
      },
    });

    return NextResponse.json(
      {
        message: isVerifyingExisting
          ? 'تم تفعيل الحساب الموجود بنجاح! يمكنك الآن تسجيل الدخول.'
          : 'تم تأكيد البريد الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.',
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: new Date(),
        },
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
    return NextResponse.json({ error: 'حدث خطأ في التحقق من الكود' }, { status: 500 });
  }
}
