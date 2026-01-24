'use client';

import React, { useState, FormEvent, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import Image from 'next/image';

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [remember, setRemember] = useState(false);
  const callbackUrl = params.get('callbackUrl') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('remember_login');
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
      localStorage.setItem('remember_login', remember ? 'true' : 'false');

      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      });

      if (res?.ok) {
        router.push('/');
        router.refresh();
      } else {
        if ((res as any)?.error === 'EMAIL_NOT_VERIFIED') {
          setError('يرجى تأكيد بريدك الإلكتروني أولاً');
        } else if ((res as any)?.error === 'ACCOUNT_NOT_VERIFIED') {
          router.push(`/verify-email?email=${encodeURIComponent(email)}&action=verify_existing`);
        } else {
          setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
        }
      }
    } catch (err) {
      setError('فشل تسجيل الدخول. حاول مرة أخرى.');
    }

    setLoading(false);
  }

  return (
    <div className='min-h-screen w-full flex' dir='rtl'>
      {/* Left Side - Form */}
      <div className='flex-1 flex items-center justify-center px-4 sm:px-8 lg:px-16 py-12 bg-white relative'>
        {/* Decorative Elements */}
        <div className='absolute top-0 left-0 w-64 h-64 bg-emerald-100/50 rounded-full blur-[100px]'></div>
        <div className='absolute bottom-0 right-0 w-48 h-48 bg-teal-100/50 rounded-full blur-[80px]'></div>

        <div className='relative z-10 w-full max-w-md'>
          {/* Logo */}
          <Link href='/' className='inline-flex items-center gap-3 mb-10 group'>
            <div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform'>
              <span className='text-white font-black text-xl'>ب</span>
            </div>
            <div>
              <h2 className='font-black text-slate-900 text-xl'>البديل</h2>
              <p className='text-emerald-600 text-xs font-medium'>للخدمات الحكومية</p>
            </div>
          </Link>

          {/* Header */}
          <div className='mb-8'>
            <h1 className='text-3xl sm:text-4xl font-black text-slate-900 mb-3'>
              مرحباً بعودتك! 👋
            </h1>
            <p className='text-slate-500 text-lg'>سجل دخولك للوصول إلى حسابك</p>
          </div>

          {/* Callback Notice */}
          {callbackUrl.includes('/service/') && (
            <div className='mb-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl'>
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>💡</span>
                <p className='text-blue-700 text-sm font-medium'>
                  تحتاج لحساب لإتمام طلب هذه الخدمة
                </p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className='mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl'>
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>✅</span>
                <p className='text-emerald-700 text-sm font-medium'>{success}</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl'>
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>❌</span>
                <div>
                  <p className='text-red-700 text-sm font-medium'>{error}</p>
                  {error === 'يرجى تأكيد بريدك الإلكتروني أولاً' && (
                    <Link
                      href={`/verify-email?email=${encodeURIComponent(email)}`}
                      className='text-emerald-600 hover:text-emerald-700 text-sm font-bold underline mt-1 inline-block'
                    >
                      إعادة إرسال رسالة التأكيد
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className='space-y-5'>
            {/* Email */}
            <div>
              <label htmlFor='email' className='block text-sm font-bold text-slate-700 mb-2'>
                البريد الإلكتروني
              </label>
              <div className='relative'>
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className='w-full px-5 py-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400'
                  placeholder='example@email.com'
                />
                <div className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400'>
                  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor='password' className='block text-sm font-bold text-slate-700 mb-2'>
                كلمة المرور
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className='w-full px-5 py-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400'
                  placeholder='••••••••'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors'
                >
                  {showPassword ? (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21'
                      />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className='flex items-center justify-between'>
              <label className='inline-flex items-center gap-3 cursor-pointer select-none group'>
                <input
                  type='checkbox'
                  className='w-5 h-5 rounded-lg border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all'
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                <span className='text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors'>
                  تذكرني
                </span>
              </label>
              <Link
                href='/forgot-password'
                className='text-sm text-emerald-600 hover:text-emerald-700 font-bold transition-colors'
              >
                نسيت كلمة المرور؟
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type='submit'
              disabled={loading}
              className='w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 focus:ring-4 focus:ring-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]'
            >
              {loading ? (
                <span className='flex items-center justify-center gap-3'>
                  <svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'>
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                    ></path>
                  </svg>
                  جاري تسجيل الدخول...
                </span>
              ) : (
                <span className='flex items-center justify-center gap-2'>
                  تسجيل الدخول
                  <svg
                    className='w-5 h-5 rtl:rotate-180'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <div className='mt-8 text-center'>
            <p className='text-slate-600'>
              ليس لديك حساب؟{' '}
              <Link
                href='/register'
                className='text-emerald-600 hover:text-emerald-700 font-bold transition-colors'
              >
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero Image (Hidden on mobile) */}
      <div className='hidden lg:flex flex-1 relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 items-center justify-center overflow-hidden'>
        {/* Decorative Blurs */}
        <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px]'></div>
        <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/15 rounded-full blur-[120px]'></div>

        {/* Content */}
        <div className='relative z-10 max-w-lg text-center px-12'>
          <div className='w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20'>
            <span className='text-5xl'>🔐</span>
          </div>
          <h2 className='text-4xl font-black text-white mb-6'>أهلاً بك في البديل</h2>
          <p className='text-emerald-100/80 text-xl leading-relaxed mb-8'>
            سجّل دخولك الآن واستمتع بخدماتنا المميزة في استخراج الأوراق الرسمية
          </p>

          {/* Features */}
          <div className='grid grid-cols-3 gap-4 mt-10'>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10'>
              <span className='text-2xl mb-2 block'>🚀</span>
              <span className='text-white/80 text-sm font-medium'>سريع</span>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10'>
              <span className='text-2xl mb-2 block'>🛡️</span>
              <span className='text-white/80 text-sm font-medium'>آمن</span>
            </div>
            <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/10'>
              <span className='text-2xl mb-2 block'>💼</span>
              <span className='text-white/80 text-sm font-medium'>موثوق</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen flex items-center justify-center bg-white'>
          <div className='w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
