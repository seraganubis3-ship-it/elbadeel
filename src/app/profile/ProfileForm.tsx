'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  wifeName: string | null;
  fatherName: string | null;
  motherName: string | null;
  birthDate: Date | null;
  nationality: string | null;
  idNumber: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    wifeName: user.wifeName || '',
    fatherName: user.fatherName || '',
    motherName: user.motherName || '',
    birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    nationality: user.nationality || '',
    idNumber: user.idNumber || '',
    address: user.address || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'تم تحديث البروفايل بنجاح' });
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'حدث خطأ أثناء تحديث البروفايل' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'حدث خطأ في الاتصال' });
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({
    label,
    name,
    type = 'text',
    placeholder,
    required = false,
    dir = 'rtl',
  }: {
    label: string;
    name: string;
    type?: string;
    placeholder?: string;
    required?: boolean;
    dir?: string;
  }) => (
    <div>
      <label htmlFor={name} className='block text-sm font-medium text-slate-700 mb-2'>
        {label} {required && <span className='text-red-500'>*</span>}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={formData[name as keyof typeof formData]}
        onChange={handleInputChange}
        required={required}
        dir={dir}
        className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none'
        placeholder={placeholder}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
      {/* Message Alert */}
      {message && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <svg
              className='w-5 h-5 flex-shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          ) : (
            <svg
              className='w-5 h-5 flex-shrink-0'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          )}
          <span className='text-sm font-medium'>{message.text}</span>
        </div>
      )}

      {/* Basic Info Section */}
      <div>
        <h3 className='text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4'>
          المعلومات الأساسية
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <InputField label='الاسم الكامل' name='name' placeholder='أدخل اسمك الكامل' required />
          <InputField
            label='رقم الهاتف'
            name='phone'
            type='tel'
            placeholder='01xxxxxxxxx'
            dir='ltr'
          />
        </div>
      </div>

      {/* Family Info Section */}
      <div>
        <h3 className='text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4'>
          المعلومات العائلية
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <InputField label='اسم الأب' name='fatherName' placeholder='اسم الأب' />
          <InputField label='اسم الأم' name='motherName' placeholder='اسم الأم' />
          <InputField label='اسم الزوجة' name='wifeName' placeholder='اسم الزوجة (اختياري)' />
        </div>
      </div>

      {/* Identity Info Section */}
      <div>
        <h3 className='text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4'>
          معلومات الهوية
        </h3>
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <InputField label='رقم الهوية' name='idNumber' placeholder='الرقم القومي' dir='ltr' />
          <InputField label='تاريخ الميلاد' name='birthDate' type='date' />
          <InputField label='الجنسية' name='nationality' placeholder='مصري' />
        </div>
      </div>

      {/* Address Section */}
      <div>
        <h3 className='text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4'>
          العنوان
        </h3>
        <label htmlFor='address' className='block text-sm font-medium text-slate-700 mb-2'>
          العنوان الكامل
        </label>
        <textarea
          id='address'
          name='address'
          value={formData.address}
          onChange={handleInputChange}
          rows={3}
          className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none resize-none'
          placeholder='أدخل عنوانك بالتفصيل...'
        />
      </div>

      {/* Submit Button */}
      <div className='flex justify-end pt-4 border-t border-slate-100'>
        <button
          type='submit'
          disabled={isLoading}
          className='flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-600/25 disabled:opacity-50 disabled:cursor-not-allowed'
        >
          {isLoading ? (
            <>
              <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                ></path>
              </svg>
              جاري الحفظ...
            </>
          ) : (
            <>
              <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              حفظ التغييرات
            </>
          )}
        </button>
      </div>
    </form>
  );
}
