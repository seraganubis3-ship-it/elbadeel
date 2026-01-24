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
    <div className='group relative overflow-hidden bg-white/40 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white/60 p-8 transition-all duration-500 hover:shadow-[0_20px_60px_rgba(99,102,241,0.1)]'>
      <div className='absolute top-0 left-0 -ml-16 -mt-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700'></div>

      <div className='relative flex items-center justify-between mb-10'>
        <div className='flex items-center'>
          <div className='w-14 h-14 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50 group-hover:scale-110 transition-transform duration-500'>
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
                d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
              />
            </svg>
          </div>
          <div className='mr-5'>
            <h2 className='text-2xl font-black text-slate-800 tracking-tight'>المعلومات الشخصية</h2>
            <p className='text-slate-500 font-medium text-sm'>إدارة شؤون العائلة والقربى</p>
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
                className='px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-indigo-200 flex items-center gap-2'
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
              className='p-3 bg-white/80 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all duration-300 shadow-sm border border-indigo-100/50 group/btn'
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

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8 leading-loose'>
        {[
          {
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            label: 'اسم الأب',
            value: order.fatherName,
            key: 'fatherName',
            type: 'text',
          },
          {
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            label: 'اسم الأم',
            value: order.motherName,
            key: 'motherName',
            type: 'text',
          },
          {
            icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            label: 'الجنسية',
            value: order.nationality,
            key: 'nationality',
            type: 'text',
          },
          {
            icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
            label: 'اسم الزوج/الزوجة',
            value: order.wifeName,
            key: 'wifeName',
            type: 'text',
          },
          {
            icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2m16-10a4 4 0 11-8 0 4 4 0 018 0zM9 21h12a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z',
            label: 'والدة الزوج/الزوجة',
            value: order.wifeMotherName,
            key: 'wifeMotherName',
            type: 'text',
          },
          {
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z',
            label: 'تاريخ الزواج',
            value: order.marriageDate
              ? new Date(order.marriageDate).toLocaleDateString('ar-EG')
              : 'غير محدد',
            key: 'marriageDate',
            type: 'date',
          },
          {
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z',
            label: 'تاريخ الطلاق',
            value: order.divorceDate
              ? new Date(order.divorceDate).toLocaleDateString('ar-EG')
              : 'غير محدد',
            key: 'divorceDate',
            type: 'date',
          },
          {
            icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z',
            label: 'تاريخ الوفاة',
            value: order.deathDate
              ? new Date(order.deathDate).toLocaleDateString('ar-EG')
              : 'غير محدد',
            key: 'deathDate',
            type: 'date',
          },
        ].map((item, i) => (
          <div
            key={item.key}
            className='flex items-start bg-white/30 rounded-3xl p-6 border border-white/40 group/item hover:bg-white/60 transition-all duration-300'
          >
            <div className='w-12 h-12 bg-indigo-50 text-indigo-500 rounded-2xl flex items-center justify-center ml-4 shrink-0 group-hover/item:bg-indigo-500 group-hover/item:text-white transition-all duration-500 shadow-inner'>
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
                  className='w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:ring-2 focus:ring-indigo-500 outline-none'
                />
              ) : (
                <p className='text-slate-700 font-black text-lg truncate group-hover/item:text-indigo-700 transition-colors'>
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
