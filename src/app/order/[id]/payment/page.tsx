import { prisma } from '@/lib/prisma';
import { notFound, redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import PaymentForm from './PaymentForm';
import Link from 'next/link';

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;

  // Get order
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      service: true,
      variant: true,
      payment: true,
    },
  });

  if (!order) return notFound();

  // Check if user owns this order
  if (order.userId !== session.user.id) {
    redirect('/orders');
  }

  if (order.status === 'waiting_confirmation') {
    return (
      <div className='min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4' dir='rtl'>
        <div className='max-w-lg w-full bg-white rounded-[2rem] shadow-xl border border-amber-100 p-8 text-center'>
          <div className='w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center'>
            <svg className='w-8 h-8' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
            </svg>
          </div>
          <h1 className='text-2xl font-black text-slate-900 mb-3'>الدفع غير متاح الآن</h1>
          <p className='text-slate-600 leading-7 mb-6'>
            طلبك قيد مراجعة الإدارة. سيظهر زر الدفع تلقائيًا بعد تأكيد الطلب وتحديد المستحقات المطلوبة.
          </p>
          <Link
            href={`/orders/${id}`}
            className='inline-flex items-center justify-center px-6 py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors'
          >
            متابعة حالة الطلب
          </Link>
        </div>
      </div>
    );
  }

  if (order.status !== 'waiting_payment') {
    redirect(`/orders/${id}`);
  }
  return (
    <div className='min-h-screen bg-[#F8FAFC] relative overflow-hidden' dir='rtl'>
      {/* Dynamic Background Elements */}
      <div className='absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-slate-900 to-[#F8FAFC]'></div>
      <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3'></div>
      <div className='absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[130px] -translate-y-1/3 -translate-x-1/4'></div>

      <div className='relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24'>
        {/* Header Section */}
        <div className='text-center mb-16'>
          <Link
            href='/orders'
            className='inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-8 text-white/70 hover:text-white transition-all text-sm font-bold'
          >
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10 19l-7-7m0 0l7-7m-7 7h18'
              />
            </svg>
            العودة لطلباتي
          </Link>
          <h1 className='text-4xl sm:text-5xl font-black text-white mb-4 tracking-tight'>
            إتمام عملية الدفع
          </h1>
          <p className='text-lg text-slate-400 font-medium'>
            خطوة واحدة تفصلك عن تأكيد طلبك والبدء في التنفيذ
          </p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-10 items-start'>
          {/* Main Payment Section */}
          <div className='lg:col-span-7'>
            <PaymentForm orderId={order.id} totalAmount={order.totalCents} />

            {/* Trust Badges */}
            <div className='mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4'>
              {[
                { icon: '🔒', label: 'دفع آمن' },
                { icon: '⚡', label: 'تأكيد فوري' },
                { icon: '🛡️', label: 'حماية البيانات' },
                { icon: '📞', label: 'دعم 24/7' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className='bg-white/50 backdrop-blur-sm border border-slate-100 p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:shadow-md'
                >
                  <span className='text-2xl'>{badge.icon}</span>
                  <span className='text-[10px] font-black text-slate-500 uppercase tracking-widest'>
                    {badge.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Section */}
          <div className='lg:col-span-5 space-y-6'>
            {/* Receipt Card */}
            <div className='bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 overflow-hidden sticky top-8'>
              <div className='bg-slate-900 p-8 text-white relative'>
                <div className='absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full'></div>
                <h2 className='text-2xl font-black mb-2 relative z-10'>ملخص الطلب</h2>
                <div className='flex items-center gap-2 text-slate-400 text-xs font-bold relative z-10 bg-white/10 w-fit px-3 py-1 rounded-full'>
                  <span className='w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse'></span>
                  رقم الطلب: #{order.id.slice(-6)}
                </div>
              </div>

              <div className='p-8 space-y-6'>
                <div className='space-y-4'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <span className='text-xs font-black text-slate-400 uppercase tracking-widest block mb-1'>
                        الخدمة المطلوبة
                      </span>
                      <h3 className='text-lg font-black text-slate-800'>{order.service.name}</h3>
                      <p className='text-sm text-slate-500 font-bold'>{order.variant.name}</p>
                    </div>
                    <div className='w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-2xl shadow-inner italic font-serif'>
                      {(order.service as any).icon || '📄'}
                    </div>
                  </div>

                  <div className='h-px bg-slate-100'></div>

                  <div className='space-y-3'>
                    <div className='flex justify-between items-center text-sm font-bold'>
                      <span className='text-slate-500'>سعر الخدمة</span>
                      <span className='text-slate-900'>
                        {(order.variant.priceCents / 100).toFixed(2)} ج.م
                      </span>
                    </div>

                    <div className='flex justify-between items-center text-sm font-bold'>
                      <span className='text-slate-500'>طريقة الاستلام</span>
                      <span className='text-slate-900'>
                        {order.deliveryType === 'OFFICE' ? '📦 استلام مكتبي' : '🚚 توصيل للمنزل'}
                      </span>
                    </div>

                    {order.deliveryFee > 0 && (
                      <div className='flex justify-between items-center text-sm font-bold text-emerald-600'>
                        <span>رسوم التوصيل</span>
                        <span>+ {(order.deliveryFee / 100).toFixed(2)} ج.م</span>
                      </div>
                    )}

                    {(order as any).discountAmount > 0 && (
                      <div className='flex justify-between items-center text-sm font-bold text-rose-500 bg-rose-50 p-2 rounded-lg'>
                        <span>خصم كوبون</span>
                        <span>- {((order as any).discountAmount / 100).toFixed(2)} ج.م</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='pt-6 border-t-2 border-dashed border-slate-100 flex justify-between items-end'>
                  <div>
                    <span className='text-xs font-black text-slate-400 uppercase tracking-widest block'>
                      المبلغ الإجمالي
                    </span>
                    <span className='text-[10px] text-slate-400 font-bold'>
                      شامل كافة الرسوم والضرائب
                    </span>
                  </div>
                  <div className='text-left'>
                    <span className='text-4xl font-black text-slate-900 leading-none'>
                      {(order.totalCents / 100).toFixed(0)}
                    </span>
                    <span className='text-xs font-black text-slate-400 mr-1'>ج.م</span>
                  </div>
                </div>
              </div>

              {/* Secure Banner */}
              <div className='bg-emerald-50 px-8 py-4 flex items-center justify-center gap-3'>
                <div className='w-2 h-2 bg-emerald-500 rounded-full animate-ping'></div>
                <span className='text-[10px] font-black text-emerald-700 uppercase tracking-widest'>
                  نظام دفع مشفر وآمن بالكامل (SSL)
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
