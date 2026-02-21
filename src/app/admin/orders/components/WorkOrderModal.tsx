'use client';

import { useState } from 'react';

interface WorkOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (workOrderNumber: string) => void;
  count: number;
  isSubmitting?: boolean;
}

export function WorkOrderModal({
  isOpen,
  onClose,
  onSubmit,
  count,
  isSubmitting,
}: WorkOrderModalProps) {
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrderNumber.trim()) {
      setError('يرجى إدخال رقم أمر الشغل');
      return;
    }
    onSubmit(workOrderNumber);
    // Note: Don't clear here if we want to wait for success, but let's keep it for now
    // Actually, usually it's better to clear after parent says it's done.
  };

  return (
    <div className='fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200'>
        <form onSubmit={handleSubmit} className='p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4 text-center'>إدخال رقم أمر الشغل</h2>

          <div className='bg-blue-50 text-blue-800 p-3 rounded-lg text-sm mb-4 text-center'>
            سيتم تعيين رقم أمر الشغل لـ <strong>{count}</strong> طلب
          </div>

          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>رقم أمر الشغل</label>
              <input
                type='text'
                value={workOrderNumber}
                onChange={e => {
                  setWorkOrderNumber(e.target.value);
                  setError('');
                }}
                disabled={isSubmitting}
                className={`w-full px-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  error ? 'border-red-500 bg-red-50' : 'border-gray-200'
                } ${isSubmitting ? 'bg-slate-50 text-slate-400' : ''}`}
                placeholder='مثال: WO-2024-001'
                autoFocus
              />
              {error && <p className='text-red-500 text-xs mt-1'>{error}</p>}
            </div>
          </div>

          <div className='flex gap-3 mt-6'>
            <button
              type='button'
              onClick={onClose}
              disabled={isSubmitting}
              className='flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50'
            >
              إلغاء
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all disabled:bg-blue-400 disabled:shadow-none flex items-center justify-center gap-2'
            >
              {isSubmitting ? (
                <>
                  <div className='w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  جاري الحفظ...
                </>
              ) : (
                'حفظ ومتابعة'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
