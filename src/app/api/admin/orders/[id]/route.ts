import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();
    
    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذه الصفحة" }, { status: 403 });
    }

    const { id } = await params;

    // Get order with full details
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        service: {
          select: {
            name: true,
            slug: true,
          }
        },
        variant: {
          select: {
            name: true,
            priceCents: true,
            etaDays: true,
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        payment: true,
        orderDocuments: true
      },
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      order: {
        id: order.id,
        service: order.service,
        variant: order.variant,
        status: order.status,
        totalCents: order.totalCents,
        deliveryType: order.deliveryType,
        deliveryFee: order.deliveryFee,
        createdAt: order.createdAt,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail,
        address: order.address,
        notes: order.notes,
        adminNotes: order.adminNotes,
        user: order.user,
        payment: order.payment,
        orderDocuments: order.orderDocuments,
      }
    });

  } catch (error) {
    console.error('Error fetching order details:', error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء جلب تفاصيل الطلب" 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();
    
    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذه الصفحة" }, { status: 403 });
    }

    const { id } = await params;

    // Delete order and related data
    await prisma.order.delete({
      where: { id },
    });

    return NextResponse.json({ 
      success: true, 
      message: "تم حذف الطلب بنجاح" 
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء حذف الطلب" 
    }, { status: 500 });
  }
}
