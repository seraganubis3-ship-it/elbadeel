'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ServiceCard, Service, Category } from './ServiceCard';

interface ServicesGridProps {
  categories: Category[];
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

    // Sort by orderIndex
    services.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

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
