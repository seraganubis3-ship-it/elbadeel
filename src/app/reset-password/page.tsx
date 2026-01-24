'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ResetPasswordForm from './ResetPasswordForm';

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || undefined;

  if (!token) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4'>
        <div className='max-w-md w-full'>
          <div className='bg-white rounded-2xl shadow-2xl p-8 text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </div>
            <h1 className='text-2xl font-bold text-gray-900 mb-2'>رابط غير صحيح</h1>
            <p className='text-gray-600 mb-4'>
              رابط إعادة تعيين كلمة المرور غير صحيح أو منتهي الصلاحية
            </p>
            <a
              href='/forgot-password'
              className='text-green-600 hover:text-green-700 font-medium transition-colors'
            >
              طلب رابط جديد
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>إعادة تعيين كلمة المرور</h1>
            <p className='text-gray-600'>أدخل كلمة المرور الجديدة</p>
          </div>

          {/* Form */}
          <ResetPasswordForm token={token} />

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<div className='min-h-screen flex items-center justify-center text-white'>...</div>}
    >
      <ResetPasswordInner />
    </Suspense>
  );
}
