'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowRight, Save, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/permissions';

export default function CreateBlogPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (session && !hasPermission(session.user as any, 'MANAGE_BLOGS')) {
      router.push('/login');
    }
  }, [session, router]);
  
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    published: true,
    tags: '',
    seoTitle: '',
    seoDesc: ''
  });



  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      
      const res = await fetch('/api/admin/blogs/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create post');
      }

      toast.success('تم إنشاء المقال بنجاح');
      router.push('/admin/blogs');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/blogs" className="text-gray-500 hover:text-gray-900 transition">
          <ArrowRight size={24} />
        </Link>
        <h1 className="text-2xl font-bold">إضافة مقال جديد</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عنوان المقال *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="أدخل عنوان المقال..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">نبذة مختصرة</label>
              <textarea
                name="excerpt"
                rows={2}
                value={formData.excerpt}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="مقدمة قصيرة تظهر في نتائج البحث وقوائم المقالات..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">محتوى المقال *</label>
              <textarea
                name="content"
                required
                rows={15}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-mono"
                placeholder="اكتب محتوى المقال هنا (يدعم HTML أو Markdown لاحقاً)..."
              />
            </div>

            <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4">
              <h3 className="font-bold text-blue-900 flex items-center gap-2">
                <Save size={18} className="text-blue-600" />
                إعدادات SEO (جوجل)
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">عنوان الـ SEO (يظهر في جوجل)</label>
                <input
                  type="text"
                  name="seoTitle"
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="إذا تركت فارغاً سيتم استخدام عنوان المقال..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 mb-1">وصف الـ SEO (Meta Description)</label>
                <textarea
                  name="seoDesc"
                  rows={2}
                  value={formData.seoDesc}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="الوصف الذي يظهر أسفل العنوان في نتائج بحث جوجل..."
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-semibold mb-4 border-b pb-2">إعدادات النشر</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكلمات الدلالية (Tags)</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="جواز_سفر, استخراج, رسوم (مفصول بفاصلة)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رابط صورة الغلاف (URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="coverImage"
                      value={formData.coverImage}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left"
                      placeholder="https://example.com/image.jpg"
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="published"
                    name="published"
                    checked={formData.published}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-gray-700 cursor-pointer">
                    نشر فوراً
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-70"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
              ) : (
                <>
                  <Save size={20} />
                  <span>حفظ المقال</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
