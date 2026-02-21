import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

import { hasPermission } from '@/lib/permissions';
import { hash } from 'bcryptjs';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون على الأقل حرفين'),
  // email: z.string().email('بريد إلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'),
  password: z.string().min(4, 'كلمة المرور يجب أن تكون 4 أحرف على الأقل'),
  role: z.string().min(1, 'دور غير صحيح'),
  adminRoleId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    // التحقق من صلاحيات المدير
    if (!session?.user || !hasPermission(session.user, 'MANAGE_USERS')) {
      return NextResponse.json({ error: 'غير مصرح لك بإنشاء مستخدمين' }, { status: 401 });
    }

    const body = await req.json();
    // console.log('Create Admin Request Body:', body);

    // التحقق من صحة البيانات
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'بيانات غير صحيحة',
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { name, phone, password, role, adminRoleId } = validation.data;

    // التحقق من عدم وجود مستخدم بنفس رقم الهاتف
    // استخدام findFirst بدلاً من findUnique لأننا قمنا بإزالة constraint من الداتابيس مؤقتاً
    const existingUser = await prisma.user.findFirst({
      where: { phone },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'رقم الهاتف مستخدم بالفعل',
        },
        { status: 400 }
      );
    }

    // تشفير كلمة المرور
    const hashedPassword = await hash(password, 12);

    // إنشاء المستخدم الجديد
    const newUser = await prisma.user.create({
      data: {
        name,
        email: null,
        phone,
        passwordHash: hashedPassword,
        role: role as any,
        adminRoleId: adminRoleId || null,
        emailVerified: new Date(), // تفعيل الحساب مباشرة
        createdByAdminId: session.user.id, // تسجيل من أنشأ هذا المستخدم
      },
      select: {
        id: true,
        name: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'تم إنشاء المستخدم بنجاح',
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء إنشاء المستخدم',
      },
      { status: 500 }
    );
  }
}
