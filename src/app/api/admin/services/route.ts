import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { uploadToBackblaze } from '@/lib/s3';
import { generatePresignedUrl } from '@/lib/presignedUrl';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!['ADMIN', 'STAFF', 'VIEWER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const services = await prisma.service.findMany({
      include: {
        category: true,
        variants: true,
        documents: true,
      },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'desc' }],
    });

    // Process services to add signed URLs for icons
    const servicesWithSignedUrls = await Promise.all(
      services.map(async service => {
        let iconUrl = service.icon;
        if (iconUrl && !iconUrl.startsWith('/uploads/') && !iconUrl.startsWith('http')) {
          iconUrl = await generatePresignedUrl(iconUrl);
        }
        return { ...service, icon: iconUrl };
      })
    );

    return NextResponse.json({ success: true, services: servicesWithSignedUrls });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب الخدمات' }, { status: 500 });
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
    const description = formData.get('description') as string;
    const categoryId = formData.get('categoryId') as string;
    const active = formData.get('active') === 'true';
    const image = formData.get('image') as File | null;

    if (!name || !slug || !categoryId) {
      return NextResponse.json(
        { error: 'اسم الخدمة ورابط الخدمة والفئة مطلوبان' },
        { status: 400 }
      );
    }

    // Validate slug format (Allow English, Arabic, numbers and hyphens)
    if (!/^[a-zA-Z0-9\-\u0600-\u06FF\s_]+$/.test(slug)) {
      return NextResponse.json(
        { error: 'رابط الخدمة يجب أن يحتوي على أحرف أو أرقام أو فواصل فقط' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingService = await prisma.service.findUnique({
      where: { slug },
    });

    if (existingService) {
      return NextResponse.json(
        { error: 'رابط الخدمة موجود بالفعل، اختر رابطاً آخر' },
        { status: 400 }
      );
    }

    let imagePath = null;

    // Handle image upload with B2
    if (image && image.size > 0) {
      try {
        imagePath = await uploadToBackblaze(image, 'services');
      } catch (e) {
        // Upload failed
        // Non-blocking? Or blocking? Typically blocking.
        // But if it fails, we might just continue without image or error.
      }
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description,
        icon: imagePath,
        active,
        categoryId,
      },
      include: {
        category: true,
        variants: true,
        documents: true,
      },
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الخدمة' }, { status: 500 });
  }
}
