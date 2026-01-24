'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import VerifyEmailForm from './VerifyEmailForm';

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || undefined;
  const token = searchParams.get('token') || undefined;
  const action = searchParams.get('action') || undefined;
  const userId = searchParams.get('userId') || undefined;

  // تحديد نوع الصفحة بناءً على المعاملات
  const isVerifyingExisting = action === 'verify_existing';
  const isNewAccount = !action && !token;

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-blue-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z'
                />
              </svg>
            </div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {token
                ? 'تأكيد البريد الإلكتروني'
                : isVerifyingExisting
                  ? 'تفعيل الحساب الموجود'
                  : 'إعادة إرسال رسالة التأكيد'}
            </h1>
            <p className='text-gray-600'>
              {token
                ? 'جاري تأكيد بريدك الإلكتروني...'
                : isVerifyingExisting
                  ? 'هذا البريد الإلكتروني مسجل بالفعل لكن لم يتم تفعيله. يرجى إدخال كود التأكيد المرسل لك.'
                  : 'تحقق من بريدك الإلكتروني واتبع رابط التأكيد لتفعيل حسابك'}
            </p>

            {/* رسالة خاصة للحسابات الموجودة */}
            {isVerifyingExisting && (
              <div className='mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                <p className='text-blue-700 text-sm'>
                  <strong>ملاحظة:</strong> لا تحتاج لإنشاء حساب جديد. فقط قم بتفعيل الحساب الموجود.
                </p>
              </div>
            )}
          </div>

          {/* Form */}
          <VerifyEmailForm
            email={email ?? ''}
            token={token ?? ''}
            action={action ?? ''}
            userId={userId ?? ''}
          />

          {/* Back to Login */}
          <div className='text-center mt-6'>
            <a
              href='/login'
              className='text-green-600 hover:text-green-700 font-medium transition-colors'
            >
              العودة لتسجيل الدخول
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={<div className='min-h-screen flex items-center justify-center text-white'>...</div>}
    >
      <VerifyEmailInner />
    </Suspense>
  );
}
