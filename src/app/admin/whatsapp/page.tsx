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
  trigger: string | null;
  body: string;
  category: 'AUTOMATIC' | 'MANUAL';
}

const AVAILABLE_TRIGGERS = [
  { id: 'NEW_ORDER', name: 'استلام طلب جديد (أونلاين)' },
  { id: 'NEW_ORDER_ADMIN', name: 'استلام طلب جديد (لوحة التحكم)' },
  { id: 'NEW_CUSTOMER', name: 'تسجيل عميل جديد' },
  { id: 'STATUS_waiting_confirmation', name: 'حالة: انتظار المراجعة' },
  { id: 'STATUS_waiting_payment', name: 'حالة: انتظار الدفع' },
  { id: 'STATUS_processing', name: 'حالة: تحت التنفيذ' },
  { id: 'STATUS_settlement', name: 'حالة: تسديد' },
  { id: 'STATUS_supply', name: 'حالة: ورود' },
  { id: 'STATUS_delivered', name: 'حالة: تم التسليم' },
  { id: 'STATUS_fulfillment', name: 'حالة: استيفاء' },
  { id: 'STATUS_returned', name: 'حالة: مرتجع' },
  { id: 'STATUS_cancelled', name: 'حالة: ملغي' },
];

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);

  // Templates state
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTrigger, setNewTrigger] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newCategory, setNewCategory] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC');
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editTrigger, setEditTrigger] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editCategory, setEditCategory] = useState<'AUTOMATIC' | 'MANUAL'>('AUTOMATIC');


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
        setTimeout(checkStatus, 1000);
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
    if (!newTitle.trim() || !newBody.trim() || (newCategory === 'AUTOMATIC' && !newTrigger.trim())) {
      toast.error('أكمل جميع الحقول المطلوبة');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTitle, 
          trigger: newCategory === 'MANUAL' ? null : newTrigger,
          body: newBody,
          category: newCategory
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(prev => [...prev, data.template]);
        setNewTitle('');
        setNewTrigger('');
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
    setEditTrigger(t.trigger || '');
    setEditBody(t.body);
    setEditCategory(t.category);
    setExpandedId(t.id);
  };

  const saveEdit = async (id: string) => {
    const res = await fetch(`/api/admin/whatsapp/templates/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        title: editTitle, 
        trigger: editCategory === 'MANUAL' ? null : editTrigger,
        body: editBody,
        category: editCategory
      }),
    });
    const data = await res.json();
    if (data.success) {
      setTemplates(prev =>
        prev.map(t => (t.id === id ? { ...t, title: editTitle, trigger: editCategory === 'MANUAL' ? null : editTrigger, body: editBody, category: editCategory } : t))
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
          <p className='text-gray-500 mt-1 text-sm'>ربط WhatsApp وإدارة الرسائل التلقائية والجاهزة</p>
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

      {/* Placeholders Guide */}
      <div className='bg-blue-50 border border-blue-100 rounded-2xl p-5'>
        <h2 className='text-blue-800 font-bold mb-3 flex items-center gap-2'>
          <AlertCircle size={18} />
          دليل المتغيرات الذكية
        </h2>
        <p className='text-blue-700 text-sm mb-4'>
          يمكنك استخدام هذه الأكواد داخل نص الرسالة وسيتم استبدالها تلقائياً ببيانات الطلب:
        </p>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
          {[
            { tag: '<customer_name>', desc: 'اسم العميل' },
            { tag: '<order_id>', desc: 'رقم الطلب (آخر 6 أرقام)' },
            { tag: '<order_price>', desc: 'إجمالي مبلغ الطلب' },
            { tag: '<service_name>', desc: 'اسم الخدمة' },
            { tag: '<variant_name>', desc: 'نوع الخدمة' },
            { tag: '<status_text>', desc: 'حالة الطلب الحالية' },
            { tag: '<notes>', desc: 'ملاحظات الإدارة / سبب الحالة' },
            { tag: '<work_order_number>', desc: 'رقم التشغيل' },
            { tag: '<pickup_location>', desc: 'مكان الاستلام' },
            { tag: '<customer_phone>', desc: 'رقم هاتف العميل' },
            { tag: '<customer_email>', desc: 'البريد الإلكتروني' },
            { tag: '<password>', desc: 'كلمة مرور العميل (رقم الهاتف)' },
            { tag: '<remaining_price>', desc: 'المبلغ المتبقي' },
          ].map(p => (
            <div key={p.tag} className='flex items-center gap-2 text-xs'>
              <code className='bg-white px-1.5 py-0.5 rounded border border-blue-200 text-blue-600 font-bold'>
                {p.tag}
              </code>
              <span className='text-blue-500'>{p.desc}</span>
            </div>
          ))}
        </div>
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

      {/* ─── Shared Components for Sections ─── */}
      <TemplateSection 
        title="إعدادات الرسائل التلقائية" 
        subtitle="رسائل يتم إرسالها تلقائياً عند حدوث أحداث معينة"
        category="AUTOMATIC"
        templates={templates.filter(t => t.category === 'AUTOMATIC' || !t.category)}
        loading={templatesLoading}
        onAdd={() => {
          setNewCategory('AUTOMATIC');
          setShowAddForm(true);
        }}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        editingId={editingId}
        setEditingId={setEditingId}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editTrigger={editTrigger}
        setEditTrigger={setEditTrigger}
        editBody={editBody}
        setEditBody={setEditBody}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        saveEdit={saveEdit}
        handleDelete={handleDelete}
        handleCopy={handleCopy}
        startEdit={startEdit}
      />

      <TemplateSection 
        title="إعدادات الرسائل الجاهزة" 
        subtitle="رسائل تظهر كاختصارات سريعة عند المراسلة اليدوية"
        category="MANUAL"
        templates={templates.filter(t => t.category === 'MANUAL')}
        loading={templatesLoading}
        onAdd={() => {
          setNewCategory('MANUAL');
          setShowAddForm(true);
        }}
        expandedId={expandedId}
        setExpandedId={setExpandedId}
        editingId={editingId}
        setEditingId={setEditingId}
        editTitle={editTitle}
        setEditTitle={setEditTitle}
        editTrigger={editTrigger}
        setEditTrigger={setEditTrigger}
        editBody={editBody}
        setEditBody={setEditBody}
        editCategory={editCategory}
        setEditCategory={setEditCategory}
        saveEdit={saveEdit}
        handleDelete={handleDelete}
        handleCopy={handleCopy}
        startEdit={startEdit}
      />

      {/* Add Modal */}
      {showAddForm && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50'>
          <div className='bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200'>
            <div className='bg-green-600 px-6 py-4 flex items-center justify-between text-white'>
              <h3 className='font-bold'>إضافة قالب رسالة جديد</h3>
              <button onClick={() => setShowAddForm(false)} className='hover:bg-white/20 p-1 rounded-lg'>
                <X size={20} />
              </button>
            </div>
            
            <div className='p-6 space-y-4 font-sans'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='col-span-2 md:col-span-1'>
                  <label className='text-xs font-bold text-gray-500 block mb-1'>نوع الرسالة</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className='w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none'
                  >
                    <option value='AUTOMATIC'>تلقائية (Trigger)</option>
                    <option value='MANUAL'>جاهزة (Popup)</option>
                  </select>
                </div>
                <div className='col-span-2 md:col-span-1'>
                  <label className='text-xs font-bold text-gray-500 block mb-1'>عنوان القالب</label>
                  <input
                    type='text'
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder='مثال: ترحيب بالعميل'
                    className='w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none'
                  />
                </div>
              </div>

              {newCategory === 'AUTOMATIC' && (
                <div>
                  <label className='text-xs font-bold text-gray-500 block mb-1'>الحدث المشغّل (Trigger)</label>
                  <select
                    value={newTrigger}
                    onChange={e => setNewTrigger(e.target.value)}
                    className='w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none'
                  >
                    <option value=''>-- اختر الحدث --</option>
                    {AVAILABLE_TRIGGERS.map(trig => (
                      <option key={trig.id} value={trig.id}>{trig.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className='text-xs font-bold text-gray-500 block mb-1'>نص الرسالة</label>
                <textarea
                  value={newBody}
                  onChange={e => setNewBody(e.target.value)}
                  placeholder='اكتب نص الرسالة هنا...'
                  rows={8}
                  className='w-full border rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-green-400 focus:outline-none resize-none'
                />
              </div>

              <div className='flex gap-2 justify-end pt-2'>
                <button
                  onClick={() => setShowAddForm(false)}
                  className='px-6 py-2.5 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-all'
                >
                  إلغاء
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving}
                  className='px-8 py-2.5 bg-green-600 text-white text-sm font-bold rounded-xl hover:bg-green-700 transition-all shadow-md active:scale-95 disabled:opacity-50'
                >
                  {saving ? 'جاري الحفظ...' : 'حفظ القالب'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-Components ───

interface TemplateSectionProps {
  title: string;
  subtitle: string;
  category: string;
  templates: Template[];
  loading: boolean;
  onAdd: () => void;
  expandedId: string | null;
  setExpandedId: (id: string | null) => void;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editTitle: string;
  setEditTitle: (v: string) => void;
  editTrigger: string;
  setEditTrigger: (v: string) => void;
  editBody: string;
  setEditBody: (v: string) => void;
  editCategory: string;
  setEditCategory: (v: any) => void;
  saveEdit: (id: string) => void;
  handleDelete: (id: string) => void;
  handleCopy: (v: string) => void;
  startEdit: (t: Template) => void;
}

function TemplateSection({
  title, subtitle, templates, loading, onAdd,
  expandedId, setExpandedId, editingId, setEditingId,
  editTitle, setEditTitle, editTrigger, setEditTrigger, editBody, setEditBody,
  editCategory, setEditCategory, saveEdit, handleDelete, handleCopy, startEdit
}: TemplateSectionProps) {
  return (
    <div className='bg-white rounded-2xl shadow-sm border overflow-hidden'>
      <div className='flex items-center justify-between px-6 py-4 border-b bg-gray-50/50'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center font-bold text-green-700'>
            {templates.length}
          </div>
          <div>
            <h2 className='font-bold text-gray-900'>{title}</h2>
            <p className='text-[10px] text-gray-400 uppercase tracking-tighter'>{subtitle}</p>
          </div>
        </div>
        <button
          onClick={onAdd}
          className='flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-sm'
        >
          <Plus size={16} />
          إضافة رسالة
        </button>
      </div>

      <div className='divide-y font-sans'>
        {loading ? (
          <div className='py-12 text-center text-gray-400 text-sm'>
            <RefreshCcw size={24} className='animate-spin mx-auto mb-2 opacity-20' />
            جاري التحميل...
          </div>
        ) : templates.length === 0 ? (
          <div className='py-14 text-center'>
            <MessageSquare size={36} className='text-gray-200 mx-auto mb-3' />
            <p className='text-gray-400 text-sm'>لا توجد رسائل في هذا القسم</p>
          </div>
        ) : (
          templates.map(t => (
            <div key={t.id} className='group hover:bg-gray-50/30 transition-colors'>
              {editingId === t.id ? (
                <div className='p-5 bg-blue-50/50 space-y-4 animate-in slide-in-from-top-2 duration-300'>
                  <div className='grid grid-cols-2 gap-3'>
                    <div className='col-span-2 md:col-span-1'>
                      <label className='text-[10px] font-bold text-blue-500 uppercase block mb-1'>تصنيف الرسالة</label>
                      <select
                        value={editCategory}
                        onChange={e => setEditCategory(e.target.value as any)}
                        className='w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400'
                      >
                        <option value='AUTOMATIC'>تلقائية (Trigger)</option>
                        <option value='MANUAL'>جاهزة (Popup)</option>
                      </select>
                    </div>
                    <div className='col-span-2 md:col-span-1'>
                      <label className='text-[10px] font-bold text-blue-500 uppercase block mb-1'>العنوان</label>
                      <input
                        type='text'
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        className='w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 font-bold'
                      />
                    </div>
                  </div>
                  {editCategory === 'AUTOMATIC' && (
                    <div>
                      <label className='text-[10px] font-bold text-blue-500 uppercase block mb-1'>الحدث المشغّل</label>
                      <select
                        value={editTrigger}
                        onChange={e => setEditTrigger(e.target.value)}
                        className='w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400'
                      >
                        <option value=''>-- اختر الحدث --</option>
                        {AVAILABLE_TRIGGERS.map(trig => (
                          <option key={trig.id} value={trig.id}>{trig.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className='text-[10px] font-bold text-blue-500 uppercase block mb-1'>المحتوى</label>
                    <textarea
                      value={editBody}
                      onChange={e => setEditBody(e.target.value)}
                      rows={6}
                      className='w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 resize-none leading-relaxed'
                    />
                  </div>
                  <div className='flex gap-2 justify-end'>
                    <button onClick={() => setEditingId(null)} className='px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl'>
                      إلغاء
                    </button>
                    <button onClick={() => saveEdit(t.id)} className='px-6 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200'>
                      حفظ التغييرات
                    </button>
                  </div>
                </div>
              ) : (
                <div className='px-6 py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4 flex-1 min-w-0'>
                      <button 
                         onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                         className='flex items-center gap-3 text-right flex-1 min-w-0'
                      >
                         {t.category === 'AUTOMATIC' ? (
                           <div className='bg-green-100 text-green-700 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase shrink-0'>
                             Auto: {t.trigger || 'NONE'}
                           </div>
                         ) : (
                           <div className='bg-purple-100 text-purple-700 rounded-md px-2 py-0.5 text-[9px] font-bold uppercase shrink-0'>
                             Manual
                           </div>
                         )}
                         <span className='font-bold text-gray-700 text-sm truncate'>{t.title}</span>
                      </button>
                    </div>
                    
                    <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                      <button onClick={() => handleCopy(t.body)} className='p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl'>
                        <Copy size={16} />
                      </button>
                      <button onClick={() => startEdit(t)} className='p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl'>
                        <Pencil size={16} />
                      </button>
                      <button onClick={() => handleDelete(t.id)} className='p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl'>
                        <Trash2 size={16} />
                      </button>
                      <button 
                        onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
                        className='p-2 text-gray-400 hover:bg-gray-100 rounded-xl'
                      >
                        {expandedId === t.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  {expandedId === t.id && (
                    <div className='mt-4 bg-gray-50 rounded-2xl p-4 border border-gray-100 animate-in slide-in-from-top-1 duration-200'>
                      <pre className='text-xs text-gray-600 whitespace-pre-wrap leading-relaxed italic'>
                        "{t.body}"
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
