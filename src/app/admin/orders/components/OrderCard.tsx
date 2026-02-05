'use client';

import Link from 'next/link';
import { Order, STATUS_CONFIG, StatusKey, getDeliveryInfo } from '../types';
import { PREDEFINED_FINES } from '@/constants/fines';

interface OrderCardProps {
  order: Order;
  isSelected: boolean;
  isUpdating: boolean;
  onSelect: (orderId: string) => void;
  onStatusChange: (orderId: string, status: string) => void;
  onWhatsAppClick: (order: Order) => void;
}

export function OrderCard({
  order,
  isSelected,
  isUpdating,
  onSelect,
  onStatusChange,
  onWhatsAppClick,
}: OrderCardProps) {
  const statusConfig =
    STATUS_CONFIG[order.status as StatusKey] || STATUS_CONFIG.waiting_confirmation;
  const deliveryInfo = getDeliveryInfo(order);
  const phone =
    order.customerPhone && order.customerPhone !== 'unknown'
      ? order.customerPhone
      : order.user?.phone || 'غير محدد';

  return (
    <div
      className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border-r-4 overflow-hidden ${
        isSelected ? 'ring-2 ring-blue-500 border-r-blue-500' : 'border-r-gray-200'
      }`}
    >
      {/* Card Header */}
      <div className='p-4 bg-gradient-to-l from-gray-50 to-white border-b border-gray-100'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            {/* Checkbox */}
            <input
              type='checkbox'
              checked={isSelected}
              onChange={() => onSelect(order.id)}
              className='w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500'
            />

            {/* Order ID Badge */}
            <div className='flex items-center gap-2'>
              <span className='px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-mono font-bold'>
                #{order.id.slice(-6)}
              </span>
              {order.createdByAdmin && (
                <span className='px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium'>
                  🏢 مكتب
                </span>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.class}`}>
            {statusConfig.icon} {statusConfig.text}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className='p-4'>
        {/* Service Info */}
        <div className='mb-4'>
          <h3 className='font-bold text-gray-900 text-lg mb-1'>
            {order.service?.name || 'خدمة غير محددة'}
          </h3>
          <p className='text-sm text-gray-500'>{order.variant?.name || 'نوع غير محدد'}</p>
        </div>

        {order.serviceDetails && (
          <div className='mb-4 p-3 bg-purple-50/50 border border-purple-100 rounded-xl'>
            <div className='flex items-center gap-2 mb-1.5'>
              <span className='text-[10px] bg-purple-600 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tighter'>
                إجابات
              </span>
            </div>
            <p className='text-[11px] text-purple-900 font-bold whitespace-pre-wrap leading-relaxed opacity-80 max-h-40 overflow-y-auto custom-scrollbar'>
              {order.serviceDetails}
            </p>
          </div>
        )}

        {/* Fines Badge */}
        {(order.selectedFines || order.finesDetails) && (
          <div className='mb-4 p-3 bg-rose-50/50 border border-rose-100 rounded-xl'>
            <div className='flex items-center gap-2 mb-1.5'>
               <span className='text-[10px] bg-rose-600 text-white px-1.5 py-0.5 rounded uppercase font-black tracking-tighter'>
                  غرامات
               </span>
            </div>
            {order.selectedFines && (() => {
               try {
                  const fIds = JSON.parse(order.selectedFines) as string[];
                  const fines = fIds.map(id => PREDEFINED_FINES.find(f => f.id === id)).filter(Boolean);
                  if (fines.length === 0) return null;
                  return (
                     <div className="flex flex-wrap gap-1 mb-2">
                        {fines.map(f => (
                           <span key={f!.id} className="text-[10px] bg-white border border-rose-200 text-rose-700 px-1.5 py-0.5 rounded-md font-bold">
                              {f!.name}
                           </span>
                        ))}
                     </div>
                  );
               } catch (e) { return null; }
            })()}
            {order.finesDetails && (
               <p className='text-[11px] text-rose-900 font-bold whitespace-pre-wrap leading-relaxed opacity-80'>
                  {order.finesDetails.startsWith('"') ? JSON.parse(order.finesDetails) : order.finesDetails}
               </p>
            )}
          </div>
        )}

        {/* Customer Info Grid */}
        <div className='grid grid-cols-2 gap-3 mb-4'>
          <div className='flex items-center gap-2 text-sm'>
            <span className='text-gray-400'>👤</span>
            <span className='text-gray-700 truncate'>
              {order.customerName}
              {order.customerFollowUp && (
                <span className='bg-blue-100 text-blue-700 text-[10px] px-1.5 py-0.5 rounded mx-2 font-bold inline-block'>
                  تابع
                </span>
              )}
            </span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <span className='text-gray-400'>📱</span>
            <span className='text-gray-700 truncate' dir='ltr'>
              {phone}
            </span>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <span className='text-gray-400'>📅</span>
            <span className='text-gray-700'>
              {new Date(order.createdAt).toLocaleDateString('ar-EG')}
            </span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className={`flex items-center gap-2 text-sm mb-4 ${deliveryInfo.color}`}>
          <span>{order.deliveryType === 'OFFICE' ? '🏢' : '🚚'}</span>
          <span>{deliveryInfo.type}</span>
          <span className='text-gray-400'>•</span>
          <span>{deliveryInfo.fee}</span>
        </div>

        {/* Quick Status Change */}
        <div className='mb-4'>
          <select
            value={order.status}
            onChange={e => onStatusChange(order.id, e.target.value)}
            disabled={isUpdating}
            className='w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50'
          >
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <option key={key} value={key}>
                {config.icon} {config.text}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className='flex gap-2'>
          <Link
            href={`/admin/orders/${order.id}`}
            className='flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
              />
            </svg>
            التفاصيل
          </Link>
          <button
            onClick={() => onWhatsAppClick(order)}
            className='flex items-center justify-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors text-sm font-medium'
          >
            <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
