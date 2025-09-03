import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();
    
    // Check if user is admin
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "غير مصرح لك بالوصول لهذه الصفحة" }, { status: 403 });
    }

    // Get all orders with full details
    const orders = await prisma.order.findMany({
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
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ 
      success: true, 
      orders: orders.map(order => ({
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
      }))
    });

  } catch (error) {
    console.error('Error fetching admin orders:', error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء جلب الطلبات" 
    }, { status: 500 });
  }
}
