import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { AdminNotification } from '@/types/admin-notifications';
import { hasPermission } from '@/lib/permissions';

export async function GET(_request: NextRequest) {
  try {
    const session = await requireAuth();

    if (!hasPermission(session.user as any, 'MANAGE_ORDERS')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول لهذه الصفحة' }, { status: 403 });
    }

    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const newOnlineOrders = await prisma.order.findMany({
      where: {
        status: 'waiting_confirmation',
        createdByAdminId: null,
        createdAt: { gte: fiveDaysAgo },
      },
      include: {
        service: { select: { name: true } },
        variant: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const notifications: AdminNotification[] = newOnlineOrders.map(order => ({
      id: `new-order-${order.id}`,
      type: 'new_order',
      title: 'طلب أونلاين جديد قيد المراجعة',
      message: `طلب #${order.id} - ${order.customerName}\n${order.service?.name || 'خدمة غير محددة'}${order.variant?.name ? ` - ${order.variant.name}` : ''}`,
      priority: 'high',
      timestamp: order.createdAt,
      read: false,
      actionUrl: `/admin/orders/${order.id}`,
      actionLabel: 'مراجعة الطلب',
    }));

    return NextResponse.json({
      success: true,
      notifications,
      counts: {
        newOrders: newOnlineOrders.length,
        total: notifications.length,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الإشعارات' },
      { status: 500 }
    );
  }
}