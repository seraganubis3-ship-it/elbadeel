'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Phone,
  Package,
  Calendar,
} from 'lucide-react';
import { STATUS_CONFIG, Order } from '../types';

interface QuickOrderStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (order: Order, newStatus: string) => void;
  updatingId: string | null;
}

export function QuickOrderStatusModal({
  isOpen,
  onClose,
  onStatusChange,
  updatingId,
}: QuickOrderStatusModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [customerOptions, setCustomerOptions] = useState<{ phone: string; name: string }[]>([]);
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState<string | null>(null);

  const [results, setResults] = useState<Order[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with global updates
  useEffect(() => {
    const handleOrderUpdated = (e: any) => {
      const { orderId, newStatus } = e.detail;
      setResults(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('orderUpdated', handleOrderUpdated);
      return () => window.removeEventListener('orderUpdated', handleOrderUpdated);
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchTerm('');
      setSelectedCustomerPhone(null);
      setCustomerOptions([]);
      setResults([]);
    }
  }, [isOpen]);

  // Handle Search Debounced (Find Customers)
  useEffect(() => {
    if (selectedCustomerPhone) return; // Don't search customers if one is already selected

    const fetchCustomers = async () => {
      if (!searchTerm || searchTerm.length < 2) {
        setCustomerOptions([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/admin/orders?search=${encodeURIComponent(searchTerm)}&limit=50`
        );
        if (response.ok) {
          const data = await response.json();
          // Extract unique customers
          const customersMap = new Map();
          (data.orders || []).forEach((o: Order) => {
            const phone = o.customerPhone;
            if (phone && phone !== 'unknown' && !customersMap.has(phone)) {
              customersMap.set(phone, { name: o.customerName, phone });
            }
          });
          setCustomerOptions(Array.from(customersMap.values()));
        }
      } catch (error) {
        console.error('Search failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(fetchCustomers, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedCustomerPhone]);

  // Fetch orders when a customer is selected
  useEffect(() => {
    if (!selectedCustomerPhone) {
      setResults([]);
      return;
    }

    const fetchCustomerOrders = async () => {
      setIsSearching(true);
      try {
        // Fetch specific to this phone number
        const response = await fetch(
          `/api/admin/orders?search=${encodeURIComponent(selectedCustomerPhone)}&limit=50`
        );
        if (response.ok) {
          const data = await response.json();
          setResults(data.orders || []);
        }
      } catch (error) {
        console.error('Fetch orders failed:', error);
      } finally {
        setIsSearching(false);
      }
    };

    fetchCustomerOrders();
  }, [selectedCustomerPhone]);

  const handleSelectCustomer = (phone: string, name: string) => {
    setSearchTerm(name);
    setSelectedCustomerPhone(phone);
    setCustomerOptions([]);
  };

  const handleClearSelection = () => {
    setSelectedCustomerPhone(null);
    setSearchTerm('');
    setResults([]);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex flex-col justify-start items-center bg-slate-900/40 backdrop-blur-sm p-4 pt-[10vh] overflow-y-auto'>
      {/* Click outside to close */}
      <div className='absolute inset-0 z-0' onClick={onClose} />

      <div className='relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200'>
        {/* Banner Header */}
        <div className='bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex flex-col gap-4'>
          <div className='flex justify-between items-center'>
            <h2 className='text-2xl font-black text-white flex items-center gap-2'>
              <Search className='w-6 h-6 text-white/80' />
              البحث السريع للطلبات
            </h2>
            <button
              onClick={onClose}
              className='w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          <div className='relative'>
            <div className='absolute inset-y-0 right-0 pl-3 flex items-center pr-4 pointer-events-none'>
              <Search className='h-6 w-6 text-indigo-300' />
            </div>
            <input
              ref={inputRef}
              type='text'
              value={searchTerm}
              onChange={e => {
                setSelectedCustomerPhone(null);
                setSearchTerm(e.target.value);
              }}
              placeholder='ابحث بالاسم، رقم الموبايل، أو رقم الطلب...'
              className='block w-full pr-12 pl-12 py-4 border-0 rounded-2xl text-lg text-slate-900 placeholder-slate-400 focus:ring-4 focus:ring-white/20 bg-white/95 backdrop-blur-sm shadow-inner transition-all font-bold outline-none'
            />
            {selectedCustomerPhone && (
              <button
                onClick={handleClearSelection}
                className='absolute inset-y-0 left-0 pl-4 flex items-center'
              >
                <X className='h-6 w-6 text-slate-400 hover:text-rose-500 transition-colors' />
              </button>
            )}
            {isSearching && !selectedCustomerPhone && (
              <div className='absolute inset-y-0 left-0 pl-4 flex items-center'>
                <Loader2 className='h-6 w-6 text-indigo-500 animate-spin' />
              </div>
            )}

            {/* Autocomplete Dropdown */}
            {customerOptions.length > 0 && !selectedCustomerPhone && (
              <ul className='absolute z-50 w-full bg-white mt-2 rounded-xl shadow-xl max-h-60 overflow-auto border border-slate-100 py-2'>
                {customerOptions.map((c, i) => (
                  <li
                    key={i}
                    onClick={() => handleSelectCustomer(c.phone, c.name)}
                    className='px-4 py-3 hover:bg-indigo-50 cursor-pointer flex items-center justify-between border-b border-slate-50 last:border-0 transition-colors'
                  >
                    <div className='font-bold text-slate-800 flex items-center gap-2'>
                      <span className='w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm'>
                        👤
                      </span>
                      {c.name}
                    </div>
                    <div className='text-sm text-slate-500 font-medium' dir='ltr'>
                      {c.phone}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Results Area */}
        <div className='p-2 sm:p-6 bg-slate-50 min-h-[300px] max-h-[60vh] overflow-y-auto'>
          {!selectedCustomerPhone ? (
            <div className='h-full flex flex-col items-center justify-center text-slate-400 py-12'>
              <Search className='w-16 h-16 mb-4 opacity-20' />
              <p className='text-lg font-bold'>يرجى البحث واختيار عميل من القائمة المنسدلة</p>
              <p className='text-sm'>سيتم عرض جميع طلبات العميل لتعديل حالتها مباشرة</p>
            </div>
          ) : results.length === 0 && !isSearching ? (
            <div className='h-full flex flex-col items-center justify-center text-slate-400 py-12'>
              <AlertCircle className='w-16 h-16 mb-4 opacity-20 text-rose-500' />
              <p className='text-lg font-bold text-slate-600'>لا يوجد طلبات لهذا العميل</p>
            </div>
          ) : (
            <div className='space-y-4'>
              {results.map(order => {
                const currentStatus =
                  STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] ||
                  STATUS_CONFIG.waiting_confirmation;

                return (
                  <div
                    key={order.id}
                    className='bg-white rounded-2xl border border-slate-200/60 p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow'
                  >
                    <div className='flex flex-col xl:flex-row xl:items-center justify-between gap-6'>
                      {/* Order Info */}
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-3 mb-2'>
                          <span className='px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-mono font-bold tracking-wider'>
                            #{order.id.slice(-6)}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${currentStatus.class}`}
                          >
                            {currentStatus.icon} {currentStatus.text}
                          </span>
                          <span className='text-xs text-slate-400 font-bold flex items-center gap-1'>
                            <Calendar className='w-3.5 h-3.5' />
                            {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                              dateStyle: 'medium',
                            })}
                          </span>
                        </div>

                        <h3 className='text-xl font-black text-slate-800 mb-1 flex items-center gap-2'>
                          {order.customerName}
                          {order.customerFollowUp && (
                            <span className='bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold'>
                              تابع
                            </span>
                          )}
                        </h3>

                        <div className='flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500 font-medium mt-2'>
                          <div className='flex items-center gap-1.5'>
                            <Phone className='w-4 h-4 text-emerald-500' />
                            <span dir='ltr'>{order.customerPhone}</span>
                          </div>
                          <div className='flex items-center gap-1.5'>
                            <Package className='w-4 h-4 text-indigo-500' />
                            <span className='truncate max-w-[200px] sm:max-w-xs text-indigo-900 font-bold'>
                              {order.service?.name || 'خدمة غير محددة'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions Panel */}
                      <div className='flex shrink-0 items-center bg-slate-50 rounded-xl p-2 border border-slate-100 gap-2 overflow-x-auto pb-1 sm:pb-2'>
                        {updatingId === order.id ? (
                          <div className='flex items-center justify-center gap-2 px-6 py-2 text-indigo-600 font-bold min-w-[200px]'>
                            <Loader2 className='w-5 h-5 animate-spin' />
                            جاري التحديث...
                          </div>
                        ) : (
                          <>
                            {/* Smart Buttons Based on Status */}
                            {order.status === 'waiting_confirmation' && (
                              <button
                                onClick={() => onStatusChange(order, 'processing')}
                                className='whitespace-nowrap px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold rounded-lg transition-colors flex items-center gap-1.5'
                              >
                                <Clock className='w-4 h-4' />
                                قيد التنفيذ
                              </button>
                            )}

                            {(order.status === 'processing' ||
                              order.status === 'waiting_confirmation') && (
                              <button
                                onClick={() => onStatusChange(order, 'ready_for_pickup')}
                                className='whitespace-nowrap px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 font-bold rounded-lg transition-colors flex items-center gap-1.5'
                              >
                                <CheckCircle2 className='w-4 h-4' />
                                جاهز للتسليم
                              </button>
                            )}

                            {order.status === 'ready_for_pickup' && (
                              <button
                                onClick={() => onStatusChange(order, 'delivered')}
                                className='whitespace-nowrap px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg shadow-md shadow-green-200 transition-colors flex items-center gap-1.5'
                              >
                                💸 تم التسليم والدفع
                              </button>
                            )}

                            {/* Dropdown for any other status */}
                            <div className='relative flex items-center min-w-[140px] px-2'>
                              <select
                                value={order.status}
                                onChange={e => onStatusChange(order, e.target.value)}
                                className='w-full bg-white border border-slate-200 text-slate-700 text-sm font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer'
                              >
                                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                                  <option key={key} value={key}>
                                    {config.icon} {config.text}
                                  </option>
                                ))}
                              </select>
                              <div className='absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none'>
                                <svg
                                  className='w-4 h-4 text-slate-400'
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
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t border-slate-100 p-4 bg-white flex justify-between items-center text-sm font-medium text-slate-500'>
          <span>يتم البحث في أحدث الطلبات تلقائياً</span>
          <button
            onClick={onClose}
            className='px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors'
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
}
