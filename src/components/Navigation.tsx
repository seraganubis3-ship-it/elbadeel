"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";

export default function Navigation() {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-2 lg:gap-4 xl:gap-6">
      {/* Services Link */}
      <Link 
        href="/services" 
        className="group relative text-white/90 hover:text-white transition-all duration-300 font-medium px-3 lg:px-4 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 whitespace-nowrap"
      >
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <span className="text-sm lg:text-base">الخدمات</span>
        </span>
      </Link>
      
      {session?.user ? (
        <>
          {/* Orders Link */}
          <Link 
            href="/orders" 
            className="group relative text-white/90 hover:text-white transition-all duration-300 font-medium px-3 lg:px-4 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 whitespace-nowrap"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm lg:text-base">طلباتي</span>
            </span>
          </Link>
          
          {/* Admin Panel Link */}
          {session.user.role === "ADMIN" && (
            <Link 
              href="/admin" 
              className="group relative text-white/90 hover:text-white transition-all duration-300 font-medium px-3 lg:px-4 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="text-sm lg:text-base hidden lg:block">لوحة التحكم</span>
              </span>
            </Link>
          )}
          
          {/* User Info & Logout */}
          <div className="flex items-center gap-2 lg:gap-3">
            <Link 
              href="/profile" 
              className="flex items-center gap-2 px-3 lg:px-4 py-2 bg-white/15 backdrop-blur-sm rounded-lg border border-white/20 whitespace-nowrap hover:bg-white/25 transition-all duration-300 group"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-white/20 to-white/10 rounded-full flex items-center justify-center border border-white/30 flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-bold text-sm">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </span>
              </div>
              <span className="text-white/90 text-sm font-medium hidden xl:block group-hover:text-white transition-colors duration-300">
                مرحباً، {session.user.name || session.user.email}
              </span>
            </Link>
            
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="group bg-red-500/90 hover:bg-red-600 text-white px-3 lg:px-4 py-2 rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl backdrop-blur-sm border border-red-400/30 whitespace-nowrap"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden lg:block">تسجيل الخروج</span>
              </span>
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Register Link */}
          <Link 
            href="/register" 
            className="group relative text-white/90 hover:text-white transition-all duration-300 font-medium px-3 lg:px-4 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm border border-transparent hover:border-white/20 whitespace-nowrap"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="text-sm lg:text-base">إنشاء حساب</span>
            </span>
          </Link>
          
          {/* Login Button */}
          <Link 
            href="/login" 
            className="group bg-white/15 hover:bg-white/25 text-white px-4 lg:px-6 py-2 rounded-lg transition-all duration-300 font-medium text-sm shadow-lg hover:shadow-xl backdrop-blur-sm border border-white/30 whitespace-nowrap"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 lg:w-5 lg:h-5 group-hover:scale-110 transition-transform duration-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="text-sm lg:text-base">تسجيل الدخول</span>
            </span>
          </Link>
        </>
      )}
    </div>
  );
}
