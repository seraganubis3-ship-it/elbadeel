import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminOrStaff } from '@/lib/auth';
import { getStatusText } from '@/app/admin/orders/types';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkOrderDetailPage({ params }: Props) {
  await requireAdminOrStaff();
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  
  let orders;
  let title;
  
  if (decodedId.startsWith('date_')) {
      const dateStr = decodedId.replace('date_', '');
      const targetDate = new Date(dateStr);
      // Create UTC boundaries for the day (assuming stored dates are correct)
      const startOfDay = new Date(dateStr); startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(dateStr); endOfDay.setHours(23,59,59,999);
      
      const OFFICIAL_EXTRACT_SLUGS = [
        'شهادة-الميلاد',
        'death-certificate',
        'marriage-certificate',
        'divorce-certificate',
        'individual-record'
      ];

      orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay
            },
            service: { slug: { in: OFFICIAL_EXTRACT_SLUGS } },
            workOrderNumber: null
        },
        include: {
            service: true,
            variant: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
      });
      title = `مستخرجات رسمية - ${dateStr}`;
  } else {
      orders = await prisma.order.findMany({
        where: {
            workOrderNumber: decodedId,
        },
        include: {
            service: true,
            variant: true,
        },
        orderBy: {
            createdAt: 'desc', // or any logical order
        },
      });
      title = `أمر شغل رقم ${decodedId}`;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">أمر الشغل غير موجود أو فارغ</h1>
        <Link href="/admin/work-orders" className="text-blue-600 underline">
          العودة للقائمة
        </Link>
      </div>
    );
  }

  // Calculate status summary
  const statuses = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className='p-6 w-full max-w-7xl mx-auto' dir='rtl'>
      {/* Header */}
      <div className='flex items-center justify-between mb-8'>
        <div>
          <div className='flex items-center gap-3 mb-2'>
            <Link
              href='/admin/work-orders'
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M14 5l7 7m0 0l-7 7m7-7H3' className="rotate-180" />
              </svg>
            </Link>
            <h1 className='text-3xl font-black text-gray-900'>
              {title}
            </h1>
          </div>
          <p className='text-gray-500'>
            إجمالي الطلبات: {orders.length}
          </p>
        </div>
        
        <div className="flex gap-2">
            <Link
              href={`/admin/work-orders/${encodeURIComponent(decodedId)}/print`}
              target="_blank"
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-bold flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              طباعة كشف
            </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         {Object.entries(statuses).map(([status, count]) => (
             <div key={status} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                 <div className="text-xs text-gray-500 mb-1">الحالة</div>
                 <div className="flex justify-between items-end">
                     <span className="font-bold text-gray-800 truncate">{getStatusText(status)}</span> 
                     {/* Note: Ideally map status to Arabic text using a helper if available server-side */}
                     <span className="text-2xl font-black text-blue-600">{count}</span>
                 </div>
             </div>
         ))}
      </div>

      {Object.entries(
        orders.reduce((acc, order) => {
          const serviceName = order.service.name;
          if (!acc[serviceName]) acc[serviceName] = [];
          acc[serviceName]!.push(order);
          return acc;
        }, {} as Record<string, typeof orders>)
      ).map(([serviceName, serviceOrders]) => (
        <div key={serviceName} className="mb-8">
          <h2 className='text-xl font-bold text-gray-800 mb-4 bg-gray-50 p-3 rounded-lg border-r-4 border-blue-500'>
            {serviceName} ({serviceOrders.length})
          </h2>
          <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
            <table className='w-full text-right'>
              <thead className='bg-gray-50 border-b border-gray-100'>
                <tr>
                  <th className='px-6 py-4 text-sm font-semibold text-gray-600'>رقم الطلب</th>
                  <th className='px-6 py-4 text-sm font-semibold text-gray-600'>العميل</th>
                  {/* Removed Service column as it's the header now */}
                  <th className='px-6 py-4 text-sm font-semibold text-gray-600'>التفاصيل</th> 
                  <th className='px-6 py-4 text-sm font-semibold text-gray-600'>الحالة</th>
                  <th className='px-6 py-4 text-sm font-semibold text-gray-600'>إجراءات</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-50'>
                {serviceOrders.map((order) => (
                  <tr key={order.id} className='hover:bg-gray-50/50 transition-colors'>
                    <td className='px-6 py-4 font-mono font-bold text-sm text-gray-600' dir="ltr">
                      #{order.id.slice(0, 8)}
                    </td>
                    <td className='px-6 py-4'>
                      <div className='font-bold text-gray-900'>{order.customerName}</div>
                      <div className='text-xs text-gray-500 font-mono' dir="ltr">{order.customerPhone}</div>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-600'>
                      {order.variant && <span className="block text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">{order.variant.name}</span>}
                    </td>
                    <td className='px-6 py-4'>
                      <span className='px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-bold'>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className='text-blue-600 hover:text-blue-800 font-bold text-sm hover:underline'
                      >
                        تفاصيل
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
