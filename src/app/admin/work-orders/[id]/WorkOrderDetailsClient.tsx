'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import { getStatusText } from '@/app/admin/orders/types';

// Define a minimal Order interface based on what we use
interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  status: string;
  service: {
    name: string;
  };
  variant?: {
    name: string;
  } | null;
}

interface WorkOrderDetailsClientProps {
  initialOrders: Order[];
  title: string;
  decodedId: string;
}

export function WorkOrderDetailsClient({
  initialOrders,
  title,
  decodedId,
}: WorkOrderDetailsClientProps) {
  const [filterTerm, setFilterTerm] = useState('');

  // 1. Filter Orders
  const filteredOrders = useMemo(() => {
    if (!filterTerm.trim()) return initialOrders;
    const lowerTerm = filterTerm.toLowerCase();
    return initialOrders.filter(
      order =>
        order.customerName.toLowerCase().includes(lowerTerm) ||
        order.customerPhone.includes(lowerTerm) ||
        order.id.toLowerCase().includes(lowerTerm)
    );
  }, [initialOrders, filterTerm]);

  // 2. Calculate Stats based on filtered orders
  const statuses = useMemo(() => {
    return filteredOrders.reduce(
      (acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
  }, [filteredOrders]);

  // 3. Group by Service
  const groupedOrders = useMemo(() => {
    return filteredOrders.reduce(
      (acc, order) => {
        const serviceName = order.service.name;
        // Initialize if not present
        if (!acc[serviceName]) acc[serviceName] = [];

        // Use non-null assertion since we just created it
        acc[serviceName]!.push(order);
        return acc;
      },
      {} as Record<string, Order[]>
    );
  }, [filteredOrders]);

  return (
    <div className='p-6 w-full max-w-7xl mx-auto' dir='rtl'>
      {/* Header */}
      <div className='flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4'>
        <div>
          <div className='flex items-center gap-3 mb-2'>
            <Link
              href='/admin/work-orders'
              className='text-gray-400 hover:text-gray-600 transition-colors'
            >
              <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M14 5l7 7m0 0l-7 7m7-7H3'
                  className='rotate-180'
                />
              </svg>
            </Link>
            <h1 className='text-3xl font-black text-gray-900'>{title}</h1>
          </div>
          <p className='text-gray-500'>
            إجمالي الطلبات: <span className='font-bold text-gray-900'>{filteredOrders.length}</span>
            {initialOrders.length !== filteredOrders.length && (
              <span className='text-xs mx-2 bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full'>
                (من أصل {initialOrders.length})
              </span>
            )}
          </p>
        </div>

        <div className='flex flex-col md:flex-row gap-3 items-end md:items-center'>
          {/* Internal Search */}
          <div className='relative w-full md:w-64'>
            <input
              type='text'
              value={filterTerm}
              onChange={e => setFilterTerm(e.target.value)}
              placeholder='بحث داخل القائمة...'
              className='w-full px-4 py-2 pr-10 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm'
            />
            <div className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400'>
              <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
          </div>

          <Link
            href={`/admin/work-orders/${encodeURIComponent(decodedId)}/print`}
            target='_blank'
            className='px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-bold flex items-center gap-2 whitespace-nowrap'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
              />
            </svg>
            طباعة كشف
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
        {Object.entries(statuses).map(([status, count]) => (
          <div key={status} className='bg-white p-4 rounded-xl border border-gray-100 shadow-sm'>
            <div className='text-xs text-gray-500 mb-1'>الحالة</div>
            <div className='flex justify-between items-end'>
              <span className='font-bold text-gray-800 truncate text-sm'>
                {getStatusText(status)}
              </span>
              <span className='text-2xl font-black text-blue-600'>{count}</span>
            </div>
          </div>
        ))}
      </div>

      {Object.entries(groupedOrders).map(([serviceName, serviceOrders]) => (
        <div
          key={serviceName}
          className='mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500'
        >
          <div className='flex items-center justify-between bg-gray-50 p-3 rounded-t-xl border-b border-gray-100 border-r-4 border-r-blue-500'>
            <h2 className='text-lg font-bold text-gray-800'>{serviceName}</h2>
            <span className='bg-white border border-gray-200 px-2 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm'>
              {serviceOrders.length}
            </span>
          </div>
          <div className='bg-white rounded-b-xl shadow-sm border border-gray-100 border-t-0 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full text-right min-w-[600px]'>
                <thead className='bg-gray-50/50 border-b border-gray-100'>
                  <tr>
                    <th className='px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500'>
                      رقم الطلب
                    </th>
                    <th className='px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500'>
                      العميل
                    </th>
                    <th className='px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500'>
                      التفاصيل
                    </th>
                    <th className='px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500'>
                      الحالة
                    </th>
                    <th className='px-6 py-3 text-xs font-bold uppercase tracking-wider text-gray-500'>
                      إجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-50'>
                  {serviceOrders.map(order => (
                    <tr key={order.id} className='hover:bg-blue-50/30 transition-colors group'>
                      <td className='px-6 py-3 font-mono font-bold text-sm text-gray-600' dir='ltr'>
                        #{order.id.slice(0, 8)}
                      </td>
                      <td className='px-6 py-3'>
                        <div className='font-bold text-gray-900 text-sm'>{order.customerName}</div>
                        <div className='text-xs text-gray-500 font-mono' dir='ltr'>
                          {order.customerPhone}
                        </div>
                      </td>
                      <td className='px-6 py-3 text-sm text-gray-600'>
                        {order.variant && (
                          <span className='inline-block text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md'>
                            {order.variant.name}
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-3'>
                        <span className='inline-flex px-2 py-1 bg-gray-100 text-gray-600 rounded text-[10px] font-bold'>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className='px-6 py-3'>
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className='text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100'
                        >
                          فتح الملف
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}

      {filteredOrders.length === 0 && (
        <div className='text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200'>
          <p className='text-gray-500 font-medium'>لا توجد نتائج مطابقة لبحثك</p>
          <button
            onClick={() => setFilterTerm('')}
            className='mt-2 text-blue-600 hover:underline text-sm font-bold'
          >
            مسح البحث
          </button>
        </div>
      )}
    </div>
  );
}
