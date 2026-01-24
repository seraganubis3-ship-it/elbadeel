'use client';

import { useState } from 'react';
import SimpleScrollParallax from '@/components/3D/SimpleScrollParallax';
import AnimatedCard from '@/components/3D/AnimatedCard';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  orderIndex: number;
}

export default function FAQClient({ faqs }: { faqs: FAQ[] }) {
  const [openFaqs, setOpenFaqs] = useState<Set<string>>(new Set());

  const toggleFaq = (faqId: string) => {
    const newOpenFaqs = new Set(openFaqs);
    if (newOpenFaqs.has(faqId)) {
      newOpenFaqs.delete(faqId);
    } else {
      newOpenFaqs.add(faqId);
    }
    setOpenFaqs(newOpenFaqs);
  };

  return (
    <div className='min-h-screen w-full bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 text-gray-900'>
      {/* Enhanced Hero Section */}
      <div className='relative overflow-hidden w-full'>
        {/* Enhanced Background Effects */}
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-gradient-to-r from-green-600/25 to-blue-600/25'></div>
          {/* Floating shapes */}
          <div className='absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-green-400/30 to-blue-400/30 rounded-full blur-xl animate-pulse'></div>
          <div className='absolute top-40 right-20 w-28 h-28 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full blur-xl animate-pulse delay-1000'></div>
          <div className='absolute bottom-20 left-1/4 w-16 h-16 bg-gradient-to-br from-green-400/30 to-emerald-400/30 rounded-full blur-lg animate-pulse delay-2000'></div>
          <div className='absolute top-1/2 right-1/3 w-24 h-24 bg-gradient-to-br from-indigo-400/30 to-purple-400/30 rounded-full blur-xl animate-pulse delay-3000'></div>
        </div>

        <div className='relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24'>
          <div className='text-center'>
            <SimpleScrollParallax speed={0.3} direction='up'>
              <div className='inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg text-sm sm:text-base font-medium mb-8'>
                <svg
                  className='w-5 h-5 flex-shrink-0'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span>الأسئلة الشائعة</span>
              </div>
            </SimpleScrollParallax>

            <SimpleScrollParallax speed={0.2} direction='up'>
              <h1 className='text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 sm:mb-8 leading-tight'>
                <span className='bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-pulse'>
                  الأسئلة الشائعة
                </span>
              </h1>
            </SimpleScrollParallax>

            <SimpleScrollParallax speed={0.1} direction='up'>
              <p className='text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4'>
                <span className='bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent'>
                  إجابات على أكثر الأسئلة شيوعاً حول خدماتنا وكيفية استخدام المنصة
                </span>
              </p>
            </SimpleScrollParallax>
          </div>
        </div>
      </div>

      {/* Enhanced FAQ Content */}
      <div className='w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20'>
        <div className='space-y-6'>
          {faqs.map((faq, index) => (
            <AnimatedCard key={faq.id} delay={index * 0.1}>
              <div className='bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden transition-all duration-500 hover:shadow-3xl transform hover:-translate-y-2 hover:scale-[1.02] group'>
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className='w-full px-8 py-6 text-right flex items-center justify-between hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50 transition-all duration-500 group'
                >
                  <div className='flex items-center'>
                    <div className='w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mr-6 group-hover:rotate-12 transition-transform duration-500 shadow-lg'>
                      <span className='text-lg font-bold text-white'>{index + 1}</span>
                    </div>
                    <h3 className='text-xl font-bold text-gray-900 pr-4 group-hover:text-green-600 transition-colors duration-300'>
                      {faq.question}
                    </h3>
                  </div>
                  <div className='flex items-center'>
                    <svg
                      className={`w-8 h-8 text-gray-400 transition-all duration-500 group-hover:text-green-500 ${
                        openFaqs.has(faq.id) ? 'rotate-180' : ''
                      }`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </button>

                {openFaqs.has(faq.id) && (
                  <div className='px-8 pb-6 border-t border-gray-100 bg-gradient-to-r from-green-50/50 to-blue-50/50'>
                    <div className='pt-6 text-gray-700 leading-relaxed text-lg'>{faq.answer}</div>
                  </div>
                )}
              </div>
            </AnimatedCard>
          ))}
        </div>

        {/* Enhanced Contact Section */}
        <SimpleScrollParallax speed={0.1} direction='up'>
          <AnimatedCard
            delay={0.2}
            className='mt-20 bg-gradient-to-r from-green-500 via-blue-500 to-indigo-500 rounded-3xl p-12 sm:p-16 text-center text-white shadow-3xl relative overflow-hidden'
          >
            {/* Background decorative elements */}
            <div className='absolute top-8 right-8 w-20 h-20 bg-white/10 rounded-full animate-pulse'></div>
            <div className='absolute bottom-8 left-8 w-16 h-16 bg-white/10 rounded-full animate-bounce'></div>
            <div className='absolute top-1/2 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse'></div>
            <div className='absolute top-1/2 right-1/4 w-8 h-8 bg-white/10 rounded-full animate-bounce'></div>

            <div className='relative z-10 max-w-4xl mx-auto'>
              <div className='w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8 group-hover:rotate-12 transition-transform duration-500 shadow-xl'>
                <svg
                  className='w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                  />
                </svg>
              </div>
              <h3 className='text-3xl sm:text-4xl font-bold mb-6 animate-pulse'>
                <span className='bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'>
                  لم تجد إجابة لسؤالك؟
                </span>
              </h3>
              <p className='text-xl sm:text-2xl mb-10 opacity-90 leading-relaxed'>
                نحن هنا لمساعدتك! تواصل معنا وسنكون سعداء بالإجابة على جميع استفساراتك
              </p>
              <div className='flex flex-col sm:flex-row gap-6 justify-center'>
                <a
                  href='tel:+201234567890'
                  className='group inline-flex items-center gap-4 px-10 py-5 bg-white text-green-600 rounded-2xl font-bold text-xl hover:bg-gray-50 transition-all duration-500 shadow-2xl hover:shadow-3xl transform hover:scale-110 relative overflow-hidden'
                >
                  <span className='relative z-10'>اتصل بنا</span>
                  <svg
                    className='w-6 h-6 group-hover:translate-x-2 transition-transform duration-300'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                  <div className='absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                </a>
                <a
                  href='mailto:info@albadeel.com'
                  className='group inline-flex items-center gap-4 px-10 py-5 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold text-xl hover:bg-white/30 transition-all duration-500 border border-white/30 transform hover:scale-110 relative overflow-hidden'
                >
                  <span className='relative z-10'>راسلنا عبر البريد</span>
                  <svg
                    className='w-6 h-6 group-hover:translate-x-2 transition-transform duration-300'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                    />
                  </svg>
                  <div className='absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
                </a>
              </div>
            </div>
          </AnimatedCard>
        </SimpleScrollParallax>
      </div>
    </div>
  );
}
