"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";
import Logo from "@/components/Logo";
import Navigation from "@/components/Navigation";
import MobileNavigation from "@/components/MobileNavigation";

interface AdminLayoutWrapperProps {
  children: ReactNode;
}

export default function AdminLayoutWrapper({ children }: AdminLayoutWrapperProps) {
  const pathname = usePathname();
  const isAdminPage = pathname.startsWith("/admin");

  return (
    <>
      {/* Only show header if not admin page */}
      {!isAdminPage && (
        <header className="relative overflow-hidden border-b shadow-xl sticky top-0 z-50 backdrop-blur-sm">
          {/* Modern gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600" />
          {/* Glass effect overlay */}
          <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-teal-500/20 animate-pulse" />
          
          <nav className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            {/* Logo Section */}
            <div className="flex items-center">
              <Logo />
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center justify-center flex-1">
              <Navigation />
            </div>
            
            {/* Mobile Navigation */}
            <div className="lg:hidden">
              <MobileNavigation />
            </div>
          </nav>
        </header>
      )}
      
      {children}
    </>
  );
}
