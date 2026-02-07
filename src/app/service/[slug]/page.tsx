import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import OrderForm from './OrderForm';
import { getSession } from '@/lib/auth';
import Image from 'next/image';
import type { Metadata, ResolvingMetadata } from 'next';

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const service = await prisma.service.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!service) {
    return {
      title: 'الخدمة غير موجودة | البديل',
      description: 'عذراً، هذه الخدمة غير متوفرة حالياً.',
    };
  }

  const title = `${service.name} | البديل للخدمات الحكومية`;
  const description = service.description || `استخراج ${service.name} بسرعة وسهولة من منصة البديل.`;

  return {
    title,
    description,
    keywords: [
      service.name,
      `سعر ${service.name}`,
      `تكلفة ${service.name}`,
      `اجراءات ${service.name}`,
      `استخراج ${service.name}`,
      `اوراق ${service.name}`,
      'خدمات حكومية',
      'البديل',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      siteName: 'البديل للخدمات الحكومية',
    },
    alternates: {
      canonical: `/service/${service.slug}`,
    },
  };
}

export default async function ServiceDetail({ params }: { params: Promise<{ slug: string }> }) {
  // Check if user is authenticated
  const session = await getSession();
  if (!session?.user) {
    redirect('/register');
  }

  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  // Fetch service with variants and documents
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      variants: { orderBy: { priceCents: 'asc' } },
      category: true,
      documents: {
        where: { active: true },
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  if (!service) return notFound();

  // Fetch system settings for delivery fee
  const settings = await prisma.systemSettings.findFirst();
  const defaultDeliveryFee = settings?.defaultDeliveryFee || 5000; // Default to 50 EGP if not set

  // Fetch dynamic fields separately
  const fields = await prisma.serviceField.findMany({
    where: {
      serviceId: service.id,
      active: true,
    },
    orderBy: { orderIndex: 'asc' },
    include: {
      options: {
        orderBy: { orderIndex: 'asc' },
      },
    },
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    provider: {
      '@type': 'Organization',
      name: 'البديل للخدمات الحكومية',
      url: 'https://albadel.com.eg',
    },
    description: service.description || `خدمة ${service.name} من مكتب البديل`,
    areaServed: {
      '@type': 'Country',
      name: 'Egypt',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'باقات الخدمة',
      itemListElement: service.variants.map((variant) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: variant.name,
        },
        price: (variant.priceCents / 100).toString(),
        priceCurrency: 'EGP',
      })),
    },
  };

  return (
    <div
      className='min-h-screen w-full bg-[#F8FAFC] text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900'
      dir='rtl'
    >
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Hero Section - Matching Services Page Style */}
      <div className='relative w-full pt-24 sm:pt-28 pb-32 sm:pb-40 overflow-hidden'>
        {/* Background Gradient */}
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900'></div>

        {/* Decorative Elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4'></div>
          <div className='absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-400/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4'></div>
          <div className="absolute inset-0 opacity-[0.08]">
             <Image 
                src="/images/government-services-bg.jpg" 
                alt="خلفية الخدمات الحكومية" 
                fill 
                className="object-cover object-center"
                priority
             />
          </div>
        </div>

        <div className='relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center'>
          {/* Breadcrumb / Category Badge */}
          <div className='inline-flex items-center gap-3 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-8 shadow-lg'>
            <Link
              href='/services'
              className='text-emerald-300/80 text-sm font-medium hover:text-white transition-colors flex items-center gap-2'
            >
              <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                />
              </svg>
              الخدمات
            </Link>
            <span className='text-white/30'>/</span>
            <span className='text-emerald-300 text-sm font-bold flex items-center gap-2'>
              <span className='w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse'></span>
              {(service as any).category?.name || 'خدمة مميزة'}
            </span>
          </div>

          <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.15] tracking-tight'>
            {service.name}
          </h1>

          <p className='text-lg sm:text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed font-medium'>
            {service.description ||
              'استمتع بتجربة استخراج أوراق واستفسارات حكومية بأعلى معايير الجودة والسهولة.'}
          </p>

          {/* Quick Info Pills */}
          <div className='flex flex-wrap justify-center gap-3 mt-8'>
            <div className='flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10'>
              <span className='text-emerald-400'>⚡</span>
              <span className='text-white/90 text-sm font-bold'>سريع وموثوق</span>
            </div>
            <div className='flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10'>
              <span className='text-emerald-400'>🔒</span>
              <span className='text-white/90 text-sm font-bold'>آمن 100%</span>
            </div>
            <div className='flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/10'>
              <span className='text-emerald-400'>💳</span>
              <span className='text-white/90 text-sm font-bold'>دفع سهل</span>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Divider */}
      <div className='relative z-10 -mt-1'>
        <svg className='w-full h-12 sm:h-20' viewBox='0 0 1440 80' preserveAspectRatio='none'>
          <path fill='#F8FAFC' d='M0,0 C480,80 960,80 1440,0 L1440,80 L0,80 Z' />
        </svg>
      </div>

      {/* Main Content */}
      <div className='relative z-20 max-w-4xl mx-auto px-4 sm:px-6 -mt-24 sm:-mt-32 pb-24'>
        {/* Order Form Container */}
        <div className='relative'>
          {/* Glow Effect */}
          <div className='absolute -inset-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-[3rem] blur-2xl'></div>

          {/* Form Card */}
          <div className='relative bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl shadow-slate-200/60 border border-slate-100 overflow-hidden'>
            <OrderForm
              serviceId={service.id}
              serviceSlug={service.slug}
              serviceName={service.name}
              variants={(service as any).variants}
              user={session.user}
              requiredDocuments={(service as any).documents || []}
              dynamicFields={(fields as any) || []}
              defaultDeliveryFee={defaultDeliveryFee}
            />
          </div>
        </div>

        {/* Info Sections */}
        <div className='mt-16 sm:mt-20 space-y-12'>
          {/* Features Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6'>
            <div className='group bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 text-center'>
              <div className='w-14 h-14 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl group-hover:scale-110 transition-transform'>
                🚀
              </div>
              <h3 className='font-black text-slate-900 mb-2 text-lg'>سرعة في الإنجاز</h3>
              <p className='text-sm text-slate-500 leading-relaxed'>
                نلتزم بالمواعيد المحددة لضمان راحتك
              </p>
            </div>
            <div className='group bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 text-center'>
              <div className='w-14 h-14 bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl group-hover:scale-110 transition-transform'>
                🛡️
              </div>
              <h3 className='font-black text-slate-900 mb-2 text-lg'>ضمان وأمان</h3>
              <p className='text-sm text-slate-500 leading-relaxed'>
                بياناتك ومستنداتك في أمان تام معنا
              </p>
            </div>
            <div className='group bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300 text-center'>
              <div className='w-14 h-14 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5 text-2xl group-hover:scale-110 transition-transform'>
                💬
              </div>
              <h3 className='font-black text-slate-900 mb-2 text-lg'>دعم متواصل</h3>
              <p className='text-sm text-slate-500 leading-relaxed'>
                فريق دعم فني جاهز للرد على استفساراتك
              </p>
            </div>
          </div>
          {/* Documents List */}
          {(service as any).documents && (service as any).documents.length > 0 && (
            <div className='bg-gradient-to-br from-slate-50 to-emerald-50/30 rounded-3xl p-6 sm:p-10 border border-slate-200/60'>
              <div className='text-center mb-8'>
                <div className='inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-100 rounded-full mb-4 shadow-sm'>
                  <span className='text-emerald-600'>📋</span>
                  <span className='text-emerald-700 text-xs font-bold'>قائمة التجهيزات</span>
                </div>
                <h2 className='text-xl sm:text-2xl font-black text-slate-800 mb-2'>
                  المستندات المطلوبة
                </h2>
                <p className='text-slate-500 text-sm'>
                  يرجى تجهيز هذه المستندات قبل البدء في الطلب
                </p>
              </div>

              <div className='flex flex-wrap justify-center gap-3'>
                {(service as any).documents.map((doc: any, index: number) => (
                  <div
                    key={doc.id}
                    className='flex items-center gap-3 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all'
                  >
                    <span className='w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold'>
                      {index + 1}
                    </span>
                    <span className='font-semibold text-slate-700 text-sm'>{doc.title}</span>
                    {!doc.required && (
                      <span className='text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full'>
                        اختياري
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Back Link */}
          <div className='text-center pt-4'>
            <Link
              href='/services'
              className='inline-flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all font-medium'
            >
              <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              العودة لصفحة الخدمات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
