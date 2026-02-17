import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId')?.trim();
    const date = searchParams.get('date');

    if (!customerId) {
      return NextResponse.json(
        {
          error: 'معرف العميل مطلوب',
        },
        { status: 400 }
      );
    }

    const orderIdsParam = searchParams.get('orderIds');
    let targetDate = new Date();

    // Build where clause
    const whereClause: any = {
      userId: customerId,
    };

    if (date) {
      targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.createdAt = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    // If specific orders are requested, filter by them (Override/Refine Date)
    if (orderIdsParam) {
      const orderIds = orderIdsParam
        .split(',')
        .map(id => id.trim())
        .filter(Boolean);
      if (orderIds.length > 0) {
        // If IDs provided, we strictly look for them, regardless of date filter unless explicitly combined?
        // User says "All services not by date". So if we are selecting, we likely want to ignore date.
        // But here we are deciding the API logic.
        // If orderIds are present, we should probably ignore the date filter that might have been set above,
        // OR simply rely on the fact that the Modal won't send date if it wants all.
        // Let's force ID filter if present.
        delete whereClause.createdAt; // Remove date filter if specific IDs are asked
        whereClause.id = { in: orderIds };
      }
    }

    // Get all orders for the customer on the specified date
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: true,
        service: {
          include: {
            variants: true,
          },
        },
        variant: true,
        payment: true,
        createdByAdmin: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        {
          error: 'لا توجد طلبات للعميل في هذا التاريخ',
        },
        { status: 404 }
      );
    }

    // Calculate totals
    const totalAmount = orders.reduce((sum, order) => sum + order.totalCents, 0);
    const totalPaid = orders.reduce((sum, order) => sum + (order.payment?.amount || 0), 0);
    const totalRemaining = totalAmount - totalPaid;

    // Format orders for receipt
    const formattedOrders = orders.map(order => {
      // Get delivery duration from variant etaDays (same logic as regular receipt)
      let deliveryDuration = null;
      if (order.variant?.etaDays) {
        deliveryDuration = `${order.variant.etaDays} يوم`;
      } else {
        deliveryDuration = 'غير محدد';
      }

      return {
        id: order.id,
        serviceName: order.service.name,
        variantName: order.variant?.name || '',
        priceCents: order.variant?.priceCents || 0, // Added base price
        totalCents: order.totalCents,
        paidAmount: order.payment?.amount || 0,
        remainingAmount: order.totalCents - (order.payment?.amount || 0),
        createdAt: order.createdAt,
        status: order.status,
        notes: order.notes,
        adminNotes: order.adminNotes,
        createdByAdmin: order.createdByAdmin?.name || null,
        // إضافة البيانات المفقودة
        quantity: order.quantity || 1,
        deliveryDuration: deliveryDuration || null,
        discount: order.discount || 0,
        deliveryFee: order.deliveryFee || 0,
        otherFees: order.otherFees || 0,
        hasAttachments: order.hasAttachments || false,
        attachedDocuments: (order as any).attachedDocuments
          ? (() => {
              try {
                return JSON.parse((order as any).attachedDocuments);
              } catch {
                return [];
              }
            })()
          : [],
        policeStation: order.policeStation || null,
        pickupLocation: order.pickupLocation || null,
        selectedFines: order.selectedFines || null,
        finesDetails: order.finesDetails || null,
        servicesDetails: order.servicesDetails || null,
      };
    });

    const firstOrder = orders[0];
    if (!firstOrder) {
      return NextResponse.json(
        {
          error: 'لا توجد طلبات للعميل في هذا التاريخ',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: {
        id: firstOrder.user?.id || '',
        name: firstOrder.user?.name || '',
        phone: firstOrder.user?.phone || '',
        idNumber: firstOrder.idNumber || '',
        address: firstOrder.address || '',
      },
      orders: formattedOrders,
      summary: {
        totalOrders: orders.length,
        totalAmount,
        totalPaid,
        totalRemaining,
        date: targetDate.toISOString().split('T')[0],
      },
    });
  } catch (error) {
    //
    //

    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          error: 'غير مصرح - يرجى تسجيل الدخول',
        },
        { status: 401 }
      );
    }

    // Return more specific error information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        error: `خطأ في جلب البيانات: ${errorMessage}`,
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
