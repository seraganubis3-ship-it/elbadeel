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
    
    const { name, priceCents, etaDays, active } = body;

    if (!name || !priceCents || !etaDays) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const variant = await prisma.serviceVariant.update({
      where: { id },
      data: {
        name,
        priceCents: parseInt(priceCents),
        etaDays: parseInt(etaDays),
        active
      }
    });

    return NextResponse.json({ success: true, variant });
  } catch (error) {
    console.error('Error updating variant:', error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث نوع الخدمة" }, { status: 500 });
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

    // Check if variant has orders
    const orderCount = await prisma.order.count({
      where: { variantId: id }
    });

    if (orderCount > 0) {
      return NextResponse.json({ 
        error: "لا يمكن حذف هذا النوع لأنه مرتبط بطلبات موجودة" 
      }, { status: 400 });
    }

    await prisma.serviceVariant.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting variant:', error);
    return NextResponse.json({ error: "حدث خطأ أثناء حذف نوع الخدمة" }, { status: 500 });
  }
}
