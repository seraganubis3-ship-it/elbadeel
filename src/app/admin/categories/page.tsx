'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  orderIndex: number;
  active: boolean;
  _count?: {
    services: number;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    orderIndex: 0,
    active: true,
    image: null as File | null,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories');
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      // console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('slug', formData.slug);
      formDataToSend.append('orderIndex', formData.orderIndex.toString());
      formDataToSend.append('active', formData.active.toString());

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';

      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const data = await res.json();

      if (data.success) {
        alert(editingCategory ? '✅ تم تحديث الفئة بنجاح!' : '✅ تم إنشاء الفئة بنجاح!');
        setShowModal(false);
        setEditingCategory(null);
        setFormData({ name: '', slug: '', orderIndex: 0, active: true, image: null });
        fetchCategories();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      orderIndex: category.orderIndex,
      active: category.active,
      image: null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ تم حذف الفئة بنجاح!');
        fetchCategories();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const generateSlug = (name: string) => {
    const arabicToEnglish: { [key: string]: string } = {
      ا: 'a',
      أ: 'a',
      إ: 'i',
      آ: 'a',
      ب: 'b',
      ت: 't',
      ث: 'th',
      ج: 'j',
      ح: 'h',
      خ: 'kh',
      د: 'd',
      ذ: 'th',
      ر: 'r',
      ز: 'z',
      س: 's',
      ش: 'sh',
      ص: 's',
      ض: 'd',
      ط: 't',
      ظ: 'z',
      ع: 'a',
      غ: 'gh',
      ف: 'f',
      ق: 'q',
      ك: 'k',
      ل: 'l',
      م: 'm',
      ن: 'n',
      ه: 'h',
      و: 'w',
      ي: 'y',
      ة: 'a',
      ' ': '-',
    };

    let slug = name.toLowerCase();
    for (const [ar, en] of Object.entries(arabicToEnglish)) {
      slug = slug.replace(new RegExp(ar, 'g'), en);
    }

    slug = slug.replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
    setFormData(prev => ({ ...prev, slug }));
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto'></div>
          <p className='mt-4 text-lg font-bold text-gray-700'>جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600'>
                إدارة الفئات
              </h1>
              <p className='text-slate-500 text-lg mt-2 font-bold'>تنظيم وترتيب فئات الخدمات</p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setFormData({
                  name: '',
                  slug: '',
                  orderIndex: categories.length,
                  active: true,
                  image: null,
                });
                setShowModal(true);
              }}
              className='px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-lg shadow-purple-200 transition-all flex items-center gap-2'
            >
              <span className='text-2xl'>+</span>
              إضافة فئة جديدة
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {categories.map(category => (
            <div
              key={category.id}
              className='bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden hover:shadow-2xl transition-all group'
            >
              <div
                className={`p-6 ${category.active ? 'bg-gradient-to-r from-purple-500 to-indigo-600' : 'bg-slate-400'}`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-4'>
                    <div className='w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl shadow-lg'>
                      {category.icon && (category.icon.startsWith('/') || category.icon.startsWith('http')) ? (
                        <Image
                          src={category.icon}
                          alt={category.name}
                          width={48}
                          height={48}
                          className='w-12 h-12 object-cover rounded-xl'
                        />
                      ) : (
                        <span className='text-3xl'>{category.icon || '📁'}</span>
                      )}
                    </div>
                    <div>
                      <h3 className='text-xl font-black text-white'>{category.name}</h3>
                      <p className='text-white/80 text-sm font-bold'>/{category.slug}</p>
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-black ${category.active ? 'bg-white/20 text-white' : 'bg-white/30 text-white'}`}
                  >
                    #{category.orderIndex}
                  </div>
                </div>
              </div>

              <div className='p-6'>
                <div className='flex items-center justify-between mb-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-2xl'>📦</span>
                    <span className='text-slate-600 font-bold'>
                      {category._count?.services || 0} خدمة
                    </span>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-black ${category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                  >
                    {category.active ? 'مفعّل' : 'غير مفعّل'}
                  </div>
                </div>

                <div className='flex gap-2'>
                  <button
                    onClick={() => handleEdit(category)}
                    className='flex-1 px-4 py-3 bg-blue-50 text-blue-600 rounded-xl font-black hover:bg-blue-600 hover:text-white transition-all'
                  >
                    تعديل
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className='flex-1 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-600 hover:text-white transition-all'
                  >
                    حذف
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className='text-center py-20'>
            <div className='text-6xl mb-4'>📂</div>
            <h3 className='text-2xl font-black text-slate-700 mb-2'>لا توجد فئات بعد</h3>
            <p className='text-slate-500 font-bold'>ابدأ بإضافة فئة جديدة لتنظيم الخدمات</p>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto'>
              <div className='bg-gradient-to-r from-purple-600 to-indigo-600 p-6'>
                <h2 className='text-2xl font-black text-white'>
                  {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className='p-8 space-y-6'>
                <div className='space-y-2'>
                  <label className='text-xs font-black text-purple-400 uppercase tracking-widest'>
                    اسم الفئة *
                  </label>
                  <input
                    type='text'
                    value={formData.name}
                    onChange={e => {
                      setFormData(prev => ({ ...prev, name: e.target.value }));
                      if (!editingCategory) generateSlug(e.target.value);
                    }}
                    required
                    className='w-full px-5 py-4 bg-purple-50/50 border-2 border-purple-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-slate-800'
                    placeholder='مثال: البطاقات والهويات'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-black text-purple-400 uppercase tracking-widest'>
                    الرابط (Slug) *
                  </label>
                  <input
                    type='text'
                    value={formData.slug}
                    onChange={e => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    required
                    className='w-full px-5 py-4 bg-purple-50/50 border-2 border-purple-100 rounded-2xl focus:border-purple-500 outline-none font-mono text-slate-800'
                    placeholder='cards-and-ids'
                    pattern='[a-zA-Z0-9-_]+'
                  />
                  <p className='text-xs text-slate-500'>أحرف إنجليزية وأرقام وشرطات فقط</p>
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-black text-purple-400 uppercase tracking-widest'>
                    ترتيب العرض
                  </label>
                  <input
                    type='number'
                    value={formData.orderIndex}
                    onChange={e =>
                      setFormData(prev => ({ ...prev, orderIndex: parseInt(e.target.value) || 0 }))
                    }
                    className='w-full px-5 py-4 bg-purple-50/50 border-2 border-purple-100 rounded-2xl focus:border-purple-500 outline-none font-bold text-slate-800'
                  />
                </div>

                <div className='space-y-2'>
                  <label className='text-xs font-black text-purple-400 uppercase tracking-widest'>
                    صورة/أيقونة الفئة
                  </label>
                  {editingCategory?.icon && !formData.image && (
                    <div className='mb-2'>
                      <Image
                        src={editingCategory.icon}
                        alt={editingCategory.name}
                        width={80}
                        height={80}
                        className='w-20 h-20 rounded-xl border'
                      />
                    </div>
                  )}
                  <input
                    type='file'
                    accept='image/*'
                    onChange={e =>
                      setFormData(prev => ({ ...prev, image: e.target.files?.[0] || null }))
                    }
                    className='w-full px-5 py-4 bg-purple-50/50 border-2 border-purple-100 rounded-2xl focus:border-purple-500 outline-none'
                  />
                </div>

                <div className='flex items-center gap-3 p-4 bg-purple-50 rounded-2xl'>
                  <input
                    type='checkbox'
                    checked={formData.active}
                    onChange={e => setFormData(prev => ({ ...prev, active: e.target.checked }))}
                    className='w-5 h-5 rounded border-purple-300 text-purple-600 focus:ring-purple-500'
                  />
                  <label className='font-black text-slate-700'>تفعيل الفئة</label>
                </div>

                <div className='flex gap-4'>
                  <button
                    type='button'
                    onClick={() => {
                      setShowModal(false);
                      setEditingCategory(null);
                      setFormData({ name: '', slug: '', orderIndex: 0, active: true, image: null });
                    }}
                    className='flex-1 px-6 py-4 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-2xl font-black transition-all'
                  >
                    إلغاء
                  </button>
                  <button
                    type='submit'
                    disabled={saving}
                    className='flex-1 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl font-black shadow-lg transition-all disabled:opacity-50'
                  >
                    {saving ? '⏳ جاري الحفظ...' : editingCategory ? '💾 تحديث' : '💾 حفظ'}
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
