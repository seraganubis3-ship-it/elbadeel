'use client';

import { useState, useEffect, useRef } from 'react';
import { Service, Category, Admin, STATUS_CONFIG } from '../types';

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
  onSearchChange,
  onStatusChange,
  onDeliveryChange,
  onDateFromChange,
  onDateToChange,
  onServiceToggle,
  onOrderSourceChange,
  onCategoryChange,
  onEmployeeChange,
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

  return (
    <div className='bg-white/95 rounded-2xl shadow-xl border border-gray-100/50 p-4 lg:p-6 mb-6'>
      {/* Order Source Tabs */}
      <div className='flex flex-wrap gap-2 mb-6 p-1 bg-gray-100 rounded-xl'>
        <button
          onClick={() => onOrderSourceChange('office')}
          className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
            orderSourceFilter === 'office'
              ? 'bg-white text-blue-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🏢 طلبات المكتب
        </button>
        <button
          onClick={() => onOrderSourceChange('online')}
          className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
            orderSourceFilter === 'online'
              ? 'bg-white text-green-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          🌐 طلبات أونلاين
        </button>
        <button
          onClick={() => onOrderSourceChange('all')}
          className={`flex-1 min-w-[100px] px-4 py-3 rounded-lg font-medium transition-all duration-200 text-sm ${
            orderSourceFilter === 'all'
              ? 'bg-white text-purple-600 shadow-md'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 جميع الطلبات
        </button>
      </div>

      {/* Filters Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {/* Search - Row 1, Col 1 */}
        <div className='relative'>
          <div className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'>
            <svg
              className='w-5 h-5 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
          <input
            type='text'
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder='بحث بالاسم أو الهاتف أو رقم الطلب...'
            className='w-full pr-10 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm'
          />
        </div>

        {/* Status Filter - Row 1, Col 2 */}
        <select
          value={statusFilter}
          onChange={e => onStatusChange(e.target.value)}
          className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer'
        >
          <option value='all'>جميع الحالات</option>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <option key={key} value={key}>
              {config.icon} {config.text}
            </option>
          ))}
        </select>

        {/* Delivery Type Filter - Row 1, Col 3 */}
        <select
          value={deliveryFilter}
          onChange={e => onDeliveryChange(e.target.value)}
          className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer'
        >
          <option value='all'>جميع طرق التسليم</option>
          <option value='OFFICE'>🏢 استلام من المكتب</option>
          <option value='DELIVERY'>🚚 توصيل للمنزل</option>
        </select>

        {/* Services Multi-Select Dropdown - Row 1, Col 4 */}
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm flex items-center justify-between'
          >
            <span className='truncate'>
              {selectedServiceIds.length === 0
                ? 'جميع الخدمات'
                : `${selectedServiceIds.length} خدمة محددة`}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${isServicesDropdownOpen ? 'rotate-180' : ''}`}
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
          </button>

          {isServicesDropdownOpen && (
            <div className='absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto'>
              {services.map(service => (
                <label
                  key={service.id}
                  className='flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0'
                >
                  <input
                    type='checkbox'
                    checked={selectedServiceIds.includes(service.id)}
                    onChange={() => onServiceToggle(service.id)}
                    className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
                  />
                  <span className='mr-3 text-sm text-gray-700'>{service.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Category Filter - Row 2, Col 1-2 (Spans 2) */}
        <select
            value={categoryId}
            onChange={e => onCategoryChange(e.target.value)}
            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer md:col-span-2'
        >
            <option value=''>جميع الفئات</option>
            {categories.map(category => (
            <option key={category.id} value={category.id}>
                📂 {category.name}
            </option>
            ))}
        </select>

        {/* Employee Filter - Row 2, Col 3-4 (Spans 2) */}
        <select
            value={employeeId}
            onChange={e => onEmployeeChange(e.target.value)}
            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm appearance-none cursor-pointer md:col-span-2'
        >
            <option value=''>جميع الموظفين</option>
            {admins.map(admin => (
            <option key={admin.id} value={admin.id}>
                👤 {admin.name}
            </option>
            ))}
        </select>
      </div>

      {/* Date Range */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mt-4'>
        <div className='relative'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>من تاريخ</label>
          <input
            type='text'
            value={dateFrom}
            onChange={e => onDateFromChange(e.target.value)}
            placeholder='dd/mm/yyyy'
            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm'
          />
        </div>
        <div className='relative'>
          <label className='block text-sm font-medium text-gray-700 mb-1'>إلى تاريخ</label>
          <input
            type='text'
            value={dateTo}
            onChange={e => onDateToChange(e.target.value)}
            placeholder='dd/mm/yyyy'
            className='w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm'
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasFilter && (
        <div className='mt-4 flex items-center gap-2 text-sm text-gray-600'>
          <span className='font-medium'>الفلاتر النشطة:</span>
          {orderSourceFilter !== 'all' && (
            <span className='px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs'>
              {orderSourceFilter === 'office' ? 'طلبات المكتب' : 'طلبات أونلاين'}
            </span>
          )}
          {selectedServiceIds.length > 0 && (
            <span className='px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs'>
              {selectedServiceIds.length} خدمة
            </span>
          )}
          {categoryId && (
            <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs'>
              فئة: {categories.find(c => c.id === categoryId)?.name}
            </span>
          )}
          {employeeId && (
            <span className='px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs'>
              موظف: {admins.find(a => a.id === employeeId)?.name}
            </span>
          )}
          {(dateFrom || dateTo) && (
            <span className='px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs'>
              نطاق تاريخ
            </span>
          )}
        </div>
      )}
    </div>
  );
}
