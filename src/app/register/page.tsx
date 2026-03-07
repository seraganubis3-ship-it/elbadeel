'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'التسجيل - البديل للخدمات الحكومية',
  description:
    'أنشئ حساباً جديداً في منصة البديل للخدمات الحكومية. سجل الآن واستفد من جميع خدماتنا المتاحة.',
  keywords: [
    'التسجيل في البديل',
    'إنشاء حساب',
    'تسجيل دخول',
    'حساب جديد',
    'منصة البديل',
    'خدمات حكومية',
  ],
  alternates: {
    canonical: 'https://albadel.com.eg/register',
  },
  openGraph: {
    title: 'التسجيل - البديل للخدمات الحكومية',
    description:
      'أنشئ حساباً جديداً في منصة البديل للخدمات الحكومية. سجل الآن واستفد من جميع خدماتنا المتاحة.',
    url: 'https://albadel.com.eg/register',
    siteName: 'البديل للخدمات الحكومية',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'فشل التسجيل');
      }

      if (data.success) {
        router.push(
          '/login?message=' + encodeURIComponent('تم التسجيل بنجاح! يمكنك الآن تسجيل الدخول')
        );
      } else {
        setError(data.message || 'فشل التسجيل');
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 sm:px-6'>
      <div className='w-full max-w-md'>
        <div className='bg-white rounded-2xl shadow-2xl p-8 sm:p-10'>
          <div className='text-center mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>التسجيل</h1>
            <p className='text-gray-600'>أنشئ حساباً جديداً للبدء في استخدام الخدمات</p>
          </div>

          {error && (
            <div
              className='bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6'
              role='alert'
            >
              <p className='font-medium'>{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className='space-y-6'>
            <div>
              <label htmlFor='name' className='block text-sm font-medium text-gray-700 mb-2'>
                الاسم الكامل
              </label>
              <input
                id='name'
                name='name'
                type='text'
                required
                value={formData.name}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='أدخل اسمك الكامل'
              />
            </div>

            <div>
              <label htmlFor='phone' className='block text-sm font-medium text-gray-700 mb-2'>
                رقم الهاتف
              </label>
              <input
                id='phone'
                name='phone'
                type='tel'
                required
                value={formData.phone}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='01xxxxxxxxx'
              />
            </div>

            <div>
              <label htmlFor='password' className='block text-sm font-medium text-gray-700 mb-2'>
                كلمة المرور
              </label>
              <div className='relative'>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='أدخل كلمة المرور'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor='confirmPassword'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                تأكيد كلمة المرور
              </label>
              <input
                id='confirmPassword'
                name='confirmPassword'
                type='password'
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className='w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                placeholder='أعد إدخال كلمة المرور'
              />
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'جاري التسجيل...' : 'تسجيل'}
            </button>
          </form>

          <div className='mt-6 text-center'>
            <p className='text-gray-600'>
              لديك حساب بالفعل؟{' '}
              <Link href='/login' className='text-blue-600 hover:text-blue-700 font-medium'>
                تسجيل الدخول
              </Link>
            </p>
          </div>

          <div className='mt-4 pt-4 border-t border-gray-200'>
            <Link
              href='/'
              className='flex items-center justify-center text-gray-600 hover:text-gray-900'
            >
              <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7v-4h-4v4m-4 0h14a2 2 0 002-2V8a2 2 0 00-2-2h-4m-4 0h-4'
                />
              </svg>
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
