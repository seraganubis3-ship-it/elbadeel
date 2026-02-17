'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { RefreshCcw, LogOut, CheckCircle, Smartphone, AlertCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface WhatsAppStatus {
  status: 'connected' | 'disconnected' | 'qr_ready' | 'loading';
  qrRequired: boolean;
  qrImage?: string;
  user?: {
    id: string;
    name?: string;
  };
  message?: string;
}

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  // We now use internal API proxy, so we don't need WHATSAPP_API_URL here
  // const WHATSAPP_API_URL = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || 'http://127.0.0.1:3001';

  // Fetch WhatsApp status via our internal API proxy
  const fetchQR = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/whatsapp/qr?t=${Date.now()}`, {
        cache: 'no-store',
      });
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('WhatsApp QR Error:', error);
    }
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/whatsapp/status?t=${Date.now()}`, {
        cache: 'no-store',
      });

      const data = await response.json();

      if (data.qrRequired) {
        // If QR is required, fetch the QR image via proxy
        fetchQR();
      } else {
        setStatus(data);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('WhatsApp Status Error:', error);
      setStatus({
        status: 'disconnected',
        qrRequired: false,
        message: 'فشل الاتصال بالخدمة',
      });
    } finally {
      setLoading(false);
    }
  }, [fetchQR]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000); // Check every 5s
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleLogout = async () => {
    if (!confirm('هل أنت متأكد من تسجيل الخروج من WhatsApp؟ سيتم مسح الجلسة.')) return;

    try {
      const response = await fetch(`/api/admin/whatsapp/logout`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        toast.success('تم تسجيل الخروج من WhatsApp');
        setStatus(null);
        setLoading(true);
        setTimeout(checkStatus, 2000);
      } else {
        toast.error('فشل تسجيل الخروج');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الخروج');
    }
  };

  const testConnection = async () => {
    if (!status?.user?.id) return;

    setTesting(true);
    try {
      // Use the existing send API which is already proxied or server-side
      const response = await fetch(`/api/admin/whatsapp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: status.user.id.split(':')[0], // Send to self
          message: '✅ اختبار اتصال منصة البديل ناجح!',
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('تم إرسال رسالة اختبار بنجاح');
      } else {
        toast.error(data.error || 'فشل الاختبار');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <div className='flex justify-between items-center mb-8'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
            <Image src='/icons/whatsapp.png' width={40} height={40} alt='WhatsApp' />
            إدارة WhatsApp
          </h1>
          <p className='text-gray-600 mt-1'>ربط WhatsApp لإرسال إشعارات تلقائية للعملاء</p>
        </div>

        <button
          onClick={() => {
            setLoading(true);
            checkStatus();
          }}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          title='تحديث الحالة'
        >
          <RefreshCcw
            size={20}
            className={loading ? 'animate-spin text-gray-500' : 'text-gray-600'}
          />
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Status Card */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h2 className='text-xl font-bold mb-4'>حالة الاتصال</h2>

          {loading && !status ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4'></div>
              <p className='text-gray-500'>جاري التحقق من الحالة...</p>
            </div>
          ) : status?.status === 'connected' ? (
            <div className='text-center py-8'>
              <div className='w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <CheckCircle size={40} className='text-green-600' />
              </div>
              <h3 className='text-2xl font-bold text-green-700 mb-2'>متصل بنجاح</h3>
              <p className='text-gray-600 mb-6'>
                تم ربط الرقم:{' '}
                <span dir='ltr' className='font-mono font-semibold'>
                  {status.user?.id?.split(':')[0]}
                </span>
              </p>

              <div className='flex flex-col gap-3'>
                <button
                  onClick={testConnection}
                  disabled={testing}
                  className='flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-3 rounded-lg hover:bg-blue-100 transition-colors'
                >
                  {testing ? <span className='animate-spin'>⌛</span> : <Send size={18} />}
                  إرسال رسالة اختبار
                </button>

                <button
                  onClick={handleLogout}
                  className='flex items-center justify-center gap-2 bg-red-50 text-red-700 py-3 rounded-lg hover:bg-red-100 transition-colors'
                >
                  <LogOut size={18} />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <div className='w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <Smartphone size={40} className='text-gray-400' />
              </div>
              <p className='text-gray-600 mb-4'>WhatsApp غير متصل</p>
              <div className='bg-yellow-50 text-yellow-800 p-4 rounded-lg text-sm'>
                الرجاء مسح QR Code من القائمة الجانبية للربط
              </div>
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div className='bg-white rounded-xl shadow-sm border p-6'>
          <h2 className='text-xl font-bold mb-4'>ربط جهاز جديد</h2>

          {status?.status === 'connected' ? (
            <div className='h-full flex flex-col items-center justify-center text-center py-12'>
              <CheckCircle size={48} className='text-green-200 mb-4' />
              <p className='text-gray-400'>الجهاز متصل بالفعل</p>
              <p className='text-sm text-gray-300 mt-2'>لتغيير الرقم، قم بتسجيل الخروج أولاً</p>
            </div>
          ) : status?.qrImage ? (
            <div className='flex flex-col items-center'>
              <div className='bg-white p-4 rounded-xl shadow-lg border mb-6'>
                <Image
                  src={status.qrImage}
                  width={260}
                  height={260}
                  alt='WhatsApp QR Code'
                  className='rounded-lg'
                />
              </div>
              <div className='text-right w-full max-w-xs'>
                <h3 className='font-bold mb-2'>خطوات الربط:</h3>
                <ol className='list-decimal list-inside space-y-2 text-gray-600 text-sm'>
                  <li>افتح WhatsApp على موبايلك</li>
                  <li>اضغط على القائمة (⁝) أو الإعدادات</li>
                  <li>اختر &quot;الأجهزة المرتبطة&quot; (Linked Devices)</li>
                  <li>اضغط على &quot;ربط جهاز&quot; (Link a Device)</li>
                  <li>وجه الكاميرا نحو الـ QR Code</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-64 text-center'>
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4'></div>
                  <p className='text-gray-500'>جاري تجهيز QR Code...</p>
                </>
              ) : (
                <>
                  <AlertCircle size={40} className='text-red-400 mb-3' />
                  <div className='text-gray-600 mb-2'>
                    <h3 className='text-xl font-bold text-gray-900 mb-2'>جاري تحميل WhatsApp</h3>
                    <p>يرجى الانتظار حتى يتم تحميل البوت...</p>
                    <p className='text-xs mt-2 text-gray-400' dir='ltr'>
                      Status: Disconnected
                    </p>
                  </div>
                  <div className='mt-4 text-xs text-gray-400 p-2 border rounded'>
                    تأكد أن البوت يعمل في التيرمنال:
                    <br />
                    <code className='bg-gray-100 p-1 rounded'>npm run whatsapp</code>
                  </div>
                  <button
                    onClick={() => checkStatus()}
                    className='mt-4 text-blue-600 hover:underline text-sm'
                  >
                    إعادة المحاولة
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
