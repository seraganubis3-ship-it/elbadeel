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

export const revalidate = 3600; // Revalidate every hour

export default async function ServicesPage() {
  const session = (await getServerSession(authConfig)) as any;

  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      name: true,
      icon: true,
      services: {
        where: { active: true },
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          description: true,
          orderIndex: true,
          variants: {
            where: { active: true },
            orderBy: { priceCents: 'asc' },
            select: {
              id: true,
              name: true,
              priceCents: true,
              etaDays: true,
            },
          },
        },
      },
    },
  });

  return (
    <ServicesLayoutClient>
      {/* Hero Section - Simplified */}
      <div className='relative w-full pt-28 pb-16 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900'>
        {/* Simple gradient overlay - no external patterns */}
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-400/10'></div>

        {/* Content Container */}
        <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 lg:py-12'>
            {/* Text Content */}
            <div className='text-right order-2 lg:order-1'>
              {/* Badge */}
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-6'>
                <span className='relative flex h-2 w-2'>
                  <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75'></span>
                  <span className='relative inline-flex rounded-full h-2 w-2 bg-emerald-400'></span>
                </span>
                <span className='text-emerald-300 text-xs font-black uppercase tracking-widest'>
                  منصة البديل الرقمية
                </span>
              </div>

              <h1 className='text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6 leading-tight'>
                أوراقك الرسمية
                <br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300'>
                  بضغطة واحدة
                </span>
              </h1>

              <p className='text-emerald-100/80 text-lg sm:text-xl max-w-xl leading-relaxed mb-8 font-medium'>
                نحن هنا لنسهل عليك عناء الإجراءات الحكومية. أمان تام، سرعة فائقة، وخدمة متميزة.
              </p>

              {/* Feature Pills */}
              <div className='flex flex-wrap gap-3 mb-8'>
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
            </div>

            {/* Image */}
            <div className='order-1 lg:order-2 flex justify-center'>
              <div className='relative'>
                <div className='relative bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-white/20'>
                  <Image
                    src='/images/service.png'
                    alt='البديل - خدمات حكومية'
                    width={512}
                    height={384}
                    className='w-full max-w-[280px] sm:max-w-md rounded-xl'
                    priority
                  />

                  {/* Floating Badge */}
                  <div className='absolute -bottom-3 -right-3 bg-white px-3 py-2 sm:px-5 sm:py-3 rounded-xl shadow-xl border border-emerald-100'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center'>
                        <svg className='w-4 h-4 sm:w-5 sm:h-5 text-white' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                        </svg>
                      </div>
                      <div className='text-right'>
                        <p className='text-emerald-600 font-black text-xs sm:text-sm'>+100000</p>
                        <p className='text-slate-500 text-[10px] sm:text-xs font-medium'>طلب مكتمل</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className='bg-slate-50 py-16 sm:py-24'>
        {/* Section Header */}
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12'>
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
      <div className='bg-white py-12 sm:py-16 border-y border-slate-100'>
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

      {/* CTA Section - Unified for Mobile & Desktop */}
      {!session?.user && (
        <div className='bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 py-12 sm:py-16'>
          <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
            <div className='flex flex-col sm:flex-row items-center justify-between gap-6'>
              <div className='text-right flex-1'>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-4'>
                  <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
                  <span className='text-emerald-300 text-xs font-bold'>انضم إلينا الآن</span>
                </div>
                <h2 className='text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-2'>أهلاً بك في منصة البديل</h2>
                <p className='text-emerald-100/70 text-base sm:text-lg max-w-md'>
                  سجل حسابك الآن واستمتع بتجربة سلسة في استخراج أوراقك الرسمية
                </p>
              </div>
              <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
                <Link
                  href='/register'
                  className='px-8 py-4 bg-white text-emerald-700 rounded-2xl font-black shadow-xl hover:bg-emerald-50 transition-all text-center'
                >
                  إنشاء حساب مجاني
                </Link>
                <Link
                  href='/login'
                  className='px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-2xl font-bold backdrop-blur-sm transition-all text-center'
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
