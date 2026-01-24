'use client';

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import SimpleScrollParallax from '@/components/3D/SimpleScrollParallax';
import AnimatedCard from '@/components/3D/AnimatedCard';

function AdminLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [remember, setRemember] = useState(false);
  const callbackUrl = params.get('callbackUrl') || '/admin';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_remember_login');
    if (saved === 'true') setRemember(true);
  }, []);

  useEffect(() => {
    const message = params.get('message');
    if (message) {
      setSuccess(decodeURIComponent(message));
    }
  }, [params]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Persist remember preference for admin
      localStorage.setItem('admin_remember_login', remember ? 'true' : 'false');

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.ok) {
        // Check if user has admin privileges
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (
          session?.user?.role === 'ADMIN' ||
          session?.user?.role === 'STAFF' ||
          session?.user?.role === 'VIEWER'
        ) {
          // Navigate to admin dashboard
          router.push('/admin');
          router.refresh();
        } else {
          setError(
            'ليس لديك صلاحية للوصول إلى لوحة التحكم الإدارية. يجب أن تكون مدير أو موظف أو مراجع'
          );
          // Sign out the user since they don't have admin privileges
          await fetch('/api/auth/signout', { method: 'POST' });
        }
      } else {
        if ((res as any)?.error === 'EMAIL_NOT_VERIFIED') {
          setError('يرجى تأكيد بريدك الإلكتروني أولاً');
        } else if ((res as any)?.error === 'ACCOUNT_NOT_VERIFIED') {
          setError('الحساب غير مفعل. يرجى التواصل مع المدير');
        } else {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      }
    } catch (err) {
      setError('فشل في تسجيل الدخول. يرجى المحاولة مرة أخرى');
    }

    setLoading(false);
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center px-4 bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 text-gray-900 relative overflow-hidden'>
      {/* Enhanced Background Effects */}
      <div className='absolute inset-0'>
        <div className='absolute inset-0 bg-gradient-to-r from-slate-600/10 via-emerald-600/10 to-slate-600/10'></div>
        {/* Floating shapes */}
        <div className='absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-slate-400/30 to-emerald-400/30 rounded-full blur-xl animate-pulse'></div>
        <div className='absolute top-40 right-20 w-28 h-28 bg-gradient-to-br from-emerald-400/30 to-slate-400/30 rounded-full blur-xl animate-pulse delay-1000'></div>
        <div className='absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-emerald-400/30 to-slate-400/30 rounded-full blur-lg animate-pulse delay-2000'></div>
        <div className='absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-slate-400/30 to-emerald-400/30 rounded-full blur-xl animate-pulse delay-3000'></div>
      </div>

      <div className='relative z-10 w-full max-w-sm sm:max-w-md'>
        <AnimatedCard
          delay={0.2}
          className='bg-white/90 backdrop-blur-sm rounded-3xl shadow-3xl p-8 sm:p-10 border border-white/20 relative overflow-hidden'
        >
          {/* Background decorative elements */}
          <div className='absolute top-4 right-4 w-8 h-8 bg-emerald-500/10 rounded-full animate-pulse'></div>
          <div className='absolute bottom-4 left-4 w-6 h-6 bg-slate-500/10 rounded-full animate-bounce'></div>
          <div className='relative z-10 text-center mb-8'>
            <SimpleScrollParallax speed={0.3} direction='up'>
              <div className='w-20 h-20 bg-gradient-to-br from-slate-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:rotate-12 transition-transform duration-500'>
                <svg
                  className='w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
            </SimpleScrollParallax>

            <SimpleScrollParallax speed={0.2} direction='up'>
              <h1 className='text-4xl font-bold mb-4'>
                <span className='bg-gradient-to-r from-slate-600 via-emerald-600 to-slate-600 bg-clip-text text-transparent'>
                  لوحة التحكم الإدارية
                </span>
              </h1>
            </SimpleScrollParallax>

            <SimpleScrollParallax speed={0.1} direction='up'>
              <p className='text-lg text-gray-600'>
                <span className='bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent'>
                  تسجيل دخول المديرين والموظفين
                </span>
              </p>
            </SimpleScrollParallax>
          </div>

          {success && (
            <div className='mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm text-center'>
              {success}
            </div>
          )}

          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm text-center'>
              {error}
            </div>
          )}

          <SimpleScrollParallax speed={0.1} direction='up'>
            <form onSubmit={onSubmit} className='space-y-6'>
              <div>
                <label htmlFor='email' className='block text-lg font-semibold text-gray-700 mb-3'>
                  البريد الإلكتروني
                </label>
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className='w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-black text-lg shadow-lg hover:shadow-xl'
                  placeholder='أدخل بريدك الإلكتروني'
                />
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-lg font-semibold text-gray-700 mb-3'
                >
                  كلمة المرور
                </label>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className='w-full px-6 py-4 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all duration-300 text-black text-lg shadow-lg hover:shadow-xl'
                  placeholder='أدخل كلمة المرور'
                />
                <div className='mt-3 text-right'>
                  <Link
                    href='/forgot-password'
                    className='text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors hover:underline'
                  >
                    نسيت كلمة المرور؟
                  </Link>
                </div>
              </div>

              <div className='flex items-center justify-between'>
                <label className='inline-flex items-center gap-3 cursor-pointer select-none group'>
                  <input
                    type='checkbox'
                    className='w-5 h-5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 group-hover:scale-110 transition-transform duration-200'
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  <span className='text-base font-medium text-gray-700 group-hover:text-emerald-600 transition-colors duration-200'>
                    تذكرني
                  </span>
                </label>
              </div>

              <button
                type='submit'
                disabled={loading}
                className='group w-full bg-gradient-to-r from-slate-600 via-emerald-600 to-slate-600 text-white py-5 px-8 rounded-2xl font-bold text-xl hover:from-slate-700 hover:via-emerald-700 hover:to-slate-700 focus:ring-4 focus:ring-emerald-300 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 shadow-2xl hover:shadow-3xl relative overflow-hidden'
              >
                <span className='relative z-10 flex items-center justify-center gap-3'>
                  {loading ? (
                    <>
                      <svg
                        className='w-6 h-6 animate-spin'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                        />
                      </svg>
                      جاري تسجيل الدخول...
                    </>
                  ) : (
                    <>
                      تسجيل الدخول
                      <svg
                        className='w-6 h-6 group-hover:translate-x-2 transition-transform duration-300'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                        />
                      </svg>
                    </>
                  )}
                </span>
                <div className='absolute inset-0 bg-gradient-to-r from-slate-700 via-emerald-700 to-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
              </button>
            </form>
          </SimpleScrollParallax>

          <SimpleScrollParallax speed={0.1} direction='up'>
            <div className='mt-10 text-center'>
              <p className='text-lg text-gray-600'>
                <Link
                  href='/'
                  className='text-emerald-600 hover:text-emerald-700 font-bold transition-colors hover:underline text-xl'
                >
                  العودة للموقع الرئيسي
                </Link>
              </p>
            </div>
          </SimpleScrollParallax>
        </AnimatedCard>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className='min-h-[60vh] flex items-center justify-center'>...</div>}>
      <AdminLoginInner />
    </Suspense>
  );
}
