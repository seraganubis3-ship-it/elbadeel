'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export interface ServiceVariant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
}

export interface Service {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  variants?: ServiceVariant[]; // Made optional for homepage
  orderIndex?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  services: Service[];
}

// Scroll Animation Hook
function useScrollAnimation() {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return { ref, isVisible };
}

interface ServiceCardProps {
  service: Service;
  index?: number;
  animateInView?: boolean;
  className?: string;
}

export function ServiceCard({ service, index = 0, animateInView = true, className = '' }: ServiceCardProps) {
  const { ref, isVisible } = useScrollAnimation();

  const minPrice =
    service.variants && service.variants.length > 0 ? Math.min(...service.variants.map(v => v.priceCents)) / 100 : null;
  const minDays =
    service.variants && service.variants.length > 0 ? Math.min(...service.variants.map(v => v.etaDays)) : null;

  const isValidImage = (src?: string | null) => {
    if (!src) return false;
    return src.startsWith('/') || src.startsWith('http');
  };

  const animationStyle = animateInView ? {
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
    transitionDelay: `${(index % 3) * 100}ms`,
  } : {};

  return (
    <div
      ref={animateInView ? ref : null}
      className={`transition-all duration-700 h-full ${className}`}
      style={animationStyle}
    >
      <Link
        href={`/service/${service.slug}`}
        className='group relative block rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full min-h-[340px] border border-gray-100/50 bg-white'
      >
        {/* Background Image Logic */}
        {isValidImage(service.icon) ? (
          <>
            <Image
              src={service.icon!}
              alt={service.name}
              fill
              className='object-cover group-hover:scale-110 transition-transform duration-1000 ease-out'
            />
            {/* Stronger overlay to ensure text visibility */}
            <div className='absolute inset-0 bg-gradient-to-t from-white/95 via-white/70 to-transparent'></div>
          </>
        ) : (
          <div className='absolute inset-0 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 group-hover:from-amber-100 transition-colors duration-500 flex items-center justify-center'>
            {service.icon ? (
              <span className='text-9xl select-none filter grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500 scale-150 group-hover:scale-[1.8] text-amber-900'>
                {service.icon}
              </span>
            ) : null}
          </div>
        )}

        {/* Glossy Reflection Card effect on hover */}
        <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>

        {/* Content Overlay */}
        <div className='relative h-full p-8 flex flex-col justify-end z-10'>
          {/* Title & Info */}
          <div className='mb-6'>
            <h3
              className={`text-2xl sm:text-3xl font-black mb-3 transition-transform duration-500 group-hover:-translate-y-1 text-black`}
            >
              {service.name}
            </h3>
          </div>

          {/* CTA - Clean without extra details */}
          <div
            className={`mt-auto pt-5 rounded-2xl transition-all duration-300 ${
              isValidImage(service.icon)
                ? 'p-4 -mx-2 mb-1'
                : 'border-t border-gray-100 mt-2'
            }`}
          >
            <div
              className={`w-full py-4 rounded-2xl font-black transition-all duration-500 flex items-center justify-center gap-3 overflow-hidden group/btn relative ${
                isValidImage(service.icon)
                  ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-xl shadow-emerald-900/40'
                  : 'bg-emerald-900 text-white hover:bg-emerald-800'
              }`}
            >
              <span className='relative z-10 text-sm tracking-wide'>طلب الخدمة الآن</span>
              <svg
                className='w-4 h-4 relative z-10 transition-transform duration-300 group-hover/btn:translate-x-1'
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
              {/* Button shine effect */}
              <div className='absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700'></div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
