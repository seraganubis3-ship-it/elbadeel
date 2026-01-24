'use client';

import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import AdminWorkDateWrapper from '@/components/AdminWorkDateWrapper';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [workDate, setWorkDate] = useState<string | null>(null);

  // Get work date from session or localStorage
  useEffect(() => {
    if (session?.user) {
      const user = session.user as any;
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        const sessionWorkDate = user.workDate;
        const localWorkDate =
          typeof window !== 'undefined' ? localStorage.getItem('adminWorkDate') : null;
        setWorkDate(sessionWorkDate || localWorkDate);
      }
    }
  }, [session]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Check if user has admin privileges
  if (
    !session?.user ||
    !session.user.role ||
    !['ADMIN', 'STAFF', 'VIEWER'].includes(session.user.role)
  ) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 px-4'>
        <div className='text-center max-w-md w-full'>
          <h1 className='text-xl sm:text-2xl font-bold text-gray-900 mb-4'>غير مصرح لك بالوصول</h1>
          <p className='text-gray-600 mb-6 text-sm sm:text-base'>
            يجب أن تكون مدير أو موظف أو مراجع للوصول إلى لوحة التحكم
          </p>
          <div className='space-y-3'>
            <Link
              href='/admin/login'
              className='inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 text-sm sm:text-base'
            >
              تسجيل دخول إداري
            </Link>
            <Link
              href='/'
              className='inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white font-semibold rounded-xl hover:from-slate-700 hover:to-slate-800 transition-all duration-300 text-sm sm:text-base'
            >
              العودة للصفحة الرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navigation = [
    {
      name: 'لوحة التحكم',
      href: '/admin',
      icon: (
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z'
          />
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z'
          />
        </svg>
      ),
    },
    {
      name: 'إنشاء طلب',
      href: '/admin/create',
      icon: (
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      ),
    },
    {
      name: 'إدارة الطلبات',
      href: '/admin/orders',
      icon: (
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
          />
        </svg>
      ),
    },
    {
      name: 'إدارة الخدمات',
      href: '/admin/services',
      icon: (
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z'
          />
        </svg>
      ),
    },
    {
      name: ' المستخدمين',
      href: '/admin/users',
      icon: (
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
          />
        </svg>
      ),
    },
    {
      name: 'العهدة',
      href: '/admin/inventory',
      icon: (
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M3 7h18M3 12h18M3 17h18'
          />
        </svg>
      ),
    },
    {
      name: 'التقارير',
      href: '/admin/reports',
      icon: (
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
          />
        </svg>
      ),
    },
    {
      name: 'واتساب',
      href: '/admin/whatsapp',
      icon: (
        <svg className='w-5 h-5 sm:w-6 sm:h-6' fill='currentColor' viewBox='0 0 24 24'>
          <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
        </svg>
      ),
    },
    {
      name: 'أكواد الخصم',
      href: '/admin/promo-codes',
      icon: (
        <svg
          className='w-5 h-5 sm:w-6 sm:h-6'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z'
          />
        </svg>
      ),
    },
  ];

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 admin-panel'>
      {/* Header (hidden in print) */}
      <header className='relative overflow-hidden border-b shadow-lg sticky top-0 z-[1000] bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-950 print:hidden'>
        {/* Background gradient matching navbar */}
        <div className='absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-950 pointer-events-none' />
        {/* Subtle pattern matching navbar */}
        <div
          className='absolute inset-0 opacity-[0.07] pointer-events-none'
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #ffffff 2px, transparent 2px), radial-gradient(circle at 80% 30%, #ffffff 2px, transparent 2px), radial-gradient(circle at 60% 70%, #ffffff 2px, transparent 2px)',
            backgroundSize: '40px 40px, 50px 50px, 60px 60px',
          }}
        />

        <div className='relative flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4'>
          {/* Logo and Titles */}
          <div className='flex items-center gap-2 sm:gap-4'>
            <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300'>
              <svg
                className='w-5 h-5 sm:w-6 sm:h-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            </div>
            {/* Titles removed as requested */}
          </div>

          {/* User Info and Mobile Menu Button */}
          <div className='flex items-center gap-2 sm:gap-4'>
            {/* Work Date Display */}
            {(session.user.role === 'ADMIN' || session.user.role === 'STAFF') && workDate && (
              <button
                onClick={() => {
                  const newDate = prompt('أدخل تاريخ العمل الجديد (DD/MM/YYYY):', workDate);
                  if (newDate && newDate !== workDate) {
                    localStorage.setItem('adminWorkDate', newDate);
                    window.location.reload();
                  }
                }}
                className='hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-600/80 backdrop-blur-sm text-white text-xs font-medium rounded-lg border border-blue-400/30 hover:bg-blue-500/80 transition-colors cursor-pointer'
              >
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <span>تاريخ العمل: {workDate}</span>
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                  />
                </svg>
              </button>
            )}

            {/* Back to Website Button */}
            <Link
              href='/'
              className='inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300'
            >
              <svg
                className='w-3 h-3 sm:w-4 sm:h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              <span className='hidden md:inline'>العودة للموقع</span>
              <span className='hidden lg:inline text-emerald-100'>
                - {session.user.name || session.user.email}
              </span>
            </Link>

            {/* User Info - Hidden on very small screens */}
            <div className='hidden xs:flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20'>
              <div className='w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center'>
                <span className='text-white font-bold text-xs sm:text-sm'>
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </span>
              </div>
              <div className='text-right hidden sm:block'>
                <p className='text-white text-xs sm:text-sm font-medium'>
                  {session.user.name || session.user.email}
                </p>
                <p className='text-emerald-200 text-xs'>
                  {session.user.role === 'ADMIN'
                    ? 'مدير النظام'
                    : session.user.role === 'STAFF'
                      ? 'موظف'
                      : session.user.role === 'VIEWER'
                        ? 'مراجع'
                        : 'مستخدم'}
                </p>
              </div>
            </div>

            {/* Menu Button - Always Visible */}
            <button
              onClick={toggleMobileMenu}
              className='text-white hover:text-emerald-300 p-1.5 sm:p-2 rounded-lg hover:bg-white/20 transition-all duration-300'
            >
              <svg
                className='w-5 h-5 sm:w-6 sm:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                ) : (
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 6h16M4 12h16M4 18h16'
                  />
                )}
              </svg>
            </button>

            {/* Logout Button - Hidden on small screens */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='hidden sm:inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300'
            >
              <svg
                className='w-3 h-3 sm:w-4 sm:h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              <span className='hidden md:inline'>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className='flex'>
        {/* Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className='fixed inset-0 bg-black bg-opacity-50 z-[9998]'
            onClick={closeMobileMenu}
          />
        )}

        {/* Sidebar Menu - Always Available */}
        <div
          className={`fixed top-0 right-0 h-full w-72 sm:w-80 lg:w-96 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-950 shadow-2xl border-l border-emerald-500/20 transition-all duration-300 ease-in-out transform z-[9999] flex flex-col min-h-0 ${
            mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Mobile Header */}
          <div className='flex items-center justify-between p-4 sm:p-6 border-b border-emerald-500/20'>
            <h2 className='text-lg sm:text-xl font-bold text-white'>القائمة</h2>
            <button
              onClick={closeMobileMenu}
              className='text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200'
            >
              <svg
                className='w-5 h-5 sm:w-6 sm:h-6'
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

          {/* Navigation Menu */}
          <nav className='p-4 sm:p-6 space-y-2 overflow-y-auto flex-1 pb-24 sm:pb-28'>
            <div className='grid grid-cols-1 gap-2'>
              {navigation.map(item => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={`group flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-all duration-300 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25'
                        : 'text-emerald-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive ? 'bg-white/20' : 'bg-white/10 group-hover:bg-white/20'
                      }`}
                    >
                      {item.icon}
                    </div>
                    <span className='font-medium text-sm sm:text-base'>{item.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* Additional Quick Actions */}
            <div className='pt-4 mt-4 border-t border-emerald-500/20'>
              <h3 className='text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-3 px-2'>
                إجراءات سريعة
              </h3>
              <div className='space-y-2'>
                <Link
                  href='/admin/orders?delivery=today'
                  onClick={closeMobileMenu}
                  className='group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-emerald-100 hover:bg-white/10 hover:text-white'
                >
                  <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-all duration-300'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                  <span className='font-medium text-sm'>تسليم اليوم</span>
                </Link>

                <Link
                  href='/admin/orders?status=settlement'
                  onClick={closeMobileMenu}
                  className='group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-emerald-100 hover:bg-white/10 hover:text-white'
                >
                  <div className='w-8 h-8 rounded-lg flex items-center justify-center bg-white/10 group-hover:bg-white/20 transition-all duration-300'>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z'
                      />
                    </svg>
                  </div>
                  <span className='font-medium text-sm'>طلبات التسديد</span>
                </Link>
              </div>
            </div>
          </nav>

          {/* Mobile User Info */}
          <div className='p-4 sm:p-6 border-t border-emerald-500/20'>
            {/* Work Date Display for Mobile */}
            {(session.user.role === 'ADMIN' || session.user.role === 'STAFF') && workDate && (
              <button
                onClick={() => {
                  const newDate = prompt('أدخل تاريخ العمل الجديد (DD/MM/YYYY):', workDate);
                  if (newDate && newDate !== workDate) {
                    localStorage.setItem('adminWorkDate', newDate);
                    window.location.reload();
                  }
                }}
                className='w-full mb-3 flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600/80 backdrop-blur-sm text-white text-xs font-medium rounded-lg border border-blue-400/30 hover:bg-blue-500/80 transition-colors cursor-pointer'
              >
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
                <span>تاريخ العمل: {workDate}</span>
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                  />
                </svg>
              </button>
            )}

            {/* Back to Website Button */}
            <Link
              href='/'
              onClick={closeMobileMenu}
              className='w-full mb-3 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300'
            >
              <svg
                className='w-3 h-3 sm:w-4 sm:h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              العودة للموقع - {session.user.name || session.user.email}
            </Link>

            <div className='flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20'>
              <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center'>
                <span className='text-white font-bold text-xs sm:text-sm'>
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </span>
              </div>
              <div className='flex-1 text-right'>
                <p className='text-white text-xs sm:text-sm font-medium'>
                  {session.user.name || session.user.email}
                </p>
                <p className='text-emerald-200 text-xs'>
                  {session.user.role === 'ADMIN'
                    ? 'مدير النظام'
                    : session.user.role === 'STAFF'
                      ? 'موظف'
                      : session.user.role === 'VIEWER'
                        ? 'مراجع'
                        : 'مستخدم'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                closeMobileMenu();
                signOut({ callbackUrl: '/' });
              }}
              className='w-full mt-3 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300'
            >
              <svg
                className='w-3 h-3 sm:w-4 sm:h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              تسجيل الخروج
            </button>
          </div>
        </div>

        {/* Main Content */}
        <main className='flex-1 p-3 sm:p-4 md:p-6 lg:p-8 w-full'>
          <AdminWorkDateWrapper>{children}</AdminWorkDateWrapper>
        </main>
      </div>
    </div>
  );
}
