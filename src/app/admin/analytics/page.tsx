'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, ShoppingCart, RefreshCw, Award, Activity, UserCheck, BarChart3, ArrowUp, ArrowDown, Calendar } from 'lucide-react';
import Button from '@/components/Button';

interface AnalyticsData {
  summary: {
    totalOrders: number;
    totalRevenue: number;
    activeCustomers: number;
    totalCustomers: number;
    avgOrderValue: number;
    todayOrders: number;
    todayRevenue: number;
    yesterdayOrders: number;
    yesterdayRevenue: number;
    todayGrowth: number;
    revenueGrowth: number;
    totalStaff: number;
    activeStaff: number;
    conversionRate: number;
    totalSiteActions: number;
    dateRange: number;
  };
  topServices: Array<{
    id: string;
    name: string;
    count: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    serviceName: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    customer: {
      name: string;
      phone: string | null;
    };
  }>;
  chartData: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
  customerStats: Array<{
    userId: string;
    name: string;
    phone: string;
    ordersCount: number;
    totalRevenue: number;
    avgOrderValue: number;
    mostRequestedService: string;
    mostRequestedServiceCount: number;
  }>;
  staffStats: Array<{
    staffId: string;
    name: string;
    role: string;
    ordersProcessed: number;
    revenueGenerated: number;
    avgOrderValue: number;
    lastActivity: string;
  }>;
  ordersByStatus: Array<{
    status: string;
    count: number;
  }>;
  siteActivity: Array<{
    action: string;
    count: number;
  }>;
}

const statusLabels: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  IN_PROGRESS: 'جاري التنفيذ',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
};

const statusColors: Record<string, string> = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#10b981',
  CANCELLED: '#ef4444',
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [dateRange, setDateRange] = useState<number>(30);

  const fetchAnalytics = async (days: number = dateRange) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/analytics?days=${days}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(dateRange);
  }, [dateRange]);

  const handleDateRangeChange = (days: number) => {
    setDateRange(days);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-semibold text-gray-700">جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600 font-semibold">فشل تحميل البيانات</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30" dir="rtl">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              لوحة التحليلات
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              آخر تحديث: {lastUpdate.toLocaleTimeString('ar-EG')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-white rounded-xl shadow-md p-1">
              <button
                onClick={() => handleDateRangeChange(7)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  dateRange === 7
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                7 أيام
              </button>
              <button
                onClick={() => handleDateRangeChange(30)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  dateRange === 30
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                30 يوم
              </button>
              <button
                onClick={() => handleDateRangeChange(90)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  dateRange === 90
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                90 يوم
              </button>
            </div>

            <Button onClick={() => fetchAnalytics(dateRange)} disabled={loading} size="lg">
              <RefreshCw className={`w-5 h-5 ml-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </div>

        {/* Summary Cards - IMPROVED READABILITY */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Orders */}
          <Card className="border-0 shadow-xl bg-white overflow-hidden relative hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-blue-600" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي الطلبات</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data.summary.totalOrders.toLocaleString('en-US')}</div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="info" className="text-xs">
                  اليوم: {data.summary.todayOrders}
                </Badge>
                {data.summary.todayGrowth !== 0 && (
                  <span className={`text-xs flex items-center gap-1 font-semibold ${data.summary.todayGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.summary.todayGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(data.summary.todayGrowth).toFixed(1)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue */}
          <Card className="border-0 shadow-xl bg-white overflow-hidden relative hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-600" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">إجمالي الإيرادات</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {data.summary.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-lg text-gray-600">جنيه</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <Badge variant="success" className="text-xs">
                  اليوم: {data.summary.todayRevenue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} جنيه
                </Badge>
                {data.summary.revenueGrowth !== 0 && (
                  <span className={`text-xs flex items-center gap-1 font-semibold ${data.summary.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {data.summary.revenueGrowth > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(data.summary.revenueGrowth).toFixed(1)}%
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Active Customers */}
          <Card className="border-0 shadow-xl bg-white overflow-hidden relative hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-violet-600" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">العملاء النشطين</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{data.summary.totalCustomers.toLocaleString('en-US')}</div>
              <p className="text-xs text-gray-500 mt-3">إجمالي العملاء المسجلين</p>
            </CardContent>
          </Card>

          {/* Average Order Value */}
          <Card className="border-0 shadow-xl bg-white overflow-hidden relative hover:shadow-2xl transition-shadow">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-500 to-orange-600" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">متوسط قيمة الطلب</CardTitle>
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {data.summary.avgOrderValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} <span className="text-lg text-gray-600">جنيه</span>
              </div>
              <p className="text-xs text-gray-500 mt-3">للطلب الواحد</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Metrics */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">إجمالي الموظفين</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.summary.totalStaff}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <UserCheck className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <Badge variant="info" className="mt-3">
                نشط: {data.summary.activeStaff}
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">معدل التحويل</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.summary.conversionRate.toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">طلبات لكل عميل</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 font-medium">نشاط الموقع</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{data.summary.totalSiteActions.toLocaleString('en-US')}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <Activity className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">آخر {dateRange} يوم</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabbed Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
            <TabsTrigger value="staff">الموظفين</TabsTrigger>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Revenue Chart */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">الإيرادات (آخر {dateRange} يوم)</CardTitle>
                  <CardDescription>إجمالي الإيرادات اليومية</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data.chartData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fill="url(#colorRevenue)" name="الإيرادات" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders Chart */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">الطلبات (آخر {dateRange} يوم)</CardTitle>
                  <CardDescription>عدد الطلبات اليومية</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                      <YAxis stroke="#6b7280" fontSize={12} />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#3b82f6" radius={[8, 8, 0, 0]} name="الطلبات" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Orders by Status */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">توزيع الطلبات حسب الحالة</CardTitle>
                  <CardDescription>نسبة الطلبات لكل حالة</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={data.ordersByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={(entry) => `${statusLabels[entry.status] || entry.status || 'غير محدد'}: ${entry.count}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.ordersByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={statusColors[entry.status] || '#6b7280'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Top Services */}
              <Card className="border-0 shadow-lg bg-white">
                <CardHeader>
                  <CardTitle className="text-gray-900">أكثر الخدمات طلباً</CardTitle>
                  <CardDescription>أعلى 5 خدمات حسب عدد الطلبات</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topServices.map((service, index) => (
                      <div key={service.id} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                            ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white' :
                              index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-white' :
                              index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white' :
                              'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700'}
                          `}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{service.name}</p>
                            <p className="text-sm text-gray-500">{service.count} طلب</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-green-600">{service.revenue.toLocaleString('en-US')} جنيه</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-6 w-6 text-yellow-500" />
                  <CardTitle className="text-gray-900">تقرير العملاء (أفضل 20 عميل)</CardTitle>
                </div>
                <CardDescription>إحصائيات تفصيلية لكل عميل (آخر {dateRange} يوم)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <th className="text-right p-4 font-bold text-gray-700">#</th>
                        <th className="text-right p-4 font-bold text-gray-700">اسم العميل</th>
                        <th className="text-right p-4 font-bold text-gray-700">رقم الهاتف</th>
                        <th className="text-center p-4 font-bold text-gray-700">عدد الطلبات</th>
                        <th className="text-center p-4 font-bold text-gray-700">إجمالي الإيرادات</th>
                        <th className="text-center p-4 font-bold text-gray-700">متوسط الطلب</th>
                        <th className="text-right p-4 font-bold text-gray-700">أكثر خدمة طلباً</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.customerStats.map((customer, index) => (
                        <tr key={customer.userId} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {index < 3 && (
                                <Award className={`h-5 w-5 ${
                                  index === 0 ? 'text-yellow-500' :
                                  index === 1 ? 'text-gray-400' :
                                  'text-orange-600'
                                }`} />
                              )}
                              <span className="font-semibold text-gray-700">{index + 1}</span>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-gray-900">{customer.name}</td>
                          <td className="p-4 text-gray-600">{customer.phone || 'غير متوفر'}</td>
                          <td className="p-4 text-center">
                            <Badge variant="info">{customer.ordersCount}</Badge>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-green-600">
                              {customer.totalRevenue.toLocaleString('en-US')} جنيه
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            {customer.avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} جنيه
                          </td>
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-gray-900">{customer.mostRequestedService}</p>
                              <Badge variant="purple" className="mt-1">
                                {customer.mostRequestedServiceCount} مرة
                              </Badge>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Staff Tab */}
          <TabsContent value="staff">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-6 w-6 text-blue-500" />
                  <CardTitle className="text-gray-900">أداء الموظفين (أفضل 10)</CardTitle>
                </div>
                <CardDescription>إحصائيات أداء كل موظف (آخر {dateRange} يوم)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                        <th className="text-right p-4 font-bold text-gray-700">#</th>
                        <th className="text-right p-4 font-bold text-gray-700">اسم الموظف</th>
                        <th className="text-center p-4 font-bold text-gray-700">الدور</th>
                        <th className="text-center p-4 font-bold text-gray-700">الطلبات المعالجة</th>
                        <th className="text-center p-4 font-bold text-gray-700">الإيرادات المحققة</th>
                        <th className="text-center p-4 font-bold text-gray-700">متوسط الطلب</th>
                        <th className="text-center p-4 font-bold text-gray-700">آخر نشاط</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.staffStats.map((staff, index) => (
                        <tr key={staff.staffId} className="border-b border-gray-100 hover:bg-green-50/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              {index < 3 && (
                                <Award className={`h-5 w-5 ${
                                  index === 0 ? 'text-yellow-500' :
                                  index === 1 ? 'text-gray-400' :
                                  'text-orange-600'
                                }`} />
                              )}
                              <span className="font-semibold text-gray-700">{index + 1}</span>
                            </div>
                          </td>
                          <td className="p-4 font-medium text-gray-900">{staff.name}</td>
                          <td className="p-4 text-center">
                            <Badge variant={staff.role === 'ADMIN' ? 'danger' : 'info'}>
                              {staff.role === 'ADMIN' ? 'مدير' : 'موظف'}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant="success">{staff.ordersProcessed}</Badge>
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-bold text-green-600">
                              {staff.revenueGenerated.toLocaleString('en-US')} جنيه
                            </span>
                          </td>
                          <td className="p-4 text-center text-gray-700">
                            {staff.avgOrderValue.toLocaleString('en-US', { maximumFractionDigits: 0 })} جنيه
                          </td>
                          <td className="p-4 text-center text-sm text-gray-600">
                            {new Date(staff.lastActivity).toLocaleDateString('ar-EG')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-lg bg-white">
              <CardHeader>
                <CardTitle className="text-gray-900">آخر الطلبات</CardTitle>
                <CardDescription>أحدث 10 طلبات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">#{order.id}</p>
                        <p className="text-sm text-gray-600">{order.customer.name}</p>
                        <p className="text-xs text-gray-500">{order.customer.phone || 'غير متوفر'}</p>
                      </div>
                      <div className="flex-1 text-center">
                        <p className="text-sm font-medium text-gray-900">{order.serviceName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                        </p>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-bold text-green-600">{order.totalPrice.toLocaleString('en-US')} جنيه</p>
                        <Badge 
                          variant={
                            order.status === 'COMPLETED' ? 'success' :
                            order.status === 'IN_PROGRESS' ? 'info' :
                            order.status === 'PENDING' ? 'warning' :
                            'danger'
                          }
                          className="mt-1"
                        >
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
