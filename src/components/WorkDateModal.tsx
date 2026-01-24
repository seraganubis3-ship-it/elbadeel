'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';

interface WorkDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function WorkDateModal({ isOpen, onClose, userEmail }: WorkDateModalProps) {
  const [workDate, setWorkDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!workDate.trim()) {
      setError('يرجى إدخال تاريخ العمل');
      return;
    }

    // التحقق من صيغة التاريخ DD/MM/YYYY
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(workDate)) {
      setError('يرجى إدخال التاريخ بصيغة DD/MM/YYYY');
      return;
    }

    // التحقق من صحة التاريخ
    const dateParts = workDate.split('/').map(Number);
    if (dateParts.length !== 3 || dateParts.some(isNaN)) {
      setError('صيغة التاريخ غير صحيحة');
      return;
    }

    const day = dateParts[0]!;
    const month = dateParts[1]!;
    const year = dateParts[2]!;

    const date = new Date(year, month - 1, day);
    if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
      setError('التاريخ المدخل غير صحيح');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // حفظ تاريخ العمل عبر API
      const response = await fetch('/api/admin/work-date', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workDate }),
      });

      if (response.ok) {
        // حفظ تاريخ العمل في localStorage مؤقتاً
        localStorage.setItem('adminWorkDate', workDate);

        // إغلاق المودال وإعادة تحميل الصفحة
        onClose();
        window.location.reload();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'حدث خطأ أثناء حفظ تاريخ العمل');
      }
    } catch (error) {
      setError('حدث خطأ أثناء حفظ تاريخ العمل');
    } finally {
      setLoading(false);
    }
  };

  const handleTodayClick = () => {
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    setWorkDate(formattedDate);
  };

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white rounded-lg p-6 w-full max-w-md mx-4'>
        <div className='text-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>تحديد تاريخ العمل</h2>
          <p className='text-gray-600'>يرجى إدخال التاريخ الذي تريد العمل به اليوم</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='workDate' className='block text-sm font-medium text-gray-700 mb-2'>
              تاريخ العمل (DD/MM/YYYY)
            </label>
            <input
              type='text'
              id='workDate'
              value={workDate}
              onChange={e => setWorkDate(e.target.value)}
              placeholder='مثال: 13/10/2025'
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              dir='ltr'
            />
            <button
              type='button'
              onClick={handleTodayClick}
              className='mt-2 text-sm text-blue-600 hover:text-blue-800'
            >
              استخدام تاريخ اليوم
            </button>
          </div>

          {error && <div className='text-red-600 text-sm bg-red-50 p-3 rounded-md'>{error}</div>}

          <div className='flex gap-3 pt-4'>
            <button
              type='submit'
              disabled={loading}
              className='flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {loading ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>

        <div className='mt-4 text-xs text-gray-500 text-center'>
          سيتم استخدام هذا التاريخ لجميع الطلبات التي تنشئها من لوحة التحكم
        </div>
      </div>
    </div>
  );
}
