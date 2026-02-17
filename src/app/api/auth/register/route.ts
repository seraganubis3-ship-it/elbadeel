import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendVerificationCode } from '@/lib/notifications';
import { generateVerificationCode } from '@/lib/email';

const registerSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, password } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'رقم الهاتف مستخدم بالفعل',
          action: 'LOGIN_EXISTING',
          message: 'هذا الرقم مسجل بالفعل. يرجى تسجيل الدخول.',
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Create user
    // Note: email is optional and not collected here.
    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash: hashedPassword,
        role: 'USER',
        emailVerified: new Date(), // Auto-verify phone accounts? Or leave null?
        // User requested simplification. Usually phone users are considered verified if no SMS verification is implemented yet.
        // Assuming auto-verify for now or just proceed.
      },
    });

    // Remove password from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: 'تم إنشاء الحساب بنجاح.',
        user: userWithoutPassword,
        verificationSent: false, // No verification needed
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || 'بيانات غير صحيحة' },
        { status: 400 }
      );
    }

    return NextResponse.json({ error: 'حدث خطأ في إنشاء الحساب' }, { status: 500 });
  }
}
