'use client';

import { useState } from 'react';
import { Order } from '../types';

interface OrderAddressDetailsProps {
  order: Order;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: (fields: Partial<Order>) => void;
  updating: boolean;
}

export default function OrderAddressDetails({
  order,
  isEditing,
  onToggleEdit,
  onSave,
  updating,
}: OrderAddressDetailsProps) {
  const [formData, setFormData] = useState<{
    governorate: string;
    city: string;
    district: string;
    street: string;
    buildingNumber: string;
    apartmentNumber: string;
    landmark: string;
  }>({
    governorate: order.governorate || '',
    city: order.city || '',
    district: order.district || '',
    street: order.street || '',
    buildingNumber: order.buildingNumber || '',
    apartmentNumber: order.apartmentNumber || '',
    landmark: order.landmark || '',
  });

  const handleSave = () => {
    onSave(formData as Partial<Order>);
  };

  return (
    <div className='group relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 p-8 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(6,182,212,0.1)]'>
      <div className='absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-700'></div>

      <div className='relative flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <div className='w-14 h-14 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-200/50 group-hover:scale-110 transition-transform duration-500'>
            <svg
              className='w-7 h-7 text-white'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          </div>
          <div className='mr-5'>
            <h2 className='text-2xl font-black text-slate-800 tracking-tight'>العنوان التفصيلي</h2>
            <p className='text-slate-500 font-medium text-sm'>إدارة الموقع الجغرافي المسجل للطلب</p>
          </div>
        </div>

        <div className='flex gap-2'>
          {isEditing ? (
            <>
              <button
                onClick={onToggleEdit}
                disabled={updating}
                className='px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-bold text-sm'
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={updating}
                className='px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-cyan-200 flex items-center gap-2'
              >
                {updating && (
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                )}
                حفظ التغييرات
              </button>
            </>
          ) : (
            <button
              onClick={onToggleEdit}
              className='p-3 bg-white/80 hover:bg-cyan-50 text-cyan-600 rounded-xl transition-all duration-300 shadow-sm border border-cyan-100/50 group/btn'
            >
              <svg
                className='w-5 h-5 group-hover/btn:rotate-12 transition-transform'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 leading-loose'>
        {[
          {
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5',
            label: 'المحافظة',
            value: order.governorate,
            key: 'governorate',
            type: 'text',
          },
          {
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            label: 'المدينة',
            value: order.city,
            key: 'city',
            type: 'text',
          },
          {
            icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
            label: 'الحي/المنطقة',
            value: order.district,
            key: 'district',
            type: 'text',
          },
          {
            icon: 'M9 20l-5.447-2.724A2 2 0 013 15.382V6a2 2 0 011.553-1.943l7-2a2 2 0 011.894 0l7 2A2 2 0 0121 6v9.382a2 2 0 01-1.553 1.894L14 20l-2.5-.5',
            label: 'الشارع',
            value: order.street,
            key: 'street',
            type: 'text',
          },
          {
            icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5',
            label: 'رقم المبنى',
            value: order.buildingNumber,
            key: 'buildingNumber',
            type: 'text',
          },
          {
            icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
            label: 'رقم الشقة',
            value: order.apartmentNumber,
            key: 'apartmentNumber',
            type: 'text',
          },
          {
            icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
            label: 'المعلم المميز',
            value: order.landmark,
            key: 'landmark',
            type: 'text',
          },
        ].map((item, i) => (
          <div
            key={item.key}
            className='flex items-start bg-white/30 rounded-3xl p-5 border border-white/40 group/item hover:bg-white/60 transition-all duration-300'
          >
            <div className='w-10 h-10 bg-cyan-50 text-cyan-500 rounded-xl flex items-center justify-center ml-4 shrink-0 group-hover/item:bg-cyan-500 group-hover/item:text-white transition-all duration-500 shadow-inner'>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={item.icon} />
              </svg>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest'>
                {item.label}
              </p>
              {isEditing ? (
                <input
                  type={item.type}
                  value={(formData as any)[item.key]}
                  onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                  className='w-full bg-white/80 border border-slate-200 rounded-lg px-2 py-1 text-slate-800 font-bold focus:ring-2 focus:ring-cyan-500 outline-none text-sm'
                />
              ) : (
                <p className='text-slate-700 font-black text-base truncate group-hover/item:text-cyan-700 transition-colors'>
                  {item.value || '----'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
