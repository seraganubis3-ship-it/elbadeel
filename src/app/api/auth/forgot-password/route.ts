import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendEmailSafe } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مطلوب" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { success: true, message: "إذا كان البريد الإلكتروني مسجل، سيتم إرسال رابط إعادة التعيين" }
      );
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // Send email
    const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    
    await sendEmailSafe({
      to: email,
      subject: "إعادة تعيين كلمة المرور - منصة البديل",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">إعادة تعيين كلمة المرور</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              مرحباً ${user.name || "عزيزي المستخدم"}،
            </p>
            <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة البديل.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="background: #059669; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                إعادة تعيين كلمة المرور
              </a>
            </div>
            <p style="color: #000000; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذا البريد الإلكتروني.
            </p>
            <p style="color: #000000; font-size: 14px; line-height: 1.6; margin-bottom: 20px;">
              هذا الرابط صالح لمدة ساعة واحدة فقط.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #111827; font-size: 12px; text-align: center;">
              منصة البديل - خدمات استخراج الأوراق الرسمية
            </p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({
      success: true,
      message: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
    });

  } catch (error) {
    console.error("Error in forgot password:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء معالجة الطلب" },
      { status: 500 }
    );
  }
}
