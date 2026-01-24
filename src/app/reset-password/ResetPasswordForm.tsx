'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setMessage('كلمة المرور وتأكيدها غير متطابقين');
      return;
    }

    if (password.length < 6) {
      setMessage('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      let data: any = null;
      try {
        data = await response.json();
      } catch (_) {
        data = null;
      }

      if (response.ok) {
        setIsSuccess(true);
        setMessage('تم إعادة تعيين كلمة المرور بنجاح!');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage((data && data.error) || 'حدث خطأ أثناء إعادة تعيين كلمة المرور');
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
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>تم بنجاح!</h3>
        <p className='text-gray-600 mb-4'>{message}</p>
        <p className='text-sm text-gray-500'>سيتم توجيهك إلى صفحة تسجيل الدخول تلقائياً...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {message && <div className='p-4 rounded-lg text-sm bg-red-100 text-red-700'>{message}</div>}

      <div>
        <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
          كلمة المرور الجديدة
        </label>
        <input
          type='password'
          id='password'
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black placeholder:text-gray-400'
          placeholder='أدخل كلمة المرور الجديدة'
        />
      </div>

      <div>
        <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 mb-2'>
          تأكيد كلمة المرور
        </label>
        <input
          type='password'
          id='confirmPassword'
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          minLength={6}
          className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black placeholder:text-gray-400'
          placeholder='أعد إدخال كلمة المرور الجديدة'
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
            جاري الحفظ...
          </div>
        ) : (
          'حفظ كلمة المرور الجديدة'
        )}
      </button>
    </form>
  );
}
