'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import OrderProgressTracker from '@/components/OrderProgressTracker';

interface OrderDetails {
  id: string;
  service: {
    name: string;
    slug: string;
  };
  variant: {
    name: string;
    priceCents: number;
    etaDays: number;
  };
  status: string;
  totalCents: number;
  createdAt: Date;
  estimatedCompletionDate?: Date;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address?: string;
  notes?: string;
  documents: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    documentType: string;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else {
        setError('فشل في جلب تفاصيل الطلب');
      }
    } catch (error) {
      //
      // setError('حدث خطأ أثناء جلب تفاصيل الطلب');
      // } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, fetchOrderDetails]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>❌</div>
          <h3 className='text-xl font-semibold text-gray-900 mb-2'>خطأ في تحميل الطلب</h3>
          <p className='text-gray-600 mb-6'>{error || 'الطلب غير موجود'}</p>
          <Link
            href='/orders'
            className='inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium'
          >
            العودة للطلبات
          </Link>
        </div>
      </div>
    );
  }

  // Use estimatedCompletionDate if available, otherwise calculate from creation date
  const estimatedCompletion = order.estimatedCompletionDate
    ? new Date(order.estimatedCompletionDate)
    : (() => {
        const calculated = new Date(order.createdAt);
        calculated.setDate(calculated.getDate() + order.variant.etaDays);
        return calculated;
      })();

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b border-gray-200'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div>
              <div className='flex items-center space-x-4 space-x-reverse'>
                <Link
                  href='/orders'
                  className='text-green-600 hover:text-green-700 transition-colors duration-200'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10 19l-7-7m0 0l7-7m-7 7h18'
                    />
                  </svg>
                </Link>
                <div>
                  <h1 className='text-3xl font-bold text-gray-900'>تفاصيل الطلب</h1>
                  <p className='text-gray-600 mt-1'>رقم الطلب: {order.id}</p>
                </div>
              </div>
            </div>
            <div className='text-right'>
              <div className='text-2xl font-bold text-green-600'>
                {(order.totalCents / 100).toFixed(2)} جنيه
              </div>
              <div className='text-sm text-gray-500'>إجمالي المبلغ</div>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Order Summary */}
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>ملخص الطلب</h2>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                  <div>
                    <span className='text-sm text-gray-600'>الخدمة:</span>
                    <p className='font-medium text-gray-900'>{order.service.name}</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-600'>نوع الخدمة:</span>
                    <p className='font-medium text-gray-900'>{order.variant.name}</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-600'>المدة المتوقعة:</span>
                    <p className='font-medium text-gray-900'>{order.variant.etaDays} يوم</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-600'>تاريخ الطلب:</span>
                    <p className='font-medium text-gray-900'>
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>

                <div className='space-y-4'>
                  <div>
                    <span className='text-sm text-gray-600'>اسم العميل:</span>
                    <p className='font-medium text-gray-900'>{order.customerName}</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-600'>رقم الهاتف:</span>
                    <p className='font-medium text-gray-900'>{order.customerPhone}</p>
                  </div>
                  <div>
                    <span className='text-sm text-gray-600'>البريد الإلكتروني:</span>
                    <p className='font-medium text-gray-900'>{order.customerEmail}</p>
                  </div>
                  {order.address && (
                    <div>
                      <span className='text-sm text-gray-600'>العنوان:</span>
                      <p className='font-medium text-gray-900'>{order.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {order.notes && (
                <div className='mt-6 pt-6 border-t border-gray-200'>
                  <span className='text-sm text-gray-600'>ملاحظات إضافية:</span>
                  <p className='font-medium text-gray-900 mt-2'>{order.notes}</p>
                </div>
              )}
            </div>

            {/* Uploaded Documents */}
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>المستندات المرفوعة</h2>

              {order.documents.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>لا توجد مستندات مرفوعة</div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {order.documents.map(doc => (
                    <div key={doc.id} className='border border-gray-200 rounded-xl p-4 bg-gray-50'>
                      <div className='flex items-center justify-between mb-3'>
                        <div className='flex items-center space-x-3 space-x-reverse'>
                          <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                            <svg
                              className='w-5 h-5 text-blue-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                              />
                            </svg>
                          </div>
                          <div>
                            <h4 className='font-medium text-gray-900'>{doc.fileName}</h4>
                            <p className='text-sm text-gray-600'>
                              {(doc.fileSize / 1024 / 1024).toFixed(2)} ميجابايت
                            </p>
                          </div>
                        </div>
                        <a
                          href={doc.filePath}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='px-3 py-1 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 text-sm font-medium'
                        >
                          عرض
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Information */}
            <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-xl font-bold text-gray-900 mb-4'>معلومات الخدمة</h2>

              <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-semibold text-green-900'>{order.service.name}</h3>
                    <p className='text-sm text-green-700'>{order.variant.name}</p>
                  </div>
                  <div className='text-right'>
                    <div className='text-2xl font-bold text-green-600'>
                      {(order.variant.priceCents / 100).toFixed(2)} جنيه
                    </div>
                    <div className='text-xs text-green-600'>السعر الأساسي</div>
                  </div>
                </div>
              </div>

              <div className='mt-4 grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center p-4 bg-blue-50 rounded-xl border border-blue-200'>
                  <div className='text-2xl font-bold text-blue-600'>{order.variant.etaDays}</div>
                  <div className='text-sm text-blue-700'>يوم</div>
                  <div className='text-xs text-blue-600'>المدة المتوقعة</div>
                </div>

                <div className='text-center p-4 bg-purple-50 rounded-xl border border-purple-200'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {estimatedCompletion.toLocaleDateString('ar-EG')}
                  </div>
                  <div className='text-xs text-purple-600'>التاريخ المتوقع للإنجاز</div>
                </div>

                <div className='text-center p-4 bg-orange-50 rounded-xl border border-orange-200'>
                  <div className='text-2xl font-bold text-orange-600'>{order.documents.length}</div>
                  <div className='text-xs text-orange-600'>مستند مرفوع</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className='lg:col-span-1'>
            <div className='sticky top-24 space-y-6'>
              {/* Progress Tracker */}
              <OrderProgressTracker
                orderId={order.id}
                currentStatus={order.status}
                estimatedCompletion={estimatedCompletion}
              />

              {/* Quick Actions */}
              <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
                <h3 className='text-lg font-bold text-gray-900 mb-4'>إجراءات سريعة</h3>

                <div className='space-y-3'>
                  <button className='w-full px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors duration-200 font-medium'>
                    تحديث الحالة
                  </button>

                  <button className='w-full px-4 py-3 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-colors duration-200 font-medium'>
                    التواصل مع الدعم
                  </button>

                  <button className='w-full px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium'>
                    طباعة الطلب
                  </button>

                  <button className='w-full px-4 py-3 border border-red-300 text-red-600 rounded-xl hover:bg-red-50 transition-colors duration-200 font-medium'>
                    إلغاء الطلب
                  </button>
                </div>
              </div>

              {/* Contact Information */}
              <div className='bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white'>
                <h3 className='text-lg font-bold mb-4'>هل تحتاج مساعدة؟</h3>
                <p className='text-blue-100 text-sm mb-4'>
                  فريق الدعم متاح لمساعدتك على مدار الساعة
                </p>

                <div className='space-y-3 text-sm'>
                  <div className='flex items-center'>
                    <svg
                      className='w-4 h-4 ml-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                      />
                    </svg>
                    <span>+20 123 456 7890</span>
                  </div>

                  <div className='flex items-center'>
                    <svg
                      className='w-4 h-4 ml-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                    <span>support@example.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
