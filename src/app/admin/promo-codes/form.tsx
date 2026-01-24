'use client';

import { useState } from 'react';

interface PromoCodeFormProps {
  initialData?: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PromoCodeForm({ initialData, onClose, onSuccess }: PromoCodeFormProps) {
  const [formData, setFormData] = useState({
    code: initialData?.code || '',
    type: initialData?.type || 'FIXED',
    value: initialData?.value
      ? initialData.type === 'PERCENTAGE'
        ? initialData.value
        : initialData.value / 100
      : '',
    minOrderAmount: initialData?.minOrderAmount ? initialData.minOrderAmount / 100 : '',
    maxDiscount: initialData?.maxDiscount ? initialData.maxDiscount / 100 : '',
    startDate: initialData?.startDate
      ? new Date(initialData.startDate).toISOString().split('T')[0]
      : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    usageLimit: initialData?.usageLimit || '',
    isActive: initialData?.isActive ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.code || !formData.value) {
      setError('الرجاء ملء البيانات الأساسية');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        value:
          formData.type === 'PERCENTAGE'
            ? Number(formData.value)
            : Math.round(Number(formData.value) * 100),
        minOrderAmount: formData.minOrderAmount
          ? Math.round(Number(formData.minOrderAmount) * 100)
          : null,
        maxDiscount: formData.maxDiscount ? Math.round(Number(formData.maxDiscount) * 100) : null,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      const url = initialData
        ? `/api/admin/promo-codes/${initialData.id}`
        : '/api/admin/promo-codes';

      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        onSuccess();
      } else {
        setError(data.error || 'حدث خطأ ما');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6'>
      <div className='flex justify-between items-center mb-6 border-b pb-4'>
        <h2 className='text-xl font-bold text-gray-800'>
          {initialData ? 'تعديل كوبون' : 'إضافة كوبون جديد'}
        </h2>
        <button onClick={onClose} className='text-gray-400 hover:text-gray-600'>
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

      {error && <div className='bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm'>{error}</div>}

      <form onSubmit={handleSubmit} className='space-y-4'>
        {/* Code & Type */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>كود الخصم</label>
            <input
              type='text'
              value={formData.code}
              onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              // Only allow editing code if creating (usually safer not to change code if used, but let's allow read-only edit)
              // Actually for simplicity allow edit unless business rule says no. Prisma Unique will handle duplicate.
              disabled={!!initialData}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 uppercase font-mono disabled:bg-gray-100'
              placeholder='e.g. WELCOME10'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>نوع الخصم</label>
            <select
              value={formData.type}
              onChange={e => setFormData({ ...formData, type: e.target.value })}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500'
            >
              <option value='FIXED'>مبلغ ثابت (ج.م)</option>
              <option value='PERCENTAGE'>نسبة مئوية (%)</option>
            </select>
          </div>
        </div>

        {/* Value & Limits */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              {formData.type === 'FIXED' ? 'قيمة الخصم (ج.م)' : 'النسبة (%)'}
            </label>
            <input
              type='number'
              value={formData.value}
              onChange={e => setFormData({ ...formData, value: e.target.value })}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500'
              min='0'
              step={formData.type === 'FIXED' ? '1' : '0.1'}
            />
          </div>
          {formData.type === 'PERCENTAGE' && (
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                حد أقصى للخصم (ج.م) - اختياري
              </label>
              <input
                type='number'
                value={formData.maxDiscount}
                onChange={e => setFormData({ ...formData, maxDiscount: e.target.value })}
                className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500'
                placeholder='بلا حد أقصى'
              />
            </div>
          )}
        </div>

        {/* Min Order & Usage Limit */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              أقل قيمة للطلب (ج.م) - اختياري
            </label>
            <input
              type='number'
              value={formData.minOrderAmount}
              onChange={e => setFormData({ ...formData, minOrderAmount: e.target.value })}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500'
              placeholder='0'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              الحد الأقصى لعدد مرات الاستخدام - اختياري
            </label>
            <input
              type='number'
              value={formData.usageLimit}
              onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500'
              placeholder='بلا حد'
            />
          </div>
        </div>

        {/* Dates */}
        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ البدء</label>
            <input
              type='date'
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500'
            />
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>تاريخ الانتهاء</label>
            <input
              type='date'
              value={formData.endDate}
              onChange={e => setFormData({ ...formData, endDate: e.target.value })}
              className='w-full p-2 border rounded-lg focus:ring-2 focus:ring-emerald-500'
            />
          </div>
        </div>

        {/* Status */}
        <div className='flex items-center gap-2 pt-2'>
          <input
            type='checkbox'
            id='isActive'
            checked={formData.isActive}
            onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
            className='w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500'
          />
          <label htmlFor='isActive' className='text-sm font-medium text-gray-700'>
            تفعيل الكوبون
          </label>
        </div>

        {/* Buttons */}
        <div className='flex justify-end gap-3 pt-4 border-t mt-4'>
          <button
            type='button'
            onClick={onClose}
            className='px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors'
          >
            إلغاء
          </button>
          <button
            type='submit'
            disabled={loading}
            className='px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors'
          >
            {loading ? 'جاري الحفظ...' : 'حفظ الكوبون'}
          </button>
        </div>
      </form>
    </div>
  );
}
