'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import {
  ORDER_STATUS_CONFIG,
  ORDER_STATUS_OPTIONS,
  getStatusIcon as getStatusIconHelper,
} from '@/constants/orderStatuses';

interface Order {
  id: string;
  service: {
    name: string;
    slug: string;
  };
  variant: {
    name: string;
    priceCents: number;
    etaDays: number;
  };
  status: string;
  totalCents: number;
  deliveryType: string;
  deliveryFee: number;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  payment?: {
    method: string;
    status: string;
    senderPhone: string;
  };
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
          <div className='flex flex-col items-center'>
            <div className='w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mb-4'></div>
            <p className='text-slate-600 font-medium'>جاري التحميل...</p>
          </div>
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}

function OrdersContent() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize from URL on first render
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const status = searchParams.get('status') ?? 'all';
    const sort = searchParams.get('sort') ?? 'date';
    setSearchTerm(q);
    setStatusFilter(status);
    setSortBy(sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else if (response.status === 401) {
        // User is not authenticated, redirect to login
        const data = await response.json();
        if (data.unauthorized) {
          window.location.href = '/login';
          return;
        }
      } else {
        //
      }
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = useCallback(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        order =>
          order.service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'price':
          return b.totalCents - a.totalCents;
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
  }, [orders, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, sortBy, filterAndSortOrders]);

  // Sync filters with URL (keep it clean by omitting defaults)
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (sortBy !== 'date') params.set('sort', sortBy);
    const qs = params.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    router.replace(url, { scroll: false });
  }, [searchTerm, statusFilter, sortBy, pathname, router]);

  const getStatusBadge = (status: string) => {
    const config = ORDER_STATUS_CONFIG[status];
    if (!config) {
      return (
        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
          {status}
        </span>
      );
    }

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bgColor} ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    return getStatusIconHelper(status);
  };

  const getTimeRemaining = (createdAt: string) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const timeDiff = now.getTime() - orderTime.getTime();
    const minutesPassed = Math.floor(timeDiff / (1000 * 60));
    const minutesRemaining = 30 - minutesPassed;

    if (minutesRemaining <= 0) {
      return 'انتهت المهلة';
    } else if (minutesRemaining < 5) {
      return `${minutesRemaining} دقيقة ⚠️`;
    } else {
      return `${minutesRemaining} دقيقة`;
    }
  };

  if (loading) {
    return (
      <div
        className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50'
        dir='rtl'
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='animate-pulse space-y-6'>
            <div className='h-10 bg-white/70 rounded-xl' />
            <div className='bg-white rounded-2xl shadow p-4 sm:p-6'>
              <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
                <div className='h-10 bg-gray-200 rounded' />
                <div className='h-10 bg-gray-200 rounded' />
                <div className='h-10 bg-gray-200 rounded' />
                <div className='h-10 bg-gray-200 rounded' />
              </div>
            </div>
            <div className='space-y-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='bg-white rounded-2xl shadow p-4 sm:p-6'>
                  <div className='h-6 w-1/3 bg-gray-200 rounded mb-3' />
                  <div className='h-4 w-2/3 bg-gray-200 rounded mb-2' />
                  <div className='h-4 w-1/2 bg-gray-200 rounded' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50'
      dir='rtl'
    >
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4'>
            <div>
              <h1 className='text-2xl sm:text-3xl font-bold text-gray-900'>طلباتي</h1>
              <p className='text-gray-600 mt-1 text-sm sm:text-base'>إدارة وتتبع جميع طلباتك</p>
            </div>
            <Link
              href='/services'
              className='inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium text-sm sm:text-base w-full sm:w-auto justify-center'
            >
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 ml-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                />
              </svg>
              طلب خدمة جديدة
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6'>
        <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-4 sm:mb-6'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {/* Search */}
            <div className='sm:col-span-2 lg:col-span-2'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>البحث</label>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='ابحث في الطلبات...'
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 text-sm sm:text-base'
                />
                <svg
                  className='absolute left-3 top-2.5 h-4 w-4 sm:h-5 sm:w-5 text-gray-400'
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
            </div>

            {/* Status Filter */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>الحالة</label>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base'
              >
                <option value='all'>جميع الحالات</option>
                {ORDER_STATUS_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>ترتيب حسب</label>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900 bg-white text-sm sm:text-base'
              >
                <option value='date'>التاريخ</option>
                <option value='price'>السعر</option>
                <option value='status'>الحالة</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className='space-y-4'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2'>
            <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>قائمة الطلبات</h2>
            <span className='text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full'>
              {filteredOrders.length} طلب
            </span>
          </div>
          {filteredOrders.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-lg p-12 text-center'>
              <div className='text-6xl mb-4'>📋</div>
              <h3 className='text-xl font-semibold text-gray-900 mb-2'>لا توجد طلبات</h3>
              <p className='text-gray-600 mb-6'>
                {searchTerm || statusFilter !== 'all'
                  ? 'لا توجد طلبات تطابق معايير البحث المحددة'
                  : 'لم تقم بإنشاء أي طلبات بعد'}
              </p>
              <Link
                href='/services'
                className='inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium'
              >
                طلب خدمة جديدة
              </Link>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div
                key={order.id}
                className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-200 border border-gray-100'
              >
                <div className='flex flex-col sm:flex-row items-start justify-between gap-4'>
                  <div className='flex-1 w-full'>
                    <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4 sm:space-x-reverse mb-4'>
                      <div className='text-2xl sm:text-3xl'>{getStatusIcon(order.status)}</div>
                      <div className='flex-1 w-full'>
                        <h3 className='text-base sm:text-lg font-semibold text-gray-900 mb-1'>
                          {order.service.name}
                        </h3>
                        <p className='text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block'>
                          {order.variant.name}
                        </p>
                      </div>
                      <div className='text-right w-full sm:w-auto'>
                        <div className='text-xl sm:text-2xl font-bold text-green-600 mb-1'>
                          {(order.totalCents / 100).toFixed(2)} جنيه
                        </div>
                        <div className='text-xs sm:text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded'>
                          رقم الطلب: {order.id}
                        </div>
                      </div>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm'>
                      <div className='bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200'>
                        <span className='text-gray-600 block mb-1 text-xs font-medium'>
                          اسم العميل:
                        </span>
                        <p className='font-medium text-gray-900 text-xs sm:text-sm'>
                          {order.customerName}
                        </p>
                      </div>
                      <div className='bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200'>
                        <span className='text-gray-600 block mb-1 text-xs font-medium'>
                          رقم الهاتف:
                        </span>
                        <p className='font-medium text-gray-900 text-xs sm:text-sm'>
                          {order.customerPhone}
                        </p>
                      </div>
                      <div className='bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200'>
                        <span className='text-gray-600 block mb-1 text-xs font-medium'>
                          البريد الإلكتروني:
                        </span>
                        <p className='font-medium text-gray-900 text-xs sm:text-sm break-all'>
                          {order.customerEmail}
                        </p>
                      </div>
                      <div className='bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-200'>
                        <span className='text-gray-600 block mb-1 text-xs font-medium'>
                          تاريخ الطلب:
                        </span>
                        <p className='font-medium text-gray-900 text-xs sm:text-sm'>
                          {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                    </div>

                    {/* Delivery and Payment Info */}
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm mt-4'>
                      <div className='bg-blue-50 p-2 sm:p-3 rounded-lg border border-blue-200'>
                        <span className='text-blue-600 block mb-1 text-xs font-medium'>
                          التوصيل:
                        </span>
                        <p className='font-medium text-blue-900 text-xs sm:text-sm'>
                          {order.deliveryType === 'OFFICE'
                            ? 'استلام من المكتب'
                            : 'توصيل على العنوان'}
                        </p>
                      </div>
                      {order.deliveryFee > 0 && (
                        <div className='bg-orange-50 p-2 sm:p-3 rounded-lg border border-orange-200'>
                          <span className='text-orange-600 block mb-1 text-xs font-medium'>
                            رسوم التوصيل:
                          </span>
                          <p className='font-medium text-orange-900 text-xs sm:text-sm'>
                            {(order.deliveryFee / 100).toFixed(2)} جنيه
                          </p>
                        </div>
                      )}
                      {order.payment && (
                        <div className='bg-green-50 p-2 sm:p-3 rounded-lg border border-green-200'>
                          <span className='text-green-600 block mb-1 text-xs font-medium'>
                            طريقة الدفع:
                          </span>
                          <p className='font-medium text-green-900 text-xs sm:text-sm'>
                            {order.payment.method === 'VODAFONE_CASH' ? 'فودافون كاش' : 'انستا باي'}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 gap-4'>
                      <div className='flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 sm:space-x-reverse w-full sm:w-auto'>
                        <div className='bg-blue-50 px-2 sm:px-3 py-1 rounded-lg'>
                          <span className='text-xs sm:text-sm text-blue-700 font-medium'>
                            المدة المتوقعة: {order.variant.etaDays} يوم
                          </span>
                        </div>
                        {getStatusBadge(order.status)}

                        {/* عرض الوقت المتبقي للدفع */}
                        {order.status === 'pending' && (
                          <div className='bg-yellow-50 px-2 sm:px-3 py-1 rounded-lg'>
                            <span className='text-xs sm:text-sm text-yellow-700 font-medium'>
                              ⏰ الوقت المتبقي: {getTimeRemaining(order.createdAt)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className='flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 sm:space-x-reverse w-full sm:w-auto'>
                        <Link
                          href={`/orders/${order.id}`}
                          className='px-3 sm:px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-200 text-xs sm:text-sm font-medium text-center'
                        >
                          عرض التفاصيل
                        </Link>

                        {order.status === 'pending' && (
                          <Link
                            href={`/order/${order.id}/payment`}
                            className='px-3 sm:px-4 py-2 bg-green-600 text-white border border-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 text-xs sm:text-sm font-medium text-center'
                          >
                            إتمام الدفع
                          </Link>
                        )}

                        {order.status === 'payment_pending' && (
                          <span className='px-3 sm:px-4 py-2 bg-orange-100 text-orange-700 border border-orange-300 rounded-lg text-xs sm:text-sm font-medium text-center'>
                            في انتظار تأكيد الدفع
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {filteredOrders.length > 0 && (
          <div className='mt-6 sm:mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6'>
            <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center'>
              <div className='text-2xl sm:text-3xl font-bold text-green-600'>
                {filteredOrders.length}
              </div>
              <div className='text-xs sm:text-sm text-gray-600'>إجمالي الطلبات</div>
            </div>
            <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center'>
              <div className='text-2xl sm:text-3xl font-bold text-blue-600'>
                {filteredOrders.filter(o => o.status === 'completed').length}
              </div>
              <div className='text-xs sm:text-sm text-gray-600'>الطلبات المكتملة</div>
            </div>
            <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center'>
              <div className='text-2xl sm:text-3xl font-bold text-yellow-600'>
                {
                  filteredOrders.filter(o => o.status === 'pending' || o.status === 'reviewing')
                    .length
                }
              </div>
              <div className='text-xs sm:text-sm text-gray-600'>قيد المعالجة</div>
            </div>
            <div className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 text-center'>
              <div className='text-2xl sm:text-3xl font-bold text-purple-600'>
                {(filteredOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100).toFixed(2)}
              </div>
              <div className='text-xs sm:text-sm text-gray-600'>إجمالي القيمة (جنيه)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
