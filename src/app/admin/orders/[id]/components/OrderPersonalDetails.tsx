'use client';

import { useState } from 'react';
import { Order } from '../types';

interface OrderPersonalDetailsProps {
  order: Order;
  isEditing: boolean;
  onToggleEdit: () => void;
  onSave: (fields: Partial<Order>) => void;
  updating: boolean;
}

export default function OrderPersonalDetails({
  order,
  isEditing,
  onToggleEdit,
  onSave,
  updating,
}: OrderPersonalDetailsProps) {
  const [formData, setFormData] = useState<{
    fatherName: string;
    motherName: string;
    nationality: string;
    wifeName: string;
    wifeMotherName: string;
    marriageDate: string;
    divorceDate: string;
    deathDate: string;
  }>({
    fatherName: order.fatherName || '',
    motherName: order.motherName || '',
    nationality: order.nationality || 'EGYPTIAN',
    wifeName: order.wifeName || '',
    wifeMotherName: order.wifeMotherName || '',
    marriageDate: order.marriageDate
      ? new Date(order.marriageDate).toISOString().split('T')[0] || ''
      : '',
    divorceDate: order.divorceDate
      ? new Date(order.divorceDate).toISOString().split('T')[0] || ''
      : '',
    deathDate: order.deathDate ? new Date(order.deathDate).toISOString().split('T')[0] || '' : '',
  });

  const handleSave = () => {
    onSave(formData as Partial<Order>);
  };

  return (
    <div className='bg-white'>
      <div className='flex items-center justify-between mb-8 pb-4 border-b border-slate-50'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center'>
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
              />
            </svg>
          </div>
          <div>
            <h2 className='text-xl font-bold text-slate-800'>المعلومات الشخصية والعائلية</h2>
            <p className='text-slate-500 text-sm font-medium'>
              بيانات الأبوين، الجنسية، والحالة الاجتماعية
            </p>
          </div>
        </div>

        <button
          onClick={onToggleEdit}
          className={`px-4 py-2 rounded-xl transition-all font-bold text-sm ${
            isEditing
              ? 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              : 'bg-purple-50 text-purple-600 hover:bg-purple-100'
          }`}
        >
          {isEditing ? 'إلغاء' : 'تعديل البيانات'}
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {[
          { label: 'اسم الأب', value: order.fatherName, key: 'fatherName', type: 'text' },
          { label: 'اسم الأم', value: order.motherName, key: 'motherName', type: 'text' },
          { label: 'الجنسية', value: order.nationality, key: 'nationality', type: 'text' },
          { label: 'اسم الزوج/الزوجة', value: order.wifeName, key: 'wifeName', type: 'text' },
          {
            label: 'والدة الزوج/الزوجة',
            value: order.wifeMotherName,
            key: 'wifeMotherName',
            type: 'text',
          },
          {
            label: 'تاريخ الزواج',
            value: order.marriageDate
              ? new Date(order.marriageDate).toLocaleDateString('ar-EG', { dateStyle: 'medium' })
              : '----',
            key: 'marriageDate',
            type: 'date',
          },
          {
            label: 'تاريخ الطلاق',
            value: order.divorceDate
              ? new Date(order.divorceDate).toLocaleDateString('ar-EG', { dateStyle: 'medium' })
              : '----',
            key: 'divorceDate',
            type: 'date',
          },
          {
            label: 'تاريخ الوفاة',
            value: order.deathDate
              ? new Date(order.deathDate).toLocaleDateString('ar-EG', { dateStyle: 'medium' })
              : '----',
            key: 'deathDate',
            type: 'date',
          },
        ].map(item => (
          <div
            key={item.key}
            className='group/field p-4 bg-slate-50/30 rounded-2xl border border-slate-100'
          >
            <p className='text-base font-bold text-slate-400 uppercase tracking-wider mb-2'>
              {item.label}
            </p>
            {isEditing ? (
              <input
                type={item.type}
                value={(formData as any)[item.key]}
                onChange={e => setFormData({ ...formData, [item.key]: e.target.value })}
                className='w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-lg font-bold text-slate-800 outline-none focus:ring-2 focus:ring-purple-500'
              />
            ) : (
              <p className='text-xl font-black text-slate-900 tracking-tight group-hover/field:text-purple-600 transition-colors'>
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
            {updating && (
              <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
            )}
            حفظ البيانات
          </button>
        </div>
      )}
    </div>
  );
}
