'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface ServiceVariant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
  active: boolean;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  active: boolean;
  categoryId: string;
  category?: { name: string };
  variants: ServiceVariant[];
  documents: Array<{
    id: string;
    title: string;
  }>;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/services'),
        fetch('/api/admin/categories'),
      ]);

      const servicesData = await servicesRes.json();
      const categoriesData = await categoriesRes.json();

      if (servicesData.success) {
        setServices(servicesData.services);
      }

      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الخدمة؟')) return;

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ تم حذف الخدمة بنجاح!');
        fetchData();
      } else {
        alert(data.error || 'حدث خطأ');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الحذف');
    }
  };

  const filteredServices = services.filter(service => {
    const matchesSearch =
      service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !filterCategory || service.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: services.length,
    active: services.filter(s => s.active).length,
    inactive: services.filter(s => !s.active).length,
  };

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
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Header */}
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>الخدمات</h1>
            <p className='text-gray-500 mt-1'>إدارة جميع خدمات المنصة</p>
          </div>
          <div className='flex gap-3'>
            <Link href='/admin/categories'>
              <button className='px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-all'>
                الفئات
              </button>
            </Link>
            <Link href='/admin/services/create'>
              <button className='px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-all'>
                + إضافة خدمة
              </button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-white border border-gray-200 rounded-lg p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>إجمالي الخدمات</p>
                <p className='text-2xl font-bold text-gray-900'>{stats.total}</p>
              </div>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='bg-white border border-gray-200 rounded-lg p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>الخدمات النشطة</p>
                <p className='text-2xl font-bold text-green-600'>{stats.active}</p>
              </div>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className='bg-white border border-gray-200 rounded-lg p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <p className='text-sm text-gray-500 mb-1'>الخدمات الموقوفة</p>
                <p className='text-2xl font-bold text-red-600'>{stats.inactive}</p>
              </div>
              <div className='w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className='bg-white border border-gray-200 rounded-lg p-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <input
                type='text'
                placeholder='🔍 ابحث عن خدمة...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'
              />
            </div>
            <div>
              <select
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'
              >
                <option value=''>كل الفئات</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Services Table */}
        <div className='bg-white border border-gray-200 rounded-lg overflow-hidden'>
          <div className='overflow-x-auto'>
            <table className='w-full'>
              <thead className='bg-gray-50 border-b border-gray-200'>
                <tr>
                  <th className='px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase'>
                    الخدمة
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase'>
                    الفئة
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase'>
                    الأنواع
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase'>
                    المستندات
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase'>
                    الحالة
                  </th>
                  <th className='px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase'>
                    إجراءات
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-200'>
                {filteredServices.length > 0 ? (
                  filteredServices.map(service => (
                    <tr key={service.id} className='hover:bg-gray-50 transition-colors'>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-3'>
                          {service.icon &&
                            (service.icon.startsWith('/') || service.icon.startsWith('http')) && (
                              <div className='w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0'>
                                <Image
                                  src={service.icon}
                                  alt={service.name}
                                  width={24}
                                  height={24}
                                  className='w-6 h-6 rounded object-cover'
                                />
                              </div>
                            )}
                          <div>
                            <p className='font-medium text-gray-900'>{service.name}</p>
                            {service.description && (
                              <p className='text-sm text-gray-500 line-clamp-1'>
                                {service.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800'>
                          {service.category?.name || 'غير محدد'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex flex-col gap-1'>
                          {service.variants.slice(0, 2).map((v, i) => (
                            <div key={v.id} className='text-xs text-gray-600'>
                              <span className='font-medium'>{v.name}:</span> {v.priceCents / 100}{' '}
                              ج.م
                            </div>
                          ))}
                          {service.variants.length > 2 && (
                            <span className='text-xs text-gray-400'>
                              +{service.variants.length - 2} أخرى
                            </span>
                          )}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <span className='text-sm text-gray-600'>
                          {service.documents.length} مستند
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            service.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {service.active ? 'نشط' : 'موقوف'}
                        </span>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='flex items-center gap-2'>
                          <Link href={`/admin/services/edit/${service.id}`}>
                            <button
                              className='p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors'
                              title='تعديل'
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
                                  d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
                                />
                              </svg>
                            </button>
                          </Link>
                          <button
                            onClick={() => handleDelete(service.id)}
                            className='p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                            title='حذف'
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
                ) : (
                  <tr>
                    <td colSpan={6} className='px-6 py-12 text-center'>
                      <div className='text-gray-400'>
                        <svg
                          className='w-12 h-12 mx-auto mb-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                          />
                        </svg>
                        <p className='text-lg font-medium'>لا توجد خدمات</p>
                        <p className='text-sm mt-1'>
                          جرب البحث بكلمات أخرى أو قم بإضافة خدمة جديدة
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Results Count */}
        {filteredServices.length > 0 && (
          <div className='text-sm text-gray-500 text-center'>
            عرض {filteredServices.length} من أصل {services.length} خدمة
          </div>
        )}
      </div>
    </div>
  );
}
