'use client';

import { Order } from '../types';

interface QuickPaymentModalProps {
  order: Order | null;
  isOpen: boolean;
  amount: number;
  method: string;
  notes: string;
  submitting: boolean;
  onAmountChange: (amount: number) => void;
  onMethodChange: (method: string) => void;
  onNotesChange: (notes: string) => void;
  onClose: () => void;
  onSubmit: () => void;
}

const paymentMethods = [
  { value: 'CASH', label: 'كاش' },
  { value: 'INSTAPAY', label: 'إنستا باي' },
  { value: 'WALLET', label: 'محفظة إلكترونية' },
  { value: 'VODAFONE_CASH', label: 'فودافون كاش' },
];

const formatCurrency = (value: number) => `${(value / 100).toFixed(2)} ج.م`;

export function QuickPaymentModal({
  order,
  isOpen,
  amount,
  method,
  notes,
  submitting,
  onAmountChange,
  onMethodChange,
  onNotesChange,
  onClose,
  onSubmit,
}: QuickPaymentModalProps) {
  if (!isOpen || !order) return null;

  const total = order.totalCents || 0;
  const discount = (order.discount || 0) + (order.discountAmount || 0);
  const paid = order.payment?.amount || order.paidAmount || 0;
  const remaining = Math.max(0, order.remainingAmount ?? total - discount - paid);
  const normalizedAmount = Math.max(0, amount || 0);

  return (
    <div className='fixed inset-0 z-[210] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm'>
      <div
        className='w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl'
        dir='rtl'
        role='dialog'
        aria-modal='true'
      >
        <div className='flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5'>
          <div>
            <p className='text-xs font-black uppercase text-emerald-600'>سداد سريع</p>
            <h3 className='mt-1 text-2xl font-black text-slate-900'>سداد باقي المستحقات</h3>
            <p className='mt-1 text-sm font-bold text-slate-500'>
              #{order.id.slice(-6)} - {order.customerName}
            </p>
          </div>
          <button
            type='button'
            onClick={onClose}
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-100'
            aria-label='إغلاق'
          >
            <svg className='h-5 w-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='space-y-5 px-6 py-6'>
          <div className='grid grid-cols-3 gap-3'>
            <div className='rounded-xl border border-slate-200 bg-white p-3'>
              <p className='text-xs font-bold text-slate-400'>الإجمالي</p>
              <p className='mt-1 text-base font-black text-slate-900'>{formatCurrency(total)}</p>
            </div>
            <div className='rounded-xl border border-emerald-100 bg-emerald-50 p-3'>
              <p className='text-xs font-bold text-emerald-500'>المدفوع</p>
              <p className='mt-1 text-base font-black text-emerald-700'>{formatCurrency(paid)}</p>
            </div>
            <div className='rounded-xl border border-amber-100 bg-amber-50 p-3'>
              <p className='text-xs font-bold text-amber-500'>المتبقي</p>
              <p className='mt-1 text-base font-black text-amber-700'>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {discount > 0 && (
            <div className='rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-sm font-bold text-cyan-800'>
              تم احتساب خصم بقيمة {formatCurrency(discount)} على هذا الطلب.
            </div>
          )}

          <div>
            <label className='mb-2 block text-sm font-black text-slate-700'>المبلغ المدفوع الآن</label>
            <div className='relative'>
              <input
                type='number'
                min='0'
                step='0.01'
                value={amount}
                onChange={e => onAmountChange(parseFloat(e.target.value) || 0)}
                className='w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-4 pl-14 text-lg font-black text-slate-900 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100'
              />
              <span className='absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400'>
                ج.م
              </span>
            </div>
          </div>

          <div>
            <label className='mb-2 block text-sm font-black text-slate-700'>طريقة الدفع</label>
            <div className='grid grid-cols-2 gap-2'>
              {paymentMethods.map(item => (
                <button
                  key={item.value}
                  type='button'
                  onClick={() => onMethodChange(item.value)}
                  className={`rounded-xl border px-3 py-3 text-sm font-black transition-all ${
                    method === item.value
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-100'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className='mb-2 block text-sm font-black text-slate-700'>ملاحظات</label>
            <textarea
              value={notes}
              onChange={e => onNotesChange(e.target.value)}
              rows={3}
              className='w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800 outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-100'
            />
          </div>
        </div>

        <div className='flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 sm:flex-row'>
          <button
            type='button'
            onClick={onClose}
            disabled={submitting}
            className='flex-1 rounded-xl border border-slate-200 bg-white px-5 py-3 font-black text-slate-600 transition-colors hover:bg-slate-100 disabled:opacity-60'
          >
            إلغاء
          </button>
          <button
            type='button'
            onClick={onSubmit}
            disabled={submitting || normalizedAmount <= 0 || normalizedAmount * 100 > remaining}
            className='flex-1 rounded-xl bg-emerald-600 px-5 py-3 font-black text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none'
          >
            {submitting ? 'جاري التسجيل...' : 'تسجيل الدفع'}
          </button>
        </div>
      </div>
    </div>
  );
}
