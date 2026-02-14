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
    <div className='bg-white'>
      <div className='flex items-center justify-between mb-8 pb-4 border-b border-slate-50'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center'>
            <svg
              className='w-5 h-5'
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
          <div>
            <h2 className='text-xl font-bold text-slate-800'>معلومات العميل الأساسية</h2>
            <p className='text-slate-500 text-sm font-medium'>بيانات التواصل والتحقق الشخصي</p>
          </div>
        </div>

        <button
          onClick={onToggleEdit}
          className={`px-4 py-2 rounded-xl transition-all font-bold text-sm ${
            isEditing ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
          }`}
        >
          {isEditing ? 'إلغاء' : 'تعديل البيانات'}
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {[
          { label: 'الاسم الكامل', value: order.customerName, key: 'customerName', type: 'text' },
          { label: 'الرقم القومي', value: order.idNumber, key: 'idNumber', type: 'text' },
          { 
            label: 'تاريخ الميلاد', 
            value: order.birthDate ? new Date(order.birthDate).toLocaleDateString('ar-EG', { dateStyle: 'medium' }) : '----', 
            key: 'birthDate', 
            type: 'date' 
          },
          { label: 'رقم الهاتف', value: order.customerPhone, key: 'customerPhone', type: 'tel' },
          { label: 'رقم هاتف إضافي', value: order.additionalPhone, key: 'additionalPhone', type: 'tel' },
          { label: 'المهنة', value: order.profession, key: 'profession', type: 'text' },
        ].map((item) => (
          <div key={item.key} className='group/field p-4 bg-slate-50/30 rounded-2xl border border-slate-100'>
            <p className='text-base font-bold text-slate-400 uppercase tracking-wider mb-2'>{item.label}</p>
            {isEditing ? (
              <input
                type={item.type}
                value={(formData as any)[item.key]}
                onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-black text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500'
              />
            ) : (
              <p className='text-2xl font-black text-slate-900 tracking-tight group-hover/field:text-indigo-600 transition-colors'>
                {item.value || '----'}
              </p>
            )}
          </div>
        ))}
      </div>

      {isEditing && (
        <div className='flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100'>
          <button
            onClick={onToggleEdit}
            className='px-6 py-3 text-slate-500 font-bold text-base hover:bg-slate-50 rounded-xl transition-colors'
          >
            تجاهل التعديلات
          </button>
          <button
            onClick={handleSave}
            disabled={updating}
            className='px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-all font-bold text-base shadow-lg shadow-slate-200 flex items-center gap-2'
          >
            {updating && <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>}
            حفظ البيانات
          </button>
        </div>
      )}
    </div>
  );
}
