import React, { useState } from 'react';
import Link from 'next/link';
import { Customer, FormData } from '../../types';
import { OrderSelectionModal } from '../modals/OrderSelectionModal';

interface ActionsSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  customer: Customer | null;
  submitting: boolean;
  handleReset: () => void;
}

export const ActionsSection: React.FC<ActionsSectionProps> = ({
  formData,
  setFormData,
  customer,
  submitting,
  handleReset,
}) => {
  const [showOrderModal, setShowOrderModal] = useState(false);

  return (
    <>
      <div id='actions-section' className='space-y-4 pt-4'>
        <div className='grid grid-cols-2 gap-3'>
          <button
            type='button'
            onClick={() =>
              setFormData(prev => ({
                ...prev,
                underImplementationReason: 'تم وضع الطلب تحت التنفيذ',
              }))
            }
            className='flex items-center justify-center py-3 bg-amber-100 text-amber-800 border border-amber-200 rounded-xl hover:bg-amber-200 font-bold text-sm transition-all active:scale-95 shadow-sm'
          >
            تحت التنفيذ
          </button>

          <button
            type='button'
            onClick={() => {
              if (customer?.id) {
                setShowOrderModal(true);
              } else {
                alert('يرجى البحث عن العميل أولاً');
              }
            }}
            className='flex items-center justify-center py-3 bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl hover:bg-indigo-200 font-bold text-sm transition-all active:scale-95 shadow-sm'
          >
            إيصال مجمع
          </button>
        </div>

        <button
          type='submit'
          disabled={submitting}
          className='w-full py-4 bg-emerald-600 text-white rounded-2xl font-black text-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-3'
        >
          {submitting ? (
            <>
              <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
              <span>جاري الحفظ...</span>
            </>
          ) : (
            <>
              <span>تأكيد وإنشاء الطلب</span>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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

        <div className='flex items-center justify-center pt-2'>
          <button
            type='button'
            onClick={handleReset}
            className='w-full py-3 bg-red-100 text-red-700 rounded-xl font-bold text-sm hover:bg-red-200 transition-all border border-red-200'
          >
            إلغاء العملية والتفريغ
          </button>
        </div>
      </div>

      <OrderSelectionModal
        isOpen={showOrderModal}
        onClose={() => setShowOrderModal(false)}
        customer={customer}
      />
    </>
  );
};
