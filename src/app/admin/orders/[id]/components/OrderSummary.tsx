'use client';

import { Order } from '../types';

interface OrderSummaryProps {
  order: Order;
}

export default function OrderSummary({ order }: OrderSummaryProps) {
  const photographyFee =
    order.photographyLocation === 'dandy_mall'
      ? 200
      : order.photographyLocation === 'civil_registry_haram'
        ? 50
        : order.photographyLocation === 'home_photography'
          ? 200
          : 0;

  const totalCents = order.totalCents;

  return (
    <div className='bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 text-right'>
      <div className='flex items-center mb-4 justify-end'>
        <div className='mr-3'>
          <h2 className='text-lg font-bold text-gray-900'>ملخص الطلب</h2>
          <p className='text-gray-600 text-sm'>تفاصيل التكلفة والرسوم</p>
        </div>
        <div className='w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg'>
          <svg className='w-4 h-4 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
            />
          </svg>
        </div>
      </div>

      <div className='space-y-3'>
        <div className='group p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200/50 hover:shadow-md transition-all duration-300'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-2 space-x-reverse'>
              <div className='w-6 h-6 bg-blue-500 rounded-md flex items-center justify-center'>
                <svg
                  className='w-3 h-3 text-white'
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
              <span className='text-blue-800 font-bold text-sm'>سعر الخدمة:</span>
            </div>
            <span className='text-blue-900 font-bold text-sm'>
              {order.variant?.priceCents
                ? ((order.variant.priceCents * (order.quantity || 1)) / 100).toFixed(2)
                : 'غير محدد'}{' '}
              جنيه
              {order.quantity && order.quantity > 1 && (
                <span className='text-xs text-blue-600 mr-1'>
                  ({order.variant?.priceCents ? (order.variant.priceCents / 100).toFixed(2) : '0'} ×{' '}
                  {order.quantity})
                </span>
              )}
            </span>
          </div>
        </div>

        {photographyFee > 0 && (
          <div className='group p-3 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg border border-cyan-200/50 hover:shadow-md transition-all duration-300'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-2 space-x-reverse'>
                <div className='w-6 h-6 bg-cyan-500 rounded-md flex items-center justify-center'>
                  <svg
                    className='w-3 h-3 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 13a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                </div>
                <span className='text-cyan-800 font-bold text-sm'>رسوم التصوير:</span>
              </div>
              <span className='text-cyan-900 font-bold text-sm'>+{photographyFee} جنيه</span>
            </div>
          </div>
        )}

        {order.deliveryType === 'ADDRESS' && order.deliveryFee > 0 && (
          <div className='group p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200/50 hover:shadow-md transition-all duration-300'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-2 space-x-reverse'>
                <div className='w-6 h-6 bg-green-500 rounded-md flex items-center justify-center'>
                  <svg
                    className='w-3 h-3 text-white'
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
                <span className='text-green-800 font-bold text-sm'>رسوم التوصيل:</span>
              </div>
              <span className='text-green-900 font-bold text-sm'>
                +{(order.deliveryFee / 100).toFixed(2)} جنيه
              </span>
            </div>
          </div>
        )}

        {order.finesDetails && (
          <div className='group p-3 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200/50 hover:shadow-md transition-all duration-300'>
            <div className='flex items-center space-x-2 space-x-reverse mb-2 justify-end'>
              <h3 className='text-sm font-bold text-red-800'>الغرامات المطبقة</h3>
              <div className='w-6 h-6 bg-red-500 rounded-md flex items-center justify-center'>
                <svg
                  className='w-3 h-3 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
            </div>
            <div className='space-y-2'>
              {(() => {
                try {
                  const fines = JSON.parse(order.finesDetails as string);
                  return fines.map((fine: any, index: number) => (
                    <div
                      key={index}
                      className='flex justify-between items-center p-2 bg-white/50 rounded-md'
                    >
                      <span className='text-red-700 font-medium text-xs'>{fine.name}</span>
                      {fine.id === 'fine_004' ? (
                        <span className='text-red-600 font-bold text-sm'>
                          {(fine.amount / 100).toFixed(2)} جنيه
                        </span>
                      ) : (
                        <span className='text-gray-500 text-sm'>-</span>
                      )}
                    </div>
                  ));
                } catch {
                  return <span className='text-red-600 text-xs'>خطأ في عرض الغرامات</span>;
                }
              })()}
            </div>
          </div>
        )}

        {order.servicesDetails && (
          <div className='group p-3 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200/50 hover:shadow-md transition-all duration-300'>
            <div className='flex items-center space-x-2 space-x-reverse mb-2 justify-end'>
              <h3 className='text-sm font-bold text-indigo-800'>تفاصيل الخدمات</h3>
              <div className='w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center'>
                <svg
                  className='w-3 h-3 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
                  />
                </svg>
              </div>
            </div>
            <div className='space-y-2'>
              {(() => {
                try {
                  const services = JSON.parse(order.servicesDetails as string);
                  return services.map((service: any, index: number) => (
                    <div
                      key={index}
                      className='flex justify-between items-center p-2 bg-white/50 rounded-md'
                    >
                      <span className='text-indigo-700 font-medium text-xs'>{service.name}</span>
                      <span className='text-indigo-600 font-bold text-sm'>
                        +{(service.amount / 100).toFixed(2)} جنيه
                      </span>
                    </div>
                  ));
                } catch {
                  return <span className='text-indigo-600 text-xs'>خطأ في عرض الخدمات</span>;
                }
              })()}
            </div>
          </div>
        )}

        {order.discount && order.discount > 0 && (
          <div className='group p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg border border-purple-200/50 hover:shadow-md transition-all duration-300'>
            <div className='flex justify-between items-center'>
              <div className='flex items-center space-x-2 space-x-reverse'>
                <div className='w-6 h-6 bg-purple-500 rounded-md flex items-center justify-center'>
                  <svg
                    className='w-3 h-3 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
                    />
                  </svg>
                </div>
                <span className='text-purple-800 font-bold text-sm'>الخصم:</span>
              </div>
              <span className='text-purple-900 font-bold text-sm'>
                -{(order.discount / 100).toFixed(2)} جنيه
              </span>
            </div>
          </div>
        )}
        <div className='mt-4 p-4 bg-gradient-to-r from-emerald-50 to-green-100 rounded-lg border-2 border-emerald-200/50 shadow-lg'>
          <div className='flex justify-between items-center'>
            <div className='flex items-center space-x-2 space-x-reverse'>
              <div className='w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg'>
                <svg
                  className='w-4 h-4 text-white'
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
              <div>
                <h3 className='text-lg font-bold text-emerald-800'>إجمالي الطلب</h3>
                <p className='text-emerald-600 text-xs'>المبلغ النهائي المطلوب دفعه</p>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-emerald-900'>
                {(totalCents / 100).toFixed(2)}
              </div>
              <div className='text-emerald-700 font-medium text-sm'>جنيه مصري</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
