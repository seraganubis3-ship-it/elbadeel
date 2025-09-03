import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendEmailSafe } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const { email, userId, action } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مطلوب" },
        { status: 400 }
      );
    }

    // تحديد نوع العملية
    const isVerifyingExisting = action === "verify_existing";

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
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { success: true, message: "إذا كان البريد الإلكتروني مسجل، سيتم إرسال رسالة التأكيد" }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مؤكد بالفعل" },
        { status: 400 }
      );
    }

    // Generate verification code (6 digits) instead of token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save verification code to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationCode,
        verificationCodeExpiry,
      },
    });

    // Send verification code email
    await sendEmailSafe({
      to: email,
      subject: "كود تأكيد البريد الإلكتروني - منصة البديل",
      html: `
        <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669, #10b981); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">تأكيد البريد الإلكتروني - منصة البديل</h1>
          </div>
          <div style="padding: 30px; background: #f9fafb; border-radius: 0 0 10px 10px;">
            <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              مرحباً ${user.name || "عزيزي المستخدم"}،
            </p>
            <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              ${isVerifyingExisting 
                ? "هذا البريد الإلكتروني مسجل بالفعل لكن لم يتم تفعيله. يرجى استخدام الكود التالي لتأكيد بريدك الإلكتروني:"
                : "شكراً لك على التسجيل في منصة البديل. يرجى استخدام الكود التالي لتأكيد بريدك الإلكتروني:"
              }
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <div style="background: #ffffff; border: 3px solid #059669; border-radius: 10px; padding: 20px; display: inline-block; min-width: 200px;">
                <div style="font-size: 32px; font-weight: bold; color: #059669; letter-spacing: 5px; font-family: monospace;">
                  ${verificationCode}
                </div>
              </div>
            </div>
            <p style="color: #000000; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
              <strong>ملاحظات مهمة:</strong>
            </p>
            <ul style="color: #000000; font-size: 14px; line-height: 1.6; margin-bottom: 20px; padding-right: 20px;">
              <li>هذا الكود صالح لمدة 10 دقائق فقط</li>
              <li>لا تشارك هذا الكود مع أي شخص</li>
              <li>إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني</li>
            </ul>
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
      message: isVerifyingExisting 
        ? "تم إرسال كود التأكيد إلى بريدك الإلكتروني لتفعيل الحساب الموجود"
        : "تم إرسال رسالة التأكيد إلى بريدك الإلكتروني",
    });

  } catch (error) {
    console.error("Error in resend verification:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء إرسال رسالة التأكيد" },
      { status: 500 }
    );
  }
}
