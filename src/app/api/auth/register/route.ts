import { NextRequest, NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { sendVerificationCodeEmail, generateVerificationCode } from "@/lib/email";

const registerSchema = z.object({
  name: z.string().min(2, "الاسم يجب أن يكون على الأقل حرفين"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phone: z.string().min(10, "رقم الهاتف غير صحيح"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, phone } = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // إذا كان الحساب موجود لكن غير مفعل
      if (!existingUser.emailVerified) {
        return NextResponse.json(
          { 
            error: "حساب موجود بالفعل لكن غير مفعل",
            action: "VERIFY_EXISTING",
            message: "هذا البريد الإلكتروني مسجل بالفعل لكن لم يتم تفعيله. يرجى تفعيل الحساب الموجود.",
            userId: existingUser.id
          },
          { status: 409 } // Conflict - account exists but not verified
        );
      }
      
      // إذا كان الحساب موجود ومفعل
      return NextResponse.json(
        { 
          error: "البريد الإلكتروني مستخدم بالفعل",
          action: "LOGIN_EXISTING",
          message: "هذا البريد الإلكتروني مسجل ومفعل بالفعل. يرجى تسجيل الدخول بدلاً من إنشاء حساب جديد."
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 12);

    // Generate verification code (6 digits)
    const verificationCode = generateVerificationCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedPassword,
        phone,
        role: "USER",
        verificationToken: verificationCode, // Use existing field
        verificationTokenExpiry: verificationCodeExpiry, // Use existing field
      },
    });

    // Remove password from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    // Send verification code email
    try {
      await sendVerificationCodeEmail(email, name, verificationCode);
    } catch (emailError) {
      console.error("Error sending verification code email:", emailError);
      // Continue with user creation even if email fails
    }

    return NextResponse.json(
      { 
        message: "تم إنشاء الحساب بنجاح. يرجى التحقق من بريدك الإلكتروني لتأكيد الحساب.",
        user: userWithoutPassword,
        verificationSent: true
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "حدث خطأ في إنشاء الحساب" },
      { status: 500 }
    );
  }
}
