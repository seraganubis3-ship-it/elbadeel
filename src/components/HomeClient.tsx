'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SmoothScroll from '@/components/SmoothScroll';
import {
  FadeIn,
  SlideUp,
  ScaleIn,
  StaggerContainer,
  staggerItem,
} from '@/components/AnimationWrappers';

// Types matching the Prisma structure
interface ServiceVariant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
}

interface Service {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  variants: ServiceVariant[];
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
  services: Service[];
}

const PARTICLE_SIZES = ['w-3 h-3', 'w-4 h-4', 'w-5 h-5'];

const STAT_STYLES: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
};

export default function HomeClient({ categories }: { categories: Category[] }) {
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroBgY = useTransform(scrollYProgress, [0, 0.2], ['0%', '20%']);
  const particleY = useTransform(scrollYProgress, [0, 0.2], ['0%', '50%']);

  // Flatten services for the marquee
  const allServices = categories.flatMap(cat => cat.services);

  // 1. Ensure content covers screen multiple times (min 15 items to be safe)
  let marqueeServices = [...allServices];
  // Safety check to prevent hanging if no services exist
  if (marqueeServices.length > 0) {
    // Cap duplication to avoid massive DOM
    let safetyCounter = 0;
    while (marqueeServices.length < 15 && safetyCounter < 10) {
      marqueeServices = [...marqueeServices, ...allServices];
      safetyCounter++;
    }
  }

  // We ensure sufficient items for the slider

  return (
    <SmoothScroll>
      <div ref={containerRef} className='min-h-screen bg-white overflow-hidden'>
        {/* ================= HERO SECTION ================= */}
        <section className='hero-section relative min-h-screen flex items-center justify-center overflow-hidden'>
          {/* ... (rest of hero section) ... */}
          {/* Background Image Parallax */}
          <motion.div
            style={{ y: heroBgY, scale: 1.1 }}
            className='hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat'
          >
            <div
              className='absolute inset-0 w-full h-full bg-cover bg-center'
              style={{ backgroundImage: "url('/images/government-services-bg.jpg')" }}
            />
            <div className='absolute inset-0 bg-gradient-to-br from-emerald-950/80 via-teal-900/70 to-emerald-950/80'></div>
          </motion.div>

          {/* ... (rest of hero content) ... */}

          {/* Floating particles */}
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                style={{ y: particleY }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={`particle absolute ${PARTICLE_SIZES[i % 3]} bg-emerald-400/30 rounded-full blur-sm`}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: `${10 + i * 15}%`,
                    left: `${5 + (i % 3) * 35}%`,
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'currentColor',
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <div className='relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
            <StaggerContainer className='flex flex-col items-center'>
              {/* Badge */}
              <motion.div
                variants={staggerItem}
                className='hero-badge inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full mb-8 backdrop-blur-md'
              >
                <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
                <span className='text-white text-xs font-black uppercase tracking-widest'>
                  منصة موثوقة وآمنة
                </span>
              </motion.div>

              {/* Main Title */}
              <motion.h1
                variants={staggerItem}
                className='hero-title text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-8'
              >
                <span className='text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]'>البديل</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={staggerItem}
                className='hero-subtitle text-xl sm:text-2xl md:text-3xl text-emerald-50 mb-4 font-medium'
              >
                شباك واحد لجميع
              </motion.p>
              <motion.p
                variants={staggerItem}
                className='hero-subtitle text-3xl sm:text-4xl md:text-5xl font-black mb-12'
              >
                <span className='bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-300 bg-clip-text text-transparent'>
                  الخدمات الحكومية
                </span>
              </motion.p>

              {/* CTA Buttons */}
              <motion.div
                variants={staggerItem}
                className='hero-actions flex flex-col sm:flex-row gap-5 justify-center items-center'
              >
                <Link
                  href='/services'
                  className='group px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-black rounded-[2rem] transition-all duration-300 hover:scale-105 shadow-2xl shadow-emerald-900/50 border border-emerald-400/30'
                >
                  <span className='flex items-center gap-3'>
                    استعرض الخدمات
                    <svg
                      className='w-5 h-5 group-hover:-translate-x-1 transition-transform'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={3}
                        d='M15 19l-7-7 7-7'
                      />
                    </svg>
                  </span>
                </Link>

                {!session?.user && (
                  <Link
                    href='/register'
                    className='px-10 py-5 bg-white/10 hover:bg-white/20 text-white text-lg font-bold rounded-[2rem] border border-white/30 hover:border-white/50 transition-all backdrop-blur-md'
                  >
                    إنشاء حساب مجاني
                  </Link>
                )}
              </motion.div>
            </StaggerContainer>

            {/* Stats Cards */}
            <StaggerContainer
              staggerDelay={0.1}
              className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-20 max-w-5xl mx-auto'
            >
              {[
                {
                  val: '+100K',
                  label: 'عميل سعيد',
                  color: 'emerald' as const,
                  icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
                },
                {
                  val: '+25',
                  label: 'سنة خبرة',
                  color: 'teal' as const,
                  icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z',
                },
                {
                  val: '+50',
                  label: 'خدمة متاحة',
                  color: 'blue' as const,
                  icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
                },
                {
                  val: '24/7',
                  label: 'دعم فني',
                  color: 'purple' as const,
                  icon: 'M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                },
              ].map((stat, i) => {
                const style = STAT_STYLES[stat.color]!;
                return (
                  <motion.div
                    variants={staggerItem}
                    key={i}
                    className='stat-card group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 text-center hover:bg-white/10 transition-all duration-500 cursor-default shadow-lg'
                  >
                    <div
                      className={`w-12 h-12 ${style.bg} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    >
                      <svg
                        className={`w-6 h-6 ${style.text}`}
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d={stat.icon}
                        />
                      </svg>
                    </div>
                    <p className='text-3xl sm:text-4xl font-black text-white mb-1 tracking-tighter'>
                      {stat.val}
                    </p>
                    <p className='text-emerald-100/50 text-[10px] font-black uppercase tracking-widest'>
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </StaggerContainer>
          </div>

          {/* Scroll indicator */}
          <div className='absolute bottom-10 left-1/2 -translate-x-1/2'>
            <div className='w-8 h-12 border-2 border-white/20 rounded-full flex justify-center pt-3 backdrop-blur-md'>
              <div className='w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce'></div>
            </div>
          </div>

          {/* Bottom fade */}
          <div className='absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent'></div>
        </section>

        {/* ================= SERVICES SECTION (MARQUEE) ================= */}
        <section className='services-section py-32 bg-slate-50 relative z-10 overflow-hidden'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <FadeIn>
              <div className='text-center mb-20 services-header'>
                <h2 className='services-title text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-6'>
                  الخدمات <span className='text-emerald-600'>الحكومية</span>
                </h2>
                <div className='w-24 h-2 bg-emerald-500 mx-auto rounded-full mb-8'></div>
                <p className='text-slate-500 text-xl max-w-2xl mx-auto font-medium'>
                  اسحب الشريط لرؤية المزيد من الخدمات المتاحة
                </p>
              </div>
            </FadeIn>
          </div>

          {/* INFINITE MARQUEE */}
          {/* Using LTR explicitly for the marquee container allows x: -50% logic to work consistently regardless of page direction */}
          <div className='relative w-full overflow-hidden py-10' dir='ltr'>
            {/* Gradients to mask edges */}
            <div className='absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none'></div>
            <div className='absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none'></div>
            {/* 
                SEAMLESS MARQUEE FIX:
                To avoid the "half-gap glitch" where x: -50% doesn't align perfectly with flex gaps,
                we remove the parent `gap-8` and instead apply `pr-8` (padding) to each child.
            */}
            {/* 
                PARALLAX SLIDER (Drag & Snap)
                A horizontal scroll container that allows dragging.
                Items snap to center or strict positioning.
            */}
            {/* 
                SEAMLESS INFINITE SLIDER
                To ensure a perfect loop without gaps:
                1. We use a container wide enough to hold two full sets of items (w-max).
                2. We duplicate the list (A + A).
                3. We animate from x: 0% to x: -50%.
                4. Since A is identical to A, when the first A finishes (-50%), we instantly reset to 0%, creating an illusion of infinite flow.
                5. We avoid 'gap' on the flex container and instead use 'padding-right' on items to handle spacing reliably.
            */}
            <motion.div
              className='flex w-max'
              initial={{ x: '0%' }}
              animate={{ x: '-50%' }}
              transition={{
                repeat: Infinity,
                ease: 'linear',
                duration: 60, // Slower, smoother
                repeatType: 'loop',
              }}
              style={{ willChange: 'transform' }}
              whileHover={{ animationPlayState: 'paused' }}
            >
              {/* 
                 Safety: Double repetition is standard. 
                 Using padding-right (pr-8) prevents flex-gap sub-pixel issues.
               */}
              {[...marqueeServices, ...marqueeServices].map((service, i) => (
                <div key={`${service.id}-${i}`} className='flex-shrink-0 w-[350px] pr-8'>
                  <Link
                    href={`/service/${service.slug}`}
                    className='service-card group relative h-[420px] rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 block bg-white border border-slate-100 hover:border-emerald-200'
                  >
                    {service.icon &&
                    (service.icon.startsWith('/') || service.icon.startsWith('http')) ? (
                      <Image
                        src={service.icon}
                        alt={service.name}
                        fill
                        className='object-cover group-hover:scale-110 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100'
                      />
                    ) : (
                      <div className='absolute inset-0 bg-gradient-to-br from-emerald-50 to-white flex items-center justify-center'>
                        {service.icon ? (
                          <span className='text-8xl select-none filter grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500 scale-150 group-hover:scale-[2]'>
                            {service.icon}
                          </span>
                        ) : null}
                      </div>
                    )}

                    <div className='absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent'></div>

                    <div className='absolute bottom-0 left-0 right-0 p-8 text-white z-10 text-right'>
                      <h3 className='text-2xl font-black mb-2'>{service.name}</h3>
                      {service.description && (
                        <p className='text-slate-200 text-sm mb-6 line-clamp-2 opacity-90'>
                          {service.description}
                        </p>
                      )}

                      <div className='flex items-center justify-end gap-2 text-xs font-bold uppercase tracking-widest text-emerald-300 group-hover:text-emerald-200 transition-colors'>
                        طلب الخدمة
                        <svg
                          className='w-4 h-4 group-hover:translate-x-[-4px] transition-transform rtl:rotate-180'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={3}
                            d='M17 8l4 4m0 0l-4 4m4-4H3'
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </motion.div>
          </div>

          <FadeIn delay={0.4}>
            <div className='text-center mt-12 relative z-10'>
              <Link
                href='/services'
                className='inline-flex items-center gap-4 px-14 py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[2.5rem] transition-all duration-300 hover:scale-105 shadow-[0_20px_40px_rgba(16,185,129,0.3)]'
              >
                عرض جميع الخدمات وتفاصيلها
                <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={3}
                    d='M17 8l4 4m0 0l-4 4m4-4H3'
                  />
                </svg>
              </Link>
            </div>
          </FadeIn>
        </section>

        {/* ================= FEATURES SECTION ================= */}
        <section className='features-section py-40 bg-slate-50 relative overflow-hidden'>
          {/* Decorative background circle */}
          <div className='absolute -top-40 -right-40 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[120px]'></div>

          <div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
            <FadeIn>
              <div className='text-center mb-32 features-header'>
                <h2 className='text-5xl sm:text-6xl md:text-7xl font-black text-slate-900 mb-8'>
                  لماذا <span className='text-emerald-600'>البديل</span>؟
                </h2>
                <p className='text-slate-500 text-2xl font-medium max-w-3xl mx-auto leading-relaxed'>
                  نوفر لك تجربة سلسة وآمنة لإنجاز معاملاتك الحكومية بكل احترافية وجودة تفوق التوقعات
                </p>
              </div>
            </FadeIn>

            <StaggerContainer className='grid grid-cols-1 md:grid-cols-3 gap-12'>
              {[
                {
                  title: 'أسعار تنافسية',
                  desc: 'نوفر لك أفضل الأسعار في السوق مع ضمان جودة الخدمة وأمان البيانات',
                  icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                  color: 'emerald',
                },
                {
                  title: 'سرعة في التنفيذ',
                  desc: 'ننجز معاملاتك في أسرع وقت ممكن مع فريق متخصص وشبكة علاقات واسعة جداً',
                  icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
                  color: 'emerald',
                },
                {
                  title: 'أمان وسرية',
                  desc: 'بياناتك ومستنداتك في أمان تام مع أعلى معايير التشفير والخصوصية العالمية',
                  icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
                  color: 'emerald',
                },
              ].map((feat, i) => (
                <motion.div
                  variants={staggerItem}
                  key={i}
                  className='feature-card group text-center p-14 bg-white rounded-[4rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_-20px_rgba(16,185,129,0.15)] transition-all duration-700 hover:-translate-y-5 border border-slate-100'
                >
                  <div className='w-24 h-24 bg-emerald-50 group-hover:bg-emerald-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 transition-all duration-500 shadow-sm group-hover:shadow-emerald-200 group-hover:rotate-6'>
                    <svg
                      className='w-12 h-12 text-emerald-600 group-hover:text-white transition-colors duration-500'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d={feat.icon}
                      />
                    </svg>
                  </div>
                  <h3 className='text-3xl font-black text-slate-800 mb-6'>{feat.title}</h3>
                  <p className='text-slate-500 leading-loose text-lg font-medium'>{feat.desc}</p>
                </motion.div>
              ))}
            </StaggerContainer>
          </div>
        </section>
      </div>
    </SmoothScroll>
  );
}
