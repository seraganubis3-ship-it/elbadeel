import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';

const emptyToNull = (val: unknown) => (val === '' ? null : val);
const genderTransform = (val: unknown) => {
  if (val === '') return null;
  if (typeof val === 'string') return val.toLowerCase();
  return val;
};

const userUpdateSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(100, 'الاسم طويل جداً').optional(),
  phone: z.preprocess(emptyToNull, z.string().optional().nullable()),
  email: z.preprocess(
    emptyToNull,
    z.string().email('البريد الإلكتروني غير صحيح').optional().nullable()
  ),
  wifeName: z.preprocess(emptyToNull, z.string().optional().nullable()),
  fatherName: z.preprocess(emptyToNull, z.string().optional().nullable()),
  motherName: z.preprocess(emptyToNull, z.string().optional().nullable()),
  birthDate: z.preprocess(emptyToNull, z.string().optional().nullable()),
  nationality: z.preprocess(emptyToNull, z.string().optional().nullable()),
  idNumber: z.preprocess(emptyToNull, z.string().optional().nullable()),
  address: z.preprocess(emptyToNull, z.string().optional().nullable()),
  governorate: z.preprocess(emptyToNull, z.string().optional().nullable()),
  city: z.preprocess(emptyToNull, z.string().optional().nullable()),
  district: z.preprocess(emptyToNull, z.string().optional().nullable()),
  street: z.preprocess(emptyToNull, z.string().optional().nullable()),
  buildingNumber: z.preprocess(emptyToNull, z.string().optional().nullable()),
  apartmentNumber: z.preprocess(emptyToNull, z.string().optional().nullable()),
  landmark: z.preprocess(emptyToNull, z.string().optional().nullable()),
  additionalPhone: z.preprocess(emptyToNull, z.string().optional().nullable()),
  gender: z.preprocess(genderTransform, z.enum(['male', 'female']).optional().nullable()),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();
    if (session.user.role !== 'ADMIN' && !hasPermission(session.user as any, 'MANAGE_USERS')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();

    const validationResult = userUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn('User update validation failed:', {
        errors: validationResult.error.issues,
        body,
      });
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

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.wifeName !== undefined) updateData.wifeName = data.wifeName || null;
    if (data.fatherName !== undefined) updateData.fatherName = data.fatherName || null;
    if (data.motherName !== undefined) updateData.motherName = data.motherName || null;
    if (data.nationality !== undefined) updateData.nationality = data.nationality || null;
    if (data.idNumber !== undefined) updateData.idNumber = data.idNumber || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.governorate !== undefined) updateData.governorate = data.governorate || null;
    if (data.city !== undefined) updateData.city = data.city || null;
    if (data.district !== undefined) updateData.district = data.district || null;
    if (data.street !== undefined) updateData.street = data.street || null;
    if (data.buildingNumber !== undefined) updateData.buildingNumber = data.buildingNumber || null;
    if (data.apartmentNumber !== undefined)
      updateData.apartmentNumber = data.apartmentNumber || null;
    if (data.landmark !== undefined) updateData.landmark = data.landmark || null;
    if (data.additionalPhone !== undefined)
      updateData.additionalPhone = data.additionalPhone || null;
    if (data.gender !== undefined) updateData.gender = data.gender;

    if (data.birthDate) {
      updateData.birthDate = new Date(data.birthDate);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
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
        governorate: true,
        city: true,
        district: true,
        street: true,
        buildingNumber: true,
        apartmentNumber: true,
        landmark: true,
        additionalPhone: true,
        gender: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تحديث بيانات المستخدم بنجاح',
      user: updatedUser,
    });
  } catch (error) {
    logger.error('Error updating user:', error);
    return NextResponse.json(
      { success: false, error: 'فشل تحديث بيانات المستخدم' },
      { status: 500 }
    );
  }
}
