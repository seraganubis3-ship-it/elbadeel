'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useToast, ToastContainer } from '@/components/Toast';

export default function PaymentPage() {
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [method, setMethod] = useState<'VODAFONE_CASH' | 'INSTA_PAY'>('VODAFONE_CASH');
  const [senderPhone, setSenderPhone] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchOrder();
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [orderId]); // previewUrl cleanup in return, but orderId dependency is for fetch

  // Separate cleanup effect if needed, or just rely on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } catch (error) {
      // console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone || senderPhone.length < 11) {
      showError('خطأ', 'يرجى إدخال رقم هاتف صحيح');
      return;
    }

    if (!screenshot) {
      showError('خطأ', 'يرجى إرفاق صورة التحويل');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('method', method);
      formData.append('senderPhone', senderPhone);
      formData.append('screenshot', screenshot);

      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        showSuccess('تم بنجاح', 'تم إرسال بيانات الدفع بنجاح');
        setTimeout(() => {
          router.push(`/orders/${orderId}`);
        }, 2000);
      } else {
        showError('خطأ', data.error || 'حدث خطأ أثناء الإرسال');
      }
    } catch (error) {
      showError('خطأ', 'حدث خطأ في الاتصال');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshot(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const removeImage = () => {
    setScreenshot(null);
    setPreviewUrl(null);
  };

  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <div className='w-12 h-12 border-4 border-blue-600 rounded-full animate-spin border-t-transparent'></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50'>
        <p>الطلب غير موجود</p>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8' dir='rtl'>
      <div className='max-w-md mx-auto'>
        <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
          {/* Header */}
          <div className='bg-blue-600 p-6 text-center'>
            <h1 className='text-2xl font-bold text-white mb-2'>دفع المستحقات</h1>
            <p className='text-blue-100'>رقم الطلب: #{order.id.slice(-6)}</p>
          </div>

          <div className='p-8'>
            {/* Amount */}
            <div className='text-center mb-8'>
              <p className='text-slate-500 mb-2'>المبلغ المطلوب دفا</p>
              <div className='text-4xl font-extrabold text-slate-800'>
                {(order.totalCents / 100).toFixed(2)}{' '}
                <span className='text-lg text-slate-500'>ج.م</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* Methods */}
              <div className='grid grid-cols-2 gap-4'>
                <div
                  onClick={() => setMethod('VODAFONE_CASH')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${
                    method === 'VODAFONE_CASH'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className='text-2xl mb-2'>📱</div>
                  <div className='font-bold'>محفظة</div>
                </div>
                <div
                  onClick={() => setMethod('INSTA_PAY')}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all text-center ${
                    method === 'INSTA_PAY'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className='text-2xl mb-2'>🏦</div>
                  <div className='font-bold'>انستا باي</div>
                </div>
              </div>

              {/* Instructions */}
              <div className='bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm'>
                <p className='font-bold text-slate-700 mb-2'>تعليمات الدفع:</p>
                {method === 'VODAFONE_CASH' ? (
                  <p className='text-slate-600'>
                    يرجى التحويل على الرقم:{' '}
                    <span className='font-mono font-bold select-all'>01001544258</span>
                  </p>
                ) : (
                  <p className='text-slate-600'>
                    يرجى التحويل على الرقم:{' '}
                    <span className='font-mono font-bold select-all'>01001544258</span>
                  </p>
                )}
              </div>

              {/* Upload Screenshot */}
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  صورة التحويل (سكرين شوت)
                </label>

                {previewUrl ? (
                  <div className='relative rounded-2xl overflow-hidden border-2 border-slate-200 group'>
                    <div className='relative w-full h-64 bg-slate-100'>
                      <Image
                        src={previewUrl}
                        alt='Payment Preview'
                        fill
                        className='object-contain'
                      />
                    </div>
                    <div className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4'>
                      <button
                        type='button'
                        onClick={removeImage}
                        className='bg-red-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-600 transition-colors'
                      >
                        حذف الصورة 🗑️
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className='grid grid-cols-2 gap-4'>
                    {/* Camera Option */}
                    <div className='relative'>
                      <input
                        type='file'
                        id='camera-upload'
                        accept='image/*'
                        capture='environment'
                        className='hidden'
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor='camera-upload'
                        className='flex flex-col items-center justify-center p-6 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all h-full'
                      >
                        <div className='w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-2'>
                          📸
                        </div>
                        <span className='font-bold text-slate-700'>تصوير</span>
                        <span className='text-xs text-slate-500 mt-1'>التقط صورة مباشرة</span>
                      </label>
                    </div>

                    {/* Gallery Option */}
                    <div className='relative'>
                      <input
                        type='file'
                        id='gallery-upload'
                        accept='image/*'
                        className='hidden'
                        onChange={handleFileChange}
                      />
                      <label
                        htmlFor='gallery-upload'
                        className='flex flex-col items-center justify-center p-6 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all h-full'
                      >
                        <div className='w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-2xl mb-2'>
                          🖼️
                        </div>
                        <span className='font-bold text-slate-700'>المعرض</span>
                        <span className='text-xs text-slate-500 mt-1'>اختر من الملفات</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Sender Phone */}
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  رقم المحفظة / الهاتف المحول منه
                </label>
                <input
                  type='text'
                  value={senderPhone}
                  onChange={e => setSenderPhone(e.target.value)}
                  placeholder='010xxxxxxxx'
                  className='w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-left'
                  dir='ltr'
                  required
                />
              </div>

              <button
                type='submit'
                disabled={submitting}
                className='w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-200'
              >
                {submitting ? 'جاري التأكيد...' : 'تأكيد عملية الدفع'}
              </button>
            </form>

            <div className='mt-6 text-center'>
              <Link
                href={`/orders/${order.id}`}
                className='text-sm text-slate-500 hover:text-slate-700'
              >
                العودة لتفاصيل الطلب
              </Link>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
