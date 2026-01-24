import React from 'react';
import Link from 'next/link';
import { Customer, FormData } from '../../types';

interface ActionsSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  customer: Customer | null;
  submitting: boolean;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  formData,
  setFormData,
  customer,
  submitting,
}) => {
  return (
    <div id='actions-section' className='space-y-4'>
      <div className='grid grid-cols-2 gap-3'>
        <button
          type='button'
          onClick={() =>
            setFormData(prev => ({
              ...prev,
              underImplementationReason: 'تم وضع الطلب تحت التنفيذ',
            }))
          }
          className='flex items-center justify-center py-3 bg-white border border-orange-200 text-orange-600 rounded-xl hover:bg-orange-50 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm'
        >
          تحت التنفيذ
        </button>

        <button
          type='button'
          onClick={() => {
            if (customer?.id) {
              const today = new Date().toISOString().split('T')[0];
              const cleanCustomerId = encodeURIComponent(customer.id.trim());
              const url = `/admin/collective-receipt?customerId=${cleanCustomerId}&date=${today}`;
              window.open(url, '_blank');
            } else {
              alert('يرجى البحث عن العميل أولاً');
            }
          }}
          className='flex items-center justify-center py-3 bg-white border border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-sm'
        >
          إيصال مجمع
        </button>
      </div>

      <button
        type='submit'
        disabled={submitting}
        className='w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3'
      >
        {submitting ? (
          <>
            <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
            <span>جاري الحفظ...</span>
          </>
        ) : (
          <>
            <span>تأكيد وإنشاء الطلب</span>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={3}
                d='M5 13l4 4L19 7'
              />
            </svg>
          </>
        )}
      </button>

      <div className='flex items-center justify-center gap-4 pt-2'>
        <label className='flex items-center gap-2 cursor-pointer grayscale hover:grayscale-0 transition-all opacity-60 hover:opacity-100'>
          <input
            type='checkbox'
            className='w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900'
          />
          <span className='text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none'>
            طباعة صورة
          </span>
        </label>
        <Link
          href='/admin/orders'
          className='text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors'
        >
          إلغاء العملية
        </Link>
      </div>
    </div>
  );
};
