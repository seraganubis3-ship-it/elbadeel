'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function OrderSuccessInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const filesUploaded = searchParams.get('filesUploaded');
  const paymentSubmitted = searchParams.get('paymentSubmitted');

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        {/* Success Icon */}
        <div className='mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8'>
          <svg
            className='w-12 h-12 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>
          {paymentSubmitted ? 'تم إرسال بيانات الدفع بنجاح! 🎉' : 'تم استلام طلبك بنجاح! 🎉'}
        </h1>

        <p className='text-xl text-gray-600 mb-8'>
          {paymentSubmitted
            ? 'شكراً لك! تم إرسال بيانات الدفع بنجاح. سنقوم بمراجعة الدفع والبدء في تنفيذ طلبك.'
            : 'شكراً لك على ثقتك بنا. تم استلام طلبك وسيتم مراجعته من الإدارة أولاً، وسيظهر لك زر الدفع بعد تأكيد الطلب.'}
        </p>

        {/* Order Details */}
        {orderId && (
          <div className='bg-white rounded-2xl p-8 shadow-xl border border-green-200 mb-8'>
            <h2 className='text-2xl font-bold text-gray-900 mb-6'>تفاصيل الطلب</h2>

            <div className='space-y-4'>
              <div className='flex items-center justify-between p-4 bg-green-50 rounded-xl'>
                <span className='text-gray-700 font-medium'>رقم الطلب:</span>
                <span className='font-mono font-bold text-green-600 text-lg'>{orderId}</span>
              </div>

              {filesUploaded && (
                <div className='flex items-center justify-between p-4 bg-blue-50 rounded-xl'>
                  <span className='text-gray-700 font-medium'>المستندات المرفوعة:</span>
                  <span className='font-bold text-blue-600'>{filesUploaded} ملف</span>
                </div>
              )}

              <div className='flex items-center justify-between p-4 bg-purple-50 rounded-xl'>
                <span className='text-gray-700 font-medium'>تاريخ الطلب:</span>
                <span className='font-bold text-purple-600'>
                  {new Date().toLocaleDateString('ar-EG')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className='bg-white rounded-2xl p-8 shadow-xl border border-gray-200 mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>الخطوات التالية</h2>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='text-center'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-blue-600'>1</span>
              </div>
              <h3 className='font-bold text-gray-900 mb-2'>مراجعة الطلب</h3>
              <p className='text-gray-600 text-sm'>سنقوم بمراجعة طلبك والمستندات المرفوعة</p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-green-600'>2</span>
              </div>
              <h3 className='font-bold text-gray-900 mb-2'>بدء التنفيذ</h3>
              <p className='text-gray-600 text-sm'>سنبدأ في تنفيذ طلبك في أقرب وقت ممكن</p>
            </div>

            <div className='text-center'>
              <div className='w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-2xl font-bold text-purple-600'>3</span>
              </div>
              <h3 className='font-bold text-gray-900 mb-2'>متابعة التقدم</h3>
              <p className='text-gray-600 text-sm'>
                يمكنك متابعة تقدم طلبك من صفحة &quot;طلباتي&quot;
              </p>
            </div>
          </div>
        </div>
        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4 justify-center'>
          <Link
            href={orderId ? `/orders/${orderId}` : '/orders'}
            className='flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            متابعة حالة الطلب
          </Link>

          <Link
            href='/'
            className='flex items-center justify-center gap-2 px-8 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium text-lg'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
              />
            </svg>
            العودة للرئيسية
          </Link>
        </div>

        {/* Additional Info */}
        <div className='mt-8 text-center'>
          <p className='text-gray-500 text-sm'>
            تم إرسال تأكيد الطلب إلى بريدك الإلكتروني. يرجى التحقق من مجلد الرسائل غير المرغوب فيها
            إذا لم تجد الرسالة.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className='min-h-screen flex items-center justify-center'>...</div>}>
      <OrderSuccessInner />
    </Suspense>
  );
}
