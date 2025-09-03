"use client";

import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is admin
  if (!session?.user || session.user.role !== "ADMIN") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 px-4">
        <div className="text-center max-w-md w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">غير مصرح لك بالوصول</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">يجب أن تكون مدير النظام للوصول إلى لوحة التحكم</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 text-sm sm:text-base"
          >
            العودة للصفحة الرئيسية
          </Link>
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
      name: "لوحة التحكم",
      href: "/admin",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
    },
    {
      name: "إدارة الطلبات",
      href: "/admin/orders",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      name: "إدارة الخدمات",
      href: "/admin/services",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      name: "إدارة المستخدمين",
      href: "/admin/users",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      name: "التقارير",
      href: "/admin/reports",
      icon: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 admin-panel">
      {/* Header */}
      <header className="relative overflow-hidden border-b shadow-lg sticky top-0 z-[1000] bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-950">
        {/* Background gradient matching navbar */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-950" />
        {/* Subtle pattern matching navbar */}
        <div className="absolute inset-0 opacity-[0.07]" style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #ffffff 2px, transparent 2px), radial-gradient(circle at 80% 30%, #ffffff 2px, transparent 2px), radial-gradient(circle at 60% 70%, #ffffff 2px, transparent 2px)",
          backgroundSize: "40px 40px, 50px 50px, 60px 60px",
        }} />
        
        <div className="relative flex items-center justify-between px-3 sm:px-4 py-3 sm:py-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg sm:rounded-xl flex items-center justify-center">
              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg sm:text-xl font-bold text-white">لوحة التحكم</h1>
              <p className="text-xs sm:text-sm text-emerald-200">إدارة النظام</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-bold text-white">لوحة التحكم</h1>
            </div>
          </div>

          {/* User Info and Mobile Menu Button */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Back to Website Button */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="hidden md:inline">العودة للموقع</span>
            </Link>

            {/* User Info - Hidden on very small screens */}
            <div className="hidden xs:flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                </span>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-white text-xs sm:text-sm font-medium">{session.user.name || session.user.email}</p>
                <p className="text-emerald-200 text-xs">مدير النظام</p>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-white hover:text-emerald-300 p-1.5 sm:p-2 rounded-lg hover:bg-white/20 transition-all duration-300"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Logout Button - Hidden on small screens */}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300"
            >
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden md:inline">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar - Hidden on mobile/tablet */}
        <aside className="hidden xl:block w-64 min-h-screen bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-950 shadow-xl">
          {/* Subtle pattern */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #ffffff 2px, transparent 2px), radial-gradient(circle at 80% 30%, #ffffff 2px, transparent 2px), radial-gradient(circle at 60% 70%, #ffffff 2px, transparent 2px)",
            backgroundSize: "40px 40px, 50px 50px, 60px 60px",
          }} />
          
          <nav className="relative p-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                      : "text-emerald-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-white/20"
                      : "bg-white/10 group-hover:bg-white/20"
                  }`}>
                    {item.icon}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
            
            {/* Back to Website Link in Sidebar */}
            <div className="pt-4 border-t border-white/20">
              <Link
                href="/"
                className="group flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 text-emerald-100 hover:bg-white/10 hover:text-white"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 bg-white/10 group-hover:bg-white/20">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <span className="font-medium">العودة للموقع</span>
              </Link>
            </div>
          </nav>
        </aside>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 xl:hidden"
            onClick={closeMobileMenu}
          />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-72 sm:w-80 bg-gradient-to-br from-slate-900 via-emerald-900 to-slate-950 shadow-2xl border-l border-emerald-500/20 overflow-hidden transition-all duration-300 ease-in-out transform z-50 xl:hidden ${
          mobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}>
          {/* Mobile Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-emerald-500/20">
            <h2 className="text-lg sm:text-xl font-bold text-white">القائمة</h2>
            <button
              onClick={closeMobileMenu}
              className="text-emerald-300 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="p-4 sm:p-6 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`group flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-all duration-300 ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                      : "text-emerald-100 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-white/20"
                      : "bg-white/10 group-hover:bg-white/20"
                  }`}>
                    {item.icon}
                  </div>
                  <span className="font-medium text-sm sm:text-base">{item.name}</span>
                </Link>
              );
            })}
          </nav>

                      {/* Mobile User Info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 border-t border-emerald-500/20">
              {/* Back to Website Button */}
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="w-full mb-3 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                العودة للموقع
              </Link>

              <div className="flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl border border-white/20">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">
                    {session.user.name?.charAt(0) || session.user.email?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-white text-xs sm:text-sm font-medium">{session.user.name || session.user.email}</p>
                  <p className="text-emerald-200 text-xs">مدير النظام</p>
                </div>
              </div>
              
              <button
                onClick={() => {
                  closeMobileMenu();
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full mt-3 flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-red-500 hover:bg-red-600 text-white text-xs sm:text-sm font-medium rounded-lg sm:rounded-xl transition-all duration-300"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                تسجيل الخروج
              </button>
            </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
