'use client';

import { useState, useEffect, useRef } from 'react';
import { Service, Category, Admin, STATUS_CONFIG } from '../types';
import { OrderSearchInput } from './OrderSearchInput';

interface OrdersFiltersProps {
  // Filter values
  searchTerm: string;
  statusFilter: string;
  deliveryFilter: string;
  dateFrom: string;
  dateTo: string;
  selectedServiceIds: string[];
  orderSourceFilter: string;

  categoryId: string;
  employeeId: string;
  photographyDate?: string;

  // Setters
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onDeliveryChange: (value: string) => void;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onServiceToggle: (serviceId: string) => void;
  onOrderSourceChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  onPhotographyDateChange: (value: string) => void;

  // Data
  services: Service[];
  categories: Category[];
  admins: Admin[];
  hasFilter: boolean;
}

export function OrdersFilters({
  searchTerm,
  statusFilter,
  deliveryFilter,
  dateFrom,
  dateTo,
  selectedServiceIds,
  orderSourceFilter,
  categoryId,
  employeeId,
  photographyDate,
  onSearchChange,
  onStatusChange,
  onDeliveryChange,
  onDateFromChange,
  onDateToChange,
  onServiceToggle,
  onOrderSourceChange,
  onCategoryChange,

  onEmployeeChange,
  onPhotographyDateChange,
  services,
  categories,
  admins,
  hasFilter,
}: OrdersFiltersProps) {
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsServicesDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date input with slashes (DD/MM/YYYY)
  const formatDateInput = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 2) return cleaned;
    if (cleaned.length <= 4) return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  };

  // Debounce date inputs
  const [localDateFrom, setLocalDateFrom] = useState(dateFrom);
  const [localDateTo, setLocalDateTo] = useState(dateTo);

  useEffect(() => {
    setLocalDateFrom(dateFrom);
  }, [dateFrom]);

  useEffect(() => {
    setLocalDateTo(dateTo);
  }, [dateTo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localDateFrom !== dateFrom) {
        onDateFromChange(localDateFrom);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localDateFrom, onDateFromChange, dateFrom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localDateTo !== dateTo) {
        onDateToChange(localDateTo);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localDateTo, onDateToChange, dateTo]);

  const handleDateFromChange = (value: string) => {
    const formatted = formatDateInput(value);
    setLocalDateFrom(formatted);
  };

  const handleDateToChange = (value: string) => {
    const formatted = formatDateInput(value);
    setLocalDateTo(formatted);
  };

  // Photography Date Logic
  const [localPhotographyDate, setLocalPhotographyDate] = useState(photographyDate || '');

  useEffect(() => {
    setLocalPhotographyDate(photographyDate || '');
  }, [photographyDate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localPhotographyDate !== photographyDate) {
        onPhotographyDateChange(localPhotographyDate);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localPhotographyDate, onPhotographyDateChange, photographyDate]);

  const handlePhotographyDateChange = (value: string) => {
    const formatted = formatDateInput(value);
    setLocalPhotographyDate(formatted);
  };
  return (
    <div className='bg-white rounded-2xl lg:rounded-[2rem] shadow-sm border border-slate-200/60 p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden'>
      {/* Decorative gradient background */}
      <div className='absolute top-0 left-0 w-full h-1.5 sm:h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'></div>
      <div className='absolute -right-16 -top-16 sm:-right-24 sm:-top-24 w-48 sm:w-64 h-48 sm:h-64 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none'></div>

      <div className='flex flex-col xl:flex-row items-start xl:items-center justify-between gap-5 sm:gap-6 mb-6 sm:mb-8 relative z-10'>
        <div className='w-full xl:w-auto text-center xl:text-right'>
          <h2 className='text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center justify-center xl:justify-start gap-2.5 sm:gap-3'>
            <span className='w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl flex items-center justify-center text-lg sm:text-xl'>
              🔍
            </span>
            البحث والفلاتر
          </h2>
          <p className='text-slate-500 text-xs sm:text-sm mt-1.5 font-medium'>
            ابحث وقم بتصفية الطلبات حسب العديد من المعايير
          </p>
        </div>

        {/* Order Source Segmented Control */}
        <div className='flex p-1.5 bg-slate-100/80 backdrop-blur rounded-2xl border border-slate-200 shadow-inner overflow-x-auto w-full xl:w-auto overflow-y-hidden hide-scrollbar snap-x snap-mandatory'>
          {[
            { id: 'all', label: 'جميع الطلبات', icon: '📋' },
            { id: 'office', label: 'طلبات المكتب', icon: '🏢' },
            { id: 'online', label: 'طلبات أونلاين', icon: '🌐' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => onOrderSourceChange(tab.id)}
              className={`flex-1 min-w-max xl:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl font-bold transition-all duration-300 text-xs sm:text-sm whitespace-nowrap snap-center ${
                orderSourceFilter === tab.id
                  ? 'bg-white text-blue-700 shadow-md transform lg:scale-[1.02] ring-1 ring-black/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Search Bar */}
      <div className='relative mb-6 sm:mb-8 relative z-10'>
        <OrderSearchInput value={searchTerm} onChange={onSearchChange} />
      </div>

      {/* Filters Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10'>
        {/* Status Filter */}
        <div className='space-y-1 sm:space-y-1.5'>
          <label className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-1'>
            حالة الطلب
          </label>
          <div className='relative'>
            <select
              value={statusFilter}
              onChange={e => onStatusChange(e.target.value)}
              className='w-full pr-4 pl-9 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm font-medium text-slate-700 appearance-none cursor-pointer hover:bg-slate-100'
            >
              <option value='all'>جميع الحالات</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.icon} {config.text}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-slate-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Delivery Type Filter */}
        <div className='space-y-1 sm:space-y-1.5'>
          <label className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-1'>
            طريقة التسليم
          </label>
          <div className='relative'>
            <select
              value={deliveryFilter}
              onChange={e => onDeliveryChange(e.target.value)}
              className='w-full pr-4 pl-9 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm font-medium text-slate-700 appearance-none cursor-pointer hover:bg-slate-100'
            >
              <option value='all'>جميع طرق التسليم</option>
              <option value='OFFICE'>🏢 استلام من المكتب</option>
              <option value='DELIVERY'>🚚 توصيل للمنزل</option>
            </select>
            <div className='absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-slate-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Services Dropdown */}
        <div className='space-y-1 sm:space-y-1.5 relative' ref={dropdownRef}>
          <label className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-1'>
            الخدمات
          </label>
          <button
            onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
            className='w-full pr-4 pl-9 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all text-xs sm:text-sm font-medium text-slate-700 flex items-center justify-between hover:bg-slate-100 outline-none'
          >
            <span className='truncate'>
              {selectedServiceIds.length === 0
                ? 'جميع الخدمات'
                : `${selectedServiceIds.length} خدمة محددة`}
            </span>
            <div className='absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none'>
              <svg
                className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform duration-300 ${isServicesDropdownOpen ? 'rotate-180' : ''}`}
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </button>

          {isServicesDropdownOpen && (
            <div className='absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 sm:max-h-60 overflow-y-auto top-full animate-fade-in origin-top'>
              {services.map(service => (
                <label
                  key={service.id}
                  className='flex items-center px-4 py-2.5 sm:py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors'
                >
                  <input
                    type='checkbox'
                    checked={selectedServiceIds.includes(service.id)}
                    onChange={() => onServiceToggle(service.id)}
                    className='w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 transition-all cursor-pointer'
                  />
                  <span className='mr-3 text-xs sm:text-sm font-medium text-slate-700'>
                    {service.name}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className='space-y-1 sm:space-y-1.5'>
          <label className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-1'>
            الفئة
          </label>
          <div className='relative'>
            <select
              value={categoryId}
              onChange={e => onCategoryChange(e.target.value)}
              className='w-full pr-4 pl-9 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm font-medium text-slate-700 appearance-none cursor-pointer hover:bg-slate-100'
            >
              <option value=''>جميع الفئات</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  📂 {category.name}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-slate-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Employee Filter */}
        <div className='space-y-1 sm:space-y-1.5'>
          <label className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-1'>
            الموظف
          </label>
          <div className='relative'>
            <select
              value={employeeId}
              onChange={e => onEmployeeChange(e.target.value)}
              className='w-full pr-4 pl-9 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm font-medium text-slate-700 appearance-none cursor-pointer hover:bg-slate-100'
            >
              <option value=''>جميع الموظفين</option>
              {admins.map(admin => (
                <option key={admin.id} value={admin.id}>
                  👤 {admin.name}
                </option>
              ))}
            </select>
            <div className='absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-slate-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Photography Date Filter */}
        <div className='space-y-1 sm:space-y-1.5'>
          <label className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-1'>
            ت. التصوير
          </label>
          <div className='relative'>
            <input
              type='text'
              value={localPhotographyDate}
              onChange={e => handlePhotographyDateChange(e.target.value)}
              placeholder='يوم/شهر/سنة'
              maxLength={10}
              className='w-full pr-4 pl-9 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm font-medium text-slate-900 hover:bg-slate-100 outline-none placeholder-slate-400 text-center font-mono tracking-wider'
              dir='ltr'
            />
            <div className='absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-slate-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Date From */}
        <div className='space-y-1 sm:space-y-1.5'>
          <label className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-1'>
            من تاريخ
          </label>
          <div className='relative'>
            <input
              type='text'
              value={localDateFrom}
              onChange={e => handleDateFromChange(e.target.value)}
              placeholder='يوم/شهر/سنة'
              maxLength={10}
              className='w-full pr-4 pl-9 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm font-medium text-slate-900 hover:bg-slate-100 outline-none placeholder-slate-400 text-center font-mono tracking-wider'
              dir='ltr'
            />
            <div className='absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-slate-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Date To */}
        <div className='space-y-1 sm:space-y-1.5'>
          <label className='text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider px-1'>
            إلى تاريخ
          </label>
          <div className='relative'>
            <input
              type='text'
              value={localDateTo}
              onChange={e => handleDateToChange(e.target.value)}
              placeholder='يوم/شهر/سنة'
              maxLength={10}
              className='w-full pr-4 pl-9 py-2.5 sm:py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs sm:text-sm font-medium text-slate-900 hover:bg-slate-100 outline-none placeholder-slate-400 text-center font-mono tracking-wider'
              dir='ltr'
            />
            <div className='absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none'>
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 text-slate-400'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasFilter && (
        <div className='mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 relative z-10'>
          <span className='font-bold bg-slate-100 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg'>
            الفلاتر النشطة:
          </span>
          {orderSourceFilter !== 'all' && (
            <span className='px-2.5 py-1 sm:px-3 sm:py-1.5 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-xl font-bold flex items-center gap-1.5 animate-fade-in'>
              {orderSourceFilter === 'office' ? '🏢 مكتب' : '🌐 أونلاين'}
            </span>
          )}
          {selectedServiceIds.length > 0 && (
            <span className='px-2.5 py-1 sm:px-3 sm:py-1.5 bg-purple-50 text-purple-700 border border-purple-200/60 rounded-xl font-bold flex items-center gap-1.5 animate-fade-in'>
              <span className='w-4 h-4 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-[10px]'>
                {selectedServiceIds.length}
              </span>
              خدمات
            </span>
          )}
          {categoryId && (
            <span className='px-2.5 py-1 sm:px-3 sm:py-1.5 bg-amber-50 text-amber-700 border border-amber-200/60 rounded-xl font-bold flex items-center gap-1.5 animate-fade-in truncate max-w-[120px] sm:max-w-none'>
              📂 {categories.find(c => c.id === categoryId)?.name}
            </span>
          )}
          {employeeId && (
            <span className='px-2.5 py-1 sm:px-3 sm:py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-xl font-bold flex items-center gap-1.5 animate-fade-in truncate max-w-[120px] sm:max-w-none'>
              👤 {admins.find(a => a.id === employeeId)?.name}
            </span>
          )}
          {(dateFrom || dateTo || photographyDate) && (
            <span className='px-2.5 py-1 sm:px-3 sm:py-1.5 bg-indigo-50 text-indigo-700 border border-indigo-200/60 rounded-xl font-bold flex items-center gap-1.5 animate-fade-in'>
              📅 تواريخ محددة
            </span>
          )}
        </div>
      )}
    </div>
  );
}
