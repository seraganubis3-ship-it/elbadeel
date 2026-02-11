import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToBackblaze } from '@/lib/s3';
import { generatePresignedUrl } from '@/lib/presignedUrl';

export async function GET(_request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!['ADMIN', 'STAFF', 'VIEWER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const categories = await prisma.category.findMany({
      include: {
        services: {
          include: {
            variants: { orderBy: { priceCents: 'asc' } },
            documents: { orderBy: { orderIndex: 'asc' } },
            fields: {
              include: {
                options: { orderBy: { orderIndex: 'asc' } },
              },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
      orderBy: { orderIndex: 'asc' },
    });

    // Process categories to add signed URLs for icons
    const categoriesWithSignedUrls = await Promise.all(categories.map(async (category) => {
        let iconUrl = category.icon;
        if (iconUrl && !iconUrl.startsWith('/uploads/') && !iconUrl.startsWith('http')) {
            iconUrl = await generatePresignedUrl(iconUrl);
        }
        return { ...category, icon: iconUrl };
    }));

    return NextResponse.json({ success: true, categories: categoriesWithSignedUrls });
  } catch (error) {
    // console.error("Error fetching categories:", error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الفئات' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const formData = await request.formData();

    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const orderIndex = formData.get('orderIndex') as string;
    const active = formData.get('active') === 'true';
    const image = formData.get('image') as File | null;

    if (!name || !slug) {
      return NextResponse.json({ error: 'اسم الفئة ورابط الفئة مطلوبان' }, { status: 400 });
    }

    // Validate slug format
    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'رابط الفئة يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'رابط الفئة موجود بالفعل، اختر رابطاً آخر' },
        { status: 400 }
      );
    }

    let imagePath = null;

    // Handle image upload with B2
    if (image && image.size > 0) {
        try {
            imagePath = await uploadToBackblaze(image, 'categories');
        } catch (e) {
            // Upload failed
        }
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: imagePath,
        orderIndex: parseInt(orderIndex || '0'),
        active,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    // console.error("Error creating category:", error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الفئة' }, { status: 500 });
  }
}
