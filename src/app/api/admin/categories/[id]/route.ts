import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بالوصول لهذه الصفحة' },
        { status: 403 }
      );
    }

    const formData = await request.formData();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const orderIndex = formData.get('orderIndex') as string;
    const active = formData.get('active') === 'true';
    const image = formData.get('image') as File | null;

    if (!name || !slug) {
      return NextResponse.json(
        { success: false, error: 'اسم الفئة ورابط الفئة مطلوبان' },
        { status: 400 }
      );
    }

    // Validate slug format
    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
      return NextResponse.json(
        { success: false, error: 'رابط الفئة يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط' },
        { status: 400 }
      );
    }

    // Check if slug already exists for another category
    const existingCategory = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id: params.id },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: 'رابط الفئة موجود بالفعل، اختر رابطاً آخر' },
        { status: 400 }
      );
    }

    let imagePath: string | undefined = undefined;

    // Handle image upload
    if (image && image.size > 0) {
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'categories');

      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const fileName = `${timestamp}_${image.name}`;
      const filePath = join(uploadsDir, fileName);

      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);

      await writeFile(filePath, buffer);
      imagePath = `/uploads/categories/${fileName}`;
    }

    const updateData: any = {
      name,
      slug,
      orderIndex: parseInt(orderIndex || '0'),
      active,
    };

    if (imagePath) {
      updateData.icon = imagePath;
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    // console.error('Error updating category:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ أثناء تحديث الفئة' },
      { status: 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'غير مصرح لك بالوصول لهذه الصفحة' },
        { status: 403 }
      );
    }

    // Check if category has services
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { services: true } } },
    });

    if (!category) {
      return NextResponse.json({ success: false, error: 'الفئة غير موجودة' }, { status: 404 });
    }

    if (category._count.services > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `لا يمكن حذف الفئة لأنها تحتوي على ${category._count.services} خدمة. قم بحذف أو نقل الخدمات أولاً`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    // console.error('Error deleting category:', error);
    return NextResponse.json({ success: false, error: 'حدث خطأ أثناء حذف الفئة' }, { status: 500 });
  }
}
