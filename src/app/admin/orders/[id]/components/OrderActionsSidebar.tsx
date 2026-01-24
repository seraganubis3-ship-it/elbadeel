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
}: OrderActionsSidebarProps) {
  return (
    <div className='xl:col-span-1 space-y-6 text-right'>
      {/* Status Update */}
      <div className='bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6'>
        <div className='flex items-center mb-4 justify-end'>
          <h2 className='text-lg font-bold text-gray-900 mr-3'>تحديث حالة الطلب</h2>
          <div className='w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg'>
            <svg
              className='w-4 h-4 text-white'
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
        </div>
        <div className='space-y-3'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>الحالة الجديدة</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm'
            >
              {Object.entries(ORDER_STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.text}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>ملاحظات الإدارة</label>
            <textarea
              value={newAdminNotes}
              onChange={e => setNewAdminNotes(e.target.value)}
              rows={3}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm'
              placeholder='أضف ملاحظات للإدارة...'
            />
          </div>

          <button
            onClick={onUpdateOrder}
            disabled={updating}
            className='w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all duration-200 font-medium text-sm shadow-lg'
          >
            {updating ? 'جاري التحديث...' : '💾 تحديث الطلب'}
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
        <h2 className='text-xl font-bold text-gray-900 mb-4'>إجراءات سريعة</h2>
        <div className='space-y-3'>
          <button
            onClick={onCallCustomer}
            className='w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer flex items-center justify-center gap-2'
          >
            <span>📞 الاتصال بالعميل</span>
          </button>
          <button
            onClick={onWhatsAppClick}
            className='w-full px-4 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium cursor-pointer flex items-center justify-center gap-2'
          >
            <span>💬 مراسلة واتساب</span>
          </button>
        </div>
      </div>
    </div>
  );
}
