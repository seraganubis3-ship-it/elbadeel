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
      ) : promoCodes.length === 0 ? (
        <div className='bg-white rounded-2xl shadow-sm border border-slate-100 p-16 text-center flex flex-col items-center'>
          <div className='w-24 h-24 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-4 border-2 border-dashed border-slate-200'>
            <svg className='w-10 h-10' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={1.5} d='M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' />
            </svg>
          </div>
          <h3 className='text-xl font-black text-slate-700 mb-2'>لا توجد كوبونات خصم حالياً</h3>
          <p className='text-slate-500 font-medium mb-6'>
            قم بإنشاء كوبونات وعروض خصم جديدة لعملائك لزيادة المبيعات
          </p>
          <button
            onClick={() => {
              setEditingCode(null);
              setShowForm(true);
            }}
            className='bg-emerald-50 text-emerald-600 hover:bg-emerald-100 px-6 py-2.5 rounded-xl font-bold transition-colors'
          >
            إضافة كوبون جديد +
          </button>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'>
          {promoCodes.map(code => {
            const isExpired = code.endDate && new Date(code.endDate) < new Date();
            const isActive = code.isActive && !isExpired;
            const statusColor = isActive
              ? 'bg-emerald-100 text-emerald-800 ring-emerald-200'
              : isExpired
                ? 'bg-rose-100 text-rose-800 ring-rose-200'
                : 'bg-slate-100 text-slate-800 ring-slate-200';
            const statusText = isActive ? 'فعال' : isExpired ? 'منتهي' : 'غير فعال';

            return (
              <div
                key={code.id}
                className='bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative group overflow-hidden'
              >
                {/* Decorative background element */}
                <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-3xl opacity-20 pointer-events-none transition-all group-hover:scale-150 ${isActive ? 'bg-emerald-400' : 'bg-slate-400'}`}></div>

                {/* Header */}
                <div className='flex justify-between items-start mb-6 relative z-10'>
                  <div>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-black ring-1 uppercase tracking-widest mb-3 ${statusColor}`}>
                      {statusText}
                    </span>
                    <h3 className='text-2xl font-black text-slate-800 font-mono tracking-tight flex items-center gap-2'>
                      <span className='text-emerald-500 text-lg'>#</span>
                      {code.code}
                    </h3>
                  </div>
                  
                  {/* Actions */}
                  <div className='flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                    <button
                      onClick={() => handleEdit(code)}
                      className='w-8 h-8 flex items-center justify-center bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors'
                      title='تعديل الكوبون'
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z' />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(code.id, code._count?.orders > 0)}
                      className='w-8 h-8 flex items-center justify-center bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors'
                      title={code._count?.orders > 0 ? 'إيقاف الكوبون' : 'حذف الكوبون'}
                    >
                      <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                        <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Values Container */}
                <div className='grid grid-cols-2 gap-4 mb-6 relative z-10'>
                  <div className='bg-slate-50 rounded-2xl p-4 border border-slate-100'>
                    <div className='text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1'>قيمة الخصم</div>
                    <div className='text-lg font-black text-emerald-700 flex items-baseline gap-1'>
                      {code.type === 'PERCENTAGE' ? (
                        <>{code.value}<span className='text-sm text-emerald-600'>%</span></>
                      ) : (
                        <>{code.value / 100}<span className='text-sm text-emerald-600'>ج.م</span></>
                      )}
                    </div>
                  </div>
                  
                  <div className='bg-slate-50 rounded-2xl p-4 border border-slate-100'>
                    <div className='text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1'>مرات الاستخدام</div>
                    <div className='text-lg font-black text-blue-700 flex items-baseline gap-1'>
                      {code.currentUsage}
                      <span className='text-sm text-slate-400 font-medium'>
                        / {code.usageLimit || 'غير محدود'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer details */}
                <div className='space-y-3 pt-4 border-t border-slate-100 relative z-10'>
                  {code.type === 'PERCENTAGE' && code.maxDiscount && (
                    <div className='flex justify-between items-center text-sm font-medium'>
                      <span className='text-slate-500'>الحد الأقصى للخصم:</span>
                      <span className='text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md'>{code.maxDiscount / 100} ج.م</span>
                    </div>
                  )}

                  <div className='flex justify-between items-center text-sm font-medium'>
                    <span className='text-slate-500'>بواسطة:</span>
                    <span className='text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md text-xs'>{code.createdBy?.name || '---'}</span>
                  </div>

                  <div className='flex justify-between items-center text-xs font-bold pt-2'>
                    <span className='text-slate-400'>
                      صالح من: <span className='text-slate-600'>{code.startDate ? new Date(code.startDate).toLocaleDateString('ar-EG') : 'الآن'}</span>
                    </span>
                    {code.endDate ? (
                      <span className={`${isExpired ? 'text-rose-500' : 'text-slate-600'}`}>
                        حتى: {new Date(code.endDate).toLocaleDateString('ar-EG')}
                      </span>
                    ) : (
                      <span className='text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded'>مفتوح للأبد</span>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
