import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذه الصفحة" }, { status: 403 });
    }

    const services = await prisma.service.findMany({
      include: {
        category: true,
        variants: true,
        documents: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ success: true, services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب الخدمات" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذه الصفحة" }, { status: 403 });
    }

    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const slug = formData.get("slug") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const active = formData.get("active") === "true";
    const image = formData.get("image") as File | null;

    if (!name || !slug || !categoryId) {
      return NextResponse.json({ error: "اسم الخدمة ورابط الخدمة والفئة مطلوبان" }, { status: 400 });
    }

    // Validate slug format
    if (!/^[a-zA-Z0-9-_]+$/.test(slug)) {
      return NextResponse.json({ error: "رابط الخدمة يجب أن يحتوي على أحرف إنجليزية وأرقام وشرطات فقط" }, { status: 400 });
    }

    // Check if slug already exists
    const existingService = await prisma.service.findUnique({
      where: { slug }
    });

    if (existingService) {
      return NextResponse.json({ error: "رابط الخدمة موجود بالفعل، اختر رابطاً آخر" }, { status: 400 });
    }

    let imagePath = null;
    
    // Handle image upload
    if (image && image.size > 0) {
      const uploadsDir = join(process.cwd(), "public", "uploads", "services");
      
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      const timestamp = Date.now();
      const fileName = `${timestamp}_${image.name}`;
      const filePath = join(uploadsDir, fileName);
      
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);
      imagePath = `/uploads/services/${fileName}`;
    }

    // Create service
    const service = await prisma.service.create({
      data: {
        name,
        slug,
        description,
        icon: imagePath,
        active,
        categoryId
      },
      include: {
        category: true,
        variants: true,
        documents: true
      }
    });

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: "حدث خطأ أثناء إنشاء الخدمة" }, { status: 500 });
  }
}
