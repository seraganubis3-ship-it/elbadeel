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
    title: order.title || '',
    destination: order.destination || '',
  });

  const handleSave = () => {
    onSave(formData);
  };

  const fields = [
    {
      label: 'نوع العميل',
      value: order.customerType === 'INDIVIDUAL' ? 'فرد' : order.customerType === 'COMPANY' ? 'شركة' : order.customerType === 'GOVERNMENT' ? 'حكومي' : 'غير محدد',
      key: 'customerType',
      type: 'select',
      options: [
        { v: 'INDIVIDUAL', l: 'فرد' },
        { v: 'COMPANY', l: 'شركة' },
        { v: 'GOVERNMENT', l: 'حكومي' },
      ],
    },
    {
      label: 'طريقة المتابعة',
      value: order.customerFollowUp === 'DIRECT' ? 'مباشر' : order.customerFollowUp === 'AGENT' ? 'وكيل' : order.customerFollowUp === 'LAWYER' ? 'محامي' : 'غير محدد',
      key: 'customerFollowUp',
      type: 'select',
      options: [
        { v: 'DIRECT', l: 'مباشر' },
        { v: 'AGENT', l: 'وكيل' },
        { v: 'LAWYER', l: 'محامي' },
      ],
    },
    {
      label: 'المهلة / فترة السماح',
      value: order.gracePeriod,
      key: 'gracePeriod',
      type: 'text',
    },
    {
      label: 'الصفة (اللقب)',
      value: order.title,
      key: 'title',
      type: 'text',
      placeholder: 'أستاذ، دكتور، الخ...',
    },
    {
      label: 'الجهة',
      value: order.destination,
      key: 'destination',
      type: 'text',
    },
  ];

  return (
    <div className='group relative overflow-hidden bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 p-8 transition-all duration-300'>
      <div className='relative flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <div className='w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50'>
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
            <h2 className='text-3xl font-black text-slate-800 tracking-tight'>التصنيف والمتابعة</h2>
            <p className='text-slate-500 font-bold text-lg'>توصيف العميل ونوع العلاقة والبيانات الإضافية</p>
          </div>
        </div>

        <div className='flex gap-2'>
          {isEditing ? (
            <>
              <button
                onClick={onToggleEdit}
                disabled={updating}
                className='px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all font-bold text-base'
              >
                إلغاء
              </button>
              <button
                onClick={handleSave}
                disabled={updating}
                className='px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-all font-bold text-base shadow-lg shadow-indigo-200 flex items-center gap-2'
              >
                {updating && (
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                )}
                حفظ التغييرات
              </button>
            </>
          ) : (
            <button
              onClick={onToggleEdit}
              className='px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl transition-all font-bold text-base border border-indigo-100'
            >
              تعديل التصنيف
            </button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
        {fields.map((item) => (
          <div
            key={item.key}
            className='p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300'
          >
            <p className='text-base font-bold text-slate-400 mb-3 uppercase tracking-wider'>
              {item.label}
            </p>
            {isEditing ? (
              item.type === 'select' ? (
                <select
                  value={(formData as any)[item.key]}
                  onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                  className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500'
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
                  type={item.type}
                  value={(formData as any)[item.key]}
                  onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                  placeholder={(item as any).placeholder}
                  className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500'
                />
              )
            ) : (
              <p className='text-2xl font-black text-slate-900 tracking-tight'>
                {item.value || '----'}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
