// Enhanced Analytics API endpoint with date range support
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCache, setCache } from '@/lib/cache/redis';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    await requireAdmin();

    // Get date range from query params (default: 30 days)
    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days') || '30';
    const days = parseInt(daysParam);

    // Generate cache key based on date range
    const cacheKey = `analytics:dashboard:${days}days`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }

    // Get date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const rangeStartDate = new Date(today);
    rangeStartDate.setDate(rangeStartDate.getDate() - days);

    // Get comprehensive statistics
    const [
      totalOrders,
      totalRevenue,
      activeCustomers,
      totalCustomers,
      totalStaff,
      todayOrders,
      todayRevenue,
      yesterdayOrders,
      yesterdayRevenue,
      topServices,
      recentOrders,
      dailyStats,
      customerStats,
      staffStats,
      auditLogs,
      ordersByStatus,
    ] = await Promise.all([
      // Total orders (all time)
      prisma.order.count(),

      // Total revenue (all time, excluding cancelled) - using totalPrice which is already in EGP
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: { status: { not: 'CANCELLED' } },
      }),

      // Active customers (users with role CUSTOMER who have placed at least one order)
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
          orders: {
            some: {},
          },
        },
      }),

      // Total customers (all users with CUSTOMER role)
      prisma.user.count({
        where: {
          role: 'CUSTOMER',
        },
      }),

      // Total staff (ADMIN + STAFF roles)
      prisma.user.count({
        where: {
          role: { in: ['ADMIN', 'STAFF'] },
        },
      }),

      // Today's orders
      prisma.order.count({
        where: {
          createdAt: { gte: today },
        },
      }),

      // Today's revenue
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          createdAt: { gte: today },
          status: { not: 'CANCELLED' },
        },
      }),

      // Yesterday's orders
      prisma.order.count({
        where: {
          createdAt: { gte: yesterday, lt: today },
        },
      }),

      // Yesterday's revenue
      prisma.order.aggregate({
        _sum: { totalPrice: true },
        where: {
          createdAt: { gte: yesterday, lt: today },
          status: { not: 'CANCELLED' },
        },
      }),

      // Top 5 services (within date range)
      prisma.order
        .findMany({
          where: {
            status: { not: 'CANCELLED' },
            createdAt: { gte: rangeStartDate },
          },
          select: {
            service: {
              select: {
                id: true,
                name: true,
              },
            },
            totalPrice: true,
          },
        })
        .then(orders => {
          const serviceMap = new Map<
            string,
            { id: string; name: string; count: number; revenue: number }
          >();

          orders.forEach(order => {
            if (order.service) {
              const existing = serviceMap.get(order.service.id) || {
                id: order.service.id,
                name: order.service.name,
                count: 0,
                revenue: 0,
              };
              existing.count++;
              existing.revenue += order.totalPrice || 0;
              serviceMap.set(order.service.id, existing);
            }
          });

          return Array.from(serviceMap.values())
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        }),

      // Recent 10 orders
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          totalPrice: true,
          createdAt: true,
          customerName: true,
          customerPhone: true,
          service: {
            select: {
              name: true,
            },
          },
        },
      }),

      // Daily stats for selected range
      prisma.$queryRaw<Array<{ date: Date; orders: bigint; revenue: number }>>`
        SELECT 
          DATE("createdAt") as date,
          COUNT(*)::int as orders,
          SUM(CASE WHEN status != 'CANCELLED' THEN "totalPrice" ELSE 0 END)::float as revenue
        FROM "Order"
        WHERE "createdAt" >= ${rangeStartDate}
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `.then(results =>
        results.map(r => ({
          date: r.date.toISOString().split('T')[0],
          orders: Number(r.orders),
          revenue: r.revenue || 0,
        }))
      ),

      // Customer statistics (Top 20, within date range)
      prisma.order
        .findMany({
          where: {
            status: { not: 'CANCELLED' },
            createdAt: { gte: rangeStartDate },
          },
          select: {
            userId: true,
            totalPrice: true,
            customerName: true,
            customerPhone: true,
            service: {
              select: {
                name: true,
              },
            },
          },
        })
        .then(orders => {
          const customerMap = new Map<
            string,
            {
              userId: string;
              name: string;
              phone: string;
              ordersCount: number;
              totalRevenue: number;
              services: Map<string, number>;
            }
          >();

          orders.forEach(order => {
            const existing = customerMap.get(order.userId) || {
              userId: order.userId,
              name: order.customerName,
              phone: order.customerPhone || '',
              ordersCount: 0,
              totalRevenue: 0,
              services: new Map<string, number>(),
            };

            existing.ordersCount++;
            existing.totalRevenue += order.totalPrice || 0;

            if (order.service) {
              const serviceCount = existing.services.get(order.service.name) || 0;
              existing.services.set(order.service.name, serviceCount + 1);
            }

            customerMap.set(order.userId, existing);
          });

          return Array.from(customerMap.values())
            .map(customer => {
              let mostRequestedService = 'لا يوجد';
              let maxCount = 0;

              customer.services.forEach((count, service) => {
                if (count > maxCount) {
                  maxCount = count;
                  mostRequestedService = service;
                }
              });

              return {
                userId: customer.userId,
                name: customer.name,
                phone: customer.phone,
                ordersCount: customer.ordersCount,
                totalRevenue: customer.totalRevenue,
                avgOrderValue: customer.totalRevenue / customer.ordersCount,
                mostRequestedService,
                mostRequestedServiceCount: maxCount,
              };
            })
            .sort((a, b) => b.totalRevenue - a.totalRevenue)
            .slice(0, 20);
        }),

      // Staff performance statistics (within date range)
      prisma.order
        .findMany({
          where: {
            createdByAdminId: { not: null },
            status: { not: 'CANCELLED' },
            createdAt: { gte: rangeStartDate },
          },
          select: {
            createdByAdminId: true,
            totalPrice: true,
            createdAt: true,
            completedAt: true,
            createdByAdmin: {
              select: {
                name: true,
                role: true,
              },
            },
          },
        })
        .then(orders => {
          const staffMap = new Map<
            string,
            {
              staffId: string;
              name: string;
              role: string;
              ordersProcessed: number;
              revenueGenerated: number;
              lastActivity: Date;
            }
          >();

          orders.forEach(order => {
            if (order.createdByAdminId && order.createdByAdmin) {
              const existing = staffMap.get(order.createdByAdminId) || {
                staffId: order.createdByAdminId,
                name: order.createdByAdmin.name || 'غير معروف',
                role: order.createdByAdmin.role,
                ordersProcessed: 0,
                revenueGenerated: 0,
                lastActivity: order.createdAt,
              };

              existing.ordersProcessed++;
              existing.revenueGenerated += order.totalPrice || 0;

              if (order.createdAt > existing.lastActivity) {
                existing.lastActivity = order.createdAt;
              }

              staffMap.set(order.createdByAdminId, existing);
            }
          });

          return Array.from(staffMap.values())
            .map(staff => ({
              ...staff,
              avgOrderValue: staff.revenueGenerated / staff.ordersProcessed,
            }))
            .sort((a, b) => b.revenueGenerated - a.revenueGenerated)
            .slice(0, 10);
        }),

      // Audit logs for site activity (within date range)
      prisma.auditLog.groupBy({
        by: ['action'],
        _count: { id: true },
        where: {
          createdAt: { gte: rangeStartDate },
        },
      }),

      // Orders by status (within date range)
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
        where: {
          createdAt: { gte: rangeStartDate },
        },
      }),
    ]);

    // Calculate metrics
    const avgOrderValue = totalRevenue._sum.totalPrice
      ? totalRevenue._sum.totalPrice / totalOrders
      : 0;

    const todayGrowth =
      yesterdayOrders > 0 ? ((todayOrders - yesterdayOrders) / yesterdayOrders) * 100 : 0;

    const revenueGrowth =
      (yesterdayRevenue._sum.totalPrice || 0) > 0
        ? (((todayRevenue._sum.totalPrice || 0) - (yesterdayRevenue._sum.totalPrice || 0)) /
            (yesterdayRevenue._sum.totalPrice || 0)) *
          100
        : 0;

    // Calculate conversion rate (active customers / total customers * 100)
    const conversionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;

    // Active staff (staff who processed orders)
    const activeStaff = staffStats.length;

    // Total site actions from audit logs
    const totalSiteActions = auditLogs.reduce((sum, log) => sum + log._count.id, 0);

    // Format response
    const analytics = {
      summary: {
        totalOrders,
        totalRevenue: totalRevenue._sum.totalPrice || 0,
        activeCustomers,
        totalCustomers,
        avgOrderValue,
        todayOrders,
        todayRevenue: todayRevenue._sum.totalPrice || 0,
        yesterdayOrders,
        yesterdayRevenue: yesterdayRevenue._sum.totalPrice || 0,
        todayGrowth,
        revenueGrowth,
        totalStaff,
        activeStaff,
        conversionRate,
        totalSiteActions,
        dateRange: days,
      },
      topServices,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        serviceName: order.service?.name || 'غير محدد',
        status: order.status,
        totalPrice: order.totalPrice,
        createdAt: order.createdAt,
        customer: {
          name: order.customerName,
          phone: order.customerPhone,
        },
      })),
      chartData: dailyStats,
      customerStats,
      staffStats,
      ordersByStatus: ordersByStatus.map(s => ({
        status: s.status,
        count: s._count.id,
      })),
      siteActivity: auditLogs.map(log => ({
        action: log.action,
        count: log._count.id,
      })),
    };

    // Cache for 5 minutes
    await setCache(cacheKey, analytics, { ttl: 300 });

    return NextResponse.json(analytics);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
