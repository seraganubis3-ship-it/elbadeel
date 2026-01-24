'use client';

import { useState } from 'react';
import { Order } from '../types';

interface OrderFollowUpDetailsProps {
  order: Order;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: (fields: Partial<Order>) => void;
  updating: boolean;
}

export default function OrderFollowUpDetails({
  order,
  isEditing,
  onToggleEdit,
  onSave,
  updating,
}: OrderFollowUpDetailsProps) {
  const [formData, setFormData] = useState({
    customerType: order.customerType || '',
    customerFollowUp: order.customerFollowUp || '',
    gracePeriod: order.gracePeriod || '',
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className='group relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 p-8 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(20,184,166,0.1)]'>
      <div className='absolute top-0 left-0 -ml-16 -mt-16 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl group-hover:bg-teal-500/20 transition-all duration-700'></div>

      <div className='relative flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <div className='w-14 h-14 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-200/50 group-hover:scale-110 transition-transform duration-500'>
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
                d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
              />
            </svg>
          </div>
          <div className='mr-5'>
            <h2 className='text-2xl font-black text-slate-800 tracking-tight'>التصنيف والمتابعة</h2>
            <p className='text-slate-500 font-medium text-sm'>توصيف العميل ونوع العلاقة</p>
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
                className='px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-teal-200 flex items-center gap-2'
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
              className='p-3 bg-white/80 hover:bg-teal-50 text-teal-600 rounded-xl transition-all duration-300 shadow-sm border border-teal-100/50 group/btn'
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

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {[
          {
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            label: 'نوع العميل',
            value:
              order.customerType === 'INDIVIDUAL'
                ? 'فرد'
                : order.customerType === 'COMPANY'
                  ? 'شركة'
                  : 'غير محدد',
            key: 'customerType',
            type: 'select',
            options: [
              { v: 'INDIVIDUAL', l: 'فرد' },
              { v: 'COMPANY', l: 'شركة' },
              { v: 'GOVERNMENT', l: 'حكومي' },
            ],
          },
          {
            icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
            label: 'طريقة المتابعة',
            value:
              order.customerFollowUp === 'DIRECT'
                ? 'مباشر'
                : order.customerFollowUp === 'AGENT'
                  ? 'وكيل'
                  : 'غير محدد',
            key: 'customerFollowUp',
            type: 'select',
            options: [
              { v: 'DIRECT', l: 'مباشر' },
              { v: 'AGENT', l: 'وكيل' },
              { v: 'LAWYER', l: 'محامي' },
            ],
          },
          {
            icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
            label: 'المهلة',
            value: order.gracePeriod,
            key: 'gracePeriod',
            type: 'text',
          },
        ].map((item, i) => (
          <div
            key={item.key}
            className='p-6 bg-white/30 rounded-3xl border border-white/40 text-center hover:bg-white/60 transition-all duration-300'
          >
            <div className='w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner'>
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d={item.icon} />
              </svg>
            </div>
            <p className='text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest leading-none'>
              {item.label}
            </p>
            {isEditing ? (
              item.type === 'select' ? (
                <select
                  value={(formData as any)[item.key]}
                  onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                  className='w-full bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-800 font-bold outline-none ring-teal-500 focus:ring-2'
                >
                  <option value=''>غير محدد</option>
                  {item.options?.map(opt => (
                    <option key={opt.v} value={opt.v}>
                      {opt.l}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type='text'
                  value={(formData as any)[item.key]}
                  onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                  className='w-full bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-800 font-bold outline-none ring-teal-500 focus:ring-2'
                />
              )
            ) : (
              <p className='text-xl font-black text-slate-800 tracking-tight'>
                {item.value || '----'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
