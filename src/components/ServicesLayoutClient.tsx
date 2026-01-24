'use client';

import { ReactNode } from 'react';

export default function ServicesLayoutClient({ children }: { children: ReactNode }) {
  return (
    <div className='min-h-screen bg-[#F8FAFC] overflow-hidden' dir='rtl'>
      {/* Dynamic Background Elements */}
      <div className='fixed inset-0 pointer-events-none z-0'>
        <div className='absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-emerald-50/50 to-transparent'></div>
        <div className='absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-200/20 rounded-full blur-[120px] animate-pulse'></div>
        <div
          className='absolute bottom-[20%] left-[-10%] w-[30%] h-[30%] bg-blue-200/20 rounded-full blur-[100px] animate-float'
          style={{ animationDelay: '2s' }}
        ></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      {children}

      {/* Modern UI Styles */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
