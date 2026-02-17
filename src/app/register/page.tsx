'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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

    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      if (res.ok) {
        router.push('/login?message=تم إنشاء الحساب بنجاح');
      } else {
        const errorData = await res.json();

        if (errorData.action === 'LOGIN_EXISTING') {
          router.push(`/login?message=${encodeURIComponent(errorData.message)}`);
        } else {
          setError(errorData.error || 'فشل في إنشاء الحساب');
        }
      }
    } catch (err) {
      setError('حدث خطأ. حاول مرة أخرى');
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

        <div className='relative z-10 w-full max-w-lg'>
          {/* Logo */}
          <Link href='/' className='inline-flex items-center gap-3 mb-8 group'>
            <div className='w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform'>
              <span className='text-white font-black text-xl'>ب</span>
            </div>
            <div>
              <h2 className='font-black text-slate-900 text-xl'>البديل</h2>
              <p className='text-emerald-600 text-xs font-medium'>للخدمات الحكومية</p>
            </div>
          </Link>

          {/* Header */}
          <div className='mb-6'>
            <h1 className='text-3xl sm:text-4xl font-black text-slate-900 mb-3'>
              إنشاء حساب جديد ✨
            </h1>
            <p className='text-slate-500 text-lg'>انضم إلينا واحصل على خدماتنا المميزة</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className='mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl'>
              <div className='flex items-center gap-3'>
                <span className='text-2xl'>❌</span>
                <p className='text-red-700 text-sm font-medium'>{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className='space-y-5'>
            {/* Name */}
            <div>
              <label className='block text-sm font-bold text-slate-700 mb-2'>الاسم الكامل</label>
              <div className='relative'>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className='w-full px-5 py-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400'
                  placeholder='أدخل اسمك الكامل'
                />
                <div className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400'>
                  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className='block text-sm font-bold text-slate-700 mb-2'>رقم الهاتف</label>
              <div className='relative'>
                <input
                  type='tel'
                  name='phone'
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className='w-full px-5 py-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400'
                  placeholder='01xxxxxxxxx'
                />
                <div className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400'>
                  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className='block text-sm font-bold text-slate-700 mb-2'>كلمة المرور</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className='w-full px-5 py-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400'
                  placeholder='6 أحرف على الأقل'
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

            {/* Confirm Password */}
            <div>
              <label className='block text-sm font-bold text-slate-700 mb-2'>
                تأكيد كلمة المرور
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='confirmPassword'
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className='w-full px-5 py-4 pr-12 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400'
                  placeholder='أعد إدخال كلمة المرور'
                />
                <div className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-400'>
                  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                    />
                  </svg>
                </div>
              </div>
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
                  جاري الإنشاء...
                </span>
              ) : (
                <span className='flex items-center justify-center gap-2'>
                  إنشاء الحساب
                  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
                    />
                  </svg>
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className='mt-8 text-center'>
            <p className='text-slate-600'>
              لديك حساب بالفعل؟{' '}
              <Link
                href='/login'
                className='text-emerald-600 hover:text-emerald-700 font-bold transition-colors'
              >
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Hero (Hidden on mobile) */}
      <div className='hidden lg:flex flex-1 relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 items-center justify-center overflow-hidden'>
        {/* Decorative Blurs */}
        <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px]'></div>
        <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/15 rounded-full blur-[120px]'></div>

        {/* Content */}
        <div className='relative z-10 max-w-lg text-center px-12'>
          <div className='w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20'>
            <span className='text-5xl'>🎉</span>
          </div>
          <h2 className='text-4xl font-black text-white mb-6'>انضم لعائلة البديل</h2>
          <p className='text-emerald-100/80 text-xl leading-relaxed mb-8'>
            أنشئ حسابك الآن واستفد من جميع خدماتنا في استخراج الأوراق الرسمية
          </p>

          {/* Benefits */}
          <div className='space-y-4 text-right'>
            {[
              { icon: '✓', text: 'خدمة سريعة وموثوقة' },
              { icon: '✓', text: 'متابعة للطلبات على مدار الساعة' },
              { icon: '✓', text: 'دعم فني متميز' },
              { icon: '✓', text: 'أسعار منافسة' },
            ].map((item, index) => (
              <div
                key={index}
                className='flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3 border border-white/10'
              >
                <span className='w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-bold'>
                  {item.icon}
                </span>
                <span className='text-white font-medium'>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
