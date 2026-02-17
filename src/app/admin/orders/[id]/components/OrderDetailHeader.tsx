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
    <div className='bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm'>
      <div className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <Link
              href='/admin/orders'
              className='w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl flex items-center justify-center transition-colors'
              title='العودة لقائمة الطلبات'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
            </Link>
            <div>
              <div className='flex items-center gap-3'>
                <h1 className='text-3xl font-black text-slate-900 tracking-tight'>
                  طلب #{order.id.slice(-6).toUpperCase()}
                </h1>
                <span className='px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-black uppercase tracking-widest border border-blue-200'>
                  {order.service?.name || 'خدمة غير محددة'}
                </span>
              </div>
              <p className='text-slate-500 text-base font-bold mt-1.5'>
                {new Date(order.createdAt).toLocaleDateString('ar-EG', { dateStyle: 'long' })} •{' '}
                {order.variant?.name || 'نوع غير محدد'}
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2'>
            <button
              onClick={onPrint}
              className='px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm flex items-center gap-2'
            >
              <svg
                className='w-4 h-4 text-slate-400'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                />
              </svg>
              <span>طباعة الإيصال</span>
            </button>
            <button
              onClick={onDelete}
              className='p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors'
              title='حذف الطلب'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
