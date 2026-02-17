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
    <div className='bg-white'>
      <div className='flex items-center justify-between mb-8 pb-4 border-b border-slate-50'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-cyan-50 text-cyan-600 rounded-xl flex items-center justify-center'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
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
          <div>
            <h2 className='text-xl font-bold text-slate-800'>العنوان التفصيلي</h2>
            <p className='text-slate-500 text-sm font-medium'>
              مكان الإقامة والبيانات الجغرافية للتسليم
            </p>
          </div>
        </div>

        <button
          onClick={onToggleEdit}
          className={`px-4 py-2 rounded-xl transition-all font-bold text-sm ${
            isEditing
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              : 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100'
          }`}
        >
          {isEditing ? 'إلغاء' : 'تعديل العنوان'}
        </button>
      </div>

      {!isEditing ? (
        <div className='p-8 bg-slate-50/50 border border-slate-100 rounded-2xl'>
          <div className='flex items-start gap-4'>
            <div className='mt-2 text-slate-400'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                />
              </svg>
            </div>
            <div className='flex-1'>
              <p className='text-3xl font-black text-slate-900 leading-relaxed tracking-tight'>
                {[
                  order.governorate,
                  order.city,
                  order.district,
                  order.street,
                  order.buildingNumber ? `مبنى ${order.buildingNumber}` : '',
                  order.apartmentNumber ? `شقة ${order.apartmentNumber}` : '',
                  order.landmark,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </p>
              {!order.governorate && !order.city && !order.street && (
                <p className='text-slate-400 italic text-lg'>لا توجد بيانات عنوان مسجلة</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[
              { label: 'المحافظة', value: order.governorate, key: 'governorate' },
              { label: 'المدينة', value: order.city, key: 'city' },
              { label: 'الحي/المنطقة', value: order.district, key: 'district' },
              { label: 'الشارع', value: order.street, key: 'street' },
              { label: 'رقم المبنى', value: order.buildingNumber, key: 'buildingNumber' },
              { label: 'رقم الشقة', value: order.apartmentNumber, key: 'apartmentNumber' },
              { label: 'المعلم المميز', value: order.landmark, key: 'landmark' },
            ].map(item => (
              <div
                key={item.key}
                className='group/field p-4 bg-slate-50/30 rounded-2xl border border-slate-100'
              >
                <p className='text-base font-bold text-slate-400 uppercase tracking-wider mb-2'>
                  {item.label}
                </p>
                <input
                  type='text'
                  value={(formData as any)[item.key]}
                  onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                  className='w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-cyan-500'
                />
              </div>
            ))}
          </div>

          <div className='flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100'>
            <button
              onClick={onToggleEdit}
              className='px-6 py-3 text-slate-500 font-bold text-base hover:bg-slate-50 rounded-xl transition-colors'
            >
              إلغاء التعديل
            </button>
            <button
              onClick={handleSave}
              disabled={updating}
              className='px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-bold text-base shadow-lg shadow-slate-200 flex items-center gap-2'
            >
              {updating && (
                <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
              )}
              حفظ العنوان
            </button>
          </div>
        </>
      )}
    </div>
  );
}
