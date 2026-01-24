'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import ServiceFieldsManager from './components/ServiceFieldsManager';
import ServiceDocumentsManager from './components/ServiceDocumentsManager';
import { Category, ServiceVariant, ServiceDocument, ServiceField } from './types';

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<ServiceVariant[]>([]);
  const [documents, setDocuments] = useState<ServiceDocument[]>([]);
  const [fields, setFields] = useState<ServiceField[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    active: true,
  });

  const fetchData = useCallback(async () => {
    try {
      const [categoriesRes, serviceRes] = await Promise.all([
        fetch('/api/admin/categories'),
        fetch(`/api/admin/services/${serviceId}`),
      ]);

      const categoriesData = await categoriesRes.json();
      const serviceData = await serviceRes.json();

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      if (serviceData.success) {
        const service = serviceData.service;
        setFormData({
          name: service.name,
          description: service.description || '',
          categoryId: service.categoryId,
          active: service.active,
        });
        setVariants(service.variants || []);
        setDocuments(service.documents || []);
        setFields(service.fields || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [serviceId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          variants,
          documents,
          fields,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ تم تحديث الخدمة بنجاح!');
        router.push('/admin/services');
      } else {
        alert(data.error || 'حدث خطأ أثناء تحديث الخدمة');
      }
    } catch (error) {
      alert('حدث خطأ أثناء تحديث الخدمة');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 0, name: 'المعلومات الأساسية', icon: '📋' },
    { id: 1, name: 'أنواع الخدمة', icon: '⚡' },
    { id: 2, name: 'المستندات المطلوبة', icon: '📄' },
    { id: 3, name: 'الأسئلة الديناميكية', icon: '❓' },
  ];

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto'></div>
          <p className='mt-4 text-lg font-bold text-gray-700'>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>تعديل الخدمة</h1>
              <p className='text-gray-500 mt-1'>قم بتعديل معلومات الخدمة وإعداداتها</p>
            </div>
            <button
              onClick={() => router.back()}
              className='px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-all'
            >
              ← رجوع
            </button>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden'>
          <div className='flex overflow-x-auto'>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] px-6 py-4 font-bold text-sm transition-all border-b-4 ${
                  activeTab === tab.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                    : 'border-transparent hover:bg-gray-50 text-gray-600'
                }`}
              >
                <span className='text-2xl block mb-1'>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Tab Content */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[400px]'>
            {/* Tab 0: Basic Info */}
            {activeTab === 0 && (
              <div className='space-y-6'>
                <div>
                  <h2 className='text-xl font-bold text-gray-900 mb-4'>📋 المعلومات الأساسية</h2>
                  <p className='text-sm text-gray-500 mb-6'>أدخل اسم الخدمة، الوصف، والفئة</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2'>
                      اسم الخدمة *
                    </label>
                    <input
                      type='text'
                      name='name'
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-medium'
                      placeholder='مثال: تجديد جواز السفر'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2'>الفئة *</label>
                    <select
                      name='categoryId'
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-medium'
                    >
                      <option value=''>اختر الفئة</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>وصف الخدمة</label>
                  <textarea
                    name='description'
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-medium'
                    placeholder='اكتب وصفاً مفصلاً للخدمة...'
                  />
                </div>

                <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                  <input
                    type='checkbox'
                    name='active'
                    checked={formData.active}
                    onChange={handleInputChange}
                    className='w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500'
                  />
                  <label className='font-bold text-gray-700'>تفعيل الخدمة</label>
                </div>
              </div>
            )}

            {/* Tab 1: Variants */}
            {activeTab === 1 && (
              <div className='space-y-6'>
                <div>
                  <h2 className='text-xl font-bold text-gray-900 mb-2'>⚡ أنواع الخدمة</h2>
                  <p className='text-sm text-gray-500 mb-6'>
                    أضف الأنواع المختلفة للخدمة (مثال: عادي، مستعجل، VIP)
                  </p>
                </div>

                <div className='flex justify-end mb-4'>
                  <button
                    type='button'
                    onClick={() =>
                      setVariants(prev => [
                        ...prev,
                        {
                          id: `temp-${Date.now()}`,
                          name: '',
                          priceCents: 0,
                          etaDays: 0,
                          active: true,
                        },
                      ])
                    }
                    className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm transition-all'
                  >
                    + إضافة نوع جديد
                  </button>
                </div>

                <div className='space-y-4'>
                  {variants.map((v, i) => (
                    <div key={v.id} className='p-4 bg-gray-50 border-2 border-gray-200 rounded-lg'>
                      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        <div>
                          <label className='block text-xs font-bold text-gray-600 mb-1'>
                            اسم النوع
                          </label>
                          <input
                            value={v.name}
                            onChange={e => {
                              setVariants(prev =>
                                prev.map((variant, idx) =>
                                  idx === i ? { ...variant, name: e.target.value } : variant
                                )
                              );
                            }}
                            className='w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none font-medium'
                            placeholder='عادي'
                          />
                        </div>
                        <div>
                          <label className='block text-xs font-bold text-gray-600 mb-1'>
                            السعر (ج.م)
                          </label>
                          <input
                            type='number'
                            value={v.priceCents / 100}
                            onChange={e => {
                              const newPrice = (parseInt(e.target.value) || 0) * 100;
                              setVariants(prev =>
                                prev.map((variant, idx) =>
                                  idx === i ? { ...variant, priceCents: newPrice } : variant
                                )
                              );
                            }}
                            className='w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none font-medium'
                          />
                        </div>
                        <div>
                          <label className='block text-xs font-bold text-gray-600 mb-1'>
                            الأيام
                          </label>
                          <input
                            type='number'
                            value={v.etaDays}
                            onChange={e => {
                              const newDays = parseInt(e.target.value) || 0;
                              setVariants(prev =>
                                prev.map((variant, idx) =>
                                  idx === i ? { ...variant, etaDays: newDays } : variant
                                )
                              );
                            }}
                            className='w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none font-medium'
                          />
                        </div>
                        <div className='flex items-end'>
                          <button
                            type='button'
                            onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                            className='w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-all'
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {variants.length === 0 && (
                    <div className='text-center py-12 border-2 border-dashed border-gray-300 rounded-lg'>
                      <p className='text-gray-400 font-bold'>
                        لا توجد أنواع. اضغط &quot;إضافة نوع جديد&quot; للبدء
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Documents */}
            {activeTab === 2 && (
              <div>
                <div className='mb-6'>
                  <h2 className='text-xl font-bold text-gray-900 mb-2'>📄 المستندات المطلوبة</h2>
                  <p className='text-sm text-gray-500'>
                    حدد المستندات التي يحتاجها العميل لإتمام الخدمة
                  </p>
                </div>
                <ServiceDocumentsManager documents={documents} setDocuments={setDocuments} />
              </div>
            )}

            {/* Tab 3: Fields */}
            {activeTab === 3 && (
              <div>
                <div className='mb-6'>
                  <h2 className='text-xl font-bold text-gray-900 mb-2'>❓ الأسئلة الديناميكية</h2>
                  <p className='text-sm text-gray-500'>
                    أضف أسئلة يتم طرحها على العميل عند طلب الخدمة
                  </p>
                </div>
                <ServiceFieldsManager
                  fields={fields}
                  setFields={setFields}
                  availableDocuments={documents}
                />
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className='mt-6 flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='text-sm text-gray-500'>
              التبويب {activeTab + 1} من {tabs.length}
            </div>
            <div className='flex gap-3'>
              {activeTab > 0 && (
                <button
                  type='button'
                  onClick={() => setActiveTab(activeTab - 1)}
                  className='px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold transition-all'
                >
                  ← السابق
                </button>
              )}
              {activeTab < tabs.length - 1 && (
                <button
                  type='button'
                  onClick={() => setActiveTab(activeTab + 1)}
                  className='px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold transition-all'
                >
                  التالي →
                </button>
              )}
              {activeTab === tabs.length - 1 && (
                <button
                  type='submit'
                  disabled={saving}
                  className='px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {saving ? '⏳ جاري الحفظ...' : '💾 حفظ التغييرات'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
