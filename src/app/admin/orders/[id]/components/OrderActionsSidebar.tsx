'use client';

import { Order } from '../types';
import { ORDER_STATUS_CONFIG } from '@/constants/orderStatus';

interface OrderActionsSidebarProps {
  order: Order;
  newStatus: string;
  setNewStatus: (val: string) => void;
  newAdminNotes: string;
  setNewAdminNotes: (val: string) => void;
  updating: boolean;
  onUpdateOrder: () => void;
  onCallCustomer: () => void;
  onWhatsAppClick: () => void;
  onDelete?: () => void;
}

import { useState, useEffect } from 'react';

// ... (existing imports, but we need to add useState, useEffect above if not present)

interface Delegate {
  id: string;
  name: string;
}

export default function OrderActionsSidebar({
  order,
  newStatus,
  setNewStatus,
  newAdminNotes,
  setNewAdminNotes,
  updating,
  onUpdateOrder,
  onCallCustomer,
  onWhatsAppClick,
  onDelete,
}: OrderActionsSidebarProps) {
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [selectedDelegate, setSelectedDelegate] = useState('');
  const [loadingDelegates, setLoadingDelegates] = useState(false);
  const [printType, setPrintType] = useState<'passport' | 'work-permit'>('passport');

  const handlePrintClick = async () => {
    setShowDelegateModal(true);
    if (delegates.length === 0) {
      setLoadingDelegates(true);
      try {
        const res = await fetch('/api/admin/delegates');
        const data = await res.json();
        setDelegates(data.delegates);
      } catch (err) {
        // Error fetching delegates
      } finally {
        setLoadingDelegates(false);
      }
    }
  };

  const confirmPrint = () => {
    if (!selectedDelegate) return;
    const basePath =
      printType === 'passport'
        ? '/admin/print/passport-authorization'
        : '/admin/print/work-permit-authorization';
    const url = `${basePath}?orderId=${order.id}&delegateId=${selectedDelegate}`;
    window.open(url, '_blank');
    setShowDelegateModal(false);
  };

  return (
    <div className='w-full space-y-4 sm:space-y-6'>
      {/* Status Update */}
      <div className='bg-white/70 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-white/20 p-4 sm:p-6'>
        <div className='flex items-center mb-4 sm:mb-6 justify-between sm:justify-end gap-3'>
          <div className='w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg shrink-0'>
            <svg
              className='w-4 h-4 sm:w-5 sm:h-5 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
              />
            </svg>
          </div>
          <h2 className='text-base sm:text-xl font-black text-gray-900'>تحديث حالة الطلب</h2>
        </div>
        <div className='space-y-4'>
          <div>
            <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5'>
              الحالة الجديدة
            </label>
            <select
              value={newStatus}
              onChange={e => {
                if (e.target.value === 'delete_order') {
                  onDelete?.();
                } else {
                  setNewStatus(e.target.value);
                }
              }}
              className='w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-gray-900 text-sm sm:text-base font-bold transition-all bg-white'
            >
              {Object.entries(ORDER_STATUS_CONFIG)
                .filter(([key]) => {
                  // Hide specific statuses for office orders
                  if (order.createdByAdmin) {
                    const hiddenForOffice = ['waiting_confirmation', 'waiting_payment'];
                    if (hiddenForOffice.includes(key)) return false;
                  }

                  return true;
                })
                .map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.text}
                  </option>
                ))}
              <option value='delete_order' className='text-red-600 font-bold'>
                ❌ إلغاء نهائي (حذف)
              </option>
            </select>
          </div>

          <div>
            <label className='block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5'>
              ملاحظات الإدارة
            </label>
            <textarea
              value={newAdminNotes}
              onChange={e => setNewAdminNotes(e.target.value)}
              rows={3}
              className='w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm sm:text-base transition-all bg-white resize-none'
              placeholder='أضف ملاحظات للإدارة...'
            />
          </div>

          <button
            onClick={onUpdateOrder}
            disabled={updating}
            className='w-full px-4 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition-all duration-300 font-black text-sm sm:text-base shadow-lg shadow-blue-100 flex items-center justify-center gap-2 transform active:scale-[0.98]'
          >
            {updating ? (
              <span className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></span>
            ) : (
              '💾 حفـــظ التـحـديثـات'
            )}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/50 p-4 sm:p-6 border border-slate-100'>
        <h2 className='text-sm sm:text-lg font-black text-gray-400 uppercase tracking-widest mb-4 sm:mb-6 text-center sm:text-right'>
          بيانات التواصل
        </h2>
        <div className='space-y-3 sm:space-y-4'>
          <button
            onClick={onCallCustomer}
            className='w-full px-4 sm:px-6 py-3 sm:py-4 bg-green-500 text-white rounded-xl sm:rounded-2xl hover:bg-green-600 transition-all font-black flex items-center justify-center gap-3 shadow-lg shadow-green-100 transform active:scale-[0.98] text-sm sm:text-base'
          >
            <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z' />
            </svg>
            الاتصال بالعميل
          </button>
          <button
            onClick={onWhatsAppClick}
            className='w-full px-4 sm:px-6 py-3 sm:py-4 bg-emerald-50 text-emerald-600 border-2 border-emerald-100 rounded-xl sm:rounded-2xl hover:bg-emerald-100 transition-all font-black flex items-center justify-center gap-3 transform active:scale-[0.98] text-sm sm:text-base'
          >
            <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
            </svg>
            مراسلة واتساب
          </button>

          {/* Print Authorization Button */}
          <button
            onClick={handlePrintClick}
            className='w-full px-4 sm:px-6 py-3 sm:py-4 bg-slate-800 text-white rounded-xl sm:rounded-2xl hover:bg-black transition-all font-black flex items-center justify-center gap-3 shadow-lg shadow-slate-200 transform active:scale-[0.98] text-sm sm:text-base'
          >
            <svg className='w-4 h-4 sm:w-5 sm:h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' />
            </svg>
            طباعة تفويض
          </button>
        </div>
      </div>

      {/* Delegate Selection Modal */}
      {showDelegateModal && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4 sm:p-6'>
          <div className='bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden'>
            <div className='p-6 sm:p-8'>
              <div className='w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 text-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6'>
                <svg className='w-6 h-6 sm:w-8 sm:h-8' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
                </svg>
              </div>
              <h3 className='text-xl sm:text-2xl font-black text-slate-900 mb-2 text-center'>اختيار المندوب</h3>
              <p className='text-xs sm:text-sm text-slate-500 text-center mb-6 sm:mb-8 font-bold'>يرجى تحديد المندوب ونوع التفويض للمتابعة</p>

              {loadingDelegates ? (
                <div className='flex flex-col items-center justify-center py-8 gap-3'>
                  <div className='w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin'></div>
                  <p className='text-slate-500 font-bold animate-pulse'>جاري جلب قائمة المناديب...</p>
                </div>
              ) : (
                <div className='space-y-6'>
                  {/* Print Type Selection */}
                  <div className='space-y-3'>
                    <label className='text-xs font-black text-slate-400 uppercase tracking-widest'>نوع التفويض</label>
                    <div className='grid grid-cols-2 gap-2 sm:gap-3'>
                      <button
                        onClick={() => setPrintType('passport')}
                        className={`py-3 px-4 rounded-xl font-black text-sm sm:text-base transition-all ${
                          printType === 'passport'
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        جواز سفر
                      </button>
                      <button
                        onClick={() => setPrintType('work-permit')}
                        className={`py-3 px-4 rounded-xl font-black text-sm sm:text-base transition-all ${
                          printType === 'work-permit'
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
                            : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100'
                        }`}
                      >
                        تصريح عمل
                      </button>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <label className='text-xs font-black text-slate-400 uppercase tracking-widest'>
                      اختر المندوب من القائمة
                    </label>
                    <select
                      value={selectedDelegate}
                      onChange={e => setSelectedDelegate(e.target.value)}
                      className='w-full px-4 py-3 sm:py-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl font-black text-sm sm:text-base focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none transition-all appearance-none cursor-pointer'
                    >
                      <option value=''>-- اختر المندوب --</option>
                      {delegates.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='flex flex-col sm:flex-row gap-3 pt-4'>
                    <button
                      onClick={confirmPrint}
                      disabled={!selectedDelegate}
                      className='order-1 sm:order-2 flex-1 py-3 sm:py-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl font-black hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-slate-200 transition-all transform active:scale-[0.98]'
                    >
                      طباعة التفويض
                    </button>
                    <button
                      onClick={() => setShowDelegateModal(false)}
                      className='order-2 sm:order-1 flex-1 py-3 sm:py-4 bg-slate-50 text-slate-600 rounded-xl sm:rounded-2xl font-black hover:bg-slate-100 border border-slate-100 transition-all transform active:scale-[0.98]'
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
