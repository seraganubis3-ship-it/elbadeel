'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ToastContainer, useToast } from '@/components/Toast';

interface LeaderboardItem {
  id: string;
  name: string;
  email: string;
  role: string;
  totalHandledOrders: number;
  completedOrdersCount: number;
  totalRevenueEgp: string;
  completionRatePercent: number;
  totalPoints: number;
  estimatedEgpBonus: number;
}

interface IncentiveConfig {
  id: string;
  isEnabled: boolean;
  pointsPerOrder: number;
  pointsPerEdit: number;
  pointsPerSerial: number;
  pointsPerPayment: number;
  egpPerPoint: number;
}

export default function IncentivesPage() {
  const { data: session } = useSession();
  const { toasts, showSuccess, showError, removeToast } = useToast();

  const [timeFrame, setTimeFrame] = useState<'today' | 'week' | 'month'>('month');
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [config, setConfig] = useState<IncentiveConfig | null>(null);

  // Modals
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Edit Config Form
  const [configForm, setConfigForm] = useState<IncentiveConfig>({
    id: 'default',
    isEnabled: true,
    pointsPerOrder: 10,
    pointsPerEdit: 5,
    pointsPerSerial: 5,
    pointsPerPayment: 10,
    egpPerPoint: 1.0,
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // Adjust Form
  const [adjustForm, setAdjustForm] = useState({
    userId: '',
    points: 0,
    description: '',
  });
  const [savingAdjust, setSavingAdjust] = useState(false);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/incentives/leaderboard?timeFrame=${timeFrame}`);
      const data = await res.json();

      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        setConfig(data.config || null);
        if (data.config) {
          setConfigForm(data.config);
        }
      } else {
        showError('خطأ', data.error || 'فشل جلب لوحة الصدارة');
      }
    } catch {
      showError('خطأ', 'حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }, [timeFrame, showError]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingConfig(true);
    try {
      const res = await fetch('/api/admin/incentives/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configForm),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('تم بنجاح! ⚙️', 'تم حفظ إعدادات نظام الحوافز');
        setConfig(data.config);
        setShowConfigModal(false);
        fetchLeaderboard();
      } else {
        showError('خطأ', data.error || 'فشل حفظ الإعدادات');
      }
    } catch {
      showError('خطأ', 'تعذر حفظ الإعدادات');
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveAdjust = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustForm.userId) {
      showError('تنبيه', 'يرجى اختيار المشرف');
      return;
    }
    setSavingAdjust(true);
    try {
      const res = await fetch('/api/admin/incentives/points/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(adjustForm),
      });
      const data = await res.json();
      if (data.success) {
        showSuccess('تم بنجاح! 🎯', 'تم تعديل نقاط المشرف');
        setShowAdjustModal(false);
        setAdjustForm({ userId: '', points: 0, description: '' });
        fetchLeaderboard();
      } else {
        showError('خطأ', data.error || 'فشل تعديل النقاط');
      }
    } catch {
      showError('خطأ', 'تعذر إرسال الطلب');
    } finally {
      setSavingAdjust(false);
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';

  return (
    <div className='min-h-screen bg-slate-900 text-white p-4 sm:p-8' dir='rtl'>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Header */}
      <div className='max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-6'>
        <div>
          <div className='flex items-center gap-3'>
            <span className='text-3xl'>🏆</span>
            <div>
              <h1 className='text-2xl sm:text-3xl font-black bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500 bg-clip-text text-transparent'>
                لوحة الصدارة وحوافز المشرفين
              </h1>
              <p className='text-slate-400 text-xs sm:text-sm mt-1'>
                متابعة الأداء الحي، عدد الطلبات، الإيرادات المحصلة والنقاط المكتسبة
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className='flex flex-wrap items-center gap-3'>
          {/* Timeframe selector */}
          <div className='flex items-center bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700'>
            <button
              onClick={() => setTimeFrame('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeFrame === 'today'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setTimeFrame('week')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeFrame === 'week'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              هذا الأسبوع
            </button>
            <button
              onClick={() => setTimeFrame('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                timeFrame === 'month'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              هذا الشهر
            </button>
          </div>

          {isAdmin && (
            <>
              <button
                onClick={() => setShowAdjustModal(true)}
                className='px-4 py-2.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5'
              >
                <span>➕</span> تعديل نقاط يدوي
              </button>
              <button
                onClick={() => setShowConfigModal(true)}
                className='px-4 py-2.5 bg-amber-500 text-slate-950 hover:bg-amber-400 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shadow-lg shadow-amber-500/20'
              >
                <span>⚙️</span> إعدادات الحوافز (التحكم الكامل)
              </button>
            </>
          )}
        </div>
      </div>

      <div className='max-w-7xl mx-auto'>
        {/* Status Alert */}
        {config && !config.isEnabled && (
          <div className='mb-6 p-4 bg-rose-500/20 border border-rose-500/40 rounded-2xl flex items-center gap-3 text-rose-300 text-sm font-bold'>
            <span className='text-xl'>⚠️</span>
            <span>نظام احتساب النقاط التلقائي موقوف حالياً من قبل الإدارة.</span>
          </div>
        )}

        {loading ? (
          <div className='flex flex-col items-center justify-center py-20 gap-4'>
            <div className='w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin' />
            <p className='text-slate-400 text-sm font-bold animate-pulse'>
              جاري تحميل بيانات الصدارة والإنتاجية...
            </p>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className='text-center py-20 bg-slate-800/40 rounded-3xl border border-slate-800'>
            <span className='text-4xl'>📊</span>
            <p className='text-slate-400 font-bold mt-3'>لا توجد بيانات مشرفين للفترة المحددة</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podiums */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
              {leaderboard.slice(0, 3).map((item, index) => {
                const colors = [
                  {
                    bg: 'from-amber-500/20 to-yellow-600/10',
                    border: 'border-amber-500/50',
                    badge: '🥇 المركز الأول',
                    rankColor: 'text-amber-400',
                  },
                  {
                    bg: 'from-slate-400/20 to-slate-500/10',
                    border: 'border-slate-400/50',
                    badge: '🥈 المركز الثاني',
                    rankColor: 'text-slate-300',
                  },
                  {
                    bg: 'from-amber-700/20 to-amber-900/10',
                    border: 'border-amber-700/50',
                    badge: '🥉 المركز الثالث',
                    rankColor: 'text-amber-600',
                  },
                ][index] || {
                  bg: 'from-slate-800 to-slate-900',
                  border: 'border-slate-800',
                  badge: '',
                  rankColor: 'text-white',
                };

                return (
                  <div
                    key={item.id}
                    className={`relative bg-gradient-to-b ${colors.bg} rounded-3xl p-6 border ${colors.border} shadow-xl flex flex-col justify-between overflow-hidden`}
                  >
                    <div className='flex items-center justify-between mb-4'>
                      <span className='text-xs font-black px-3 py-1 bg-slate-950/60 rounded-full border border-white/10 text-amber-300'>
                        {colors.badge}
                      </span>
                      <span className={`text-2xl font-black ${colors.rankColor}`}>
                        #{index + 1}
                      </span>
                    </div>

                    <div>
                      <h3 className='text-xl font-black text-white truncate'>{item.name}</h3>
                      <p className='text-xs text-slate-400 font-mono mt-0.5'>{item.email}</p>
                    </div>

                    <div className='grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/10 text-xs'>
                      <div className='bg-slate-950/40 p-3 rounded-2xl border border-white/5'>
                        <span className='text-slate-400 block text-[10px] mb-1'>
                          الطلبات المكتملة
                        </span>
                        <span className='text-base font-black text-amber-300'>
                          {item.completedOrdersCount} طلب
                        </span>
                      </div>
                      <div className='bg-slate-950/40 p-3 rounded-2xl border border-white/5'>
                        <span className='text-slate-400 block text-[10px] mb-1'>
                          الفلوس المحصلة
                        </span>
                        <span className='text-base font-black text-emerald-400'>
                          {item.totalRevenueEgp} ج.م
                        </span>
                      </div>
                      <div className='bg-slate-950/40 p-3 rounded-2xl border border-white/5'>
                        <span className='text-slate-400 block text-[10px] mb-1'>
                          النقاط المكتسبة
                        </span>
                        <span className='text-base font-black text-blue-400'>
                          {item.totalPoints} نقطة
                        </span>
                      </div>
                      <div className='bg-slate-950/40 p-3 rounded-2xl border border-white/5'>
                        <span className='text-slate-400 block text-[10px] mb-1'>
                          الحافز المستحق
                        </span>
                        <span className='text-base font-black text-amber-400'>
                          {item.estimatedEgpBonus} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leaderboard Full Table */}
            <div className='bg-slate-800/50 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl'>
              <div className='p-6 border-b border-slate-800 flex items-center justify-between'>
                <h2 className='text-lg font-black text-white flex items-center gap-2'>
                  <span>📊</span> ترتيب جميع المشرفين والإنتاجية
                </h2>
                <span className='text-xs text-slate-400 font-bold'>
                  قيمة النقطة الحالية: {config?.egpPerPoint || 1} ج.م
                </span>
              </div>

              <div className='overflow-x-auto'>
                <table className='w-full text-right text-sm'>
                  <thead className='bg-slate-900/60 text-slate-400 text-xs font-bold border-b border-slate-800'>
                    <tr>
                      <th className='p-4 text-center'>الترتيب</th>
                      <th className='p-4'>المشرف</th>
                      <th className='p-4 text-center'>الطلبات المكتملة</th>
                      <th className='p-4 text-center'>إجمالي الإيراد/الفلوس</th>
                      <th className='p-4 text-center'>نسبة الإتمام</th>
                      <th className='p-4 text-center'>مجموع النقاط</th>
                      <th className='p-4 text-center'>الحافز التقديري (ج.م)</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-slate-800/60 text-slate-200'>
                    {leaderboard.map((item, idx) => (
                      <tr key={item.id} className='hover:bg-slate-800/40 transition-colors'>
                        <td className='p-4 text-center font-black text-amber-400'>#{idx + 1}</td>
                        <td className='p-4'>
                          <div className='font-bold text-white'>{item.name}</div>
                          <div className='text-xs text-slate-400 font-mono'>{item.email}</div>
                        </td>
                        <td className='p-4 text-center font-black text-white'>
                          {item.completedOrdersCount} / {item.totalHandledOrders}
                        </td>
                        <td className='p-4 text-center font-black text-emerald-400 dir-ltr'>
                          {item.totalRevenueEgp} ج.م
                        </td>
                        <td className='p-4 text-center'>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              item.completionRatePercent >= 90
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {item.completionRatePercent}%
                          </span>
                        </td>
                        <td className='p-4 text-center font-black text-blue-400'>
                          {item.totalPoints}
                        </td>
                        <td className='p-4 text-center font-black text-amber-400 text-base dir-ltr'>
                          {item.estimatedEgpBonus} ج.م
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Config Modal (Admin Full Control) */}
      {showConfigModal && (
        <div className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200'>
            <div className='flex items-center justify-between pb-4 border-b border-slate-800'>
              <h3 className='text-lg font-black text-amber-400 flex items-center gap-2'>
                <span>⚙️</span> التحكم الكامل في إعدادات الحوافز
              </h3>
              <button
                onClick={() => setShowConfigModal(false)}
                className='text-slate-400 hover:text-white text-xl'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConfig} className='space-y-4 mt-4'>
              <div className='flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl border border-slate-700'>
                <span className='text-sm font-bold'>تفعيل نظام الحوافز:</span>
                <input
                  type='checkbox'
                  checked={configForm.isEnabled}
                  onChange={e => setConfigForm({ ...configForm, isEnabled: e.target.checked })}
                  className='w-5 h-5 accent-amber-500 rounded cursor-pointer'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-slate-400 mb-1'>
                  قيمة النقطة الواحدة بالجنيه المصري (EGP):
                </label>
                <input
                  type='number'
                  step='0.1'
                  min='0'
                  value={configForm.egpPerPoint}
                  onChange={e =>
                    setConfigForm({ ...configForm, egpPerPoint: parseFloat(e.target.value) || 0 })
                  }
                  className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-amber-500'
                />
              </div>

              <div className='grid grid-cols-2 gap-3'>
                <div>
                  <label className='block text-xs font-bold text-slate-400 mb-1'>
                    نقاط إكمال الطلب:
                  </label>
                  <input
                    type='number'
                    value={configForm.pointsPerOrder}
                    onChange={e =>
                      setConfigForm({
                        ...configForm,
                        pointsPerOrder: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-500'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold text-slate-400 mb-1'>
                    نقاط تأكيد الدفع:
                  </label>
                  <input
                    type='number'
                    value={configForm.pointsPerPayment}
                    onChange={e =>
                      setConfigForm({
                        ...configForm,
                        pointsPerPayment: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-500'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold text-slate-400 mb-1'>
                    نقاط تعديل البيانات:
                  </label>
                  <input
                    type='number'
                    value={configForm.pointsPerEdit}
                    onChange={e =>
                      setConfigForm({ ...configForm, pointsPerEdit: parseInt(e.target.value) || 0 })
                    }
                    className='w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-500'
                  />
                </div>
                <div>
                  <label className='block text-xs font-bold text-slate-400 mb-1'>
                    نقاط ربط السيريال:
                  </label>
                  <input
                    type='number'
                    value={configForm.pointsPerSerial}
                    onChange={e =>
                      setConfigForm({
                        ...configForm,
                        pointsPerSerial: parseInt(e.target.value) || 0,
                      })
                    }
                    className='w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold outline-none focus:border-amber-500'
                  />
                </div>
              </div>

              <div className='pt-4 flex gap-3'>
                <button
                  type='submit'
                  disabled={savingConfig}
                  className='flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-black text-sm transition-all disabled:opacity-50'
                >
                  {savingConfig ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                </button>
                <button
                  type='button'
                  onClick={() => setShowConfigModal(false)}
                  className='px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-all'
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Points Modal */}
      {showAdjustModal && (
        <div className='fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4'>
          <div className='bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200'>
            <div className='flex items-center justify-between pb-4 border-b border-slate-800'>
              <h3 className='text-lg font-black text-blue-400 flex items-center gap-2'>
                <span>➕</span> إضافة / خصم نقاط يدوياً
              </h3>
              <button
                onClick={() => setShowAdjustModal(false)}
                className='text-slate-400 hover:text-white text-xl'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className='space-y-4 mt-4'>
              <div>
                <label className='block text-xs font-bold text-slate-400 mb-1'>اختر المشرف:</label>
                <select
                  value={adjustForm.userId}
                  onChange={e => setAdjustForm({ ...adjustForm, userId: e.target.value })}
                  className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-blue-500'
                >
                  <option value=''>-- اختر المشرف --</option>
                  {leaderboard.map(sup => (
                    <option key={sup.id} value={sup.id}>
                      {sup.name} ({sup.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className='block text-xs font-bold text-slate-400 mb-1'>
                  عدد النقاط (موجب للإضافة، سالب للخصم):
                </label>
                <input
                  type='number'
                  value={adjustForm.points}
                  onChange={e =>
                    setAdjustForm({ ...adjustForm, points: parseInt(e.target.value) || 0 })
                  }
                  placeholder='مثال: 50 أو -20'
                  className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-blue-500'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-slate-400 mb-1'>سبب التعديل:</label>
                <input
                  type='text'
                  value={adjustForm.description}
                  onChange={e => setAdjustForm({ ...adjustForm, description: e.target.value })}
                  placeholder='مثال: مكافأة تميز في إغلاق تسوية'
                  className='w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-bold outline-none focus:border-blue-500'
                />
              </div>

              <div className='pt-4 flex gap-3'>
                <button
                  type='submit'
                  disabled={savingAdjust}
                  className='flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all disabled:opacity-50'
                >
                  {savingAdjust ? 'جاري الإرسال...' : 'تأكيد تعديل النقاط'}
                </button>
                <button
                  type='button'
                  onClick={() => setShowAdjustModal(false)}
                  className='px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-all'
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
