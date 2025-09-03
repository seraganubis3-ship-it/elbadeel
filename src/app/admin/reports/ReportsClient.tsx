"use client";

import { useEffect, useMemo, useState } from "react";
import RechartsChart, { SeriesPoint as ChartSeriesPoint } from "./RechartsChart";

type PeriodKey = "7d" | "30d" | "90d" | "this-month" | "last-month" | "all";

type SeriesPoint = { key: string; label: string; revenueCents: number; orders: number; completed: number; pending: number };

type Stats = {
  label: string;
  ordersCount: number;
  completedOrders: number;
  pendingOrders: number;
  revenueCents: number;
  prevOrdersCount: number;
  prevRevenueCents: number;
  totalOrdersAll: number;
  totalRevenueAllCents: number;
  bucket: "day" | "month";
  series: SeriesPoint[];
};

export default function ReportsClient({ initialPeriod }: { initialPeriod: PeriodKey }) {
  const [period, setPeriod] = useState<PeriodKey>(initialPeriod);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periods: { key: PeriodKey; label: string }[] = useMemo(() => ([
    { key: "7d", label: "7 أيام" },
    { key: "30d", label: "30 يوم" },
    { key: "90d", label: "90 يوم" },
    { key: "this-month", label: "هذا الشهر" },
    { key: "last-month", label: "الشهر الماضي" },
    { key: "all", label: "الكل" },
  ]), []);

  const deltaPct = (curr: number, prev: number) => {
    if (prev > 0) return ((curr - prev) / prev) * 100;
    return curr > 0 ? 100 : 0;
  };

  const deltaColor = (v: number) => (v >= 0 ? "text-green-600" : "text-red-600");

  const fetchStats = async (p: PeriodKey) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports?period=${p}`, { cache: "no-store" });
      if (!res.ok) throw new Error("فشل في جلب البيانات");
      const data = await res.json();
      setStats(data);
    } catch (e: any) {
      setError(e?.message || "خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(period);
  }, [period]);

  const formatEGP = (cents: number) => new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(cents / 100);

  const revenueDelta = deltaPct(stats?.revenueCents || 0, stats?.prevRevenueCents || 0);
  const ordersDelta = deltaPct(stats?.ordersCount || 0, stats?.prevOrdersCount || 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">التقارير</h1>
          <p className="text-gray-600">نظرة عامة على الأداء — {stats?.label || ""}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {periods.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                period === p.key ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl p-3">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 opacity-100 transition-opacity" style={{ opacity: loading ? 0.6 : 1 }}>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">عدد الطلبات</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stats?.ordersCount ?? "—"}</p>
              <p className={`mt-1 text-xs ${deltaColor(ordersDelta)}`}>
                {ordersDelta >= 0 ? "▲" : "▼"} {ordersDelta.toFixed(1)}% مقارنة بالفترة السابقة
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h6m2 2H7a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V9a2 2 0 00-2-2z"/></svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">طلبات مكتملة</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stats?.completedOrders ?? "—"}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">طلبات قيد الانتظار</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stats?.pendingOrders ?? "—"}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">الإيرادات</p>
              <p className="mt-2 text-2xl font-bold text-gray-900">{stats ? formatEGP(stats.revenueCents) : "—"}</p>
              <p className="text-xs text-gray-500">الفترة السابقة: {stats ? formatEGP(stats.prevRevenueCents) : "—"}</p>
              <p className={`mt-1 text-xs ${deltaColor(revenueDelta)}`}>
                {revenueDelta >= 0 ? "▲" : "▼"} {revenueDelta.toFixed(1)}% مقارنة بالفترة السابقة
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/></svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">الإيرادات والطلبات الزمنية</h2>
        {stats?.series ? (
          <RechartsChart data={stats.series as ChartSeriesPoint[]} />
        ) : (
          <div className="h-40 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">
            تحميل...
          </div>
        )}
        <div className="mt-3 text-xs text-gray-500 flex items-center gap-4">
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-500 inline-block"/> خط الإيرادات</span>
          <span className="inline-flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-300 inline-block"/> أعمدة الطلبات</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">لوحة التقارير</h2>
        <p className="text-gray-600 mb-4">إجمالي النظام: {stats?.totalOrdersAll ?? "—"} طلب — الإيرادات الكلية: {stats ? formatEGP(stats.totalRevenueAllCents) : "—"}</p>
        <div className="h-16 rounded-lg bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center text-gray-500">
          مزيد من التفاصيل قريبًا
        </div>
      </div>
    </div>
  );
}
