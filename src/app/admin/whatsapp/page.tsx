'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface ConnectionInfo {
  phoneNumber: string;
  name: string;
  platform: string;
}

interface WhatsAppStatus {
  status: 'connected' | 'disconnected' | 'loading' | 'qr_ready';
  qrRequired?: boolean;
  loading?: boolean;
  connectionInfo?: ConnectionInfo;
  qrImage?: string;
  message?: string;
}

export default function WhatsAppPage() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [testPhone, setTestPhone] = useState('');
  const [testMessage, setTestMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const WHATSAPP_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'http://127.0.0.1:3001';

  // Fetch WhatsApp status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/qr?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      const data = await response.json();
      setStatus(data);
      setStatus(data);
    } catch (error) {
      // console.error('WhatsApp Fetch Error:', error);
      setStatus({
        status: 'disconnected',
        message: `فشل الاتصال: ${(error as Error).message} (URL: ${WHATSAPP_API_URL})`,
      });
    } finally {
      setIsLoading(false);
    }
  }, [WHATSAPP_API_URL]);

  // Auto-refresh status
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [fetchStatus]);

  useEffect(() => {
    const handleFocus = () => fetchStatus();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchStatus();
    };
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [fetchStatus]);

  // Handle logout
  const handleLogout = async () => {
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/logout`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        toast.success('تم تسجيل الخروج من WhatsApp');
        fetchStatus();
      } else {
        toast.error(data.message || 'فشل في تسجيل الخروج');
      }
    } catch {
      toast.error('خطأ في الاتصال بالبوت');
    }
  };

  // Send test message
  const handleSendTest = async () => {
    if (!testPhone || !testMessage) {
      toast.error('أدخل رقم الهاتف والرسالة');
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`${WHATSAPP_API_URL}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: testPhone, message: testMessage }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success('تم إرسال الرسالة بنجاح! ✅');
        setTestMessage('');
      } else {
        toast.error(data.error || 'فشل في إرسال الرسالة');
      }
    } catch {
      toast.error('خطأ في الاتصال بالبوت');
    } finally {
      setIsSending(false);
    }
  };

  // Check if user is admin
  if (!session?.user || session.user.role !== 'ADMIN') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-green-50 to-slate-100'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-gray-900 mb-4'>غير مصرح</h1>
          <p className='text-gray-600 mb-4'>هذه الصفحة للمديرين فقط</p>
          <Link href='/admin' className='text-green-600 hover:underline'>
            العودة للوحة التحكم
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center gap-4 mb-4'>
            <Link
              href='/admin'
              className='p-2 bg-white rounded-lg shadow hover:shadow-md transition-all'
            >
              <svg
                className='w-5 h-5 text-gray-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
            </Link>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-3'>
                <span className='text-4xl'>📱</span>
                إدارة WhatsApp
              </h1>
              <p className='text-gray-600 mt-1'>ربط WhatsApp لإرسال إشعارات تلقائية للعملاء</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
            <span className='text-2xl'>📊</span>
            حالة الاتصال
          </h2>

          {isLoading ? (
            <div className='flex items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent'></div>
              <span className='mr-4 text-gray-600'>جاري التحقق من الاتصال...</span>
            </div>
          ) : status?.status === 'connected' ? (
            // Connected State
            <div className='text-center py-8'>
              <div className='w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-12 h-12 text-green-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M5 13l4 4L19 7'
                  />
                </svg>
              </div>
              <h3 className='text-2xl font-bold text-green-600 mb-2'>متصل ✅</h3>
              <p className='text-gray-600 mb-4'>WhatsApp جاهز لإرسال الرسائل</p>

              {status.connectionInfo && (
                <div className='bg-green-50 rounded-xl p-4 inline-block text-right mb-6'>
                  <p className='text-sm text-gray-600 mb-1'>
                    <span className='font-semibold'>الاسم:</span>{' '}
                    {status.connectionInfo.name || 'غير معروف'}
                  </p>
                  <p className='text-sm text-gray-600 mb-1'>
                    <span className='font-semibold'>رقم الهاتف:</span> +
                    {status.connectionInfo.phoneNumber}
                  </p>
                  <p className='text-sm text-gray-600'>
                    <span className='font-semibold'>المنصة:</span> {status.connectionInfo.platform}
                  </p>
                </div>
              )}

              <button
                onClick={handleLogout}
                className='px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-all'
              >
                تسجيل الخروج من WhatsApp
              </button>
            </div>
          ) : status?.status === 'qr_ready' ? (
            // QR Code State
            <div className='text-center py-8'>
              <div className='mb-4'>
                <span className='text-5xl'>📲</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>امسح الـ QR Code</h3>
              <p className='text-gray-600 mb-6'>{status.message}</p>

              {/* QR Code Image - Using regular img for base64 reliability */}
              <div className='bg-white p-4 rounded-2xl shadow-lg inline-block mb-6 border-4 border-green-500'>
                {status.qrImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={status.qrImage}
                    alt='WhatsApp QR Code'
                    className='w-64 h-64 mx-auto'
                    width={256}
                    height={256}
                  />
                ) : (
                  <div className='w-64 h-64 flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg'>
                    <div className='text-center'>
                      <div className='animate-spin rounded-full h-8 w-8 border-4 border-green-500 border-t-transparent mx-auto mb-2'></div>
                      <p className='text-sm text-gray-400 font-medium'>جاري توليد الكود...</p>
                    </div>
                  </div>
                )}
              </div>

              <div className='bg-blue-50 rounded-xl p-4 max-w-md mx-auto text-right'>
                <h4 className='font-bold text-blue-800 mb-2'>📋 خطوات الربط:</h4>
                <ol className='text-sm text-blue-700 space-y-1 list-decimal list-inside'>
                  <li>افتح WhatsApp على موبايلك</li>
                  <li>اذهب للإعدادات ← الأجهزة المرتبطة</li>
                  <li>اضغط على &quot;ربط جهاز&quot;</li>
                  <li>امسح الـ QR Code اللي فوق</li>
                </ol>
              </div>

              <p className='text-sm text-gray-500 mt-4 animate-pulse'>
                ⏳ الكود بيتحدث تلقائياً كل فترة...
              </p>
            </div>
          ) : status?.status === 'loading' ? (
            // Loading State
            <div className='text-center py-12'>
              <div className='animate-spin rounded-full h-16 w-16 border-4 border-yellow-500 border-t-transparent mx-auto mb-4'></div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>جاري تحميل WhatsApp</h3>
              <p className='text-gray-600'>{status.message}</p>
              <p className='text-sm text-gray-500 mt-2'>انتظر قليلاً حتى يظهر الـ QR Code...</p>
            </div>
          ) : (
            // Disconnected State
            <div className='text-center py-12'>
              <div className='w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <svg
                  className='w-12 h-12 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M6 18L18 6M6 6l12 12'
                  />
                </svg>
              </div>
              <h3 className='text-2xl font-bold text-red-600 mb-2'>غير متصل ❌</h3>
              <p className='text-gray-600 mb-6'>{status?.message || 'البوت غير متصل'}</p>

              <div className='bg-yellow-50 rounded-xl p-4 max-w-lg mx-auto text-right'>
                <h4 className='font-bold text-yellow-800 mb-2'>⚠️ لتشغيل البوت:</h4>
                <p className='text-sm text-yellow-700 mb-2'>افتح Terminal واكتب:</p>
                <code className='bg-gray-900 text-green-400 px-4 py-2 rounded-lg block text-center font-mono'>
                  npm run whatsapp
                </code>
              </div>
            </div>
          )}
        </div>

        {/* Test Message Card - Only show if connected */}
        {status?.status === 'connected' && (
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-6'>
            <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
              <span className='text-2xl'>📤</span>
              إرسال رسالة تجريبية
            </h2>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>رقم الهاتف</label>
                <input
                  type='tel'
                  value={testPhone}
                  onChange={e => setTestPhone(e.target.value)}
                  placeholder='01012345678'
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500'
                  dir='ltr'
                />
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-2'>الرسالة</label>
                <input
                  type='text'
                  value={testMessage}
                  onChange={e => setTestMessage(e.target.value)}
                  placeholder='مرحباً! هذه رسالة تجريبية'
                  className='w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500'
                />
              </div>
            </div>

            <button
              onClick={handleSendTest}
              disabled={isSending || !testPhone || !testMessage}
              className='w-full px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2'
            >
              {isSending ? (
                <>
                  <div className='animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent'></div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <span>📨</span>
                  إرسال رسالة
                </>
              )}
            </button>
          </div>
        )}

        {/* Info Card */}
        <div className='bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl shadow-lg border border-green-100 p-6'>
          <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
            <span className='text-2xl'>💡</span>
            معلومات مهمة
          </h2>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='bg-white rounded-xl p-4'>
              <h3 className='font-bold text-green-700 mb-2'>✅ المميزات</h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• إرسال إشعارات تلقائية للعملاء</li>
                <li>• رسائل حالة الطلب</li>
                <li>• تذكير بالدفع</li>
                <li>• إشعار جاهزية الطلب</li>
              </ul>
            </div>
            <div className='bg-white rounded-xl p-4'>
              <h3 className='font-bold text-orange-700 mb-2'>⚠️ ملاحظات</h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• استخدم رقم مخصص للمشروع</li>
                <li>• البوت لازم يفضل شغال</li>
                <li>• الجلسة بتتحفظ تلقائياً</li>
                <li>• لا تغلق الـ Terminal</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
