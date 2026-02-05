'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ReactNode } from 'react';
import Link from 'next/link';

interface AdminFooterWrapperProps {
  children: ReactNode;
}

export default function AdminFooterWrapper({ children }: AdminFooterWrapperProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <>
      {children}

      {/* Only show footer if not admin page */}
      {!isAdminPage && (
        <footer className='relative overflow-hidden text-white -mt-px'>
          {/* Background gradient */}
          <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-950' />
          {/* Subtle pattern */}
          <div
            className='absolute inset-0 opacity-[0.07]'
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 20%, #ffffff 2px, transparent 2px), radial-gradient(circle at 80% 30%, #ffffff 2px, transparent 2px), radial-gradient(circle at 60% 70%, #ffffff 2px, transparent 2px)',
              backgroundSize: '40px 40px, 50px 50px, 60px 60px',
            }}
          />

          <div className='relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14'>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10'>
              {/* Brand */}
              <div className='md:col-span-1'>
                <div className='flex items-center mb-5'>
                  <Image
                    src='/logo.jpg'
                    alt='منصة البديل'
                    width={100}
                    height={100}
                    className='w-14 h-14 rounded-full object-cover border border-white/20 shadow-lg'
                  />
                  <div className='mr-4'>
                    <h3 className='text-xl font-bold'>منصة البديل</h3>
                    <p className='text-emerald-200 text-sm'>خدمات استخراج الأوراق الرسمية</p>
                  </div>
                </div>
                <p className='text-slate-200/90 leading-relaxed text-sm'>
                  منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية مع ضمان الجودة والسرعة.
                </p>
              </div>

              {/* Quick links */}
              <div>
                <h4 className='text-lg font-semibold mb-4'>روابط سريعة</h4>
                <ul className='space-y-3 text-slate-200'>
                  <li>
                    <Link href='/' className='hover:text-emerald-300 transition-colors'>
                      الصفحة الرئيسية
                    </Link>
                  </li>
                  <li>
                    <Link href='/contact' className='hover:text-emerald-300 transition-colors'>
                      اتصل بنا
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className='text-lg font-semibold mb-4'>معلومات التواصل</h4>
                <div className='space-y-3 text-slate-200'>
                  <div className='flex items-center'>
                    <div className='w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center ml-3'>
                      <svg
                        className='w-4.5 h-4.5'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.5'
                          d='M3 5a2 2 0 012-2h3.28a1 1 0 01.95.69l1.5 4.49a1 1 0 01-.5 1.21l-2.26 1.13a11.04 11.04 0 005.52 5.52l1.13-2.26a1 1 0 011.21-.5l4.49 1.5a1 1 0 01.69.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z'
                        />
                      </svg>
                    </div>
                    <span className='font-medium'>01021606893</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center ml-3'>
                      <svg
                        className='w-4.5 h-4.5'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.5'
                          d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                        />
                      </svg>
                    </div>
                    <span className='font-medium'>info@albadil.com</span>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center ml-3'>
                      <svg
                        className='w-4.5 h-4.5'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.5'
                          d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                        />
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.5'
                          d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                        />
                      </svg>
                    </div>
                    <a
                      href='https://maps.app.goo.gl/YXin4AbGiHEwji8a7'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-medium hover:text-emerald-300 transition-colors cursor-pointer'
                      title='افتح في جوجل مابس'
                    >
                      شارع صالح قناوى, وليم ناشد, شارع الملك فيصل 15 مدكور، الملك فيصل، 12111
                    </a>
                  </div>
                  <div className='flex items-center'>
                    <div className='w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center ml-3'>
                      <svg
                        className='w-4.5 h-4.5'
                        viewBox='0 0 24 24'
                        fill='none'
                        stroke='currentColor'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.5'
                          d='M2 5a2 2 0 012-2h2.6a2 2 0 011.78 1.1l.86 1.72A2 2 0 0011 7h2a2 2 0 011.76 1.03l.88 1.54A2 2 0 0017 11v2a2 2 0 01-2 2h-1'
                        />
                      </svg>
                    </div>
                    <a
                      href='https://wa.me/201021606893'
                      target='_blank'
                      rel='noopener noreferrer'
                      className='font-medium hover:text-emerald-300 transition-colors'
                    >
                      التواصل عبر واتساب
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className='mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3'>
              <p className='text-slate-300 text-sm'>
                جميع الحقوق محفوظة © {new Date().getFullYear()} منصة البديل
              </p>
              <div className='flex items-center gap-2 text-sm'>
                <span className='text-slate-300'>صنع بواسطة</span>
                <a
                  href='https://wa.me/201021606893'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 hover:bg-white/15 transition-colors'
                  aria-label='تواصل مع سراج على واتساب'
                >
                  <svg className='w-4 h-4 text-emerald-300' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M20.52 3.47A11.77 11.77 0 0012.05 0C5.55 0 .28 5.27.28 11.78a11.7 11.7 0 001.6 6l-1.05 3.83 3.92-1.03a11.8 11.8 0 006 1.62h.01c6.5 0 11.77-5.27 11.77-11.78 0-3.15-1.23-6.1-3.5-8.35zM12.26 21.4h-.01a9.7 9.7 0 01-4.95-1.35l-.35-.2-2.92.77.78-2.84-.22-.37a9.72 9.72 0 01-1.47-5.15c0-5.36 4.37-9.73 9.74-9.73a9.66 9.66 0 016.9 2.86 9.63 9.63 0 012.85 6.88c0 5.36-4.36 9.73-9.73 9.73zm5.58-7.29c-.3-.15-1.77-.87-2.04-.96-.27-.1-.47-.15-.68.14-.2.29-.78.96-.96 1.16-.18.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.47-.89-.79-1.49-1.76-1.67-2.06-.17-.29-.02-.45.13-.6.13-.13.3-.35.45-.53.15-.18.2-.29.3-.49.1-.2.05-.37-.02-.53-.07-.15-.68-1.64-.93-2.25-.25-.6-.51-.52-.68-.53h-.58c-.2 0-.53.07-.81.37-.27.29-1.06 1.03-1.06 2.52s1.09 2.93 1.24 3.13c.15.2 2.14 3.26 5.18 4.57.72.31 1.28.49 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.77-.72 2.02-1.43.25-.7.25-1.3.17-1.43-.08-.12-.28-.2-.58-.35z' />
                  </svg>
                  <span className='font-semibold text-white'>سراج</span>
                </a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}
