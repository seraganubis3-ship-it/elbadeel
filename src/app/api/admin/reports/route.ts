import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

type PeriodKey = '7d' | '30d' | '90d' | 'this-month' | 'last-month' | 'all';

type SeriesPoint = {
  key: string;
  label: string;
  revenueCents: number;
  orders: number;
  completed: number;
  pending: number;
};

function getPeriodRange(period: PeriodKey) {
  const now = new Date();
  const end = new Date(now);
  const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
  const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 1);
  const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 24 * 60 * 60 * 1000);

  switch (period) {
    case '7d': {
      const start = addDays(new Date(end), -7);
      const prevEnd = new Date(start);
      const prevStart = addDays(new Date(prevEnd), -7);
      return { start, end, prevStart, prevEnd, label: 'آخر 7 أيام', bucket: 'day' as const };
    }
    case '30d': {
      const start = addDays(new Date(end), -30);
      const prevEnd = new Date(start);
      const prevStart = addDays(new Date(prevEnd), -30);
      return { start, end, prevStart, prevEnd, label: 'آخر 30 يوم', bucket: 'day' as const };
    }
    case '90d': {
      const start = addDays(new Date(end), -90);
      const prevEnd = new Date(start);
      const prevStart = addDays(new Date(prevEnd), -90);
      return { start, end, prevStart, prevEnd, label: 'آخر 90 يوم', bucket: 'day' as const };
    }
    case 'this-month': {
      const start = startOfMonth(now);
      const prevEnd = new Date(start);
      const prevStart = startOfMonth(new Date(start.getFullYear(), start.getMonth() - 1, 1));
      return { start, end, prevStart, prevEnd, label: 'هذا الشهر', bucket: 'day' as const };
    }
    case 'last-month': {
      const start = startOfMonth(new Date(now.getFullYear(), now.getMonth() - 1, 1));
      const end = endOfMonth(start);
      const prevEnd = new Date(start);
      const prevStart = startOfMonth(new Date(start.getFullYear(), start.getMonth() - 1, 1));
      return { start, end, prevStart, prevEnd, label: 'الشهر الماضي', bucket: 'day' as const };
    }
    case 'all':
    default:
      return {
        start: null,
        end: null,
        prevStart: null,
        prevEnd: null,
        label: 'الكل',
        bucket: 'month' as const,
      };
  }
}

function formatKey(d: Date, mode: 'day' | 'month') {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return mode === 'day' ? `${y}-${m}-${day}` : `${y}-${m}`;
}

function labelFromKey(key: string, mode: 'day' | 'month') {
  if (mode === 'day') return key;
  const [y, m] = key.split('-');
  return `${y}-${m}`;
}

function iterateBuckets(start: Date, end: Date, mode: 'day' | 'month'): string[] {
  const keys: string[] = [];
  if (mode === 'day') {
    const cur = new Date(start);
    while (cur < end) {
      keys.push(formatKey(cur, 'day'));
      cur.setDate(cur.getDate() + 1);
    }
  } else {
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    const endM = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cur <= endM) {
      keys.push(formatKey(cur, 'month'));
      cur.setMonth(cur.getMonth() + 1);
    }
  }
  return keys;
}

export async function GET(req: Request) {
  await requireAdmin();

  const { searchParams } = new URL(req.url);
  const period = (searchParams.get('period') || '30d') as PeriodKey;
  const { start, end, prevStart, prevEnd, label, bucket } = getPeriodRange(period);

  let rangeStart = start;
  const rangeEnd = end || new Date();

  if (!rangeStart) {
    const minCreatedAt = await prisma.order.aggregate({ _min: { createdAt: true } });
    rangeStart = minCreatedAt._min.createdAt || new Date(new Date().getFullYear(), 0, 1);
  }

  const dateFilter = rangeStart && rangeEnd ? { createdAt: { gte: rangeStart, lt: rangeEnd } } : {};
  const prevDateFilter = prevStart && prevEnd ? { createdAt: { gte: prevStart, lt: prevEnd } } : {};

  const [
    totalOrdersAll,
    totalRevenueAll,
    ordersCount,
    completedOrders,
    pendingOrders,
    revenueAgg,
    prevOrdersCount,
    prevRevenueAgg,
    ordersInRange,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalCents: true } }),
    prisma.order.count({ where: dateFilter as any }),
    prisma.order.count({ where: { ...(dateFilter as any), status: 'COMPLETED' } }),
    prisma.order.count({ where: { ...(dateFilter as any), status: 'PENDING' } }),
    prisma.order.aggregate({ where: dateFilter as any, _sum: { totalCents: true } }),
    prisma.order.count({ where: prevDateFilter as any }),
    prisma.order.aggregate({ where: prevDateFilter as any, _sum: { totalCents: true } }),
    prisma.order.findMany({
      where: dateFilter as any,
      select: { createdAt: true, totalCents: true, status: true },
      orderBy: { createdAt: 'asc' },
    }),
  ]);

  // Build series buckets
  const keys = iterateBuckets(rangeStart!, rangeEnd!, bucket);
  const bucketMap: Record<string, SeriesPoint> = {};
  for (const k of keys) {
    bucketMap[k] = {
      key: k,
      label: labelFromKey(k, bucket),
      revenueCents: 0,
      orders: 0,
      completed: 0,
      pending: 0,
    };
  }

  for (const o of ordersInRange) {
    const key = formatKey(o.createdAt, bucket);
    const b = bucketMap[key];
    if (!b) continue;
    b.orders += 1;
    b.revenueCents += o.totalCents || 0;
    if (o.status === 'COMPLETED') b.completed += 1;
    if (o.status === 'PENDING') b.pending += 1;
  }

  const series = keys.map(k => bucketMap[k]);

  return NextResponse.json({
    label,
    ordersCount,
    completedOrders,
    pendingOrders,
    revenueCents: revenueAgg._sum.totalCents || 0,
    prevOrdersCount,
    prevRevenueCents: prevRevenueAgg._sum.totalCents || 0,
    totalOrdersAll,
    totalRevenueAllCents: totalRevenueAll._sum.totalCents || 0,
    bucket,
    series,
  });
}
