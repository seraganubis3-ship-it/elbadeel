'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import OrderProgressTracker from '@/components/OrderProgressTracker';
import { PREDEFINED_FINES } from '@/constants/fines';
import { useToast, ToastContainer } from '@/components/Toast';

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
  selectedFines?: string;
  finesDetails?: string;
  documents: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    documentType: string;
    uploadedAt: Date;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { toasts, removeToast, showSuccess, showError } = useToast();

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
      setError('حدث خطأ أثناء جلب تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId, fetchOrderDetails]);

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center' dir='rtl'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin'></div>
          <p className='text-slate-600 font-medium animate-pulse'>جاري تحميل الطلب...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center' dir='rtl'>
        <div className='text-center space-y-4'>
          <div className='text-6xl'>❌</div>
          <h3 className='text-2xl font-bold text-slate-900'>عفواً</h3>
          <p className='text-slate-600'>{error || 'الطلب غير موجود'}</p>
          <Link
            href='/orders'
            className='inline-flex items-center px-8 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium'
          >
            العودة للطلبات
          </Link>
        </div>
      </div>
    );
  }

  // Calculate dates
  const estimatedCompletion = order.estimatedCompletionDate
    ? new Date(order.estimatedCompletionDate)
    : (() => {
        const calculated = new Date(order.createdAt);
        calculated.setDate(calculated.getDate() + order.variant.etaDays);
        return calculated;
      })();

  // Parse Fines
  const fines = order.selectedFines
    ? (JSON.parse(order.selectedFines) as string[])
        .map(id => PREDEFINED_FINES.find(f => f.id === id))
        .filter(Boolean)
    : [];

  return (
    <div className='min-h-screen bg-slate-50 relative' dir='rtl'>
      {/* Absolute Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03] pointer-events-none"></div>
      <div className='fixed top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none'></div>
      <div className='fixed bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none'></div>

      {/* Header / Hero */}
      <div className='relative bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-20'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-4'>
              <Link
                href='/orders'
                className='p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500'
              >
                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M14 5l7 7m0 0l-7 7m7-7H3'
                    className='rotate-180'
                  />
                </svg>
              </Link>
              <div>
                <h1 className='text-xl font-black text-slate-900 tracking-tight'>
                  تفاصيل الطلب{' '}
                  <span className='text-slate-400 font-medium'>#{order.id.slice(-6)}</span>
                </h1>
                <div className='flex items-center gap-2 text-xs font-bold text-slate-500 mt-0.5'>
                  <span>{order.service.name}</span>
                  <span>•</span>
                  <span>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</span>
                </div>
              </div>
            </div>

            <div className='text-left'>
              <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>الإجمالي</p>
              <p className='text-2xl font-black text-slate-900'>
                {(order.totalCents / 100).toFixed(2)}{' '}
                <span className='text-sm font-bold text-slate-500'>ج.م</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8'>
          {/* Sidebar (Tracker & Actions) - Order changed on Mobile */}
          <div className='lg:col-span-4 lg:order-2 space-y-6'>
            {/* Status Card */}
            <div className='bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100'>
              <div className='p-6'>
                <h2 className='text-lg font-bold text-slate-900 mb-6'>حالة الطلب</h2>
                <OrderProgressTracker
                  orderId={order.id}
                  currentStatus={order.status}
                  estimatedCompletion={estimatedCompletion}
                />
              </div>

              {/* Action Bar */}
              <div className='bg-slate-50 p-6 border-t border-slate-100 grid gap-3'>
                {order.status === 'waiting_payment' && (
                  <Link
                    href={`/orders/${order.id}/payment`}
                    className='w-full py-4 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-200 hover:shadow-emerald-300 transition-all transform hover:-translate-y-0.5'
                  >
                    💳 دفع المستحقات الآن
                  </Link>
                )}
                <button className='w-full py-3 text-center bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold text-sm transition-colors'>
                  💬 تواصل مع الدعم
                </button>
                {order.status === 'pending' && (
                  <button className='w-full py-3 text-center bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-sm transition-colors'>
                    ⚠️ إلغاء الطلب
                  </button>
                )}
              </div>
            </div>

            {/* Need Help Card */}
            <div className='bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2'></div>
              <h3 className='text-xl font-bold mb-2 relative z-10'>تحتاج مساعدة؟</h3>
              <p className='text-blue-100 text-sm mb-6 relative z-10 leading-relaxed'>
                فريقنا جاهز للرد على استفساراتك ومساعدتك في أي وقت.
              </p>
              <a
                href='tel:123456789'
                className='inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold transition-all'
              >
                <span>📞</span>
                <span>+20 123 456 7890</span>
              </a>
            </div>
          </div>

          {/* Main Details */}
          <div className='lg:col-span-8 lg:order-1 space-y-8'>
            {/* Service & Variant */}
            <div className='bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-200/60 relative overflow-hidden group hover:border-blue-200 transition-colors'>
              <div className='absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500'></div>
              <div className='flex flex-col md:flex-row md:items-center justify-between gap-6'>
                <div>
                  <span className='inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-black mb-2 tracking-wide uppercase'>
                    تفاصيل الخدمة
                  </span>
                  <h2 className='text-3xl font-black text-slate-900 mb-2'>{order.service.name}</h2>
                  <p className='text-lg text-slate-500 font-medium'>{order.variant.name}</p>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-center min-w-[100px]'>
                    <div className='text-2xl font-black text-slate-900'>
                      {order.variant.etaDays}
                    </div>
                    <div className='text-xs font-bold text-slate-500 uppercase'>يوم عمل</div>
                  </div>
                  <div className='px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100 text-center min-w-[140px]'>
                    <div className='text-2xl font-black text-emerald-600'>
                      {(order.variant.priceCents / 100).toFixed(0)}
                    </div>
                    <div className='text-xs font-bold text-slate-500 uppercase'>جنيه مصري</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Breakdown (Fines) */}
            {(fines.length > 0 || order.finesDetails) && (
              <div className='bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 overflow-hidden relative'>
                <div className='absolute top-0 right-0 p-8 opacity-5'>
                  <svg className='w-32 h-32' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.69 1.64 1.83 1.64 1.22 0 1.6-.51 1.6-1.11 0-.62-.57-1.07-2.13-1.55C9.05 13.13 7.26 12.43 7.26 9.31c0-1.68 1.21-2.94 2.87-3.32V4h2.66v1.93c1.61.35 2.9 1.3 3.1 3.29h-1.98c-.13-.89-.78-1.52-1.76-1.52-1.08 0-1.48.51-1.48 1.11 0 .61.57 1.07 1.95 1.48 1.93.58 3.82 1.35 3.82 4.14 0 1.76-1.28 3.09-3.03 3.47z' />
                  </svg>
                </div>

                <h3 className='text-xl font-bold text-slate-900 mb-6 flex items-center gap-3'>
                  <span className='w-8 h-8 bg-rose-100 text-rose-600 rounded-lg flex items-center justify-center text-sm'>
                    💰
                  </span>
                  الرسوم والغرامات الإضافية
                </h3>

                <div className='grid gap-4 relative z-10'>
                  {fines.map(fine => (
                    <div
                      key={fine!.id}
                      className='flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100'
                    >
                      <div className='flex items-center gap-3'>
                        <div className='w-2 h-2 rounded-full bg-rose-500'></div>
                        <span className='font-bold text-slate-700'>{fine!.name}</span>
                      </div>
                      <span className='font-black text-rose-600'>
                        +{(fine!.amountCents / 100).toFixed(0)}{' '}
                        <span className='text-xs text-rose-400 font-bold px-1'>ج.م</span>
                      </span>
                    </div>
                  ))}

                  {order.finesDetails && !order.finesDetails.startsWith('"') && (
                    <div className='mt-2 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-sm text-yellow-800 font-medium whitespace-pre-wrap leading-relaxed'>
                      {order.finesDetails}
                    </div>
                  )}

                  {/* Summary Total */}
                  <div className='mt-4 pt-4 border-t-2 border-slate-100 flex items-center justify-between'>
                    <span className='font-bold text-slate-500'>إجمالي الإضافات</span>
                    <span className='text-2xl font-black text-slate-900'>
                      {(fines.reduce((acc, f) => acc + f!.amountCents, 0) / 100).toFixed(2)}
                      <span className='text-sm font-bold text-slate-400 mr-2'>ج.م</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Documents Gallery */}
            <div className='space-y-4'>
              <div className='flex items-center justify-between'>
                <h3 className='text-xl font-bold text-slate-900'>المستندات والمرفقات</h3>
                <span className='px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-600'>
                  {order.documents.length} ملف
                </span>
              </div>

              {order.documents.length === 0 ? (
                <div className='bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 p-12 text-center'>
                  <div className='text-4xl mb-4 opacity-50'>📂</div>
                  <p className='text-slate-500 font-medium'>لا توجد مستندات مرفوعة</p>
                </div>
              ) : (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {order.documents.map(doc => {
                    const isImage = doc.fileType.startsWith('image/');
                    return (
                      <div
                        key={doc.id}
                        className='group flex flex-col bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100/50 transition-all relative overflow-hidden'
                      >
                        {isImage && (
                          <div className='h-48 w-full bg-slate-100 relative'>
                            <Image
                              src={doc.filePath}
                              alt={doc.fileName}
                              width={400}
                              height={192}
                              unoptimized
                              className='w-full h-full object-cover'
                            />
                          </div>
                        )}

                        <a
                          href={doc.filePath}
                          target='_blank'
                          rel='noopener noreferrer'
                          className={`flex items-start gap-4 p-5 ${isImage ? 'border-t border-slate-100' : ''}`}
                        >
                          <div
                            className={`p-3 rounded-xl ${doc.documentType === 'PAYMENT_RECEIPT' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}
                          >
                            <svg
                              className='w-6 h-6'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                              />
                            </svg>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <p className='font-bold text-slate-900 truncate mb-1'>{doc.fileName}</p>
                            <p className='text-xs text-slate-500 font-medium flex items-center gap-2'>
                              <span>{(doc.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                              <span className='w-1 h-1 rounded-full bg-slate-300'></span>
                              <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                            </p>
                            <div className='mt-2 text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:underline'>
                              {isImage ? '🔍 عرض بالحجم الكامل' : '⬇️ تحميل الملف'}
                            </div>
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Customer Info (Collapsed/Simplified) */}
            <div className='bg-white rounded-3xl p-6 border border-slate-100 shadow-sm'>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>بيانات العميل</h3>
              <div className='grid md:grid-cols-2 gap-6'>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg'>
                    👤
                  </div>
                  <div>
                    <p className='text-xs font-bold text-slate-400 uppercase'>الاسم</p>
                    <p className='font-bold text-slate-900'>{order.customerName}</p>
                  </div>
                </div>
                <div className='flex items-center gap-4'>
                  <div className='w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg'>
                    📱
                  </div>
                  <div>
                    <p className='text-xs font-bold text-slate-400 uppercase'>الهاتف</p>
                    <p className='font-bold text-slate-900 font-mono' dir='ltr'>
                      {order.customerPhone}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
