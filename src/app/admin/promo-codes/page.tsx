'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PromoCodeForm from './form';

export default function PromoCodesPage() {
  const [promoCodes, setPromoCodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCode, setEditingCode] = useState<any | null>(null);

  const fetchPromoCodes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/promo-codes');
      const data = await res.json();
      if (data.success) {
        setPromoCodes(data.promoCodes);
      }
    } catch (error) {
      // console.error('Failed to fetch promo codes', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleEdit = (code: any) => {
    setEditingCode(code);
    setShowForm(true);
  };

  const handleDelete = async (id: string, isUsed: boolean) => {
    if (
      !confirm(isUsed ? 'هل أنت متأكد من إيقاف هذا الكوبون؟' : 'هل أنت متأكد من حذف هذا الكوبون؟')
    )
      return;

    try {
      const res = await fetch(`/api/admin/promo-codes/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchPromoCodes();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingCode(null);
    fetchPromoCodes();
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-emerald-100'>
        <div>
          <h1 className='text-2xl font-bold text-gray-800'>أكواد الخصم</h1>
          <p className='text-gray-500 text-sm mt-1'>إدارة كوبونات الخصم والعروض</p>
        </div>
        <button
          onClick={() => {
            setEditingCode(null);
            setShowForm(true);
          }}
          className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20'
        >
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 4v16m8-8H4' />
          </svg>
          إضافة كوبون
        </button>
      </div>

      {showForm && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[2000] p-4'>
          <div className='bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
            <PromoCodeForm
              initialData={editingCode}
              onClose={() => {
                setShowForm(false);
                setEditingCode(null);
              }}
              onSuccess={handleFormSubmit}
            />
          </div>
        </div>
      )}

      {isLoading ? (
        <div className='flex justify-center p-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600'></div>
        </div>
      ) : (
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full text-right'>
              <thead className='bg-gray-50 text-gray-600 text-sm'>
                <tr>
                  <th className='px-6 py-4 font-bold'>الكود</th>
                  <th className='px-6 py-4 font-bold'>القيمة</th>
                  <th className='px-6 py-4 font-bold'>الاستخدام</th>
                  <th className='px-6 py-4 font-bold'>الصلاحية</th>
                  <th className='px-6 py-4 font-bold'>الحالة</th>
                  <th className='px-6 py-4 font-bold'>إجراءات</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100'>
                {promoCodes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center text-gray-400'>
                      لا توجد كوبونات حالياً
                    </td>
                  </tr>
                ) : (
                  promoCodes.map(code => (
                    <tr key={code.id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4 font-mono font-bold text-emerald-700 text-lg'>
                        {code.code}
                      </td>
                      <td className='px-6 py-4'>
                        <span className='font-bold'>
                          {code.type === 'PERCENTAGE'
                            ? `${code.value}%`
                            : `${code.value / 100} جنيه`}
                        </span>
                        {code.type === 'PERCENTAGE' && code.maxDiscount && (
                          <span className='text-xs text-gray-500 block'>
                            حد أقصى: {code.maxDiscount / 100} ج.م
                          </span>
                        )}
                      </td>
                      <td className='px-6 py-4 text-sm'>
                        <div className='flex items-center gap-2'>
                          <span
                            className={`font-bold ${code.currentUsage > 0 ? 'text-blue-600' : 'text-gray-400'}`}
                          >
                            {code.currentUsage}
                          </span>
                          <span className='text-gray-400'>/</span>
                          <span>{code.usageLimit || '∞'}</span>
                        </div>
                      </td>
                      <td className='px-6 py-4 text-sm text-gray-600'>
                        {code.startDate && (
                          <div className='text-xs'>
                            من: {new Date(code.startDate).toLocaleDateString()}
                          </div>
                        )}
                        {code.endDate ? (
                          <div
                            className={`text-xs ${new Date(code.endDate) < new Date() ? 'text-red-500' : ''}`}
                          >
                            إلى: {new Date(code.endDate).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className='text-xs text-gray-400'>مفتوح</span>
                        )}
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            code.isActive
                              ? code.endDate && new Date(code.endDate) < new Date()
                                ? 'bg-red-100 text-red-800'
                                : 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {code.isActive
                            ? code.endDate && new Date(code.endDate) < new Date()
                              ? 'منتهي'
                              : 'فعال'
                            : 'غير فعال'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => handleEdit(code)}
                            className='text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded'
                          >
                            <svg
                              className='w-4 h-4'
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
                          <button
                            onClick={() => handleDelete(code.id, code._count?.orders > 0)}
                            className='text-red-600 hover:text-red-800 p-1 bg-red-50 rounded'
                          >
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
