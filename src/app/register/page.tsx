'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Phone,
  Lock,
  User,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
} from 'lucide-react';

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين');
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.message || 'فشل التسجيل');
      }

      router.push('/login?message=' + encodeURIComponent('تم إنشاء الحساب بنجاح، يمكنك الآن تسجيل الدخول'));
    } catch (err: any) {
      setError(err.message || 'حدث خطأ ما. يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  const passwordChecks = [
    { label: '6 أحرف أو أكثر', valid: formData.password.length >= 6 },
    {
      label: 'تأكيد كلمة المرور متطابق',
      valid: !!formData.confirmPassword && formData.password === formData.confirmPassword,
    },
  ];

  return (
    <main className='relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50 py-12'>
      {/* Dynamic Animated Background */}
      <div className='absolute inset-0 z-0 overflow-hidden fixed'>
        <div className='absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-300/20 rounded-full blur-[100px] animate-pulse' />
        <div className='absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-sky-300/20 rounded-full blur-[120px] animate-pulse' style={{ animationDelay: '2s' }} />
        <div className='absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.02)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)] opacity-70' />
      </div>

      <div className='relative z-10 w-full max-w-md px-4 sm:px-6'>
        <div className='mb-8 text-center'>
          <div className='mx-auto inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-xl shadow-emerald-500/10 mb-6 relative group overflow-hidden'>
            <div className='absolute inset-0 rounded-2xl bg-gradient-to-tr from-emerald-500 to-sky-400 opacity-10 group-hover:opacity-20 transition-opacity duration-500' />
            <Sparkles className='w-8 h-8 text-emerald-600 relative z-10' />
          </div>
          <h1 className='text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mb-3'>
            إنشاء حساب جديد
          </h1>
          <p className='text-slate-500 font-medium'>
            سجل الآن وابدأ في إنشاء ومتابعة طلباتك
          </p>
        </div>

        <div className='bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.1)] border border-white/80 transition-all duration-300 hover:shadow-[0_16px_60px_-15px_rgba(0,0,0,0.1)]'>
          {error && (
            <div className='mb-6 rounded-2xl border border-rose-100 bg-rose-50/70 p-4 text-rose-700 animate-in fade-in slide-in-from-top-2'>
              <p className='text-sm font-bold text-center'>{error}</p>
            </div>
          )}

          <form onSubmit={onSubmit} className='space-y-4 lg:space-y-5'>
            <div className='space-y-1.5 lg:space-y-2'>
              <label htmlFor='name' className='block text-sm font-bold text-slate-700 mr-2'>
                الاسم الكامل
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors'>
                  <User className='w-5 h-5' />
                </div>
                <input
                  id='name'
                  name='name'
                  type='text'
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className='block w-full h-14 pl-4 pr-12 rounded-2xl border border-slate-200/80 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold'
                  placeholder='الاسم الثلاثي أو الرباعي'
                />
              </div>
            </div>

            <div className='space-y-1.5 lg:space-y-2'>
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

            <div className='space-y-1.5 lg:space-y-2'>
              <label htmlFor='password' className='block text-sm font-bold text-slate-700 mr-2'>
                كلمة المرور
              </label>
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

            <div className='space-y-1.5 lg:space-y-2'>
              <label htmlFor='confirmPassword' className='block text-sm font-bold text-slate-700 mr-2'>
                تأكيد كلمة المرور
              </label>
              <div className='relative group'>
                <div className='absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors'>
                  <ShieldCheck className='w-5 h-5' />
                </div>
                <input
                  id='confirmPassword'
                  name='confirmPassword'
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className='block w-full h-14 pl-12 pr-12 rounded-2xl border border-slate-200/80 bg-white/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none font-bold font-sans tracking-widest'
                  placeholder='••••••••'
                  dir='ltr'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none'
                >
                  {showConfirmPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}
                </button>
              </div>
            </div>

            <div className='mt-2 rounded-2xl bg-slate-100/50 p-3'>
              <div className='space-y-2'>
                {passwordChecks.map(check => (
                  <div key={check.label} className='flex items-center gap-2 text-xs font-bold'>
                    <CheckCircle2
                      className={`w-4 h-4 transition-colors ${check.valid ? 'text-emerald-600' : 'text-slate-300'}`}
                    />
                    <span className={`transition-colors ${check.valid ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {check.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='relative w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-slate-900 text-white font-bold text-base overflow-hidden transition-all hover:bg-black hover:shadow-xl hover:shadow-slate-900/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4'
            >
              {loading ? (
                <div className='w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin' />
              ) : (
                <>
                  <span>إنشاء الحساب</span>
                  <ChevronLeft className='w-5 h-5 opacity-70' />
                </>
              )}
            </button>
          </form>
        </div>

        <div className='mt-8 text-center'>
          <p className='text-slate-500 font-medium'>
            عضواً بالفعل؟{' '}
            <Link
              href='/login'
              className='font-bold text-emerald-600 hover:text-emerald-700 transition-colors relative after:absolute after:bottom-0 after:right-0 after:w-full after:h-0.5 after:bg-emerald-600/30 after:hover:bg-emerald-600/100 after:transition-colors'
            >
              تسجيل الدخول
            </Link>
          </p>
        </div>
        
        <div className='mt-12 text-center pb-6'>
            <Link href="/" className='inline-flex items-center justify-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors'>
                <ArrowRight className='w-4 h-4' />
                العودة للرئيسية
            </Link>
        </div>
      </div>
    </main>
  );
}
