'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  Lock,
  Sparkles,
  ChevronLeft,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const message = searchParams.get('message');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        phone: formData.phone,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('رقم الهاتف أو كلمة المرور غير صحيحة');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('حدث خطأ ما. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className='relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50'>
      {/* Dynamic Animated Background */}
      <div className='absolute inset-0 z-0 overflow-hidden'>
        <div className='absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-[100px] animate-pulse' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-teal-300/20 rounded-full blur-[120px] animate-pulse' style={{ animationDelay: '2s' }} />
        <div className='absolute top-[30%] left-[60%] w-[400px] h-[400px] bg-green-200/20 rounded-full blur-[80px] animate-pulse' style={{ animationDelay: '4s' }} />
        <div className='absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-70' />
      </div>

      <div className='relative z-10 w-full max-w-md px-4 sm:px-6 py-12'>
        <div className='mb-8 text-center'>
          <div className='mx-auto inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-emerald-500/10 mb-6 relative group overflow-hidden'>
            <div className='absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 opacity-10 group-hover:opacity-20 transition-opacity duration-500' />
            <Sparkles className='w-8 h-8 text-emerald-600 relative z-10' />
          </div>
          <h1 className='text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3'>
            مرحباً بعودتك
          </h1>
          <p className='text-slate-500 font-medium'>
            سجل دخولك لمتابعة طلباتك وإدارة حسابك
          </p>
        </div>

        <div className='bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/80 transition-all duration-300 hover:shadow-[0_16px_60px_-15px_rgba(0,0,0,0.1)]'>
          {message && (
            <div className='mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-emerald-700 animate-in fade-in slide-in-from-top-2'>
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0'>
                  <CheckCircle2 className='w-5 h-5 text-emerald-600' />
                </div>
                <p className='text-sm font-bold'>{decodeURIComponent(message)}</p>
              </div>
            </div>
          )}

          {error && (
            <div className='mb-6 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-rose-700 animate-in fade-in slide-in-from-top-2'>
              <p className='text-sm font-bold text-center'>{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className='space-y-5 lg:space-y-6'>
            <div className='space-y-2 lg:space-y-3'>
              <label htmlFor='phone' className='block text-sm font-bold text-slate-700 mr-2'>
                رقم الهاتف
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors'>
                  <Phone className='w-5 h-5' />
                </div>
                <input
                  id='phone'
                  name='phone'
                  type='tel'
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className='block w-full h-14 pl-4 pr-12 rounded-2xl border border-slate-200/80 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold'
                  placeholder='01xxxxxxxxx'
                  dir='ltr'
                />
              </div>
            </div>

            <div className='space-y-2 lg:space-y-3'>
              <div className='flex items-center justify-between mr-2 pr-1'>
                <label htmlFor='password' className='block text-sm font-bold text-slate-700'>
                  كلمة المرور
                </label>
                <Link
                  href='/forgot-password'
                  className='text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors'
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <div className='relative group'>
                <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors'>
                  <Lock className='w-5 h-5' />
                </div>
                <input
                  id='password'
                  name='password'
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className='block w-full h-14 pl-12 pr-12 rounded-2xl border border-slate-200/80 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold font-sans tracking-widest'
                  placeholder='••••••••'
                  dir='ltr'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none'
                >
                  {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='relative w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white font-bold text-base overflow-hidden transition-all hover:bg-black hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-2'
            >
              {loading ? (
                <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ChevronLeft className='w-5 h-5 opacity-70' />
                </>
              )}
            </button>
          </form>
        </div>

        <div className='mt-8 text-center'>
          <p className='text-slate-500 font-medium'>
            ليس لديك حساب بعد؟{' '}
            <Link
              href='/register'
              className='font-bold text-emerald-600 hover:text-emerald-700 transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-full after:h-0.5 after:bg-emerald-600/30 after:hover:bg-emerald-600/100 after:transition-colors'
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </div>
        
        <div className='mt-12 text-center'>
            <Link href="/" className='inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors'>
                <ArrowRight className='w-4 h-4' />
                العودة للرئيسية
            </Link>
        </div>
      </div>
    </main>
  );
}
