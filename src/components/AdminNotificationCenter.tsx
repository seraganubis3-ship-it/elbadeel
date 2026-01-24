'use client';

import React, { useState, useEffect } from 'react';
import { AdminNotification } from '@/types/admin-notifications';

interface AdminNotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    deliveryDue: 0,
    lowStock: 0,
    total: 0,
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setCounts(data.counts);
      }
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'delivery_due':
        return (
          <svg
            className='w-5 h-5 text-red-500'
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
        );
      case 'low_stock':
        return (
          <svg
            className='w-5 h-5 text-yellow-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        );
      case 'system':
        return (
          <svg
            className='w-5 h-5 text-blue-500'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

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
    <div
      className='notification-center fixed bottom-20 right-4 z-[9998]'
      style={{ position: 'fixed' }}
    >
      {/* Panel */}
      <div className='w-96 max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 transform transition-all duration-300 ease-out'>
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 bg-white border-b border-gray-200'>
            <div className='flex items-center space-x-3'>
              <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-4 h-4 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 17h5l-5 5v-5zM4 19h6v-6H4v6zM4 5h6V1H4v4zM15 3h5l-5-5v5z'
                  />
                </svg>
              </div>
              <div>
                <h2 className='text-lg font-semibold text-gray-900'>الإشعارات</h2>
                <p className='text-gray-500 text-sm'>{notifications.length} إشعار</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors'
            >
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M6 18L18 6M6 6l12 12'
                />
              </svg>
            </button>
          </div>

          {/* Summary */}
          <div className='p-4 bg-gray-50 border-b'>
            <div className='grid grid-cols-3 gap-3'>
              <div className='text-center p-3 bg-white rounded-lg border border-red-200'>
                <div className='text-xl font-bold text-red-600'>{counts.deliveryDue}</div>
                <div className='text-xs text-gray-600'>تسليم اليوم</div>
              </div>
              <div className='text-center p-3 bg-white rounded-lg border border-yellow-200'>
                <div className='text-xl font-bold text-yellow-600'>{counts.lowStock}</div>
                <div className='text-xs text-gray-600'>مخزون ناقص</div>
              </div>
              <div className='text-center p-3 bg-white rounded-lg border border-blue-200'>
                <div className='text-xl font-bold text-blue-600'>{counts.total}</div>
                <div className='text-xs text-gray-600'>إجمالي</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='mt-3 flex gap-2'>
              <button
                onClick={() => window.open('/admin/orders?status=PENDING&delivery=today', '_blank')}
                className='flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors'
              >
                تسليم اليوم
              </button>
              <button
                onClick={() => window.open('/admin/inventory', '_blank')}
                className='flex-1 px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors'
              >
                إدارة الاستمارات
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className='flex-1 overflow-y-auto'>
            {loading ? (
              <div className='flex items-center justify-center h-full'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full text-gray-500'>
                <svg
                  className='w-12 h-12 mb-4'
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
                <p className='text-lg font-medium'>لا توجد إشعارات</p>
                <p className='text-sm text-center'>كل شيء يعمل بشكل طبيعي</p>
              </div>
            ) : (
              <div className='p-3 space-y-2 max-h-80 overflow-y-auto'>
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border-l-4 transition-all duration-200 hover:shadow-sm ${getPriorityColor(notification.priority)}`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='text-sm font-semibold text-gray-900 mb-1'>
                          {notification.title}
                        </h4>
                        <p className='text-xs text-gray-600 leading-relaxed whitespace-pre-line line-clamp-3'>
                          {notification.message}
                        </p>
                        {notification.actionUrl && notification.actionLabel && (
                          <a
                            href={notification.actionUrl}
                            className='mt-2 inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-500 transition-colors'
                          >
                            {notification.actionLabel}
                            <svg
                              className='w-3 h-3 mr-1'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14'
                              />
                            </svg>
                          </a>
                        )}
                      </div>
                      <span className='text-xs text-gray-400 ml-2 flex-shrink-0'>
                        {formatTime(notification.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='p-3 bg-white border-t'>
            <button
              onClick={fetchNotifications}
              className='w-full px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors'
            >
              تحديث الإشعارات
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotificationCenter;
