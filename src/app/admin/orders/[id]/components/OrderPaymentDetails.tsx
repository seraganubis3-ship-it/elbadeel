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
    <div className='bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8'>
      <div className='flex items-center justify-between mb-8'>
        <div className='flex items-center'>
          <div className='w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg'>
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
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
              />
            </svg>
          </div>
          <div className='mr-4'>
            <h2 className='text-2xl font-bold text-gray-900'>تفاصيل الدفع</h2>
            <p className='text-gray-600 mt-1'>المبالغ المدفوعة والمتبقية</p>
          </div>
        </div>
        <button
          onClick={() => setShowPaymentForm(!showPaymentForm)}
          className='px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 font-medium flex items-center space-x-2 space-x-reverse shadow-lg'
        >
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
            />
          </svg>
          <span>تعديل الدفع</span>
        </button>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8'>
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
                  d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-blue-600'>
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
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-green-600'>
                {order.payment ? (order.payment.amount / 100).toFixed(2) : '0.00'}
              </div>
              <div className='text-sm text-green-700 font-medium'>جنيه</div>
            </div>
          </div>
          <div className='text-xs text-green-600 font-medium'>المبلغ المدفوع</div>
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
                  d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-orange-600'>{remainingAmount.toFixed(2)}</div>
              <div className='text-sm text-orange-700 font-medium'>جنيه</div>
            </div>
          </div>
          <div className='text-xs text-orange-600 font-medium'>المبلغ المتبقي</div>
        </div>
      </div>

      {order.payment && (
        <div className='p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200/50 mb-6 text-right'>
          <h3 className='text-lg font-bold text-gray-800 mb-4'>معلومات الدفع</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='flex justify-between items-center'>
              <span className='text-gray-700 font-medium'>طريقة الدفع:</span>
              <span className='text-gray-900 font-bold'>
                {order.payment.method === 'CASH'
                  ? 'كاش'
                  : order.payment.method === 'VODAFONE_CASH'
                    ? 'فودافون كاش'
                    : order.payment.method === 'ORANGE_MONEY'
                      ? 'أورانج موني'
                      : order.payment.method === 'ETISALAT_CASH'
                        ? 'اتصالات كاش'
                        : order.payment.method === 'BANK_TRANSFER'
                          ? 'تحويل بنكي'
                          : order.payment.method}
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-gray-700 font-medium'>حالة الدفع:</span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.payment.status === 'CONFIRMED'
                    ? 'bg-green-100 text-green-800'
                    : order.payment.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                {order.payment.status === 'CONFIRMED'
                  ? 'مؤكد'
                  : order.payment.status === 'PENDING'
                    ? 'في الانتظار'
                    : 'ملغي'}
              </span>
            </div>
            {order.payment.senderPhone && (
              <div className='flex justify-between items-center'>
                <span className='text-gray-700 font-medium'>رقم المرسل:</span>
                <span className='text-gray-900 font-bold'>{order.payment.senderPhone}</span>
              </div>
            )}
            <div className='flex justify-between items-center'>
              <span className='text-gray-700 font-medium'>تاريخ الدفع:</span>
              <span className='text-gray-900 font-bold'>
                {new Date(order.payment.createdAt).toLocaleDateString('ar-EG')}
              </span>
            </div>
          </div>
          {order.payment.notes && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <span className='text-gray-700 font-medium'>ملاحظات:</span>
              <p className='text-gray-900 mt-1'>{order.payment.notes}</p>
            </div>
          )}
        </div>
      )}

      {showPaymentForm && (
        <div className='p-6 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl border border-blue-200/50 text-right'>
          <h3 className='text-lg font-bold text-blue-800 mb-4'>تعديل معلومات الدفع</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <label className='block text-sm font-medium text-blue-700 mb-2'>المبلغ المدفوع</label>
              <input
                type='number'
                step='0.01'
                value={paymentData.amount}
                onChange={e =>
                  setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })
                }
                className='w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='0.00'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-blue-700 mb-2'>طريقة الدفع</label>
              <select
                value={paymentData.method}
                onChange={e => setPaymentData({ ...paymentData, method: e.target.value })}
                className='w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
              >
                <option value='CASH'>كاش</option>
                <option value='VODAFONE_CASH'>فودافون كاش</option>
                <option value='ORANGE_MONEY'>أورانج موني</option>
                <option value='ETISALAT_CASH'>اتصالات كاش</option>
                <option value='BANK_TRANSFER'>تحويل بنكي</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-blue-700 mb-2'>رقم المرسل</label>
              <input
                type='text'
                value={paymentData.senderPhone}
                onChange={e => setPaymentData({ ...paymentData, senderPhone: e.target.value })}
                className='w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='رقم الهاتف'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-blue-700 mb-2'>ملاحظات</label>
              <input
                type='text'
                value={paymentData.notes}
                onChange={e => setPaymentData({ ...paymentData, notes: e.target.value })}
                className='w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='ملاحظات إضافية'
              />
            </div>
          </div>
          <div className='flex justify-end space-x-3 space-x-reverse mt-4'>
            <button
              onClick={() => setShowPaymentForm(false)}
              className='px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg transition-colors'
            >
              إلغاء
            </button>
            <button
              onClick={onUpdatePayment}
              className='px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors'
            >
              حفظ التغييرات
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
