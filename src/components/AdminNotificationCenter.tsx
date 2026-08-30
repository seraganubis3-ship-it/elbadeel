'use client';

import React, { useEffect, useState } from 'react';
import { AdminNotification } from '@/types/admin-notifications';

interface AdminNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/notifications', { cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        setNewOrdersCount(data.counts?.newOrders || 0);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  const formatTime = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    return new Date(timestamp).toLocaleDateString('ar-EG');
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[9998] print:hidden' dir='rtl'>
      <button
        type='button'
        className='absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]'
        onClick={onClose}
        aria-label='إغلاق الإشعارات'
      />

      <aside className='absolute left-3 right-3 top-20 sm:left-6 sm:right-auto sm:w-[430px] max-h-[calc(100vh-7rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl'>
        <div className='bg-gradient-to-br from-slate-900 to-emerald-900 px-5 py-4 text-white'>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20'>
                <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9'
                  />
                </svg>
              </div>
              <div>
                <h2 className='text-base font-black'>إشعارات الطلبات الأونلاين</h2>
                <p className='text-xs font-medium text-emerald-100'>طلبات آخر 5 أيام قيد المراجعة</p>
              </div>
            </div>

            <button
              type='button'
              onClick={onClose}
              className='rounded-xl p-2 text-white/70 transition-colors hover:bg-white/15 hover:text-white'
              aria-label='إغلاق'
            >
              <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </button>
          </div>

          <div className='mt-4 rounded-xl bg-white/10 p-3 ring-1 ring-white/15'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-bold text-emerald-50'>طلبات تحتاج مراجعة</span>
              <span className='rounded-lg bg-white px-3 py-1 text-lg font-black text-emerald-700'>
                {newOrdersCount}
              </span>
            </div>
          </div>
        </div>

        <div className='max-h-[420px] overflow-y-auto bg-slate-50/70 p-3'>
          {loading ? (
            <div className='flex min-h-[220px] items-center justify-center'>
              <div className='h-9 w-9 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent' />
            </div>
          ) : notifications.length === 0 ? (
            <div className='flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center'>
              <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600'>
                <svg className='h-7 w-7' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </div>
              <p className='text-base font-black text-slate-900'>لا توجد طلبات أونلاين قيد المراجعة</p>
              <p className='mt-1 text-sm text-slate-500'>أي طلب جديد سيظهر هنا تلقائيًا.</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {notifications.map(notification => (
                <a
                  key={notification.id}
                  href={notification.actionUrl || '/admin/orders?status=waiting_confirmation'}
                  className='group block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg'
                >
                  <div className='flex items-start gap-3'>
                    <div className='mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100'>
                      <svg className='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                      </svg>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-3'>
                        <h3 className='text-sm font-black text-slate-900'>{notification.title}</h3>
                        <span className='shrink-0 text-xs font-bold text-slate-400'>
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className='mt-1 whitespace-pre-line text-sm leading-6 text-slate-600'>
                        {notification.message}
                      </p>
                      <span className='mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-700 transition-colors group-hover:bg-emerald-600 group-hover:text-white'>
                        مراجعة الطلب
                        <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                          <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                        </svg>
                      </span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        <div className='border-t border-slate-200 bg-white p-3'>
          <button
            type='button'
            onClick={fetchNotifications}
            className='w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-black text-white transition-colors hover:bg-slate-800'
          >
            تحديث الإشعارات
          </button>
        </div>
      </aside>
    </div>
  );
};

export default AdminNotificationCenter;