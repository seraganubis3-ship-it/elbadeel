'use client';

import ForgotPasswordForm from './ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-green-600 via-green-700 to-green-800 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='bg-white rounded-2xl shadow-2xl p-8'>
          {/* Header */}
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>نسيت كلمة المرور؟</h1>
            <p className='text-gray-600'>أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور</p>
          </div>

          {/* Form */}
          <ForgotPasswordForm />

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
