import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { requireAdminOrStaff } from '@/lib/auth';
import { getStatusText, STATUS_CONFIG } from '@/app/admin/orders/types';

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

  explicitWorkOrders.forEach((group) => {
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
  const OFFICIAL_EXTRACT_SLUGS = [
    'شهادة-الميلاد',
    'death-certificate',
    'marriage-certificate',
    'divorce-certificate',
    'individual-record'
  ];

  const rawBirthCertOrders = await prisma.order.findMany({
    where: {
      workOrderNumber: null,
      service: {
        slug: { in: OFFICIAL_EXTRACT_SLUGS }
      }
    },
    select: {
      id: true,
      createdAt: true,
      status: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const dateMap = new Map<string, { date: Date; total: number; statuses: Record<string, number> }>();

  rawBirthCertOrders.forEach((order) => {
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
      ...data
    }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());


  const renderStatusSummary = (statuses: Record<string, number>) => {
      const parts = Object.entries(statuses)
        .filter(([_, count]) => count > 0)
        .map(([status, count]) => `${getStatusText(status)}: ${count}`);
      
      return parts.join(' ، ');
  };

  return (
    <div className='p-6 w-full max-w-7xl mx-auto' dir='rtl'>
      <div className='flex items-center justify-between mb-8'>
        <h1 className='text-3xl font-bold text-gray-800'>سجلات العمل (Work Logs)</h1>
      </div>

      <div className="space-y-12">
        {/* Section 1: Explicit Work Orders */}
        <section>
            <h2 className="text-xl font-bold text-blue-800 mb-4 border-b-2 border-blue-100 pb-2">
                أوامر شغل (Work Orders)
            </h2>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                <table className='w-full text-right'>
                <thead className='bg-gray-50 border-b border-gray-100'>
                    <tr>
                    <th className='px-6 py-4 text-sm font-semibold text-gray-600'>رقم أمر الشغل</th>
                    <th className='px-6 py-4 text-sm font-semibold text-gray-600'>ملخص الحالة</th>
                    <th className='px-6 py-4 text-sm font-semibold text-gray-600'>العدد الكلي</th>
                    <th className='px-6 py-4 text-sm font-semibold text-gray-600'>إجراءات</th>
                    </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                    {finalWorkOrders.length === 0 ? (
                    <tr>
                        <td colSpan={4} className='px-6 py-8 text-center text-gray-500'>
                        لا توجد أوامر شغل حالياً
                        </td>
                    </tr>
                    ) : (
                    finalWorkOrders.map((wo) => (
                        <tr key={wo.number} className='hover:bg-blue-50/50 transition-colors'>
                        <td className='px-6 py-4 font-mono font-bold text-lg text-blue-600' dir="ltr">
                            {wo.number}
                        </td>
                        <td className='px-6 py-4 text-gray-600 text-sm'>
                            {renderStatusSummary(wo.statuses)}
                        </td>
                        <td className='px-6 py-4 text-gray-700 font-medium'>
                            <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm'>
                            📎 {wo.total} طلب
                            </span>
                        </td>
                        <td className='px-6 py-4'>
                            <Link
                            href={`/admin/work-orders/${encodeURIComponent(wo.number)}`}
                            className='inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 transition-all text-sm font-bold shadow-sm ml-2'
                            >
                            <span>👁️</span>
                            عرض التفاصيل
                            </Link>
                             <Link
                                href={`/admin/work-orders/${encodeURIComponent(wo.number)}/print`}
                                target='_blank'
                                className='inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 text-purple-700 rounded-xl hover:bg-purple-100 hover:text-purple-800 transition-all text-sm font-bold shadow-sm'
                                >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                طباعة كشف
                            </Link>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>
        </section>

        {/* Section 2: Birth Certificates (Daily) */}
        <section>
            <h2 className="text-xl font-bold text-emerald-800 mb-4 border-b-2 border-emerald-100 pb-2 flex justify-between items-center">
                <span>مستخرجات رسمية (يومي)</span>
                <span className="text-sm font-normal text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg"></span>
            </h2>
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                <table className='w-full text-right'>
                <thead className='bg-gray-50 border-b border-gray-100'>
                    <tr>
                    <th className='px-6 py-4 text-sm font-semibold text-gray-600'>تاريخ العمل</th>
                    <th className='px-6 py-4 text-sm font-semibold text-gray-600'>ملخص الحالة</th>
                    <th className='px-6 py-4 text-sm font-semibold text-gray-600'>العدد الكلي</th>
                    <th className='px-6 py-4 text-sm font-semibold text-gray-600'>إجراءات</th>
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
                    finalDateOrders.map((doGroup) => (
                        <tr key={doGroup.dateKey} className='hover:bg-emerald-50/50 transition-colors'>
                        <td className='px-6 py-4 font-mono font-bold text-lg text-emerald-700' dir="ltr">
                             {doGroup.date.toLocaleDateString('en-GB')}
                        </td>
                        <td className='px-6 py-4 text-gray-600 text-sm'>
                            {renderStatusSummary(doGroup.statuses)}
                        </td>
                        <td className='px-6 py-4 text-gray-700 font-medium'>
                            <span className='inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 rounded-full text-sm'>
                            📎 {doGroup.total} مستند
                            </span>
                        </td>
                        <td className='px-6 py-4'>
                            {/* We use a formatted ID starting with "date_" to identify this type of aggregation in the details page */}
                             <Link
                            href={`/admin/work-orders/date_${doGroup.dateKey}`}
                            className='inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:text-emerald-600 hover:border-emerald-200 transition-all text-sm font-bold shadow-sm ml-2'
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
