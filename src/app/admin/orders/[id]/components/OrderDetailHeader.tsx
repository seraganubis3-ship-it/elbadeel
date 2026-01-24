'use client';

import Link from 'next/link';
import { Order } from '../types';

interface OrderDetailHeaderProps {
  order: Order;
  onDelete: () => void;
  onPrint: () => void;
}

export default function OrderDetailHeader({ order, onDelete, onPrint }: OrderDetailHeaderProps) {
  return (
    <div className='bg-white/80 backdrop-blur-sm shadow-xl border-b border-gray-200/50 sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4 space-x-reverse'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg'>
              <svg
                className='w-6 h-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            </div>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                تفاصيل الطلب
              </h1>
              <p className='text-gray-600 mt-1 text-lg font-medium'>
                #{order.id} • {order.service?.name || 'خدمة غير محددة'}
              </p>
              <p className='text-gray-500 text-sm'>
                {order.variant?.name || 'نوع غير محدد'} •{' '}
                {new Date(order.createdAt).toLocaleDateString('ar-EG')}
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-3 space-x-reverse'>
            <Link
              href='/admin/orders'
              className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 space-x-reverse'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              <span>العودة</span>
            </Link>
            <Link
              href={`/admin/orders/${order.id}/receipt`}
              className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 space-x-reverse shadow-lg'
              title='إعادة طباعة الإيصال'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                />
              </svg>
              <span>طباعة</span>
            </Link>
            <button
              onClick={onDelete}
              className='px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 space-x-reverse shadow-lg'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
              <span>حذف</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
