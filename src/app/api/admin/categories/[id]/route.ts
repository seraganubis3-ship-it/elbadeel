import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const body = await request.json();
    
    const { name, orderIndex, active } = body;

    if (!name) {
      return NextResponse.json({ error: "اسم الفئة مطلوب" }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    const category = await prisma.category.update({
      where: { id },
      data: {
        name,
        slug,
        orderIndex: parseInt(orderIndex),
        active
      }
    });

    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث الفئة" }, { status: 500 });
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

    // Check if category has services
    const serviceCount = await prisma.service.count({
      where: { categoryId: id }
    });

    if (serviceCount > 0) {
      return NextResponse.json({ 
        error: "لا يمكن حذف هذه الفئة لأنها تحتوي على خدمات" 
      }, { status: 400 });
    }

    await prisma.category.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف الفئة" }, { status: 500 });
  }
}
