import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff } from '@/lib/auth';
import { WorkOrderGlobalSearch } from './components/WorkOrderGlobalSearch';
import { WorkOrderStats } from './components/WorkOrderStats';
import { WorkOrdersList } from './components/WorkOrdersList';

export const dynamic = 'force-dynamic';

export default async function WorkOrdersPage() {
  await requireAdminOrStaff();

  // 1. Get explicit Work Orders ordered by newest order date first.
  const explicitWorkOrderRows = await prisma.order.findMany({
    where: {
      workOrderNumber: { not: null },
    },
    select: {
      id: true,
      workOrderNumber: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      customerName: true,
    },
    orderBy: [{ createdAt: 'desc' }, { updatedAt: 'desc' }],
  });

  // Process explicit work orders to group statuses
  const workOrderMap = new Map<
    string,
    {
      total: number;
      statuses: Record<string, number>;
      latestAt: Date | null;
      customerNames: Set<string>;
    }
  >();

  explicitWorkOrderRows.forEach(order => {
    if (!order.workOrderNumber) return;
    const wo = String(order.workOrderNumber);
    if (!workOrderMap.has(wo)) {
      workOrderMap.set(wo, {
        total: 0,
        statuses: {},
        latestAt: null,
        customerNames: new Set<string>(),
      });
    }
    const entry = workOrderMap.get(wo)!;
    const candidateDate = order.createdAt || order.updatedAt || null;

    entry.total += 1;
    entry.statuses[order.status] = (entry.statuses[order.status] || 0) + 1;
    if (order.customerName) entry.customerNames.add(order.customerName);
    if (candidateDate && (!entry.latestAt || candidateDate.getTime() > entry.latestAt.getTime())) {
      entry.latestAt = candidateDate;
    }
  });

  const finalWorkOrders = Array.from(workOrderMap.entries())
    .map(([number, data]) => ({
      number,
      total: data.total,
      statuses: data.statuses,
      latestAt: data.latestAt?.toISOString() || null,
      customerNames: Array.from(data.customerNames),
    }))
    .filter(wo => wo.number !== '')
    .sort((a, b) => {
      if (a.latestAt && b.latestAt) {
        return new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime();
      }
      if (a.latestAt) return -1;
      if (b.latestAt) return 1;
      return b.number.localeCompare(a.number);
    });

  // 2. Get Implicit Work Orders (Official Extracts by Date)
  const OFFICIAL_EXTRACT_SLUGS = ['birth-certificate'];

  const rawBirthCertOrders = await prisma.order.findMany({
    where: {
      workOrderNumber: null,
      service: {
        slug: { in: OFFICIAL_EXTRACT_SLUGS },
      },
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
      customerName: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const dateMap = new Map<
    string,
    { date: Date; total: number; statuses: Record<string, number>; customerNames: Set<string> }
  >();

  rawBirthCertOrders.forEach(order => {
    const dateKey = order.createdAt.toISOString().split('T')[0] as string;
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, {
        date: order.createdAt,
        total: 0,
        statuses: {},
        customerNames: new Set<string>(),
      });
    }
    const entry = dateMap.get(dateKey)!;
    entry.total += 1;
    entry.statuses[order.status] = (entry.statuses[order.status] || 0) + 1;
    if (order.customerName) entry.customerNames.add(order.customerName);
  });

  const finalDateOrders = Array.from(dateMap.entries())
    .map(([dateKey, data]) => ({
      dateKey,
      date: data.date.toISOString(),
      total: data.total,
      statuses: data.statuses,
      customerNames: Array.from(data.customerNames),
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate dashboard stats
  const totalWorkOrders = finalWorkOrders.length + finalDateOrders.length;
  // This is a rough estimation. For exact "Today", we'd filter explicit by date or assume creation date.
  // Ideally, we'd query distinct orders created today.
  // For now, let's use the date-based implicit orders for "Today" if the top one is today
  const todayKey = new Date().toISOString().split('T')[0] || '';
  const todayOrdersStart = rawBirthCertOrders.filter(o =>
    o.createdAt.toISOString().startsWith(todayKey)
  ).length;
  // Plus any explicit work orders created today (if we had that data easily here without N+1)
  // Let's stick to a simple count of Total vs Date-based Today count for now.

  const totalPending =
    explicitWorkOrderRows.reduce(
      (sum, order) => sum + (order.status === 'PENDING' || order.status === 'PROCESSING' ? 1 : 0),
      0
    ) + rawBirthCertOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;

  return (
    <div className='min-h-screen bg-emerald-50/40 p-4 sm:p-6' dir='rtl'>
      <div className='mx-auto w-full max-w-7xl'>
        <div className='mb-6 flex flex-col gap-4 rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm shadow-slate-200/80 md:flex-row md:items-center md:justify-between'>
          <div>
            <h1 className='text-3xl font-black text-gray-900 mb-2'>سجلات العمل</h1>
            <p className='text-gray-500 text-sm'>
              إدارة ومتابعة أوامر الشغل وشهادات الميلاد الكمبيوتر اليومية
            </p>
          </div>
          <WorkOrderGlobalSearch />
        </div>

        <WorkOrderStats
          totalWorkOrders={totalWorkOrders}
          ordersToday={todayOrdersStart}
          totalPending={totalPending}
        />

        <WorkOrdersList workOrders={finalWorkOrders} dateOrders={finalDateOrders} />
      </div>
    </div>
  );
}
