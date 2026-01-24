import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminNotification } from '@/types/admin-notifications';

export async function GET(_request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await requireAuth();

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const notifications: AdminNotification[] = [];

    // 1. Check for delivery due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deliveryDueOrders = await prisma.order.findMany({
      where: {
        status: {
          in: ['PENDING', 'IN_PROGRESS', 'READY_FOR_DELIVERY'],
        },
        // Assuming we have a deliveryDate field or we calculate it from createdAt + etaDays
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Orders created more than 1 day ago
        },
      },
      include: {
        service: {
          select: { name: true },
        },
        variant: {
          select: { etaDays: true },
        },
      },
      take: 10,
    });

    // Filter orders that should be delivered today
    const todayDeliveryOrders = deliveryDueOrders.filter(order => {
      const expectedDeliveryDate = new Date(order.createdAt);
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + (order.variant?.etaDays || 0));

      return expectedDeliveryDate >= today && expectedDeliveryDate < tomorrow;
    });

    // Add delivery due notifications with service delivery time
    todayDeliveryOrders.forEach(order => {
      const serviceName = order.service?.name || 'خدمة غير محددة';
      const etaDays = order.variant?.etaDays || 0;

      notifications.push({
        id: `delivery-${order.id}`,
        type: 'delivery_due',
        title: 'تسليم اليوم',
        message: `طلب #${order.id} - ${order.customerName}\n${serviceName} (${etaDays} أيام)`,
        priority: 'high',
        timestamp: new Date(),
        read: false,
        actionUrl: `/admin/orders/${order.id}`,
        actionLabel: 'عرض الطلب',
      });
    });

    // 2. Check for low stock form serials
    const formTypes = await prisma.formType.findMany({
      include: {
        serials: {
          where: {
            consumed: false,
          },
        },
      },
    });

    const lowStockFormTypes = formTypes.filter((formType: any) => formType.serials.length < 5);

    // Add detailed low stock notifications
    lowStockFormTypes.forEach((formType: any) => {
      const remainingCount = formType.serials.length;
      const isCritical = remainingCount === 0;
      const isLow = remainingCount < 3;

      let title: string, message: string, priority: 'high' | 'medium' | 'low';

      if (isCritical) {
        title = '🚨 استمارات منتهية!';
        message = `${formType.name}\nالمتبقي: 0 استمارة`;
        priority = 'high';
      } else if (isLow) {
        title = '⚠️ استمارات قليلة جداً';
        message = `${formType.name}\nالمتبقي: ${remainingCount} استمارة فقط`;
        priority = 'high';
      } else {
        title = '📋 استمارات ناقصة';
        message = `${formType.name}\nالمتبقي: ${remainingCount} استمارة`;
        priority = 'medium';
      }

      notifications.push({
        id: `stock-${formType.id}`,
        type: 'low_stock',
        title,
        message,
        priority,
        timestamp: new Date(),
        read: false,
        actionUrl: '/admin/inventory',
        actionLabel: 'إدارة الاستمارات',
      });
    });

    // 3. Check for system notifications (example: pending orders)
    const pendingOrdersCount = await prisma.order.count({
      where: {
        status: 'PENDING',
      },
    });

    if (pendingOrdersCount > 10) {
      notifications.push({
        id: 'system-pending-orders',
        type: 'system',
        title: 'طلبات معلقة كثيرة',
        message: `${pendingOrdersCount} طلب معلق`,
        priority: 'medium',
        timestamp: new Date(),
        read: false,
        actionUrl: '/admin/orders?status=PENDING',
        actionLabel: 'عرض الطلبات المعلقة',
      });
    }

    // Sort notifications by priority and timestamp
    notifications.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

    return NextResponse.json({
      success: true,
      notifications,
      counts: {
        deliveryDue: todayDeliveryOrders.length,
        lowStock: lowStockFormTypes.length,
        total: notifications.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'حدث خطأ أثناء جلب الإشعارات',
      },
      { status: 500 }
    );
  }
}
