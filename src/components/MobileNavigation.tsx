'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function MobileNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const navigation = [
    {
      name: 'الرئيسية',
      href: '/',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      emoji: '🏠',
    },
    {
      name: 'الخدمات',
      href: '/services',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      emoji: '📋',
    },
    {
      name: 'من نحن',
      href: '/about',
      icon: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      emoji: 'ℹ️',
    },
    {
      name: 'طلباتي',
      href: '/orders',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      requireAuth: true,
      emoji: '📦',
    },
    {
      name: 'الملف الشخصي',
      href: '/profile',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
      requireAuth: true,
      emoji: '👤',
    },
  ];

  const quickActions = [
    {
      name: 'واتساب',
      href: 'https://wa.me/201021606893',
      icon: '💬',
      color: 'from-green-500 to-green-600',
      external: true,
    },
    {
      name: 'اتصل بنا',
      href: 'tel:+201000000000',
      icon: '📞',
      color: 'from-blue-500 to-blue-600',
      external: true,
    },
  ];

  const MobileSidebar = () => (
    <>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]'
        onClick={() => setIsOpen(false)}
        style={{ animation: 'fadeIn 0.2s ease-out' }}
      />

      {/* Slide-in Panel */}
      <div
        className='fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 shadow-2xl z-[9999]'
        style={{ animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <div className='flex flex-col h-full'>
          {/* Header with Logo */}
          <div className='relative p-6 pb-4'>
            {/* Decorative Glow */}
            <div className='absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-[80px]'></div>

            <div className='relative flex items-center justify-between'>
              {/* Logo */}
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30'>
                  <span className='text-white font-black text-lg'>ب</span>
                </div>
                <div>
                  <h2 className='text-lg font-black text-white'>البديل</h2>
                  <p className='text-emerald-400/70 text-[10px] font-medium'>للخدمات الحكومية</p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className='w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all'
                aria-label='إغلاق'
              >
                <svg
                  className='w-5 h-5 text-white/70'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* User Info Card */}
          {session?.user ? (
            <div className='mx-4 mb-4 p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 rounded-2xl border border-emerald-500/20'>
              <div className='flex items-center gap-4'>
                <div className='w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30'>
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0) || '؟'}
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-white font-bold truncate text-lg'>
                    {session.user.name || session.user.email?.split('@')[0]}
                  </p>
                  <div className='flex items-center gap-2 mt-1'>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        session.user.role === 'ADMIN'
                          ? 'bg-purple-500/20 text-purple-400'
                          : session.user.role === 'STAFF'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {session.user.role === 'ADMIN' 
                        ? '👑 مدير' 
                        : session.user.role === 'STAFF'
                        ? '👔 موظف'
                        : session.user.role === 'VIEWER'
                        ? '👀 مشاهد'
                        : '✓ عميل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className='mx-4 mb-4 p-4 bg-white/5 rounded-2xl border border-white/10'>
              <p className='text-white/60 text-sm text-center mb-3'>مرحباً بك في البديل</p>
              <Link
                href='/login'
                onClick={() => setIsOpen(false)}
                className='w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
                  />
                </svg>
                تسجيل الدخول
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <div className='flex-1 px-4 overflow-y-auto'>
            <p className='text-white/40 text-xs font-bold uppercase tracking-wider mb-3 px-2'>
              القائمة الرئيسية
            </p>
            <div className='space-y-1'>
              {navigation.map(item => {
                if (item.requireAuth && !session?.user) return null;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-white border border-emerald-500/20'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span
                      className={`text-xl ${isActive(item.href) ? '' : 'grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100'} transition-all`}
                    >
                      {item.emoji}
                    </span>
                    <span className='font-semibold'>{item.name}</span>
                    {isActive(item.href) && (
                      <span className='mr-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
                    )}
                  </Link>
                );
              })}

              {/* Admin Link */}
              {['ADMIN', 'STAFF', 'VIEWER'].includes(session?.user?.role || '') && (
                <>
                  <div className='h-px bg-white/10 my-3'></div>
                  <Link
                    href='/admin'
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                      isActive('/admin')
                        ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/10 text-white border border-purple-500/20'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span className='text-xl'>⚙️</span>
                    <span className='font-semibold'>لوحة التحكم</span>
                    {isActive('/admin') && (
                      <span className='mr-auto w-2 h-2 bg-purple-400 rounded-full animate-pulse'></span>
                    )}
                  </Link>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className='mt-6'>
              <p className='text-white/40 text-xs font-bold uppercase tracking-wider mb-3 px-2'>
                تواصل معنا
              </p>
              <div className='grid grid-cols-2 gap-2'>
                {quickActions.map(action => (
                  <a
                    key={action.name}
                    href={action.href}
                    target={action.external ? '_blank' : undefined}
                    rel={action.external ? 'noopener noreferrer' : undefined}
                    onClick={() => setIsOpen(false)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br ${action.color} shadow-lg hover:scale-105 transition-transform`}
                  >
                    <span className='text-2xl'>{action.icon}</span>
                    <span className='text-white font-bold text-sm'>{action.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className='p-4 border-t border-white/10'>
            {session?.user ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  signOut({ callbackUrl: '/' });
                }}
                className='w-full flex items-center justify-center gap-3 px-4 py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200'
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                  />
                </svg>
                <span className='font-bold'>تسجيل الخروج</span>
              </button>
            ) : (
              <Link
                href='/register'
                onClick={() => setIsOpen(false)}
                className='w-full flex items-center justify-center gap-2 px-4 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all duration-200'
              >
                إنشاء حساب جديد
              </Link>
            )}

            {/* Version */}
            <p className='text-center text-white/20 text-xs mt-4'>البديل v2.0 © 2025</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );

  return (
    <>
      {/* Hamburger Button - Premium Design */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='relative flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all duration-200 group'
        aria-label='القائمة'
      >
        <div className='flex flex-col items-center justify-center w-5 h-5 space-y-1.5'>
          <span
            className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`}
          />
          <span
            className={`block w-3 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? 'opacity-0 scale-0' : ''}`}
          />
          <span
            className={`block w-5 h-0.5 bg-white rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`}
          />
        </div>

        {/* Notification Dot */}
        <span className='absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse'></span>
      </button>

      {/* Portal */}
      {mounted && isOpen && createPortal(<MobileSidebar />, document.body)}
    </>
  );
}
