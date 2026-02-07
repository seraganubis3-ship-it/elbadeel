'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import React, { useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  FadeIn,
  SlideUp,
  ScaleIn,
  StaggerContainer,
  staggerItem,
} from '@/components/AnimationWrappers';
import { ServiceCard, Service, Category } from './ServiceCard';
import ContactModal from './ContactModal';



const PARTICLE_SIZES = ['w-3 h-3', 'w-4 h-4', 'w-5 h-5'];

const STAT_STYLES: Record<string, { bg: string; text: string }> = {
  emerald: { bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  teal: { bg: 'bg-teal-500/20', text: 'text-teal-400' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400' },
};

export default function HomeClient({ categories, settings }: { categories: Category[]; settings: any }) {
  const { data: session } = useSession();
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax logic
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroBgY = useTransform(scrollYProgress, [0, 0.2], ['0%', '20%']);
  const particleY = useTransform(scrollYProgress, [0, 0.2], ['0%', '50%']);

  // Flatten services for the marquee and sort globally
  const allServices = categories
    .flatMap(cat => cat.services)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const [showContactModal, setShowContactModal] = React.useState(false);

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
      <div ref={containerRef} className='min-h-screen bg-white overflow-hidden'>
        {/* ================= HERO SECTION ================= */}
        <section className='hero-section relative min-h-screen flex items-center justify-center overflow-hidden'>
          {/* ... (rest of hero section) ... */}
          {/* Background Image Parallax */}
          <motion.div
            style={{ y: heroBgY, scale: 1.1 }}
            className='hero-bg absolute inset-0 bg-cover bg-center bg-no-repeat'
          >
            <div className='absolute inset-0 w-full h-full'>
              <Image
                src='/images/government-services-bg.jpg'
                alt='خدمات حكومية'
                fill
                className='object-cover object-center'
                priority
                sizes="100vw"
              />
            </div>
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
          <div className='relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center pb-32 sm:pb-40'>
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
                className='hero-title text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black mb-8'
              >
                <span className='text-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.6)]'>البديل</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={staggerItem}
                className='hero-subtitle text-lg sm:text-2xl md:text-3xl text-emerald-50 mb-4 font-medium'
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
                className='hero-actions flex flex-col sm:flex-row gap-5 justify-center items-center w-full sm:w-auto'
              >
                <Link
                  href='/services'
                  className='group relative px-8 py-4 sm:px-10 sm:py-5 w-full sm:w-auto text-center bg-emerald-600 hover:bg-emerald-500 text-white text-lg font-black rounded-[2rem] transition-all duration-300 hover:scale-110 border border-emerald-400/50 overflow-hidden animate-glow-pulse'
                >
                  {/* Sheen Effect - Continuous */}
                  <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shimmer' />
                  
                  <span className='flex items-center justify-center gap-3 relative z-10'>
                    <span className='animate-pulse inline-block text-yellow-300'>💡</span>
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
                    className='px-8 py-4 sm:px-10 sm:py-5 w-full sm:w-auto text-center bg-white/10 hover:bg-white/20 text-white text-lg font-bold rounded-[2rem] border border-white/30 hover:border-white/50 transition-all backdrop-blur-md'
                  >
                    إنشاء حساب مجاني
                  </Link>
                )}
              </motion.div>
            </StaggerContainer>

            {/* Stats Cards */}
            <StaggerContainer
              staggerDelay={0.1}
              className='grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-20 max-w-5xl mx-auto'
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
                    className='stat-card group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-6 text-center hover:bg-white/10 transition-all duration-500 cursor-default shadow-lg'
                  >
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 ${style.bg} rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4`}
                    >
                      <svg
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${style.text}`}
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
                    <p className='text-2xl sm:text-4xl font-black text-white mb-1 tracking-tighter'>
                      {stat.val}
                    </p>
                    <p className='text-emerald-100/50 text-[9px] sm:text-[10px] font-black uppercase tracking-widest'>
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </StaggerContainer>
          </div>

          {/* Scroll indicator - Adjusted position */}
          <div className='absolute bottom-24 left-1/2 -translate-x-1/2 hidden sm:block'>
            <div className='w-8 h-12 border-2 border-white/20 rounded-full flex justify-center pt-3 backdrop-blur-md'>
              <div className='w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce'></div>
            </div>
          </div>

          {/* Bottom fade - Reduced height */}
          <div className='absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent z-0'></div>
        </section>

        {/* ================= SERVICES SECTION (MARQUEE) ================= */}
        <section className='services-section pt-10 sm:pt-20 pb-20 sm:pb-32 bg-slate-50 relative z-10 overflow-hidden'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            <FadeIn>
              <div className='text-center mb-10 sm:mb-20 services-header'>
                <h2 className='services-title text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 mb-4 sm:mb-6'>
                  الخدمات <span className='text-emerald-600'>الحكومية</span>
                </h2>
                <div className='w-16 sm:w-24 h-2 bg-emerald-500 mx-auto rounded-full mb-4 sm:mb-8'></div>
                <p className='text-slate-500 text-lg sm:text-xl max-w-2xl mx-auto font-medium'>
                  اسحب الشريط لرؤية المزيد من الخدمات المتاحة
                </p>
              </div>
            </FadeIn>
          </div>

          {/* INFINITE MARQUEE */}
          {/* Using LTR explicitly for the marquee container allows x: -50% logic to work consistently regardless of page direction */}
          <div className='relative w-full overflow-hidden py-5 sm:py-10' dir='ltr'>
            {/* Gradients to mask edges */}
            <div className='absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none'></div>
            <div className='absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none'></div>
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
                <div key={`${service.id}-${i}`} className='flex-shrink-0 w-[280px] sm:w-[350px] pr-4 sm:pr-8'>
                    <ServiceCard 
                        service={service} 
                        animateInView={false} 
                        className="h-[380px] sm:h-[420px]" 
                    />
                </div>
              ))}
            </motion.div>
          </div>

          <FadeIn delay={0.4}>
            <div className='text-center mt-8 sm:mt-12 relative z-10'>
              <Link
                href='/services'
                className='inline-flex items-center gap-4 px-10 sm:px-14 py-4 sm:py-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-[2.5rem] transition-all duration-300 hover:scale-105 shadow-[0_20px_40px_rgba(16,185,129,0.3)]'
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
        <style jsx global>{`
          @keyframes glow-pulse {
            0% {
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
            }
            70% {
              box-shadow: 0 0 0 15px rgba(16, 185, 129, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
            }
          }
          .animate-glow-pulse {
            animation: glow-pulse 2s infinite;
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-150%); }
            50% { transform: translateX(150%); }
            100% { transform: translateX(150%); }
          }
          .animate-shimmer {
            animation: shimmer 3s infinite;
          }
        `}</style>
        
        {/* Floating Contact Button */}
        <motion.button
          onClick={() => setShowContactModal(true)}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-[9000] flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-full shadow-2xl shadow-slate-900/40 border border-slate-700 hover:bg-slate-800 transition-colors group"
        >
          <span className="font-black text-sm hidden sm:inline-block">تواصل معنا</span>
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-slate-900 group-hover:rotate-12 transition-transform">
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
             </svg>
          </div>
        </motion.button>

        <ContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} settings={settings} />
      </div>
  );
}
