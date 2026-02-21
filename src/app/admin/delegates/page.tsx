'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import Image from 'next/image';

interface Delegate {
  id: string;
  name: string;
  idNumber: string;
  licenseNumber: string;
  idCardFront: string;
  idCardBack: string;
  unionCardFront: string;
  unionCardBack: string;
}

export default function DelegatesPage() {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { showSuccess, showError } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    idNumber: '',
    licenseNumber: '',
    idCardFront: null as File | null,
    idCardBack: null as File | null,
    unionCardFront: null as File | null,
    unionCardBack: null as File | null,
  });

  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDelegates();
  }, []);

  const fetchDelegates = async () => {
    try {
      const res = await fetch('/api/admin/delegates');
      const data = await res.json();
      if (data.delegates) {
        setDelegates(data.delegates);
      }
    } catch (error) {
      // Error fetching delegates
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, [field]: e.target.files![0] }));
    }
  };

  const handleEdit = (delegate: Delegate) => {
    setEditingId(delegate.id);
    setFormData({
      name: delegate.name,
      idNumber: delegate.idNumber,
      licenseNumber: delegate.licenseNumber || '',
      idCardFront: null,
      idCardBack: null,
      unionCardFront: null,
      unionCardBack: null,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('idNumber', formData.idNumber);
      if (formData.licenseNumber) data.append('licenseNumber', formData.licenseNumber);
      if (formData.idCardFront) data.append('idCardFront', formData.idCardFront);
      if (formData.idCardBack) data.append('idCardBack', formData.idCardBack);
      if (formData.unionCardFront) data.append('unionCardFront', formData.unionCardFront);
      if (formData.unionCardBack) data.append('unionCardBack', formData.unionCardBack);

      let res;
      if (editingId) {
        data.append('id', editingId);
        res = await fetch('/api/admin/delegates', {
          method: 'PUT',
          body: data,
        });
      } else {
        res = await fetch('/api/admin/delegates', {
          method: 'POST',
          body: data,
        });
      }

      if (res.ok) {
        showSuccess(
          editingId ? 'تم التعديل' : 'تمت الإضافة',
          editingId ? 'تم تعديل بيانات المندوب بنجاح' : 'تم إضافة المندوب بنجاح'
        );
        setShowModal(false);
        setEditingId(null);
        setFormData({
          name: '',
          idNumber: '',
          licenseNumber: '',
          idCardFront: null,
          idCardBack: null,
          unionCardFront: null,
          unionCardBack: null,
        });
        fetchDelegates();
      } else {
        const errData = await res.json();
        showError(
          'خطأ',
          errData.error || (editingId ? 'فشل في تعديل المندوب' : 'فشل في إضافة المندوب')
        );
      }
    } catch (error) {
      showError('خطأ', 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDelegate = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المندوب؟')) return;

    try {
      const res = await fetch(`/api/admin/delegates?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        showSuccess('تم الحذف', 'تم حذف المندوب بنجاح');
        fetchDelegates();
      } else {
        showError('خطأ', 'فشل في حذف المندوب');
      }
    } catch (error) {
      showError('خطأ', 'حدث خطأ أثناء الاتصال بالخادم');
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 p-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <div>
            <h1 className='text-3xl font-black text-slate-900'>إدارة المندوبين</h1>
            <p className='text-slate-500 font-bold mt-2'>
              إدارة بيانات وصور المندوبين لطباعة التفويضات
            </p>
          </div>
          <button
            onClick={() => {
              setEditingId(null);
              setFormData({
                name: '',
                idNumber: '',
                licenseNumber: '',
                idCardFront: null,
                idCardBack: null,
                unionCardFront: null,
                unionCardBack: null,
              });
              setShowModal(true);
            }}
            className='px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-lg'
          >
            + إضافة مندوب جديد
          </button>
        </div>

        {loading ? (
          <div className='flex justify-center p-12'>
            <div className='w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full animate-spin'></div>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {delegates.map(delegate => (
              <div
                key={delegate.id}
                className='bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-all'
              >
                <div className='flex justify-between items-start mb-4'>
                  <div className='w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl'>
                    👤
                  </div>
                  <div className='flex gap-2'>
                    <button
                      onClick={() => handleEdit(delegate)}
                      className='text-blue-500 hover:bg-blue-50 p-2 rounded-lg transition-colors'
                      title='تعديل'
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => deleteDelegate(delegate.id)}
                      className='text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors'
                      title='حذف'
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <h3 className='text-xl font-black text-slate-900 mb-1'>{delegate.name}</h3>
                <p className='text-sm font-bold text-slate-500 mb-4'>{delegate.idNumber}</p>

                <div className='space-y-2 mb-4'>
                  <div className='flex justify-between text-xs'>
                    <span className='text-slate-400 font-bold'>رقم الترخيص:</span>
                    <span className='font-bold'>{delegate.licenseNumber || '---'}</span>
                  </div>
                </div>

                <div className='grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100'>
                 
                  {delegate.idCardFront && (
                    <Image
                      src={delegate.idCardFront}
                      alt='ID Card Front'
                      width={100}
                      height={48}
                      className='w-full object-cover rounded-lg border h-auto'
                      title='بطاقة أمامي'
                      unoptimized
                    />
                  )}
                 
                  {delegate.idCardBack && (
                    <Image
                      src={delegate.idCardBack}
                      alt='ID Card Back'
                      width={100}
                      height={48}
                      className='w-full object-cover rounded-lg border h-auto'
                      title='بطاقة خلفي'
                      unoptimized
                    />
                  )}
                 
                  {delegate.unionCardFront && (
                    <Image
                      src={delegate.unionCardFront}
                      alt='Union Card Front'
                      width={100}
                      height={48}
                      className='w-full object-cover rounded-lg border h-auto'
                      title='كارنيه أمامي'
                      unoptimized
                    />
                  )}
                 
                  {delegate.unionCardBack && (
                    <Image
                      src={delegate.unionCardBack}
                      alt='Union Card Back'
                      width={100}
                      height={48}
                      className='w-full object-cover rounded-lg border h-auto'
                      title='كارنيه خلفي'
                      unoptimized
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl'>
              <div className='p-8 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10'>
                <h2 className='text-2xl font-black text-slate-900'>
                  {editingId ? 'تعديل بيانات المندوب' : 'إضافة مندوب جديد'}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className='text-slate-400 hover:text-slate-600 text-2xl'
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className='p-8 space-y-6'>
                <div className='grid grid-cols-2 gap-6'>
                  <div className='space-y-2'>
                    <label className='text-sm font-black text-slate-700'>الاسم الثلاثي</label>
                    <input
                      required
                      type='text'
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-slate-900 outline-none'
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className='space-y-2'>
                    <label className='text-sm font-black text-slate-700'>الرقم القومي</label>
                    <input
                      required
                      type='text'
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-slate-900 outline-none'
                      value={formData.idNumber}
                      onChange={e => setFormData({ ...formData, idNumber: e.target.value })}
                    />
                  </div>
                  <div className='col-span-2 space-y-2'>
                    <label className='text-sm font-black text-slate-700'>
                      رقم الترخيص (اختياري)
                    </label>
                    <input
                      type='text'
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-slate-900 outline-none'
                      value={formData.licenseNumber}
                      onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                    />
                  </div>
                </div>

                <div className='space-y-4'>
                  <h3 className='font-black text-lg border-b pb-2'>صورة البطاقة الشخصية</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-xs font-bold text-slate-500'>
                        الوجه الأمامي {editingId && '(اختياري)'}
                      </label>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={e => handleFileChange(e, 'idCardFront')}
                        className='w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs font-bold text-slate-500'>
                        الوجه الخلفي {editingId && '(اختياري)'}
                      </label>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={e => handleFileChange(e, 'idCardBack')}
                        className='w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100'
                      />
                    </div>
                  </div>
                </div>

                <div className='space-y-4'>
                  <h3 className='font-black text-lg border-b pb-2'>صورة الكارنية</h3>
                  <div className='grid grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-xs font-bold text-slate-500'>
                        الوجه الأمامي {editingId && '(اختياري)'}
                      </label>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={e => handleFileChange(e, 'unionCardFront')}
                        className='w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-xs font-bold text-slate-500'>
                        الوجه الخلفي {editingId && '(اختياري)'}
                      </label>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={e => handleFileChange(e, 'unionCardBack')}
                        className='w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100'
                      />
                    </div>
                  </div>
                </div>

                <div className='pt-4 border-t border-slate-100 flex gap-4'>
                  <button
                    type='submit'
                    disabled={submitting}
                    className='flex-1 py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition-all shadow-xl disabled:opacity-50'
                  >
                    {submitting ? 'جاري الحفظ...' : editingId ? 'حفظ التعديلات' : 'حفظ المندوب'}
                  </button>
                  <button
                    type='button'
                    onClick={() => setShowModal(false)}
                    className='px-6 py-4 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-all'
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
