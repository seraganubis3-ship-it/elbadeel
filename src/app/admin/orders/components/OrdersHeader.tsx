'use client';

import Link from 'next/link';
import { useState } from 'react';

interface OrdersHeaderProps {
  orderSourceFilter: string;
  filteredOrdersCount: number;
  activeOrdersCount: number;
  completedOrdersCount: number;
}

export function OrdersHeader({
  orderSourceFilter,
  filteredOrdersCount,
  activeOrdersCount,
  completedOrdersCount,
}: OrdersHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getTitle = () => {
    switch (orderSourceFilter) {
      case 'office':
        return 'طلبات المكتب';
      case 'online':
        return 'طلبات أونلاين';
      default:
        return 'جميع الطلبات';
    }
  };

  const getSubtitle = () => {
    switch (orderSourceFilter) {
      case 'office':
        return 'عرض وإدارة الطلبات المُنشأة من لوحة التحكم';
      case 'online':
        return 'عرض وإدارة الطلبات الواردة من الموقع';
      default:
        return 'عرض وإدارة جميع طلبات العملاء بكفاءة عالية';
    }
  };

  return (
    <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8'>
        <div className='flex items-center justify-between mb-4 lg:mb-8'>
          {/* Logo and Title */}
          <div className='flex items-center space-x-2 lg:space-x-4 space-x-reverse'>
            <div className='w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
              <svg
                className='w-6 h-6 lg:w-8 lg:h-8 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                />
              </svg>
            </div>
            <div className='hidden sm:block'>
              <h1 className='text-2xl lg:text-4xl font-bold text-white mb-1 lg:mb-2'>
                إدارة الطلبات - {getTitle()}
              </h1>
              <p className='text-blue-100 text-sm lg:text-lg hidden lg:block'>{getSubtitle()}</p>
            </div>
            {/* Mobile Title */}
            <div className='sm:hidden'>
              <h1 className='text-lg font-bold text-white'>إدارة الطلبات</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className='hidden lg:flex items-center space-x-4 space-x-reverse'>
            <Link
              href='/admin/create'
              className='px-6 lg:px-8 py-3 lg:py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 hover:border-white/50 flex items-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              <span className='font-semibold'>إنشاء طلب جديد</span>
            </Link>
            <Link
              href='/admin'
              className='px-4 lg:px-6 py-3 lg:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center space-x-2 space-x-reverse'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              <span>العودة للإدارة</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className='lg:hidden'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                {isMobileMenuOpen ? (
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
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='lg:hidden mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20'>
            <div className='space-y-3'>
              <Link
                href='/admin/create'
                className='w-full px-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center space-x-2 space-x-reverse'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                  />
                </svg>
                <span className='font-semibold'>إنشاء طلب جديد</span>
              </Link>
              <Link
                href='/admin'
                className='w-full px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center space-x-2 space-x-reverse'
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 19l-7-7m0 0l7-7m-7 7h18'
                  />
                </svg>
                <span>العودة للإدارة</span>
              </Link>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <StatCard
            title='إجمالي الطلبات'
            value={filteredOrdersCount}
            icon={
              <svg
                className='w-6 h-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                />
              </svg>
            }
            bgColor='bg-blue-500/30'
          />
          <StatCard
            title='الطلبات النشطة'
            value={activeOrdersCount}
            icon={
              <svg
                className='w-6 h-6 text-white'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                />
              </svg>
            }
            bgColor='bg-yellow-500/30'
          />
          <StatCard
            title='الطلبات المكتملة'
            value={completedOrdersCount}
            icon={
              <svg
                className='w-6 h-6 text-white'
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
            }
            bgColor='bg-green-500/30'
          />
        </div>
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({
  title,
  value,
  suffix,
  icon,
  bgColor,
}: {
  title: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  bgColor: string;
}) {
  return (
    <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300'>
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-blue-100 text-sm font-medium'>{title}</p>
          <p className='text-3xl font-bold text-white mt-2'>{value.toLocaleString()}</p>
          {suffix && <p className='text-blue-100 text-xs'>{suffix}</p>}
        </div>
        <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
