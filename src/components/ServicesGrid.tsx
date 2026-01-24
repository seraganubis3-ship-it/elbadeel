'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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

interface ServicesGridProps {
  categories: Category[];
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

function ServiceCard({ service, index }: { service: Service; index: number }) {
  const { ref, isVisible } = useScrollAnimation();

  const minPrice =
    service.variants.length > 0 ? Math.min(...service.variants.map(v => v.priceCents)) / 100 : null;
  const minDays =
    service.variants.length > 0 ? Math.min(...service.variants.map(v => v.etaDays)) : null;

  const isValidImage = (src?: string | null) => {
    if (!src) return false;
    return src.startsWith('/') || src.startsWith('http');
  };

  return (
    <div
      ref={ref}
      className='transition-all duration-700 h-full'
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        transitionDelay: `${(index % 3) * 100}ms`,
      }}
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
            {/* Lighter overlay - reduced opacity to show images better */}
            <div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent'></div>
          </>
        ) : (
          <div className='absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 group-hover:from-emerald-100 transition-colors duration-500 flex items-center justify-center'>
            {service.icon ? (
              <span className='text-9xl select-none filter grayscale opacity-20 group-hover:grayscale-0 group-hover:opacity-40 transition-all duration-500 scale-150 group-hover:scale-[1.8]'>
                {service.icon}
              </span>
            ) : null}
          </div>
        )}

        {/* Glossy Reflection Card effect on hover */}
        <div className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/0 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000'></div>

        {/* Content Overlay */}
        <div className='relative h-full p-7 flex flex-col justify-end z-10'>
          {/* Title & Info */}
          <div className='mb-6'>
            <h3
              className={`text-2xl sm:text-3xl font-black mb-2 transition-transform duration-500 group-hover:-translate-y-1 ${
                isValidImage(service.icon) ? 'text-white' : 'text-gray-900'
              }`}
            >
              {service.name}
            </h3>
            {service.description && (
              <p
                className={`text-sm line-clamp-2 leading-relaxed font-medium transition-all duration-500 ${
                  isValidImage(service.icon)
                    ? 'text-emerald-50/70 group-hover:text-white'
                    : 'text-gray-500'
                }`}
              >
                {service.description}
              </p>
            )}
          </div>

          {/* CTA & Delivery - Futuristic glass panel */}
          <div
            className={`mt-auto pt-5 rounded-2xl transition-all duration-300 ${
              isValidImage(service.icon)
                ? 'bg-white/5 backdrop-blur-md border border-white/10 p-4 -mx-2 mb-1 group-hover:bg-white/10'
                : 'border-t border-gray-100 mt-2'
            }`}
          >
            <div className='flex items-center justify-between mb-5'>
              <div className='flex flex-col'>
                <span
                  className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                    isValidImage(service.icon) ? 'text-emerald-300/60' : 'text-gray-400'
                  }`}
                >
                  حالة الخدمة
                </span>
                <div className='flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 text-white'>
                  <span className='text-xs font-black'>متاحة الآن</span>
                </div>
              </div>

              {minDays && (
                <div className='flex flex-col items-end'>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                      isValidImage(service.icon) ? 'text-emerald-300/60' : 'text-gray-400'
                    }`}
                  >
                    توقيت الإنجاز
                  </span>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${
                      isValidImage(service.icon)
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-emerald-50 text-emerald-700'
                    }`}
                  >
                    <svg
                      className='w-3.5 h-3.5'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={3}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    <span className='text-sm font-black'>
                      {minDays === 1 ? 'يوم واحد' : `${minDays} أيام`}
                    </span>
                  </div>
                </div>
              )}
            </div>

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

export default function ServicesGrid({ categories }: ServicesGridProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering Logic
  const filteredServices = useMemo(() => {
    let services = categories.flatMap(cat =>
      cat.services.map(s => ({ ...s, categoryName: cat.name, categoryId: cat.id }))
    );

    if (activeTab !== 'all') {
      services = services.filter(s => s.categoryId === activeTab);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      services = services.filter(
        s => s.name.toLowerCase().includes(query) || s.description?.toLowerCase().includes(query)
      );
    }

    return services;
  }, [categories, activeTab, searchQuery]);

  return (
    <div className='space-y-8'>
      {/* Search & Tabs Controls */}
      <div className='sticky top-20 z-30 bg-gray-50/80 backdrop-blur-xl py-4 -mx-4 px-4 sm:mx-0 sm:px-0 rounded-2xl border-b border-gray-100 mb-8 shadow-sm sm:shadow-none'>
        <div className='flex flex-col gap-6'>
          {/* Search Bar */}
          <div className='relative max-w-2xl mx-auto w-full group'>
            <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none'>
              <svg
                className='w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                />
              </svg>
            </div>
            <input
              type='text'
              placeholder='ابحث عن خدمة محددة...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='w-full bg-white border border-gray-200 text-gray-800 text-sm rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 block p-4 pr-12 transition-all shadow-sm'
            />
          </div>

          {/* Category Tabs */}
          <div className='flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none px-2 justify-center'>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              الكل
            </button>
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                  activeTab === category.id
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                    : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Results */}
      {filteredServices.length > 0 ? (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredServices.map((service, idx) => (
            <ServiceCard key={service.id} service={service} index={idx} />
          ))}
        </div>
      ) : (
        <div className='flex flex-col items-center justify-center py-20 text-center animate-fade-in'>
          <div className='w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mb-6'>
            <svg
              className='w-12 h-12 text-gray-300'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
          <h3 className='text-xl font-bold text-gray-800 mb-2'>عذراً، لم نجد نتائج</h3>
          <p className='text-gray-500'>حاول البحث بكلمات أخرى أو اختر قسم آخر</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
            className='mt-6 text-emerald-600 font-bold hover:underline'
          >
            عرض جميع الخدمات
          </button>
        </div>
      )}

      {/* Global Animation Styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
