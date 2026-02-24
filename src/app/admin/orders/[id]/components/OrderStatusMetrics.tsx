'use client';

import { useState } from 'react';
import { Order, getStatusBadge } from '../types';
import { safeLocaleDate } from '@/lib/date-utils';

interface OrderStatusMetricsProps {
  order: Order;
  onUpdateReason?: (reason: string) => void;
  updating?: boolean;
}

export default function OrderStatusMetrics({
  order,
  onUpdateReason,
  updating,
}: OrderStatusMetricsProps) {
  const status = getStatusBadge(order.status);
  const [isEditingReason, setIsEditingReason] = useState(false);
  const [editedReason, setEditedReason] = useState(order.statusReason || '');

  const handleSaveReason = () => {
    if (onUpdateReason) {
      onUpdateReason(editedReason);
      setIsEditingReason(false);
    }
  };

  return (
    <div className='bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8'>
      {/* Service Info Banner */}
      <div className='mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-[2rem] sm:rounded-3xl shadow-lg shadow-blue-200/50 text-white relative overflow-hidden group'>
        <div className='absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700'></div>
        <div className='relative flex flex-col items-start gap-6 sm:gap-4 md:flex-row md:items-center justify-between'>
          <div className='flex items-center gap-4 sm:gap-5 min-w-0'>
            <div className='w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shrink-0'>
              <svg
                className='w-6 h-6 sm:w-8 sm:h-8 text-white'
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
            <div className='min-w-0'>
              <h1 className='text-xl sm:text-3xl font-black tracking-tight truncate'>
                {order.service?.name || 'خدمة غير معروفة'}
              </h1>
              <p className='text-blue-100 font-bold mt-1 text-sm sm:text-lg'>
                {order.variant?.name || 'نوع غير محدد'}
              </p>
            </div>
          </div>
          <div className='flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 border-t border-white/10 md:border-t-0 pt-4 md:pt-0'>
            <div
              className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-black shadow-inner whitespace-nowrap ${status.color.replace('bg-', 'bg-white ').replace('text-', 'text-')}`}
            >
              {status.text}
            </div>
            {order.estimatedCompletionDate && (
              <p className='text-[10px] sm:text-xs text-blue-50 font-black opacity-90'>
                التسليم المتوقع: {safeLocaleDate(order.estimatedCompletionDate)}
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
          <div className='flex flex-wrap items-center gap-2'>
            <svg
              className='w-5 h-5 text-blue-600 shrink-0'
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
            <span className='text-blue-800 font-medium shrink-0'>أنشأه المشرف:</span>
            <span className='text-blue-700 whitespace-normal'>{order.createdByAdmin.name}</span>
          </div>
        </div>
      )}

      {order.statusReason && !isEditingReason && (
        <div className='mb-6 p-5 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 group relative'>
          <button
            onClick={() => {
              setEditedReason(order.statusReason || '');
              setIsEditingReason(true);
            }}
            className='absolute top-4 left-4 p-2 bg-amber-100 text-amber-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-amber-200'
            title='تعديل السبب'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
              />
            </svg>
          </button>
          <div className='flex items-start gap-4'>
            <div className='w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 border border-amber-200'>
              <svg
                className='w-5 h-5 text-amber-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='flex-1 text-right'>
              <h4 className='text-amber-900 font-black text-sm mb-1'>
                {order.status === 'fulfillment'
                  ? 'سبب الاستيفاء:'
                  : order.status === 'returned'
                    ? 'سبب المرتجع:'
                    : 'سبب تحديث الحالة:'}
              </h4>
              <p className='text-amber-800 leading-relaxed font-medium'>{order.statusReason}</p>
            </div>
          </div>
        </div>
      )}

      {isEditingReason && (
        <div className='mb-6 p-6 bg-white rounded-2xl border-2 border-blue-500 shadow-xl animate-in zoom-in duration-200'>
          <h4 className='text-blue-900 font-black text-sm mb-3'>تعديل السبب:</h4>
          <textarea
            value={editedReason}
            onChange={e => setEditedReason(e.target.value)}
            className='w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px] mb-4 font-medium'
            placeholder='اكتب السبب الجديد هنا...'
            autoFocus
          />
          <div className='flex gap-3'>
            <button
              onClick={handleSaveReason}
              disabled={updating}
              className='flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors'
            >
              {updating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
            <button
              onClick={() => setIsEditingReason(false)}
              className='flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-colors'
            >
              إلغاء
            </button>
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
                {safeLocaleDate(order.createdAt)}
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
