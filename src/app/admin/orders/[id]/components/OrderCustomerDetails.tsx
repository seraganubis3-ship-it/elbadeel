'use client';

import { useState } from 'react';
import { Order } from '../types';

interface OrderCustomerDetailsProps {
  order: Order;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: (fields: Partial<Order>) => void;
  updating: boolean;
}

export default function OrderCustomerDetails({
  order,
  isEditing,
  onToggleEdit,
  onSave,
  updating,
}: OrderCustomerDetailsProps) {
  const [formData, setFormData] = useState<{
    customerName: string;
    idNumber: string;
    birthDate: string;
    customerPhone: string;
    additionalPhone: string;
    profession: string;
  }>({
    customerName: order.customerName || '',
    idNumber: order.idNumber || '',
    birthDate: order.birthDate ? new Date(order.birthDate).toISOString().split('T')[0] || '' : '',
    customerPhone: order.customerPhone || '',
    additionalPhone: order.additionalPhone || '',
    profession: order.profession || '',
  });

  const handleSave = () => {
    onSave(formData as Partial<Order>);
  };

  return (
    <div className='group relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 p-8 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(59,130,246,0.1)]'>
      {/* Decorative background element */}
      <div className='absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-700'></div>

      <div className='relative flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <div className='w-14 h-14 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200/50 group-hover:scale-110 transition-transform duration-500'>
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
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
          </div>
          <div className='mr-5'>
            <h2 className='text-2xl font-black text-slate-800 tracking-tight'>بيانات العميل</h2>
            <p className='text-slate-500 font-medium text-sm'>
              إدارة معلومات الاتصال والهوية الأساسية
            </p>
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
                className='px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-emerald-200 flex items-center gap-2'
              >
                {updating ? (
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                ) : null}
                حفظ التغييرات
              </button>
            </>
          ) : (
            <button
              onClick={onToggleEdit}
              className='p-3 bg-white/80 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all duration-300 shadow-sm border border-emerald-100/50 group/btn'
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

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 relative leading-loose'>
        {[
          {
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            label: 'الاسم الكامل',
            value: order.customerName,
            key: 'customerName',
            type: 'text',
          },
          {
            icon: 'M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2',
            label: 'الرقم القومي',
            value: order.idNumber,
            key: 'idNumber',
            type: 'text',
          },
          {
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z',
            label: 'تاريخ الميلاد',
            value: order.birthDate
              ? new Date(order.birthDate).toLocaleDateString('ar-EG')
              : 'غير محدد',
            key: 'birthDate',
            type: 'date',
          },
          {
            icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
            label: 'رقم الهاتف',
            value: order.customerPhone,
            key: 'customerPhone',
            type: 'tel',
          },
          {
            icon: 'M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z',
            label: 'رقم هاتف إضافي',
            value: order.additionalPhone,
            key: 'additionalPhone',
            type: 'tel',
          },
          {
            icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
            label: 'المهنة',
            value: order.profession,
            key: 'profession',
            type: 'text',
          },
        ].map((item, i) => (
          <div
            key={item.key}
            className='flex items-start bg-white/30 rounded-3xl p-6 border border-white/40 group/item hover:bg-white/60 transition-all duration-300'
          >
            <div className='w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center ml-4 shrink-0 group-hover/item:bg-emerald-500 group-hover/item:text-white transition-all duration-500 shadow-inner'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={item.icon} />
              </svg>
            </div>
            <div className='flex-1 min-w-0'>
              <p className='text-xs font-bold text-slate-400 mb-1 uppercase tracking-widest'>
                {item.label}
              </p>
              {isEditing ? (
                <input
                  type={item.type}
                  value={(formData as any)[item.key]}
                  onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                  className='w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-emerald-500 outline-none'
                />
              ) : (
                <p className='text-slate-700 font-black text-lg truncate group-hover/item:text-emerald-700 transition-colors'>
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
