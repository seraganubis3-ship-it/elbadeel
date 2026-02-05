'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Category {
  id: string;
  name: string;
}

export default function CreateServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    categoryId: '',
    active: true,
    image: null as File | null,
  });

  const [variants, setVariants] = useState<
    Array<{
      name: string;
      priceCents: string;
      etaDays: string;
      active: boolean;
    }>
  >([{ name: '', priceCents: '', etaDays: '', active: true }]);

  const [documents, setDocuments] = useState<
    Array<{
      title: string;
      description: string;
      required: boolean;
      active: boolean;
    }>
  >([{ title: '', description: '', required: true, active: true }]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      // console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('active', formData.active.toString());

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch('/api/admin/services', {
        method: 'POST',
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.success) {
        // Add variants
        for (const variant of variants) {
          if (variant.name && variant.priceCents && variant.etaDays) {
            await fetch(`/api/admin/services/${data.service.id}/variants`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                name: variant.name,
                priceCents: parseInt(variant.priceCents) * 100,
                etaDays: parseInt(variant.etaDays),
                active: variant.active,
              }),
            });
          }
        }

        // Add documents
        for (const document of documents) {
          if (document.title) {
            await fetch(`/api/admin/services/${data.service.id}/documents`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: document.title,
                description: document.description,
                required: document.required,
                active: document.active,
              }),
            });
          }
        }

        alert('✅ تم إنشاء الخدمة بنجاح!');
        router.push('/admin/services');
      } else {
        alert(data.error || 'حدث خطأ أثناء إنشاء الخدمة');
      }
    } catch (error) {
      alert('حدث خطأ أثناء إنشاء الخدمة');
      // console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 0, name: 'المعلومات الأساسية', icon: '📋' },
    { id: 1, name: 'أنواع الخدمة', icon: '⚡' },
    { id: 2, name: 'المستندات المطلوبة', icon: '📄' },
  ];

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-6 bg-white rounded-xl shadow-sm p-6 border border-gray-200'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900'>إضافة خدمة جديدة</h1>
              <p className='text-gray-500 mt-1'>أضف خدمة جديدة مع أنواعها ومتطلباتها</p>
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
                <h2 className='text-xl font-bold text-gray-900 mb-4'>📋 المعلومات الأساسية</h2>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2'>
                      اسم الخدمة *
                    </label>
                    <input
                      type='text'
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-medium'
                      placeholder='مثال: تجديد جواز السفر'
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-bold text-gray-700 mb-2'>
                      رابط الخدمة (Slug) *
                    </label>
                    <input
                      type='text'
                      value={formData.slug}
                      onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                      required
                      className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-medium'
                      placeholder='passport-renewal'
                    />
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>الفئة *</label>
                  <select
                    value={formData.categoryId}
                    onChange={e => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
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

                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>وصف الخدمة</label>
                  <textarea
                    value={formData.description}
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none font-medium'
                    placeholder='اكتب وصفاً مفصلاً للخدمة...'
                  />
                </div>

                <div>
                  <label className='block text-sm font-bold text-gray-700 mb-2'>صورة الخدمة</label>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={e =>
                      setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))
                    }
                    className='w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 outline-none'
                  />
                </div>

                <div className='flex items-center gap-3 p-4 bg-gray-50 rounded-lg'>
                  <input
                    type='checkbox'
                    checked={formData.active}
                    onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className='w-5 h-5 rounded border-gray-300 text-indigo-600'
                  />
                  <label className='font-bold text-gray-700'>تفعيل الخدمة</label>
                </div>
              </div>
            )}

            {/* Tab 1: Variants */}
            {activeTab === 1 && (
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-bold text-gray-900'>⚡ أنواع الخدمة</h2>
                  <button
                    type='button'
                    onClick={() =>
                      setVariants(prev => [
                        ...prev,
                        { name: '', priceCents: '', etaDays: '', active: true },
                      ])
                    }
                    className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm'
                  >
                    + إضافة نوع
                  </button>
                </div>

                <div className='space-y-4'>
                  {variants.map((v, i) => (
                    <div key={i} className='p-4 bg-gray-50 border-2 border-gray-200 rounded-lg'>
                      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                        <div>
                          <label className='block text-xs font-bold text-gray-600 mb-1'>
                            اسم النوع
                          </label>
                          <input
                            value={v.name}
                            onChange={e =>
                              setVariants(prev =>
                                prev.map((variant, idx) =>
                                  idx === i ? { ...variant, name: e.target.value } : variant
                                )
                              )
                            }
                            className='w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none'
                            placeholder='عادي'
                          />
                        </div>
                        <div>
                          <label className='block text-xs font-bold text-gray-600 mb-1'>
                            السعر (ج.م)
                          </label>
                          <input
                            type='number'
                            value={v.priceCents}
                            onChange={e =>
                              setVariants(prev =>
                                prev.map((variant, idx) =>
                                  idx === i ? { ...variant, priceCents: e.target.value } : variant
                                )
                              )
                            }
                            className='w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none'
                          />
                        </div>
                        <div>
                          <label className='block text-xs font-bold text-gray-600 mb-1'>
                            الأيام
                          </label>
                          <input
                            type='number'
                            value={v.etaDays}
                            onChange={e =>
                              setVariants(prev =>
                                prev.map((variant, idx) =>
                                  idx === i ? { ...variant, etaDays: e.target.value } : variant
                                )
                              )
                            }
                            className='w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none'
                          />
                        </div>
                        <div className='flex items-end'>
                          <button
                            type='button'
                            onClick={() => setVariants(variants.filter((_, idx) => idx !== i))}
                            className='w-full px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold'
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 2: Documents */}
            {activeTab === 2 && (
              <div className='space-y-6'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-xl font-bold text-gray-900'>📄 المستندات المطلوبة</h2>
                  <button
                    type='button'
                    onClick={() =>
                      setDocuments(prev => [
                        ...prev,
                        { title: '', description: '', required: true, active: true },
                      ])
                    }
                    className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-sm'
                  >
                    + إضافة مستند
                  </button>
                </div>

                <div className='space-y-4'>
                  {documents.map((doc, i) => (
                    <div key={i} className='p-4 bg-gray-50 border-2 border-gray-200 rounded-lg'>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-3'>
                        <div>
                          <label className='block text-xs font-bold text-gray-600 mb-1'>
                            عنوان المستند
                          </label>
                          <input
                            value={doc.title}
                            onChange={e =>
                              setDocuments(prev =>
                                prev.map((d, idx) =>
                                  idx === i ? { ...d, title: e.target.value } : d
                                )
                              )
                            }
                            className='w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none'
                            placeholder='صورة شخصية'
                          />
                        </div>
                        <div className='flex items-end gap-2'>
                          <label className='flex items-center gap-2'>
                            <input
                              type='checkbox'
                              checked={doc.required}
                              onChange={e =>
                                setDocuments(prev =>
                                  prev.map((d, idx) =>
                                    idx === i ? { ...d, required: e.target.checked } : d
                                  )
                                )
                              }
                              className='w-4 h-4'
                            />
                            <span className='text-sm'>مطلوب</span>
                          </label>
                          <button
                            type='button'
                            onClick={() => setDocuments(documents.filter((_, idx) => idx !== i))}
                            className='px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-sm'
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className='block text-xs font-bold text-gray-600 mb-1'>
                          وصف المستند
                        </label>
                        <textarea
                          value={doc.description}
                          onChange={e =>
                            setDocuments(prev =>
                              prev.map((d, idx) =>
                                idx === i ? { ...d, description: e.target.value } : d
                              )
                            )
                          }
                          rows={2}
                          className='w-full px-3 py-2 bg-white border border-gray-300 rounded-lg outline-none'
                          placeholder='وصف تفصيلي...'
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className='mt-6 flex justify-between items-center bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <div className='text-sm text-gray-500'>
              التبويب {activeTab + 1} من {tabs.length}
            </div>
            <div className='flex gap-3'>
              {activeTab > 0 && (
                <button
                  type='button'
                  onClick={() => setActiveTab(activeTab - 1)}
                  className='px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold'
                >
                  ← السابق
                </button>
              )}
              {activeTab < tabs.length - 1 && (
                <button
                  type='button'
                  onClick={() => setActiveTab(activeTab + 1)}
                  className='px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold'
                >
                  التالي →
                </button>
              )}
              {activeTab === tabs.length - 1 && (
                <button
                  type='submit'
                  disabled={loading}
                  className='px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold disabled:opacity-50'
                >
                  {loading ? '⏳ جاري الحفظ...' : '💾 حفظ الخدمة'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
