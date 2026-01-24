'use client';

import { Order, getStatusBadge } from '../types';

interface OrderStatusMetricsProps {
  order: Order;
}

export default function OrderStatusMetrics({ order }: OrderStatusMetricsProps) {
  const status = getStatusBadge(order.status);

  return (
    <div className='bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8'>
      {/* Service Info Banner */}
      <div className='mb-8 p-6 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl shadow-lg shadow-blue-200/50 text-white relative overflow-hidden group'>
        <div className='absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700'></div>
        <div className='relative flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div className='flex items-center gap-5'>
            <div className='w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30'>
              <svg
                className='w-8 h-8 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                />
              </svg>
            </div>
            <div>
              <h1 className='text-3xl font-black tracking-tight'>
                {order.service?.name || 'خدمة غير معروفة'}
              </h1>
              <p className='text-blue-100 font-bold mt-1 text-lg'>
                {order.variant?.name || 'نوع غير محدد'}
              </p>
            </div>
          </div>
          <div className='flex flex-col items-end gap-2'>
            <div
              className={`px-4 py-1.5 rounded-full text-sm font-black shadow-inner whitespace-nowrap ${status.color.replace('bg-', 'bg-white ').replace('text-', 'text-')}`}
            >
              {status.text}
            </div>
            {order.estimatedCompletionDate && (
              <p className='text-xs text-blue-50 font-medium'>
                التسليم المتوقع:{' '}
                {new Date(order.estimatedCompletionDate).toLocaleDateString('ar-EG')}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center space-x-3 space-x-reverse'>
          <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md'>
            <svg
              className='w-5 h-5 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <h2 className='text-2xl font-bold text-gray-900'>ملخص حالة الطلب</h2>
        </div>
      </div>

      {order.createdByAdmin && (
        <div className='mb-6 p-4 bg-blue-50/50 rounded-xl border border-blue-200/50'>
          <div className='flex items-center space-x-2 space-x-reverse'>
            <svg
              className='w-5 h-5 text-blue-600'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
            <span className='text-blue-800 font-medium'>أنشأه المشرف:</span>
            <span className='text-blue-700'>{order.createdByAdmin.name}</span>
          </div>
        </div>
      )}

      <div className='grid grid-cols-2 lg:grid-cols-4 gap-6'>
        <div className='group p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200/50 hover:shadow-lg transition-all duration-300'>
          <div className='flex items-center justify-between mb-3'>
            <div className='w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-blue-600 group-hover:scale-110 transition-transform duration-300'>
                {(order.totalCents / 100).toFixed(2)}
              </div>
              <div className='text-sm text-blue-700 font-medium'>جنيه</div>
            </div>
          </div>
          <div className='text-xs text-blue-600 font-medium'>إجمالي المبلغ</div>
        </div>

        <div className='group p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/50 hover:shadow-lg transition-all duration-300'>
          <div className='flex items-center justify-between mb-3'>
            <div className='w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-green-600 group-hover:scale-110 transition-transform duration-300'>
                {order.variant?.etaDays || 'غير محدد'}
              </div>
              <div className='text-sm text-green-700 font-medium'>يوم</div>
            </div>
          </div>
          <div className='text-xs text-green-600 font-medium'>مدة التنفيذ</div>
        </div>

        <div className='group p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/50 hover:shadow-lg transition-all duration-300'>
          <div className='flex items-center justify-between mb-3'>
            <div className='w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4'
                />
              </svg>
            </div>
            <div className='text-right'>
              <div className='text-lg font-bold text-purple-600 group-hover:scale-110 transition-transform duration-300'>
                {order.deliveryType === 'ADDRESS' ? 'توصيل' : 'استلام'}
              </div>
              <div className='text-sm text-purple-700 font-medium'>نوع التوصيل</div>
            </div>
          </div>
          <div className='text-xs text-purple-600 font-medium'>طريقة التسليم</div>
        </div>

        <div className='group p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl border border-orange-200/50 hover:shadow-lg transition-all duration-300'>
          <div className='flex items-center justify-between mb-3'>
            <div className='w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center'>
              <svg
                className='w-5 h-5 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div className='text-right'>
              <div className='text-lg font-bold text-orange-600 group-hover:scale-110 transition-transform duration-300'>
                {new Date(order.createdAt).toLocaleDateString('ar-EG')}
              </div>
              <div className='text-sm text-orange-700 font-medium'>تاريخ الطلب</div>
            </div>
          </div>
          <div className='text-xs text-orange-600 font-medium'>تاريخ الإنشاء</div>
        </div>
      </div>
    </div>
  );
}
