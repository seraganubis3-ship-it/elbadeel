import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'من نحن - خبرة 15 عاماً | البديل للخدمات الحكومية',
  description:
    'تعرف على البديل للخدمات الحكومية، المنصة الرائدة في مصر لاستخراج جميع أنواع الأوراق الرسمية بسرعة وأمان. خبرة أكثر من 15 سنة في الخدمات الحكومية.',
  keywords: [
    'البديل للخدمات الحكومية',
    'عن البديل',
    'منصة البديل',
    'خدمات حكومية مصر',
    'استخراج أوراق رسمية',
    'خبرة 15 سنة',
  ],
  alternates: {
    canonical: 'https://albadel.com.eg/about',
  },
  openGraph: {
    title: 'من نحن - خبرة 15 عاماً | البديل للخدمات الحكومية',
    description:
      'تعرف على البديل للخدمات الحكومية، المنصة الرائدة في مصر لاستخراج جميع أنواع الأوراق الرسمية.',
    url: 'https://albadel.com.eg/about',
    siteName: 'البديل للخدمات الحكومية',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default function AboutPage() {
  const stats = [
    { value: '+15', label: 'سنة خبرة', icon: '🏆' },
    { value: '+100K', label: 'عميل سعيد', icon: '😊' },
    { value: '+50', label: 'خدمة متاحة', icon: '📋' },
    { value: '24/7', label: 'دعم متواصل', icon: '💬' },
  ];

  const features = [
    {
      icon: '🚀',
      title: 'سرعة في الإنجاز',
      description: 'نلتزم بالمواعيد المحددة ونسعى دائماً لتقديم خدماتنا في أسرع وقت ممكن',
      color: 'from-blue-500 to-indigo-500',
    },
    {
      icon: '🛡️',
      title: 'أمان وخصوصية',
      description: 'بياناتك ومستنداتك في أمان تام معنا، نستخدم أحدث تقنيات التشفير',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: '💼',
      title: 'خبرة واحترافية',
      description: 'فريق متخصص بخبرة تتجاوز 15 عاماً في مجال الخدمات الحكومية',
      color: 'from-amber-500 to-orange-500',
    },
    {
      icon: '🎧',
      title: 'دعم فني متميز',
      description: 'فريق دعم فني متاح على مدار الساعة للرد على استفساراتك',
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const services = [
    'استخراج شهادات الميلاد والوفاة',
    'استخراج بطاقات الرقم القومي',
    'استخراج جوازات السفر',
    'استخراج رخص القيادة',
    'استخراج الشهادات الدراسية',
    'خدمات التوثيق والتصديق',
    'خدمات الضرائب والتأمينات',
    'خدمات الترجمة المعتمدة',
  ];

  return (
    <div className='min-h-screen bg-[#F8FAFC]' dir='rtl'>
      {/* Hero Section with Image */}
      <div className='relative w-full pt-24 sm:pt-28 pb-32 sm:pb-40 overflow-hidden'>
        {/* Background Gradient */}
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900'></div>

        {/* Decorative Elements */}
        <div className='absolute inset-0 overflow-hidden'>
          <div className='absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/20 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/4'></div>
          <div className='absolute bottom-0 left-0 w-[500px] h-[500px] bg-teal-400/15 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/4'></div>
        </div>

        <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Text Content */}
            <div className='text-right order-2 lg:order-1'>
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl mb-6 shadow-lg'>
                <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
                <span className='text-emerald-300 text-xs font-bold'>منذ عام 2000</span>
              </div>

              <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.1]'>
                من نحن؟
                <br />
                <span className='text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-300'>
                  البديل للخدمات الحكومية
                </span>
              </h1>

              <p className='text-lg sm:text-xl text-emerald-100/80 leading-relaxed mb-8 max-w-lg'>
                المنصة الرائدة في مصر لتقديم خدمات استخراج الأوراق الرسمية والمستندات الحكومية بكل
                سهولة وأمان.
              </p>

              <Link
                href='/services'
                className='inline-flex items-center gap-3 px-8 py-4 bg-white text-emerald-700 rounded-2xl font-black shadow-xl hover:bg-emerald-50 transition-all hover:scale-105'
              >
                استكشف خدماتنا
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
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </Link>
            </div>

            {/* Image */}
            <div className='order-1 lg:order-2 flex justify-center'>
              <div className='relative group'>
                <div className='absolute -inset-4 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all duration-500'></div>
                <div className='relative bg-white/10 backdrop-blur-sm p-3 sm:p-4 rounded-3xl border border-white/20 shadow-2xl overflow-hidden'>
                  <Image
                    src='/images/who.jpeg'
                    alt='البديل للخدمات الحكومية - من نحن'
                    width={600}
                    height={400}
                    className='rounded-2xl shadow-xl w-full max-w-lg'
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Divider */}
      <div className='relative z-10 -mt-1'>
        <svg className='w-full h-16 sm:h-24' viewBox='0 0 1440 100' preserveAspectRatio='none'>
          <path fill='#F8FAFC' d='M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z' />
        </svg>
      </div>

      {/* Stats Section */}
      <div className='relative z-20 -mt-20 sm:-mt-24 pb-16 sm:pb-20'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 sm:p-10'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8'>
              {stats.map((stat, index) => (
                <div key={index} className='text-center group'>
                  <div className='w-14 h-14 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl group-hover:scale-110 transition-transform shadow-sm'>
                    {stat.icon}
                  </div>
                  <div className='text-3xl sm:text-4xl font-black text-emerald-600 mb-1'>
                    {stat.value}
                  </div>
                  <div className='text-slate-500 text-sm font-medium'>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className='py-16 sm:py-24'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Section Header */}
          <div className='text-center mb-12 sm:mb-16'>
            <div className='inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-full mb-6'>
              <span className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></span>
              <span className='text-emerald-700 text-xs font-bold'>لماذا نحن؟</span>
            </div>
            <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4'>
              ما يميزنا عن غيرنا
            </h2>
            <p className='text-slate-500 text-lg max-w-2xl mx-auto'>
              نقدم لك تجربة استثنائية في استخراج أوراقك الرسمية
            </p>
          </div>

          {/* Features Grid */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='group bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:border-emerald-100 transition-all duration-300 text-center'
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl shadow-lg group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3 className='font-black text-slate-900 mb-3 text-xl'>{feature.title}</h3>
                <p className='text-sm text-slate-500 leading-relaxed'>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className='py-16 sm:py-24 bg-gradient-to-br from-slate-50 to-emerald-50/30'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-12 items-center'>
            {/* Text */}
            <div>
              <div className='inline-flex items-center gap-2 px-4 py-2 bg-white border border-emerald-100 rounded-full mb-6 shadow-sm'>
                <span className='text-emerald-600'>📋</span>
                <span className='text-emerald-700 text-xs font-bold'>خدماتنا</span>
              </div>
              <h2 className='text-3xl sm:text-4xl font-black text-slate-900 mb-6'>
                مجموعة شاملة من الخدمات الحكومية
              </h2>
              <p className='text-slate-500 text-lg leading-relaxed mb-8'>
                يقدم البديل للخدمات الحكومية مجموعة متكاملة من الخدمات التي تغطي جميع احتياجاتك من
                الأوراق الرسمية والمستندات الحكومية.
              </p>

              <Link
                href='/services'
                className='inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all'
              >
                عرض جميع الخدمات
                <svg
                  className='w-4 h-4 rtl:rotate-180'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </Link>
            </div>

            {/* Services List */}
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {services.map((service, index) => (
                <div
                  key={index}
                  className='flex items-center gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all'
                >
                  <span className='w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm font-bold'>
                    {index + 1}
                  </span>
                  <span className='font-medium text-slate-700 text-sm'>{service}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className='py-16 sm:py-24'>
        <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            {/* Vision */}
            <div className='bg-gradient-to-br from-emerald-600 to-teal-600 p-8 sm:p-10 rounded-3xl text-white relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl'></div>
              <div className='relative z-10'>
                <div className='w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 text-2xl'>
                  👁️
                </div>
                <h3 className='text-2xl font-black mb-4'>رؤيتنا</h3>
                <p className='text-emerald-100 leading-relaxed'>
                  نسعى لأن نكون الخيار الأول والأمثل لجميع المواطنين المصريين في الحصول على خدماتهم
                  الحكومية بسهولة ويسر، مع الحفاظ على أعلى معايير الجودة والأمان.
                </p>
              </div>
            </div>

            {/* Mission */}
            <div className='bg-gradient-to-br from-slate-800 to-slate-900 p-8 sm:p-10 rounded-3xl text-white relative overflow-hidden'>
              <div className='absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl'></div>
              <div className='relative z-10'>
                <div className='w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 text-2xl'>
                  🎯
                </div>
                <h3 className='text-2xl font-black mb-4'>التزامنا</h3>
                <p className='text-slate-300 leading-relaxed'>
                  نلتزم بتقديم خدمة عملاء متميزة، والحفاظ على سرية المعلومات، وضمان إنجاز المعاملات
                  في الوقت المحدد بأعلى مستوى من الدقة والاحترافية.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className='py-16 sm:py-20 relative overflow-hidden'>
        <div className='absolute inset-0 bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900'></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
        <div className='absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[150px]'></div>

        <div className='relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-6'>
            <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
            <span className='text-emerald-300 text-xs font-bold'>ابدأ الآن</span>
          </div>

          <h2 className='text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-6'>
            جاهز تبدأ معانا؟
          </h2>
          <p className='text-emerald-100/70 text-lg max-w-2xl mx-auto mb-10'>
            انضم لآلاف العملاء السعداء واستمتع بتجربة استخراج أوراقك الرسمية بكل سهولة
          </p>

          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link
              href='/services'
              className='px-10 py-5 bg-white text-emerald-700 rounded-2xl font-black shadow-2xl hover:bg-emerald-50 transition-all hover:scale-105'
            >
              تصفح الخدمات
            </Link>
            <Link
              href='/register'
              className='px-10 py-5 bg-white/10 text-white border border-white/30 rounded-2xl font-bold backdrop-blur-sm hover:bg-white/20 transition-all'
            >
              إنشاء حساب
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
