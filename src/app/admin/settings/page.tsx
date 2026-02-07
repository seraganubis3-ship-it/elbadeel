'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface Settings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  additionalPhone: string;
  whatsappPhone: string;
  address: string;
  defaultDeliveryFee: number;
  paymentNumbers: string;
  facebookUrl: string;
  instagramUrl: string;
  logoUrl: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    siteDescription: '',
    contactEmail: '',
    contactPhone: '',
    additionalPhone: '',
    whatsappPhone: '',
    address: '',
    defaultDeliveryFee: 0,
    paymentNumbers: '',
    facebookUrl: '',
    instagramUrl: '',
    logoUrl: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      } else {
        toast.error('فشل في جلب الإعدادات');
      }
    } catch (error) {
      toast.error('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('تم حفظ الإعدادات بنجاح');
      } else {
        toast.error('فشل في حفظ الإعدادات');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">إعدادات الموقع</h1>
          <p className="text-gray-500 mt-2">تحكم في جميع بيانات الموقع، العناوين، وأرقام التواصل من مكان واحد</p>
        </div>
        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Right Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-300">
                <div className="p-6 bg-gradient-to-l from-gray-50 to-white border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">البيانات الأساسية</h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم الموقع</label>
                        <input
                            type="text"
                            value={settings.siteName || ''}
                            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="مثال: البديل للخدمات"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">الوصف (SEO)</label>
                        <input
                            type="text"
                            value={settings.siteDescription || ''}
                            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="وصف مختصر يظهر في محركات البحث"
                        />
                    </div>
                </div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-300">
                 <div className="p-6 bg-gradient-to-l from-emerald-50 to-white border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">بيانات التواصل</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">العنوان التفصيلي</label>
                        <div className="relative">
                            <span className="absolute right-4 top-3.5 text-gray-400">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </span>
                            <input
                                type="text"
                                value={settings.address || ''}
                                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                                className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                placeholder="العنوان الذي سيظهر في الإيصالات"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف الأساسي</label>
                            <input
                                type="text"
                                value={settings.contactPhone || ''}
                                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">رقم هاتف إضافي</label>
                            <input
                                type="text"
                                value={settings.additionalPhone || ''}
                                onChange={(e) => setSettings({ ...settings, additionalPhone: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">رقم الواتساب</label>
                            <input
                                type="text"
                                value={settings.whatsappPhone || ''}
                                onChange={(e) => setSettings({ ...settings, whatsappPhone: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                dir="ltr"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
                            <input
                                type="email"
                                value={settings.contactEmail || ''}
                                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none transition-all"
                                dir="ltr"
                            />
                        </div>
                    </div>
                </div>
            </div>
            
             {/* Saves Button (Desktop) */}
            <div className="hidden lg:flex justify-end">
                <button
                    type="submit"
                    disabled={saving}
                    className="px-10 py-4 bg-gradient-to-l from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 w-full justify-center lg:w-auto"
                >
                    {saving ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري الحفظ...</span>
                    </>
                    ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>حفظ التغييرات</span>
                    </>
                    )}
                </button>
            </div>
        </div>

        {/* Left Column - Financial & Social */}
        <div className="space-y-6">
             {/* Financial Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-300">
                <div className="p-6 bg-gradient-to-l from-amber-50 to-white border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">المالية والشحن</h2>
                </div>
                <div className="p-6 space-y-6">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">سعر التوصيل الافتراضي</label>
                         <div className="relative">
                            <input
                                type="number"
                                value={settings.defaultDeliveryFee || 0}
                                onChange={(e) => setSettings({ ...settings, defaultDeliveryFee: parseFloat(e.target.value) })}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all"
                            />
                            <span className="absolute left-4 top-3.5 text-gray-500 font-medium text-sm">ج.م</span>
                         </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">أرقام التحويلات</label>
                        <div className="text-xs text-gray-500 mb-2">يظهر هذا النص في تنبيهات الدفع</div>
                        <textarea
                            value={settings.paymentNumbers || ''}
                            onChange={(e) => setSettings({ ...settings, paymentNumbers: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:outline-none transition-all min-h-[120px]"
                            placeholder="أدخل تفاصيل فودافون كاش وانستا باي..."
                        />
                    </div>
                </div>
            </div>

            {/* Social Media Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow duration-300">
                <div className="p-6 bg-gradient-to-l from-indigo-50 to-white border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold text-gray-800">السوشيال ميديا</h2>
                </div>
                <div className="p-6 space-y-4">
                    <div className="relative">
                        <span className="absolute right-4 top-3.5 text-indigo-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </span>
                        <input
                            type="text"
                            value={settings.facebookUrl || ''}
                            onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                            className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none transition-all"
                            placeholder="رابط فيسبوك"
                            dir="ltr"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute right-4 top-3.5 text-pink-500">
                           <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                        </span>
                        <input
                            type="text"
                            value={settings.instagramUrl || ''}
                            onChange={(e) => setSettings({ ...settings, instagramUrl: e.target.value })}
                            className="w-full pr-12 pl-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 focus:outline-none transition-all"
                            placeholder="رابط انستجرام"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>

            {/* Save Button (Mobile) */}
            <div className="lg:hidden">
                <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-8 py-4 bg-gradient-to-l from-blue-600 to-blue-700 text-white font-bold rounded-2xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                    {saving ? (
                    <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>جاري الحفظ...</span>
                    </>
                    ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>حفظ التغييرات</span>
                    </>
                    )}
                </button>
            </div>
        </div>

      </form>
    </div>
  );
}
