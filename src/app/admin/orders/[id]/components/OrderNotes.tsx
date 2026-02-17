'use client';

import { Order } from '../types';

interface OrderNotesProps {
  order: Order;
}

export default function OrderNotes({ order }: OrderNotesProps) {
  if (!order.notes && !order.adminNotes) return null;

  return (
    <div className='bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 p-8'>
      <div className='flex items-center gap-4 mb-8 pb-4 border-b border-slate-50'>
        <div className='w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center'>
          <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
            />
          </svg>
        </div>
        <div>
          <h2 className='text-2xl font-black text-slate-800 tracking-tight'>الملاحظات</h2>
          <p className='text-slate-500 font-bold text-lg'>التفضيلات وتعليمات الإدارة</p>
        </div>
      </div>

      <div className='space-y-6'>
        {order.notes && (
          <div className='group p-6 bg-blue-50/50 rounded-3xl border border-blue-100 hover:bg-blue-50 transition-colors'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='w-2 h-2 bg-blue-500 rounded-full'></span>
              <h3 className='font-black text-blue-900 text-lg uppercase tracking-wider'>
                ملاحظات العميل
              </h3>
            </div>
            <p className='text-xl font-bold text-slate-700 leading-relaxed pr-4'>{order.notes}</p>
          </div>
        )}

        {order.adminNotes && (
          <div className='group p-6 bg-emerald-50/50 rounded-3xl border border-emerald-100 hover:bg-emerald-50 transition-colors'>
            <div className='flex items-center gap-2 mb-3'>
              <span className='w-2 h-2 bg-emerald-500 rounded-full'></span>
              <h3 className='font-black text-emerald-900 text-lg uppercase tracking-wider'>
                ملاحظات الإدارة
              </h3>
            </div>
            <p className='text-xl font-bold text-slate-700 leading-relaxed pr-4'>
              {order.adminNotes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
