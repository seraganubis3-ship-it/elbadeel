import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { logger } from '@/lib/logger';

// Schema للتحقق من صحة البيانات
const profileUpdateSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(100, 'الاسم طويل جداً'),
  phone: z.string().optional(),
  wifeName: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
  birthDate: z.string().optional(),
  nationality: z.string().optional(),
  idNumber: z.string().optional(),
  address: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        wifeName: true,
        fatherName: true,
        motherName: true,
        birthDate: true,
        nationality: true,
        idNumber: true,
        address: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    logger.error('GET Profile Error', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في جلب بيانات البروفايل' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const body = await request.json();

    // التحقق من صحة البيانات
    const validationResult = profileUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'بيانات غير صحيحة',
          details: validationResult.error.issues,
        },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // تحضير البيانات للتحديث
    const updateData: any = {
      name: data.name,
      phone: data.phone || null,
      wifeName: data.wifeName || null,
      fatherName: data.fatherName || null,
      motherName: data.motherName || null,
      nationality: data.nationality || null,
      idNumber: data.idNumber || null,
      address: data.address || null,
    };

    // تحويل تاريخ الميلاد إذا كان موجوداً
    if (data.birthDate) {
      updateData.birthDate = new Date(data.birthDate);
    }

    // تحديث المستخدم في قاعدة البيانات
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        wifeName: true,
        fatherName: true,
        motherName: true,
        birthDate: true,
        nationality: true,
        idNumber: true,
        address: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: 'تم تحديث البروفايل بنجاح',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('PUT Profile Error', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ في تحديث البروفايل' },
      { status: 500 }
    );
  }
}
