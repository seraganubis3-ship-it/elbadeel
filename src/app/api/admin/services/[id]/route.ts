import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذه الصفحة" }, { status: 403 });
    }

    const { id } = await params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        category: true,
        variants: true,
        documents: true
      }
    });

    if (!service) {
      return NextResponse.json({ error: "الخدمة غير موجودة" }, { status: 404 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: "حدث خطأ أثناء جلب الخدمة" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذه الصفحة" }, { status: 403 });
    }

    const { id } = await params;
    const formData = await request.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const categoryId = formData.get("categoryId") as string;
    const active = formData.get("active") === "true";
    const requirements = formData.get("requirements") as string;
    const image = formData.get("image") as File | null;

    if (!name || !categoryId) {
      return NextResponse.json({ error: "اسم الخدمة والفئة مطلوبان" }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    let imagePath = undefined;
    
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

    // Update service
    const service = await prisma.service.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        ...(imagePath && { icon: imagePath }),
        active,
        categoryId
      },
      include: {
        category: true,
        variants: true,
        documents: true
      }
    });

    // Update requirements if provided
    if (requirements) {
      // First, try to find existing requirements document
      const existingDoc = await prisma.serviceDocument.findFirst({
        where: {
          serviceId: id,
          title: "متطلبات الخدمة"
        }
      });

      if (existingDoc) {
        // Update existing document
        await prisma.serviceDocument.update({
          where: { id: existingDoc.id },
          data: {
            description: requirements
          }
        });
      } else {
        // Create new document
        await prisma.serviceDocument.create({
          data: {
            serviceId: id,
            title: "متطلبات الخدمة",
            description: requirements,
            required: true,
            orderIndex: 0
          }
        });
      }
    }

    return NextResponse.json({ success: true, service });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث الخدمة" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAuth();
    
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذه الصفحة" }, { status: 403 });
    }

    const { id } = await params;

    // Check if service has orders
    const orderCount = await prisma.order.count({
      where: { serviceId: id }
    });

    if (orderCount > 0) {
      return NextResponse.json({ 
        error: "لا يمكن حذف هذه الخدمة لأنها مرتبطة بطلبات موجودة" 
      }, { status: 400 });
    }

    await prisma.service.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الخدمة" }, { status: 500 });
  }
}
