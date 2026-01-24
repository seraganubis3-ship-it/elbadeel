'use client';

import React, { useState, useEffect } from 'react';
// import { toast } from 'react-hot-toast';

interface DatabaseStats {
  totalQueries: number;
  slowQueries: number;
  averageQueryTime: number;
  slowestQuery: {
    query: string;
    duration: number;
    timestamp: string;
  } | null;
  connectionCount: number;
  activeConnections: number;
}

interface HealthCheck {
  healthy: boolean;
  issues: string[];
  recommendations: string[];
}

interface QueryTrend {
  hour: number;
  count: number;
  averageDuration: number;
  slowCount: number;
}

const PerformanceMonitoringPage: React.FC = () => {
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null);
  const [healthCheck, setHealthCheck] = useState<HealthCheck | null>(null);
  const [queryTrends, setQueryTrends] = useState<QueryTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'health' | 'indexes'>(
    'overview'
  );

  useEffect(() => {
    fetchPerformanceData();
  }, []);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const [overviewRes, queriesRes, healthRes] = await Promise.all([
        fetch('/api/admin/performance?type=overview'),
        fetch('/api/admin/performance?type=queries'),
        fetch('/api/admin/performance?type=health'),
      ]);

      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setDbStats(overviewData.database);
        setHealthCheck(overviewData.health);
      }

      if (queriesRes.ok) {
        const queriesData = await queriesRes.json();
        setQueryTrends(queriesData.trends);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealthCheck(healthData);
      }
    } catch (error) {
      //
      // toast.error('خطأ في جلب بيانات الأداء');
      // } finally {
      setLoading(false);
    }
  };

  const getHealthStatusColor = (healthy: boolean) => {
    return healthy ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getPerformanceColor = (value: number, threshold: number) => {
    return value > threshold ? 'text-red-600' : 'text-green-600';
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='animate-pulse'>
              <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                {[1, 2, 3].map(i => (
                  <div key={i} className='h-32 bg-gray-200 rounded'></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-7xl mx-auto'>
        <div className='bg-white rounded-lg shadow'>
          <div className='px-6 py-4 border-b border-gray-200'>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>مراقبة الأداء</h1>
                <p className='text-gray-600 mt-2'>مراقبة أداء قاعدة البيانات والاستعلامات</p>
              </div>
              <button
                onClick={fetchPerformanceData}
                className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors'
              >
                تحديث البيانات
              </button>
            </div>
          </div>

          <div className='p-6'>
            {/* Tabs */}
            <div className='flex space-x-1 mb-6'>
              {[
                { id: 'overview', label: 'نظرة عامة' },
                { id: 'queries', label: 'الاستعلامات' },
                { id: 'health', label: 'صحة النظام' },
                { id: 'indexes', label: 'الفهارس' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-2 rounded-md font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && dbStats && (
              <div className='space-y-6'>
                {/* Database Stats */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  <div className='bg-white border border-gray-200 rounded-lg p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>إجمالي الاستعلامات</h3>
                    <p className='text-3xl font-bold text-blue-600'>{dbStats.totalQueries}</p>
                  </div>

                  <div className='bg-white border border-gray-200 rounded-lg p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      الاستعلامات البطيئة
                    </h3>
                    <p
                      className={`text-3xl font-bold ${getPerformanceColor(dbStats.slowQueries, 0)}`}
                    >
                      {dbStats.slowQueries}
                    </p>
                  </div>

                  <div className='bg-white border border-gray-200 rounded-lg p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                      متوسط وقت الاستعلام
                    </h3>
                    <p
                      className={`text-3xl font-bold ${getPerformanceColor(dbStats.averageQueryTime, 500)}`}
                    >
                      {dbStats.averageQueryTime}ms
                    </p>
                  </div>
                </div>

                {/* Connection Stats */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div className='bg-white border border-gray-200 rounded-lg p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>إجمالي الاتصالات</h3>
                    <p className='text-2xl font-bold text-gray-700'>{dbStats.connectionCount}</p>
                  </div>

                  <div className='bg-white border border-gray-200 rounded-lg p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-2'>الاتصالات النشطة</h3>
                    <p
                      className={`text-2xl font-bold ${getPerformanceColor(dbStats.activeConnections, 80)}`}
                    >
                      {dbStats.activeConnections}
                    </p>
                  </div>
                </div>

                {/* Slowest Query */}
                {dbStats.slowestQuery && (
                  <div className='bg-white border border-gray-200 rounded-lg p-6'>
                    <h3 className='text-lg font-semibold text-gray-900 mb-4'>أبطأ استعلام</h3>
                    <div className='space-y-2'>
                      <p>
                        <span className='font-medium'>الاستعلام:</span> {dbStats.slowestQuery.query}
                      </p>
                      <p>
                        <span className='font-medium'>الوقت:</span> {dbStats.slowestQuery.duration}
                        ms
                      </p>
                      <p>
                        <span className='font-medium'>التاريخ:</span>{' '}
                        {new Date(dbStats.slowestQuery.timestamp).toLocaleString('ar-EG')}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Health Tab */}
            {activeTab === 'health' && healthCheck && (
              <div className='space-y-6'>
                <div className='bg-white border border-gray-200 rounded-lg p-6'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>حالة النظام</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthStatusColor(healthCheck.healthy)}`}
                    >
                      {healthCheck.healthy ? 'سليم' : 'يحتاج انتباه'}
                    </span>
                  </div>

                  {healthCheck.issues.length > 0 && (
                    <div className='mb-4'>
                      <h4 className='font-medium text-red-600 mb-2'>المشاكل المكتشفة:</h4>
                      <ul className='list-disc list-inside space-y-1'>
                        {healthCheck.issues.map((issue, index) => (
                          <li key={index} className='text-red-600'>
                            {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {healthCheck.recommendations.length > 0 && (
                    <div>
                      <h4 className='font-medium text-blue-600 mb-2'>التوصيات:</h4>
                      <ul className='list-disc list-inside space-y-1'>
                        {healthCheck.recommendations.map((recommendation, index) => (
                          <li key={index} className='text-blue-600'>
                            {recommendation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Queries Tab */}
            {activeTab === 'queries' && (
              <div className='space-y-6'>
                <div className='bg-white border border-gray-200 rounded-lg p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>
                    اتجاهات الاستعلامات (آخر 24 ساعة)
                  </h3>
                  <div className='overflow-x-auto'>
                    <table className='min-w-full divide-y divide-gray-200'>
                      <thead className='bg-gray-50'>
                        <tr>
                          <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            الساعة
                          </th>
                          <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            عدد الاستعلامات
                          </th>
                          <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            متوسط الوقت
                          </th>
                          <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'>
                            الاستعلامات البطيئة
                          </th>
                        </tr>
                      </thead>
                      <tbody className='bg-white divide-y divide-gray-200'>
                        {queryTrends.map((trend, index) => (
                          <tr key={index}>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {trend.hour}:00
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {trend.count}
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {trend.averageDuration}ms
                            </td>
                            <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                              {trend.slowCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Indexes Tab */}
            {activeTab === 'indexes' && (
              <div className='space-y-6'>
                <div className='bg-white border border-gray-200 rounded-lg p-6'>
                  <h3 className='text-lg font-semibold text-gray-900 mb-4'>إحصائيات الفهارس</h3>
                  <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                    <p className='text-blue-800'>
                      تم إنشاء <strong>22 فهرس</strong> لتحسين أداء قاعدة البيانات. تشمل هذه الفهارس
                      الأعمدة الأكثر استخداماً في الاستعلامات.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitoringPage;
