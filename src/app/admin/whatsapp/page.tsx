'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import {
  RefreshCcw,
  LogOut,
  CheckCircle,
  Smartphone,
  AlertCircle,
  Send,
  Plus,
  Trash2,
  Copy,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface WhatsAppStatus {
  status: 'connected' | 'disconnected' | 'qr_ready' | 'loading';
  qrRequired: boolean;
  qrImage?: string;
  user?: { id: string; name?: string };
  message?: string;
}

interface Template {
  id: string;
  title: string;
  body: string;
}

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  /* ─── WhatsApp Connection ─── */
  const fetchQR = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/whatsapp/qr?t=${Date.now()}`, { cache: 'no-store' });
      setStatus(await res.json());
    } catch {}
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/whatsapp/status?t=${Date.now()}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.qrRequired) fetchQR();
      else setStatus(data);
    } catch {
      setStatus({ status: 'disconnected', qrRequired: false, message: 'فشل الاتصال بالخدمة' });
    } finally {
      setLoading(false);
    }
  }, [fetchQR]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleLogout = async () => {
    if (!confirm('هل أنت متأكد من تسجيل الخروج من WhatsApp؟')) return;
    try {
      const res = await fetch('/api/admin/whatsapp/logout', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        toast.success('تم تسجيل الخروج');
        setStatus(null);
        setLoading(true);
        setTimeout(checkStatus, 2000);
      } else toast.error('فشل تسجيل الخروج');
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const testConnection = async () => {
    if (!status?.user?.id) return;
    setTesting(true);
    try {
      const res = await fetch('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: status.user.id.split(':')[0],
          message: '✅ اختبار اتصال منصة البديل ناجح!',
        }),
      });
      const data = await res.json();
      if (data.success) toast.success('تم إرسال رسالة اختبار بنجاح');
      else toast.error(data.error || 'فشل الاختبار');
    } catch {
      toast.error('خطأ في الاتصال');
    } finally {
      setTesting(false);
    }
  };

  /* ─── Templates CRUD ─── */
  const fetchTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/whatsapp/templates');
      const data = await res.json();
      if (data.success) setTemplates(data.templates);
    } finally {
      setTemplatesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleAdd = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      toast.error('أدخل العنوان والنص');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, body: newBody }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => [...prev, data.template]);
        setNewTitle('');
        setNewBody('');
        setShowAddForm(false);
        toast.success('تم إضافة الرسالة');
      } else toast.error(data.error || 'فشل الإضافة');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('حذف هذه الرسالة؟')) return;
    const res = await fetch(`/api/admin/whatsapp/templates/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('تم الحذف');
    } else toast.error('فشل الحذف');
  };

  const handleCopy = (body: string) => {
    navigator.clipboard.writeText(body);
    toast.success('تم النسخ');
  };

  const startEdit = (t: Template) => {
    setEditingId(t.id);
    setEditTitle(t.title);
    setEditBody(t.body);
    setExpandedId(t.id);
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/admin/whatsapp/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editTitle, body: editBody }),
    });
    const data = await res.json();
    if (data.success) {
      setTemplates(prev =>
        prev.map(t => (t.id === id ? { ...t, title: editTitle, body: editBody } : t))
      );
      setEditingId(null);
      toast.success('تم التحديث');
    } else toast.error('فشل التحديث');
  };

  /* ─── Render ─── */
  return (
    <div className='p-6 max-w-5xl mx-auto space-y-8'>
      {/* Header */}
      <div className='flex justify-between items-center'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900 flex items-center gap-2'>
            <Image src='/icons/whatsapp.png' width={40} height={40} alt='WhatsApp' />
            إدارة WhatsApp
          </h1>
          <p className='text-gray-500 mt-1 text-sm'>ربط WhatsApp وإدارة الرسائل الجاهزة</p>
        </div>
        <button
          onClick={() => {
            setLoading(true);
            checkStatus();
          }}
          className='p-2 hover:bg-gray-100 rounded-full transition-colors'
          title='تحديث'
        >
          <RefreshCcw
            size={20}
            className={loading ? 'animate-spin text-gray-400' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Connection Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {/* Status Card */}
        <div className='bg-white rounded-2xl shadow-sm border p-6'>
          <h2 className='text-lg font-bold mb-4 text-gray-800'>حالة الاتصال</h2>
          {loading && !status ? (
            <div className='flex flex-col items-center justify-center py-12'>
              <div className='animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-3' />
              <p className='text-gray-400 text-sm'>جاري التحقق...</p>
            </div>
          ) : status?.status === 'connected' ? (
            <div className='text-center py-6'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <CheckCircle size={32} className='text-green-600' />
              </div>
              <h3 className='text-xl font-bold text-green-700 mb-1'>متصل بنجاح</h3>
              <p className='text-gray-500 text-sm mb-5' dir='ltr'>
                {status.user?.id?.split(':')[0]}
              </p>
              <div className='flex flex-col gap-2'>
                <button
                  onClick={testConnection}
                  disabled={testing}
                  className='flex items-center justify-center gap-2 bg-blue-50 text-blue-700 py-2.5 rounded-xl hover:bg-blue-100 transition-colors text-sm font-semibold'
                >
                  {testing ? <span className='animate-spin'>⏳</span> : <Send size={16} />}
                  إرسال رسالة اختبار
                </button>
                <button
                  onClick={handleLogout}
                  className='flex items-center justify-center gap-2 bg-red-50 text-red-600 py-2.5 rounded-xl hover:bg-red-100 transition-colors text-sm font-semibold'
                >
                  <LogOut size={16} />
                  تسجيل الخروج
                </button>
              </div>
            </div>
          ) : (
            <div className='text-center py-8'>
              <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3'>
                <Smartphone size={32} className='text-gray-400' />
              </div>
              <p className='text-gray-500 mb-3 text-sm'>WhatsApp غير متصل</p>
              <div className='bg-yellow-50 text-yellow-800 p-3 rounded-xl text-xs'>
                امسح QR Code لربط الجهاز
              </div>
            </div>
          )}
        </div>

        {/* QR Card */}
        <div className='bg-white rounded-2xl shadow-sm border p-6'>
          <h2 className='text-lg font-bold mb-4 text-gray-800'>ربط جهاز جديد</h2>
          {status?.status === 'connected' ? (
            <div className='flex flex-col items-center justify-center h-48 text-center'>
              <CheckCircle size={40} className='text-green-200 mb-3' />
              <p className='text-gray-400 text-sm'>الجهاز متصل بالفعل</p>
              <p className='text-xs text-gray-300 mt-1'>سجّل الخروج لتغيير الرقم</p>
            </div>
          ) : status?.qrImage ? (
            <div className='flex flex-col items-center'>
              <div className='bg-white p-3 rounded-xl shadow border mb-4'>
                <Image
                  src={status.qrImage}
                  width={220}
                  height={220}
                  alt='QR Code'
                  className='rounded-lg'
                />
              </div>
              <ol className='list-decimal list-inside space-y-1 text-gray-500 text-xs text-right w-full'>
                <li>افتح WhatsApp → القائمة → الأجهزة المرتبطة</li>
                <li>اضغط «ربط جهاز» ووجّه الكاميرا نحو الـ QR</li>
              </ol>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center h-48 text-center'>
              {loading ? (
                <>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mb-3' />
                  <p className='text-gray-400 text-sm'>جارٍ تجهيز QR Code...</p>
                </>
              ) : (
                <>
                  <AlertCircle size={36} className='text-red-300 mb-3' />
                  <p className='text-gray-500 text-sm'>تأكد أن البوت يعمل</p>
                  <code className='mt-2 bg-gray-100 px-2 py-1 rounded text-xs'>
                    npm run whatsapp
                  </code>
                  <button
                    onClick={checkStatus}
                    className='mt-3 text-blue-500 hover:underline text-xs'
                  >
                    إعادة المحاولة
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Message Templates Section ─── */}
      <div className='bg-white rounded-2xl shadow-sm border'>
        {/* Section Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <div className='flex items-center gap-3'>
            <div className='w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center'>
              <MessageSquare size={18} className='text-green-600' />
            </div>
            <div>
              <h2 className='font-bold text-gray-900'>إعدادات الرسائل الجاهزة</h2>
              <p className='text-xs text-gray-400'>{templates.length} رسالة محفوظة</p>
            </div>
          </div>
          <button
            onClick={() => {
              setShowAddForm(v => !v);
              setNewTitle('');
              setNewBody('');
            }}
            className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors'
          >
            <Plus size={16} />
            إضافة رسالة
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className='p-5 border-b bg-green-50/40'>
            <div className='space-y-3'>
              <div>
                <label className='text-xs font-bold text-gray-600 block mb-1'>عنوان الرسالة</label>
                <input
                  type='text'
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder='مثال: طلب جاهز للاستلام'
                  className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400'
                />
              </div>
              <div>
                <label className='text-xs font-bold text-gray-600 block mb-1'>نص الرسالة</label>
                <textarea
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  placeholder='اكتب نص الرسالة هنا...'
                  rows={4}
                  className='w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 resize-none'
                />
              </div>
              <div className='flex gap-2 justify-end'>
                <button
                  onClick={() => setShowAddForm(false)}
                  className='px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors'
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className='px-5 py-2 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50'
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ الرسالة'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates List */}
        <div className='divide-y'>
          {templatesLoading ? (
            <div className='py-12 text-center text-gray-400 text-sm'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-gray-300 mx-auto mb-2' />
              جاري التحميل...
            </div>
          ) : templates.length === 0 ? (
            <div className='py-14 text-center'>
              <MessageSquare size={36} className='text-gray-200 mx-auto mb-3' />
              <p className='text-gray-400 text-sm'>لا توجد رسائل جاهزة بعد</p>
              <p className='text-gray-300 text-xs mt-1'>اضغط «إضافة رسالة» لإنشاء أول قالب</p>
            </div>
          ) : (
            templates.map(t => (
              <div key={t.id} className='px-5 py-4'>
                {editingId === t.id ? (
                  /* Edit Mode */
                  <div className='space-y-3'>
                    <input
                      type='text'
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      className='w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold'
                    />
                    <textarea
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      rows={4}
                      className='w-full border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none'
                    />
                    <div className='flex gap-2 justify-end'>
                      <button
                        onClick={() => setEditingId(null)}
                        className='p-2 text-gray-400 hover:bg-gray-100 rounded-lg'
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={() => saveEdit(t.id)}
                        className='p-2 text-green-600 hover:bg-green-50 rounded-lg'
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View Mode */
                  <div>
                    <div className='flex items-center justify-between'>
                      <button
                        onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                        className='flex items-center gap-2 text-right flex-1 min-w-0'
                      >
                        <span className='font-bold text-gray-800 text-sm truncate'>{t.title}</span>
                        {expandedId === t.id ? (
                          <ChevronUp size={14} className='text-gray-400 flex-shrink-0' />
                        ) : (
                          <ChevronDown size={14} className='text-gray-400 flex-shrink-0' />
                        )}
                      </button>
                      <div className='flex items-center gap-1 mr-3'>
                        <button
                          onClick={() => handleCopy(t.body)}
                          title='نسخ'
                          className='p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors'
                        >
                          <Copy size={14} />
                        </button>
                        <button
                          onClick={() => startEdit(t)}
                          title='تعديل'
                          className='p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors'
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          title='حذف'
                          className='p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    {expandedId === t.id && (
                      <div className='mt-3 bg-gray-50 rounded-xl px-4 py-3'>
                        <pre className='text-xs text-gray-600 whitespace-pre-wrap font-sans leading-relaxed'>
                          {t.body}
                        </pre>
                        <button
                          onClick={() => handleCopy(t.body)}
                          className='mt-2 flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-semibold'
                        >
                          <Copy size={12} /> نسخ النص
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
