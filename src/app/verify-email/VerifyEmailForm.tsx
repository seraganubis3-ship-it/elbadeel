'use client';

import { useState, useEffect } from 'react';

interface VerifyEmailFormProps {
  email?: string;
  token?: string;
  action?: string;
  userId?: string;
}

export default function VerifyEmailForm({ email, token, action, userId }: VerifyEmailFormProps) {
  const [emailInput, setEmailInput] = useState(email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // تحديد نوع الصفحة
  const isVerifyingExisting = action === 'verify_existing';

  // Verify email if token is provided
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('تم تأكيد بريدك الإلكتروني بنجاح!');
      } else {
        setMessage(data.error || 'حدث خطأ أثناء تأكيد البريد الإلكتروني');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput,
          userId: userId, // إرسال معرف المستخدم إذا كان متوفراً
          action: action, // إرسال نوع العملية
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setMessage('تم إرسال رسالة التأكيد مرة أخرى إلى بريدك الإلكتروني');
      } else {
        setMessage(data.error || 'حدث خطأ أثناء إرسال رسالة التأكيد');
      }
    } catch (error) {
      setMessage('حدث خطأ في الاتصال');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='text-center'>
        <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg
            className='w-8 h-8 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>تم التأكيد!</h3>
        <p className='text-gray-600 mb-4'>{message}</p>
        <p className='text-sm text-gray-500'>يمكنك الآن تسجيل الدخول باستخدام حسابك</p>
        <div className='mt-4'>
          <a
            href='/login'
            className='inline-block bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors'
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  if (isVerifying) {
    return (
      <div className='text-center'>
        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <div className='w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
        </div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>جاري التأكيد...</h3>
        <p className='text-gray-600'>يرجى الانتظار أثناء تأكيد بريدك الإلكتروني</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
        <div className='flex'>
          <div className='flex-shrink-0'>
            <svg
              className='h-5 w-5 text-blue-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <div className='mr-3'>
            <h3 className='text-sm font-medium text-blue-800'>معلومات مهمة</h3>
            <div className='mt-2 text-sm text-blue-700'>
              <p>• تحقق من مجلد الرسائل غير المرغوب فيها (Spam)</p>
              <p>• تأكد من صحة عنوان البريد الإلكتروني</p>
              <p>• انتظر بضع دقائق قبل طلب إعادة الإرسال</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleResendVerification} className='space-y-6'>
        {message && <div className='p-4 rounded-lg text-sm bg-red-100 text-red-700'>{message}</div>}

        <div>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
            البريد الإلكتروني
          </label>
          <input
            type='email'
            id='email'
            value={emailInput}
            onChange={e => setEmailInput(e.target.value)}
            required
            className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black'
            placeholder='أدخل بريدك الإلكتروني'
          />
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <div className='flex items-center justify-center'>
              <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
              جاري الإرسال...
            </div>
          ) : (
            'إعادة إرسال رسالة التأكيد'
          )}
        </button>
      </form>
    </div>
  );
}
