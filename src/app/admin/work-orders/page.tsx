import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { requireAdminOrStaff } from '@/lib/auth';
import { getStatusText, STATUS_CONFIG } from '@/app/admin/orders/types';
import { WorkOrderGlobalSearch } from './components/WorkOrderGlobalSearch';
import { WorkOrderStats } from './components/WorkOrderStats';

export const dynamic = 'force-dynamic';

export default async function WorkOrdersPage() {
  await requireAdminOrStaff();

  // 1. Get explicit Work Orders
  const explicitWorkOrders = await prisma.order.groupBy({
    by: ['workOrderNumber', 'status'],
    where: {
      workOrderNumber: { not: null },
    },
    _count: { id: true },
    orderBy: { workOrderNumber: 'desc' },
  });

  // Process explicit work orders to group statuses
  const workOrderMap = new Map<string, { total: number; statuses: Record<string, number> }>();

  explicitWorkOrders.forEach(group => {
    if (!group.workOrderNumber) return;
    const wo = String(group.workOrderNumber);
    if (!workOrderMap.has(wo)) {
      workOrderMap.set(wo, { total: 0, statuses: {} });
    }
    const entry = workOrderMap.get(wo)!;
    entry.total += group._count.id;
    entry.statuses[group.status] = (entry.statuses[group.status] || 0) + group._count.id;
  });

  const finalWorkOrders = Array.from(workOrderMap.entries())
    .map(([number, data]) => ({
      number,
      ...data,
    }))
    .filter(wo => wo.number !== '')
    .sort((a, b) => b.number.localeCompare(a.number));

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
    },
    orderBy: { createdAt: 'desc' },
  });

  const dateMap = new Map<
    string,
    { date: Date; total: number; statuses: Record<string, number> }
  >();

  rawBirthCertOrders.forEach(order => {
    const dateKey = order.createdAt.toISOString().split('T')[0] as string;
    if (!dateMap.has(dateKey)) {
      dateMap.set(dateKey, { date: order.createdAt, total: 0, statuses: {} });
    }
    const entry = dateMap.get(dateKey)!;
    entry.total += 1;
    entry.statuses[order.status] = (entry.statuses[order.status] || 0) + 1;
  });

  const finalDateOrders = Array.from(dateMap.entries())
    .map(([dateKey, data]) => ({
      dateKey,
      ...data,
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  // Calculate dashboard stats
  const totalWorkOrders = explicitWorkOrders.length + rawBirthCertOrders.length;
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
    explicitWorkOrders.reduce(
      (sum, g) => sum + (g.status === 'PENDING' || g.status === 'PROCESSING' ? g._count.id : 0),
      0
    ) + rawBirthCertOrders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length;

  const renderStatusSummary = (statuses: Record<string, number>) => {
    const parts = Object.entries(statuses)
      .filter(([_, count]) => count > 0)
      .map(([status, count]) => ({ status, count }));

    return (
      <div className='flex flex-wrap gap-1.5'>
        {parts.map(({ status, count }) => (
          <span
            key={status}
            className='inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-gray-200 text-xs text-gray-600 shadow-sm'
          >
            <span>{getStatusText(status)}</span>
            <span className='font-bold text-gray-900 bg-gray-100 px-1 rounded'>{count}</span>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className='p-6 w-full max-w-7xl mx-auto' dir='rtl'>
      <div className='flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4'>
        <div>
          <h1 className='text-3xl font-black text-gray-900 mb-2'>سجلات العمل</h1>
          <p className='text-gray-500 text-sm'>
            إدارة ومتابعة أوامر الشغل وشهادات الميلاد الكمبيوتر اليومية
          </p>
        </div>
        <WorkOrderGlobalSearch />
      </div>

      <WorkOrderStats
        totalWorkOrders={finalWorkOrders.length + finalDateOrders.length} // Count of *groups*, not individual orders
        ordersToday={todayOrdersStart}
        totalPending={totalPending}
      />

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Section 1: Work Orders (Explicit) */}
        <section className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit'>
          <div className='p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center'>
            <h2 className='text-lg font-bold text-blue-800 flex items-center gap-2'>
              <span className='w-2 h-6 bg-blue-500 rounded-full'></span>
              أوامر شغل (Work Orders)
            </h2>
            <span className='text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full'>
              {finalWorkOrders.length}
            </span>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-right'>
              <thead className='bg-gray-50 border-b border-gray-100'>
                <tr>
                  <th className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    رقم الأمر
                  </th>
                  <th className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    الحالات
                  </th>
                  <th className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    الإجراء
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {finalWorkOrders.length === 0 ? (
                  <tr>
                    <td colSpan={3} className='px-6 py-12 text-center text-gray-400'>
                      <div className='flex flex-col items-center gap-2'>
                        <span className='text-2xl opacity-20'>📂</span>
                        <span>لا توجد أوامر شغل حالياً</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  finalWorkOrders.map(wo => (
                    <tr key={wo.number} className='hover:bg-blue-50/30 transition-colors group'>
                      <td className='px-6 py-4'>
                        <div className='font-mono font-bold text-lg text-blue-600' dir='ltr'>
                          {wo.number}
                        </div>
                        <div className='text-xs text-gray-400 font-medium mt-1'>{wo.total} طلب</div>
                      </td>
                      <td className='px-6 py-4'>{renderStatusSummary(wo.statuses)}</td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-col gap-2'>
                          <Link
                            href={`/admin/work-orders/${encodeURIComponent(wo.number)}`}
                            className='inline-flex justify-center items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all text-xs font-bold shadow-sm'
                          >
                            عرض التفاصيل
                          </Link>
                          <Link
                            href={`/admin/work-orders/${encodeURIComponent(wo.number)}/print`}
                            target='_blank'
                            className='inline-flex justify-center items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 text-purple-700 rounded-lg hover:bg-purple-100 hover:text-purple-800 transition-all text-xs font-bold'
                          >
                            طباعة
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 2: Birth Certificates (Daily) */}
        <section className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit'>
          <div className='p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center'>
            <h2 className='text-lg font-bold text-emerald-800 flex items-center gap-2'>
              <span className='w-2 h-6 bg-emerald-500 rounded-full'></span>
              شهادات ميلاد كمبيوتر (يومي)
            </h2>
            <span className='text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full'>
              {finalDateOrders.length}
            </span>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-right'>
              <thead className='bg-gray-50 border-b border-gray-100'>
                <tr>
                  <th className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    تاريخ العمل
                  </th>
                  <th className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    ملخص الحالة
                  </th>
                  <th className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    العدد الكلي
                  </th>
                  <th className='px-6 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider'>
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {finalDateOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className='px-6 py-8 text-center text-gray-500'>
                      لا توجد شهادات ميلاد مؤرخة حالياً
                    </td>
                  </tr>
                ) : (
                  finalDateOrders.map(doGroup => (
                    <tr key={doGroup.dateKey} className='hover:bg-emerald-50/50 transition-colors'>
                      <td
                        className='px-6 py-4 font-mono font-bold text-lg text-emerald-700'
                        dir='ltr'
                      >
                        {doGroup.date.toLocaleDateString('en-GB')}
                      </td>
                      <td className='px-6 py-4 text-gray-600 text-sm'>
                        {renderStatusSummary(doGroup.statuses)}
                      </td>
                      <td className='px-6 py-4 text-gray-700 font-medium'>
                        <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm'>
                          📎 {doGroup.total} شهادة
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        {/* We use a formatted ID starting with "date_" to identify this type of aggregation in the details page */}
                        <Link
                          href={`/admin/work-orders/date_${doGroup.dateKey}`}
                          className='inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all text-sm font-bold shadow-sm ml-2'
                        >
                          <span>👁️</span>
                          عرض التفاصيل
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
