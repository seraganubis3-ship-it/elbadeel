import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const statusUpdateSchema = z.object({
  status: z.enum(["pending", "payment_pending", "reviewing", "processing", "completed", "cancelled"]),
  adminNotes: z.string().optional(),
});

export async function PUT(
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

    // Parse request body
    const body = await request.json();
    const { status, adminNotes } = statusUpdateSchema.parse(body);

    // Get order
    const order = await prisma.order.findUnique({
      where: { id },
      include: { payment: true }
    });

    if (!order) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    // Update order status
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { 
        status,
        adminNotes: adminNotes || order.adminNotes,
        updatedAt: new Date()
      },
    });

    // If order is cancelled, also cancel payment if exists
    if (status === "cancelled" && order.payment) {
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: { 
          status: "CANCELLED",
          notes: order.payment.notes ? `${order.payment.notes}\n\n[تم إلغاء الدفع من قبل الإدارة]` : "[تم إلغاء الدفع من قبل الإدارة]"
        },
      });
    }

    // If order is completed, set completedAt
    if (status === "completed") {
      await prisma.order.update({
        where: { id },
        data: { completedAt: new Date() },
      });
    }

    return NextResponse.json({
      success: true,
      message: "تم تحديث حالة الطلب بنجاح",
      order: updatedOrder
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return NextResponse.json(
        { error: firstError?.message || "بيانات غير صحيحة" },
        { status: 400 }
      );
    }

    console.error("Status update error:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء تحديث حالة الطلب" },
      { status: 500 }
    );
  }
}


