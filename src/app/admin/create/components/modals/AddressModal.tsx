'use client';

import { FormData } from '../../types';

interface AddressModalProps {
  isOpen: boolean;
  formData: FormData;
  onFormDataChange: (data: Partial<FormData>) => void;
  onClose: () => void;
}

const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الشرقية',
  'الدقهلية',
  'البحيرة',
  'الغربية',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'شمال سيناء',
  'جنوب سيناء',
  'الوادي الجديد',
  'مطروح',
  'كفر الشيخ',
  'الفيوم',
  'بني سويف',
  'المنوفية',
  'القليوبية',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
];

export function AddressModal({ isOpen, formData, onFormDataChange, onClose }: AddressModalProps) {
  if (!isOpen) return null;

  const getFullAddress = () => {
    return (
      [
        formData.governorate,
        formData.city,
        formData.district,
        formData.street,
        formData.buildingNumber ? `مبني رقم ${formData.buildingNumber}` : '',
        formData.apartmentNumber ? `شقة رقم ${formData.apartmentNumber}` : '',
        formData.landmark ? `بجوار ${formData.landmark}` : '',
      ]
        .filter(Boolean)
        .join(' - ') || 'لم يتم إدخال العنوان بعد'
    );
  };

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4'
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className='bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
        {/* Modal Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-200'>
          <h2 className='text-2xl font-bold text-gray-900'>إدخال العنوان التفصيلي</h2>
          <button onClick={onClose} className='text-gray-400 hover:text-gray-600 transition-colors'>
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className='p-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Governorate */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>المحافظة</label>
              <select
                value={formData.governorate}
                onChange={e => onFormDataChange({ governorate: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
              >
                <option value=''>اختر المحافظة</option>
                {GOVERNORATES.map(gov => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>المدينة</label>
              <input
                type='text'
                value={formData.city}
                onChange={e => onFormDataChange({ city: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                placeholder='أدخل المدينة'
              />
            </div>

            {/* District */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>الحي/المنطقة</label>
              <input
                type='text'
                value={formData.district}
                onChange={e => onFormDataChange({ district: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                placeholder='أدخل الحي أو المنطقة'
              />
            </div>

            {/* Street */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>الشارع</label>
              <input
                type='text'
                value={formData.street}
                onChange={e => onFormDataChange({ street: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                placeholder='أدخل اسم الشارع'
              />
            </div>

            {/* Building Number */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>رقم المبنى</label>
              <input
                type='text'
                value={formData.buildingNumber}
                onChange={e => onFormDataChange({ buildingNumber: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                placeholder='أدخل رقم المبنى'
              />
            </div>

            {/* Apartment Number */}
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>رقم الشقة</label>
              <input
                type='text'
                value={formData.apartmentNumber}
                onChange={e => onFormDataChange({ apartmentNumber: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                placeholder='أدخل رقم الشقة'
              />
            </div>

            {/* Landmark */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                المعلم المميز
              </label>
              <input
                type='text'
                value={formData.landmark}
                onChange={e => onFormDataChange({ landmark: e.target.value })}
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white transition-all duration-200 hover:border-gray-400'
                placeholder='أدخل معلم مميز (مثل: بجوار مسجد، أمام مدرسة)'
              />
            </div>

            {/* Full Address Summary */}
            <div className='md:col-span-2'>
              <label className='block text-sm font-semibold text-gray-700 mb-2'>
                العنوان الكامل
              </label>
              <div className='bg-gray-50 p-4 rounded-xl border border-gray-200'>
                <p className='text-gray-700 text-sm leading-relaxed'>{getFullAddress()}</p>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className='flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200'>
            <button
              onClick={onClose}
              className='px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors'
            >
              إغلاق
            </button>
            <button
              onClick={onClose}
              className='px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors'
            >
              حفظ العنوان
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
