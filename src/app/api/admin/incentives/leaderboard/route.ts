import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getIncentiveConfig } from '@/lib/incentives';

export async function GET(request: NextRequest) {
  try {
    const session = await requireAuth();
    if (!['ADMIN', 'STAFF', 'VIEWER'].includes(session.user.role || '')) {
      return NextResponse.json({ error: 'غير مصرح لك بالوصول' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const timeFrame = searchParams.get('timeFrame') || 'month'; // 'today', 'week', 'month', 'all'

    // Calculate startDate
    let startDate: Date | undefined;
    const now = new Date();

    if (timeFrame === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeFrame === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      startDate = new Date(now.setDate(diff));
      startDate.setHours(0, 0, 0, 0);
    } else if (timeFrame === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const config = await getIncentiveConfig();

    // Fetch all admin and staff users
    const supervisors = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'STAFF'] },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
      },
    });

    const leaderboard = await Promise.all(
      supervisors.map(async sup => {
        // 1. Get status history changes by this user
        const statusHistoryWhere: any = {
          changedBy: sup.id,
        };
        if (startDate) {
          statusHistoryWhere.changedAt = { gte: startDate };
        }

        const statusChanges = await prisma.orderStatusHistory.findMany({
          where: statusHistoryWhere,
          select: { orderId: true, status: true },
        });

        const uniqueOrderIds = [...new Set(statusChanges.map(s => s.orderId))];
        const completedStatusChanges = statusChanges.filter(
          s => s.status === 'delivered' || s.status === 'paid'
        );
        const uniqueCompletedOrderIds = [...new Set(completedStatusChanges.map(s => s.orderId))];

        // 2. Fetch payments recorded or processed for revenue calculation
        const ordersCreatedByOrHandled = await prisma.order.findMany({
          where: {
            id: { in: uniqueOrderIds.length > 0 ? uniqueOrderIds : ['none'] },
          },
          select: {
            id: true,
            totalCents: true,
            status: true,
            payment: {
              select: {
                amount: true,
                status: true,
              },
            },
          },
        });

        const totalRevenueCents = ordersCreatedByOrHandled.reduce((acc, curr) => {
          const paidAmount =
            curr.payment?.amount ||
            (curr.status === 'paid' || curr.status === 'delivered' ? curr.totalCents : 0);
          return acc + paidAmount;
        }, 0);

        // 3. Fetch point logs
        const pointLogWhere: any = {
          userId: sup.id,
        };
        if (startDate) {
          pointLogWhere.createdAt = { gte: startDate };
        }

        const pointLogs = await prisma.supervisorPointLog.findMany({
          where: pointLogWhere,
          select: { points: true, actionType: true, description: true, createdAt: true },
        });

        const totalPoints = pointLogs.reduce((acc, log) => acc + log.points, 0);
        const estimatedEgpBonus = (totalPoints * config.egpPerPoint).toFixed(2);

        // 4. Calculate completion rate
        const totalHandled = uniqueOrderIds.length;
        const totalCompleted = uniqueCompletedOrderIds.length;
        const completionRate =
          totalHandled > 0 ? Math.round((totalCompleted / totalHandled) * 100) : 100;

        return {
          id: sup.id,
          name: sup.name || sup.email || 'مشرف',
          email: sup.email,
          role: sup.role,
          totalHandledOrders: totalHandled,
          completedOrdersCount: totalCompleted,
          totalRevenueEgp: (totalRevenueCents / 100).toFixed(2),
          completionRatePercent: completionRate,
          totalPoints,
          estimatedEgpBonus: Number(estimatedEgpBonus),
        };
      })
    );

    // Sort leaderboard by totalPoints descending (or completedOrdersCount as secondary)
    leaderboard.sort(
      (a, b) => b.totalPoints - a.totalPoints || b.completedOrdersCount - a.completedOrdersCount
    );

    return NextResponse.json({
      success: true,
      timeFrame,
      config,
      leaderboard,
    });
  } catch (error) {
    console.error('Error fetching incentive leaderboard:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب لوحة التفاعلات' }, { status: 500 });
  }
}
