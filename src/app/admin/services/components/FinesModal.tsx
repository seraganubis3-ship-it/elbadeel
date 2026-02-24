'use client';

import { useState, useEffect } from 'react';

interface Fine {
  id: string;
  name: string;
  amountCents: number;
  category: string;
}

interface FinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FinesModal({ isOpen, onClose }: FinesModalProps) {
  const [fines, setFines] = useState<Fine[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Edit State
  const [editValues, setEditValues] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      fetchFines();
    }
  }, [isOpen]);

  const fetchFines = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/fines');
      const data = await response.json();
      if (data.success) {
        setFines(data.fines);
        // Initialize edit states
        const initialEdits: Record<string, number> = {};
        data.fines.forEach((f: Fine) => {
          initialEdits[f.id] = f.amountCents;
        });
        setEditValues(initialEdits);
      }
    } catch (error) {
      console.error('Failed to fetch fines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id: string) => {
    setSavingId(id);
    try {
      const response = await fetch(`/api/admin/fines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountCents: editValues[id] }),
      });

      const data = await response.json();
      if (data.success) {
        setFines(prev =>
          prev.map(f => (f.id === id ? { ...f, amountCents: data.fine.amountCents } : f))
        );
        // Optional: toast success
      } else {
        alert(data.error || 'حدث خطأ أثناء الحفظ');
      }
    } catch (error) {
      console.error('Failed to update fine:', error);
      alert('فشل الاتصال بالخادم');
    } finally {
      setSavingId(null);
    }
  };

  if (!isOpen) return null;

  const finesOnly = fines.filter(f => f.category === 'غرامات');
  const servicesOnly = fines.filter(f => f.category !== 'غرامات');

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm'>
      <div
        className='bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]'
        dir='rtl'
      >
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50'>
          <h2 className='text-xl font-bold text-gray-800 flex items-center gap-2'>
            <svg
              className='w-6 h-6 text-indigo-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
            إدارة الغرامات والرسوم
          </h2>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className='p-6 overflow-y-auto flex-1'>
          {loading ? (
            <div className='flex justify-center items-center py-12'>
              <div className='animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent'></div>
            </div>
          ) : (
            <div className='space-y-8'>
              {/* غرامات Section */}
              <div>
                <h3 className='text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100'>
                  أسعار الغرامات
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {finesOnly.map(fine => (
                    <div
                      key={fine.id}
                      className='bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:border-indigo-200 hover:shadow-sm transition-all'
                    >
                      <div className='font-bold text-gray-700'>{fine.name}</div>
                      <div className='flex items-center gap-2'>
                        <div className='relative w-28'>
                          <input
                            type='number'
                            value={
                              editValues[fine.id] === undefined ? '' : editValues[fine.id]! / 100
                            }
                            onChange={e =>
                              setEditValues({
                                ...editValues,
                                [fine.id]: Number(e.target.value) * 100,
                              })
                            }
                            className='w-full text-left pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none font-bold text-gray-800'
                            dir='ltr'
                          />
                          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500'>
                            ج
                          </span>
                        </div>
                        <button
                          onClick={() => handleSave(fine.id)}
                          disabled={
                            savingId === fine.id || editValues[fine.id] === fine.amountCents
                          }
                          className={`p-1.5 rounded-lg transition-colors ${
                            editValues[fine.id] !== fine.amountCents && savingId !== fine.id
                              ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                          title='حفظ التعديل'
                        >
                          {savingId === fine.id ? (
                            <svg
                              className='animate-spin h-5 w-5'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'
                            >
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
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                              ></path>
                            </svg>
                          ) : (
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
                                d='M5 13l4 4L19 7'
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* خدمات إضافية Section */}
              <div>
                <h3 className='text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100'>
                  تسعير الخدمات الإضافية الملحقة
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {servicesOnly.map(fine => (
                    <div
                      key={fine.id}
                      className='bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between'
                    >
                      <div className='font-bold text-gray-700'>
                        {fine.name}
                        <div className='text-xs text-gray-500 font-normal mt-0.5'>
                          القيمة تحدد ديناميكياً أو يدوياً أثناء الطلب
                        </div>
                      </div>
                      <div className='px-3 py-1 bg-gray-200 text-gray-600 rounded-lg text-sm font-bold'>
                        متغير
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='p-6 bg-gray-50 border-t border-gray-100 flex justify-end'>
          <button
            onClick={onClose}
            className='px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors'
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
