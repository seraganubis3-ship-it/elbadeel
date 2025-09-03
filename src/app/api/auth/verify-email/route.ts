import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "التوكن مطلوب" },
        { status: 400 }
      );
    }

    // Find user with valid verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "رابط التأكيد غير صحيح أو منتهي الصلاحية" },
        { status: 400 }
      );
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "تم تأكيد البريد الإلكتروني بنجاح",
    });

  } catch (error) {
    console.error("Error in verify email:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تأكيد البريد الإلكتروني" },
      { status: 500 }
    );
  }
}
