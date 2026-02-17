'use client';

import { Order } from '../types';

interface OrderPaymentDetailsProps {
  order: Order;
  showPaymentForm: boolean;
  setShowPaymentForm: (val: boolean) => void;
  paymentData: any;
  setPaymentData: (val: any) => void;
  onUpdatePayment: () => void;
}

export default function OrderPaymentDetails({
  order,
  showPaymentForm,
  setShowPaymentForm,
  paymentData,
  setPaymentData,
  onUpdatePayment,
}: OrderPaymentDetailsProps) {
  const remainingAmount = (order.totalCents - (order.payment?.amount || 0)) / 100;

  return (
    <div className='bg-white rounded-2xl border border-slate-200 overflow-hidden'>
      <div className='bg-slate-50 px-6 py-4 border-b border-slate-200'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center'>
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                />
              </svg>
            </div>
            <h2 className='text-xl font-bold text-slate-800'>تفاصيل الدفع التحصيل</h2>
          </div>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className='p-2 hover:bg-slate-200 rounded-xl transition-colors text-slate-400 hover:text-emerald-600 border border-slate-100'
            title='تعديل بيانات الدفع'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
              />
            </svg>
          </button>
        </div>
      </div>

      <div className='p-6'>
        <div className='grid grid-cols-3 gap-6 mb-8'>
          <div className='bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center'>
            <p className='text-sm font-bold text-slate-400 uppercase mb-2'>المطلوب</p>
            <p className='text-xl font-black text-slate-800'>
              {(order.totalCents / 100).toFixed(2)}
            </p>
          </div>
          <div className='bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-center'>
            <p className='text-sm font-bold text-emerald-400 uppercase mb-2'>المدفوع</p>
            <p className='text-xl font-black text-emerald-700'>
              {order.payment ? (order.payment.amount / 100).toFixed(2) : '0.00'}
            </p>
          </div>
          <div className='bg-orange-50 p-4 rounded-2xl border border-orange-100 text-center'>
            <p className='text-sm font-bold text-orange-400 uppercase mb-2'>المتبقي</p>
            <p className='text-xl font-black text-orange-700'>{remainingAmount.toFixed(2)}</p>
          </div>
        </div>

        {order.payment ? (
          <div className='space-y-4 pt-6 border-t border-slate-100'>
            <div className='flex justify-between items-center text-lg'>
              <span className='text-slate-500 font-bold'>طريقة الدفع</span>
              <span className='font-black text-slate-800'>
                {order.payment.method === 'CASH'
                  ? 'كاش'
                  : order.payment.method === 'INSTAPAY'
                    ? 'إنستا باي'
                    : order.payment.method === 'WALLET'
                      ? 'محفظة إلكترونية'
                      : order.payment.method}
              </span>
            </div>
            <div className='flex justify-between items-center text-lg'>
              <span className='text-slate-500 font-bold'>حالة العملية</span>
              <span
                className={`px-4 py-1 rounded-xl font-black ${
                  order.payment.status === 'CONFIRMED'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {order.payment.status === 'CONFIRMED' ? 'مكتمل' : 'معلق'}
              </span>
            </div>
            {order.payment.senderPhone && (
              <div className='flex justify-between items-center text-lg'>
                <span className='text-slate-500 font-bold'>رقم المحول</span>
                <span className='font-black text-slate-800 tracking-tight'>
                  {order.payment.senderPhone}
                </span>
              </div>
            )}
            <div className='flex justify-between items-center text-lg'>
              <span className='text-slate-500 font-bold'>تاريخ العملية</span>
              <span className='font-black text-slate-800'>
                {new Date(order.payment.createdAt).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>
        ) : (
          <div className='text-center py-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200'>
            <p className='text-lg text-slate-400 font-bold italic'>لا توجد بيانات دفع مسجلة</p>
          </div>
        )}

        {showPaymentForm && (
          <div className='mt-8 p-6 bg-slate-50/50 border border-slate-200 rounded-2xl space-y-6'>
            <h3 className='text-lg font-black text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center gap-2'>
              <span className='w-2 h-2 bg-emerald-500 rounded-full'></span>
              تعديل بيانات الدفع
            </h3>

            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div>
                <label className='block text-sm font-bold text-slate-400 uppercase mb-2'>
                  المبلغ المدفوع
                </label>
                <input
                  type='number'
                  value={paymentData.amount}
                  onChange={e =>
                    setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })
                  }
                  className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500'
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-slate-400 uppercase mb-2'>
                  الخصم (ج.م)
                </label>
                <input
                  type='number'
                  value={paymentData.discount}
                  onChange={e =>
                    setPaymentData({ ...paymentData, discount: parseFloat(e.target.value) || 0 })
                  }
                  className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-emerald-600 outline-none focus:ring-2 focus:ring-emerald-500'
                />
              </div>

              <div>
                <label className='block text-sm font-bold text-slate-400 uppercase mb-2'>
                  طريقة الدفع
                </label>
                <select
                  value={paymentData.method}
                  onChange={e => setPaymentData({ ...paymentData, method: e.target.value })}
                  className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500'
                >
                  <option value='CASH'>كاش</option>
                  <option value='INSTAPAY'>إنستا باي</option>
                  <option value='WALLET'>محفظة إلكترونية</option>
                  <option value='VODAFONE_CASH'>فودافون كاش</option>
                </select>
              </div>
            </div>

            <div className='flex justify-end gap-3 pt-4'>
              <button
                onClick={() => setShowPaymentForm(false)}
                className='px-6 py-3 text-base font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors'
              >
                إلغاء
              </button>
              <button
                onClick={onUpdatePayment}
                className='px-8 py-3 text-base font-black bg-slate-900 text-white hover:bg-black rounded-xl transition-all shadow-lg shadow-slate-200'
              >
                تحديث البيانات
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
