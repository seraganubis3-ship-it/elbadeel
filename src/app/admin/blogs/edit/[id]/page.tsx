'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { ArrowRight, Save } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/permissions';

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    coverImage: '',
    published: true,
    tags: '',
    seoTitle: '',
    seoDesc: '',
  });

  useEffect(() => {
    if (session && !hasPermission(session.user as any, 'MANAGE_BLOGS')) {
      router.push('/login');
    }
  }, [session, router]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/blogs/posts`);
        const posts = await res.json();
        const post = posts.find((p: any) => p.id === params.id);

        if (!post) {
          toast.error('المقال غير موجود');
          router.push('/admin/blogs');
          return;
        }

        setFormData({
          title: post.title || '',
          excerpt: post.excerpt || '',
          content: post.content || '',
          coverImage: post.coverImage || '',
          published: post.published,
          tags: post.tags?.map((t: any) => t.name).join(', ') || '',
          seoTitle: post.seoTitle || '',
          seoDesc: post.seoDesc || '',
        });
      } catch (error) {
        toast.error('فشل في تحميل بيانات المقال');
      } finally {
        setFetching(false);
      }
    };

    fetchPost();
  }, [params.id, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const res = await fetch(`/api/admin/blogs/posts/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: tagsArray,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update post');
      }

      toast.success('تم تحديث المقال بنجاح');
      router.push('/admin/blogs');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='p-6 max-w-5xl mx-auto'>
      <div className='flex items-center gap-4 mb-6'>
        <Link href='/admin/blogs' className='text-gray-500 hover:text-gray-900 transition'>
          <ArrowRight size={24} />
        </Link>
        <h1 className='text-2xl font-bold'>تعديل المقال</h1>
      </div>

      <form onSubmit={handleSubmit} className='space-y-6 bg-white p-6 rounded-lg shadow'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          <div className='md:col-span-2 space-y-6'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>عنوان المقال *</label>
              <input
                type='text'
                name='title'
                required
                value={formData.title}
                onChange={handleChange}
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>نبذة مختصرة</label>
              <textarea
                name='excerpt'
                rows={2}
                value={formData.excerpt}
                onChange={handleChange}
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>محتوى المقال *</label>
              <textarea
                name='content'
                required
                rows={15}
                value={formData.content}
                onChange={handleChange}
                className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono'
              />
            </div>

            <div className='bg-blue-50/50 p-6 rounded-xl border border-blue-100 space-y-4'>
              <h3 className='font-bold text-blue-900 flex items-center gap-2'>
                <Save size={18} className='text-blue-600' />
                إعدادات SEO (جوجل)
              </h3>

              <div>
                <label className='block text-sm font-medium text-blue-900 mb-1'>
                  عنوان الـ SEO
                </label>
                <input
                  type='text'
                  name='seoTitle'
                  value={formData.seoTitle}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-blue-900 mb-1'>وصف الـ SEO</label>
                <textarea
                  name='seoDesc'
                  rows={2}
                  value={formData.seoDesc}
                  onChange={handleChange}
                  className='w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                />
              </div>
            </div>
          </div>

          <div className='space-y-6'>
            <div className='bg-gray-50 p-4 rounded-lg border'>
              <h3 className='font-semibold mb-4 border-b pb-2'>إعدادات النشر</h3>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    الكلمات الدلالية
                  </label>
                  <input
                    type='text'
                    name='tags'
                    value={formData.tags}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>
                    رابط صورة الغلاف (URL)
                  </label>
                  <input
                    type='url'
                    name='coverImage'
                    value={formData.coverImage}
                    onChange={handleChange}
                    className='w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-left'
                    dir='ltr'
                  />
                </div>

                <div className='flex items-center gap-2 pt-2'>
                  <input
                    type='checkbox'
                    id='published'
                    name='published'
                    checked={formData.published}
                    onChange={handleChange}
                    className='w-4 h-4 text-blue-600 rounded'
                  />
                  <label
                    htmlFor='published'
                    className='text-sm font-medium text-gray-700 cursor-pointer'
                  >
                    منشور
                  </label>
                </div>
              </div>
            </div>

            <button
              type='submit'
              disabled={loading}
              className='w-full bg-blue-600 text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 transition disabled:opacity-70'
            >
              {loading ? (
                <span className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></span>
              ) : (
                <>
                  <Save size={20} />
                  <span>تحديث المقال</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
