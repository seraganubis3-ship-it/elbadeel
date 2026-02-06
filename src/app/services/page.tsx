import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import ServicesGrid from '@/components/ServicesGrid';
import ServicesLayoutClient from '@/components/ServicesLayoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الخدمات - البديل للخدمات الحكومية',
  description: 'تصفح جميع الخدمات الحكومية المتاحة - استخراج شهادات، رخص، أوراق رسمية وأكثر. خدمات سريعة وموثوقة بأفضل الأسعار.',
  keywords: [
    'خدمات حكومية',
    'استخراج شهادات',
    'استخراج رخص',
    'أوراق رسمية',
    'خدمات البديل',
    'خدمات مصر',
    'مستندات حكومية'
  ],
  alternates: {
    canonical: 'https://albadel.com.eg/services',
  },
  openGraph: {
    title: 'الخدمات - البديل للخدمات الحكومية',
    description: 'تصفح جميع الخدمات الحكومية المتاحة - استخراج شهادات، رخص، أوراق رسمية وأكثر.',
    url: 'https://albadel.com.eg/services',
    siteName: 'البديل للخدمات الحكومية',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default async function ServicesPage() {
  const session = (await getServerSession(authConfig)) as any;

  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      services: {
        where: { active: true },
        orderBy: { orderIndex: 'asc' },
        include: {
          variants: {
            where: { active: true },
            orderBy: { priceCents: 'asc' },
          },
        },
      },
    },
  });

  return (
    <ServicesLayoutClient>
      {/* Hero Section - Split Layout Design */}
      <div className='relative z-10 w-full pt-28 pb-16 overflow-hidden'>
        {/* Background Gradient */}
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900'></div>

        {/* Decorative Elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4'></div>
          <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4'></div>
          {/* Pattern overlay */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        </div>

        {/* Content Container */}
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 lg:py-0 lg:min-h-[70vh]'>
            {/* Right Side - Text Content */}
            <div className='text-right order-2 lg:order-1'>
              {/* Badge */}
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-8 shadow-lg animate-fade-in-down'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-400'></span>
                </span>
                <span className='text-emerald-300 text-xs font-black uppercase tracking-widest'>
                  منصة البديل الرقمية
                </span>
              </div>

              <div className='animate-fade-in-up'>
                <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 tracking-tight leading-[1.1]'>
                  أوراقك الرسمية
                  <br />
                  <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300'>
                    بضغطة واحدة
                  </span>
                </h1>

                <p className='text-emerald-100/80 text-lg sm:text-xl max-w-xl leading-relaxed mb-10 font-medium'>
                  نحن هنا لنسهل عليك عناء الإجراءات الحكومية. أمان تام، سرعة فائقة، وخدمة متميزة
                  تليق بك.
                </p>

                {/* Feature Pills */}
                <div className='flex flex-wrap gap-3 mb-10'>
                  <div className='flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10'>
                    <span className='text-emerald-400'>🔒</span>
                    <span className='text-white/90 text-sm font-bold'>أمان تام</span>
                  </div>
                  <div className='flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10'>
                    <span className='text-emerald-400'>⚡</span>
                    <span className='text-white/90 text-sm font-bold'>سرعة فائقة</span>
                  </div>
                  <div className='flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10'>
                    <span className='text-emerald-400'>✨</span>
                    <span className='text-white/90 text-sm font-bold'>خدمة متميزة</span>
                  </div>
                </div>

                {/* Scroll Indicator */}
                <div className='hidden lg:flex items-center gap-3 text-emerald-300/60'>
                  <svg
                    className='w-5 h-5 animate-bounce'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 14l-7 7m0 0l-7-7m7 7V3'
                    />
                  </svg>
                  <span className='text-sm font-medium'>اكتشف خدماتنا بالأسفل</span>
                </div>
              </div>
            </div>

            {/* Left Side - Image */}
            <div className='order-1 lg:order-2 flex justify-center animate-fade-in-up'>
              <div className='relative group'>
                {/* Glow Effect Behind Image */}
                <div className='absolute inset-0 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-3xl blur-2xl scale-95 group-hover:scale-100 transition-transform duration-700'></div>

                {/* Main Image Container */}
                <div className='relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-3 sm:p-4 rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl'>
                  <Image
                    src='/images/service.png'
                    alt='البديل - خدمات حكومية'
                    width={512}
                    height={384}
                    className='w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg rounded-xl sm:rounded-2xl shadow-xl transform group-hover:scale-[1.02] transition-all duration-500'
                  />

                  {/* Floating Badge */}
                  <div className='absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-white px-3 py-2 sm:px-5 sm:py-3 rounded-xl sm:rounded-2xl shadow-xl border border-emerald-100'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg sm:rounded-xl flex items-center justify-center'>
                        <svg
                          className='w-4 h-4 sm:w-5 sm:h-5 text-white'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M5 13l4 4L19 7'
                          />
                        </svg>
                      </div>
                      <div className='text-right'>
                        <p className='text-emerald-600 font-black text-xs sm:text-sm'>+100000</p>
                        <p className='text-slate-500 text-[10px] sm:text-xs font-medium'>
                          طلب مكتمل
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Divider - Curved transition */}
      <div className='relative z-10 -mt-1'>
        <svg className='w-full h-16 sm:h-24' viewBox='0 0 1440 100' preserveAspectRatio='none'>
          <path fill='#F8FAFC' d='M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z' />
        </svg>
      </div>

      {/* Services Section */}
      <div className='relative z-10 bg-[#F8FAFC] pb-24 sm:pb-32'>
        {/* Section Header */}
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 sm:mb-16'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full mb-6'>
            <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></span>
            <span className='text-emerald-700 text-xs font-bold'>خدماتنا المتاحة</span>
          </div>
          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4'>
            اختر الخدمة التي تناسبك
          </h2>
          <p className='text-slate-500 text-lg max-w-2xl mx-auto'>
            نقدم لك مجموعة متكاملة من الخدمات الحكومية بأسرع وقت وأفضل جودة
          </p>
        </div>

        {/* Services Grid */}
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <ServicesGrid categories={categories} />
        </div>
      </div>

      {/* Stats Section */}
      <div className='relative z-10 bg-slate-50 py-16 sm:py-20 border-y border-slate-100'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-8'>
            <div className='text-center'>
              <div className='text-3xl sm:text-4xl font-black text-emerald-600 mb-2'>+100000</div>
              <div className='text-slate-500 text-sm font-medium'>طلب مكتمل</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl sm:text-4xl font-black text-emerald-600 mb-2'>24/7</div>
              <div className='text-slate-500 text-sm font-medium'>دعم متواصل</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl sm:text-4xl font-black text-emerald-600 mb-2'>100%</div>
              <div className='text-slate-500 text-sm font-medium'>رضا العملاء</div>
            </div>
            <div className='text-center'>
              <div className='text-3xl sm:text-4xl font-black text-emerald-600 mb-2'>24h</div>
              <div className='text-slate-500 text-sm font-medium'>أسرع تسليم</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile CTA */}
      {!session?.user && (
        <div className='fixed bottom-0 inset-x-0 z-40 p-3 sm:p-4 lg:hidden animate-fade-in-up safe-area-bottom'>
          <div className='bg-gradient-to-r from-emerald-900 to-teal-900 backdrop-blur-xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-5 shadow-2xl border border-white/10'>
            <div className='flex items-center justify-between gap-3'>
              <div className='text-right flex-1'>
                <p className='text-white font-black text-base sm:text-lg'>ابدأ الآن</p>
                <p className='text-emerald-300/70 text-[10px] sm:text-xs font-medium'>
                  سجل حسابك في ثوانٍ معدودة
                </p>
              </div>
              <Link
                href='/register'
                className='px-5 sm:px-8 py-3 sm:py-3.5 bg-white text-emerald-700 rounded-xl sm:rounded-2xl font-black shadow-xl hover:bg-emerald-50 transition-colors text-sm sm:text-base whitespace-nowrap'
              >
                تسجيل جديد
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Desktop CTA */}
      {!session?.user && (
        <div className='hidden lg:block relative overflow-hidden'>
          {/* Background with pattern */}
          <div className='absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900'></div>
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
          <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px]'></div>
          <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/20 rounded-full blur-[120px]'></div>

          <div className='relative max-w-6xl mx-auto px-8 py-20'>
            <div className='flex items-center justify-between gap-12'>
              <div className='text-right flex-1'>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-6'>
                  <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
                  <span className='text-emerald-300 text-xs font-bold'>انضم إلينا الآن</span>
                </div>
                <h2 className='text-4xl font-black text-white mb-4'>أهلاً بك في منصة البديل</h2>
                <p className='text-emerald-100/70 text-lg max-w-md'>
                  سجل حسابك الآن واستمتع بتجربة سلسة في استخراج أوراقك الرسمية
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-4'>
                <Link
                  href='/register'
                  className='group px-10 py-5 bg-white text-emerald-700 rounded-2xl font-black shadow-2xl hover:bg-emerald-50 transition-all hover:scale-105 flex items-center gap-3'
                >
                  إنشاء حساب مجاني
                  <svg
                    className='w-5 h-5 group-hover:translate-x-1 transition-transform rtl:rotate-180'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17 8l4 4m0 0l-4 4m4-4H3'
                    />
                  </svg>
                </Link>
                <Link
                  href='/login'
                  className='px-10 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-2xl font-bold backdrop-blur-sm transition-all hover:scale-105'
                >
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </ServicesLayoutClient>
  );
}
