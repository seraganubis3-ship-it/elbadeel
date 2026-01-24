import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'التوكن مطلوب' }, { status: 400 });
    }

    // Find user with valid verification code (unified system)
    const user = await prisma.user.findFirst({
      where: {
        verificationCode: token,
        verificationCodeExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'رابط التأكيد غير صحيح أو منتهي الصلاحية' },
        { status: 400 }
      );
    }

    // Update user to verified and clear verification fields
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationCodeExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تأكيد البريد الإلكتروني بنجاح',
    });
  } catch (error) {
    //
    return NextResponse.json({ error: 'حدث خطأ أثناء تأكيد البريد الإلكتروني' }, { status: 500 });
  }
}
