'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import Logo from '@/components/Logo';
import MobileNavigation from '@/components/MobileNavigation';

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdminPage = pathname.startsWith('/admin');

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {!isAdminPage && (
        <header
          className={`sticky top-0 z-50 bg-[#0D4A3C] backdrop-blur-md transition-all duration-300 ${
            isScrolled ? 'shadow-xl shadow-emerald-900/30 bg-[#0D4A3C]/95' : ''
          }`}
          dir='rtl'
        >
          {/* Decorative gradient line */}
          <div className='absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400/50 to-transparent'></div>

          <nav className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between'>
            {/* Logo */}
            <Logo />

            {/* Navigation - Center */}
            <div className='hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-sm rounded-2xl p-1.5 border border-white/10'>
              <Link
                href='/services'
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/services') || isActive('/service')
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                الخدمات
              </Link>

              <Link
                href='/about'
                className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive('/about')
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                من نحن
              </Link>

              {session?.user && (
                <Link
                  href='/orders'
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive('/orders')
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  طلباتي
                </Link>
              )}

              {['ADMIN', 'STAFF', 'VIEWER'].includes(session?.user?.role || '') && (
                <Link
                  href='/admin'
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                >
                  لوحة التحكم
                </Link>
              )}
            </div>

            {/* User Menu - Right */}
            <div className='flex items-center gap-3'>
              {session?.user ? (
                <div className='flex items-center gap-2'>
                  <Link
                    href='/profile'
                    className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                      isActive('/profile')
                        ? 'bg-emerald-500/20 ring-1 ring-emerald-400/50'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className='w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform'>
                      {session.user.name?.charAt(0) || session.user.email?.charAt(0) || '؟'}
                    </div>
                    <div className='hidden sm:block'>
                      <p className='text-sm font-medium text-white'>
                        {session.user.name?.split(' ')[0] || 'حسابي'}
                      </p>
                      <p className='text-xs text-white/60'>
                        {session.user.role === 'ADMIN'
                          ? 'مدير'
                          : session.user.role === 'STAFF'
                            ? 'موظف'
                            : session.user.role === 'VIEWER'
                              ? 'مشاهد'
                              : 'مستخدم'}
                      </p>
                    </div>
                  </Link>

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className='p-2.5 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200'
                    title='تسجيل الخروج'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={1.5}
                        d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className='flex items-center gap-2'>
                  <Link
                    href='/login'
                    className='px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white transition-colors'
                  >
                    دخول
                  </Link>
                  <Link
                    href='/register'
                    className='px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/30 hover:scale-105'
                  >
                    إنشاء حساب
                  </Link>
                </div>
              )}

              {/* Mobile Menu */}
              <div className='md:hidden'>
                <MobileNavigation />
              </div>
            </div>
          </nav>
        </header>
      )}

      <div className='min-h-screen'>{children}</div>
    </>
  );
}
