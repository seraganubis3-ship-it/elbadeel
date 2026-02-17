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
    <div className='bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 overflow-hidden'>
      <div className='bg-slate-50/50 px-8 py-6 border-b border-slate-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div>
              <h2 className='text-2xl font-black text-slate-800 tracking-tight'>ملخص التكاليف</h2>
              <p className='text-slate-500 font-bold text-lg'>التفاصيل المالية والرسوم</p>
            </div>
          </div>
        </div>
      </div>

      <div className='p-8 space-y-8'>
        {/* Service Price */}
        <div className='flex justify-between items-center'>
          <span className='text-slate-500 font-bold text-xl'>سعر الخدمة الأساسي</span>
          <span className='text-slate-900 font-black text-2xl tracking-tight'>
            {order.variant?.priceCents
              ? ((order.variant.priceCents * (order.quantity || 1)) / 100).toFixed(2)
              : '0.00'}{' '}
            <span className='text-base text-slate-400 font-bold mr-1'>جنيه</span>
          </span>
        </div>

        {/* Photography Fee */}
        {photographyFee > 0 && (
          <div className='flex justify-between items-center'>
            <span className='text-slate-500 font-bold text-xl'>رسوم التصوير</span>
            <span className='text-slate-900 font-black text-2xl tracking-tight'>
              +{photographyFee.toFixed(2)}{' '}
              <span className='text-base text-slate-400 font-bold mr-1'>جنيه</span>
            </span>
          </div>
        )}

        {/* Delivery Fee */}
        {order.deliveryType === 'ADDRESS' && order.deliveryFee > 0 && (
          <div className='flex justify-between items-center'>
            <span className='text-slate-500 font-bold text-xl'>مصاريف الشحن والتوصيل</span>
            <span className='text-slate-900 font-black text-2xl tracking-tight'>
              +{(order.deliveryFee / 100).toFixed(2)}{' '}
              <span className='text-base text-slate-400 font-bold mr-1'>جنيه</span>
            </span>
          </div>
        )}

        {/* Restore Fines Section */}
        {order.finesDetails && (
          <div className='p-6 bg-red-50/50 rounded-3xl border border-red-100'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-200'>
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
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-black text-red-900'>الغرامات المطبقة</h3>
            </div>
            <div className='space-y-3'>
              {(() => {
                try {
                  const fines = JSON.parse(order.finesDetails as string);
                  return fines.map(
                    (fine: any, index: number) =>
                      fine.amount > 0 && (
                        <div
                          key={index}
                          className='flex justify-between items-center p-4 bg-white/70 rounded-2xl border border-red-50 text-xl font-black text-red-700 shadow-sm'
                        >
                          <span>{fine.name}</span>
                          <span className='tracking-tight'>
                            +{((fine.amount || 0) / 100).toFixed(2)} جنيه
                          </span>
                        </div>
                      )
                  );
                } catch {
                  return null;
                }
              })()}
            </div>
          </div>
        )}

        {/* Dynamic Services */}
        {order.servicesDetails &&
          (() => {
            try {
              const services = JSON.parse(order.servicesDetails as string);
              return services.map((service: any, index: number) => (
                <div
                  key={index}
                  className='flex justify-between items-center p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50'
                >
                  <span className='font-bold text-xl text-indigo-900'>{service.name}</span>
                  <span className='font-black text-2xl text-indigo-950 tracking-tight'>
                    +{(service.amount / 100).toFixed(2)}{' '}
                    <span className='text-base font-bold text-indigo-400 mr-1'>جنيه</span>
                  </span>
                </div>
              ));
            } catch {
              return null;
            }
          })()}

        {/* Discount */}
        {order.discount && order.discount > 0 && (
          <div className='flex justify-between items-center p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 text-emerald-700 font-black text-xl'>
            <span className='font-bold'>الخصم المطبق</span>
            <span className='tracking-tight'>
              -{(order.discount / 100).toFixed(2)}{' '}
              <span className='text-base font-bold mr-1'>جنيه</span>
            </span>
          </div>
        )}

        {/* Total Divider */}
        <div className='pt-8 border-t border-slate-100 mt-8'>
          <div className='flex justify-between items-center'>
            <div>
              <p className='text-sm font-black text-slate-400 uppercase tracking-widest mb-2 px-1'>
                الإجمالي النهائي
              </p>
              <h3 className='text-3xl font-black text-slate-900 tracking-tight'>المبلغ المطلوب</h3>
            </div>
            <div className='text-right'>
              <div className='text-6xl font-black text-slate-950 tracking-tighter'>
                {(order.totalCents / 100).toFixed(2)}
              </div>
              <div className='text-base text-slate-500 font-black uppercase tracking-widest'>
                جنيه مصري
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
