'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const NavLink = ({
    href,
    children,
    icon,
  }: {
    href: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
        isActive(href)
          ? 'text-white bg-white/15'
          : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}
    >
      {icon && <span className='w-4 h-4'>{icon}</span>}
      {children}
    </Link>
  );

  return (
    <div className='flex items-center gap-1'>
      {/* Services Link */}
      <NavLink
        href='/services'
        icon={
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
            />
          </svg>
        }
      >
        الخدمات
      </NavLink>

      {/* About Link */}
      <NavLink
        href='/about'
        icon={
          <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        }
      >
        من نحن
      </NavLink>

      {session?.user ? (
        <>
          {/* Orders Link */}
          <NavLink
            href='/orders'
            icon={
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={1.5}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
            }
          >
            طلباتي
          </NavLink>

          {/* Admin Panel Link */}
          {['ADMIN', 'STAFF', 'VIEWER'].includes(session.user.role as string) && (
            <NavLink
              href='/admin'
              icon={
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
              }
            >
              لوحة التحكم
            </NavLink>
          )}

          {/* Divider */}
          <div className='w-px h-6 bg-white/20 mx-2'></div>

          {/* User Profile */}
          <Link
            href='/profile'
            className={`flex items-center gap-3 px-3 py-1.5 rounded-full transition-all duration-200 ${
              isActive('/profile') ? 'bg-white/15' : 'hover:bg-white/10'
            }`}
          >
            <div className='w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg'>
              {session.user.name?.charAt(0) || session.user.email?.charAt(0) || '؟'}
            </div>
            <span className='text-white/90 text-sm font-medium hidden xl:block'>
              {session.user.name || session.user.email?.split('@')[0]}
            </span>
          </Link>

          {/* Logout Button */}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className='flex items-center gap-2 px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full transition-all duration-200 text-sm font-medium'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            <span className='hidden xl:block'>خروج</span>
          </button>
        </>
      ) : (
        <>
          {/* Register Link */}
          <NavLink href='/register'>إنشاء حساب</NavLink>

          {/* Login Button - Primary CTA */}
          <Link
            href='/login'
            className='flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full transition-all duration-200 text-sm font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-emerald-400/30'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
              />
            </svg>
            دخول
          </Link>
        </>
      )}
    </div>
  );
}
