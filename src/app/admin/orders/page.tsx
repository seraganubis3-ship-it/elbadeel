"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Order {
  id: string;
  service: {
    name: string;
    slug: string;
  };
  variant: {
    name: string;
    priceCents: number;
    etaDays: number;
  };
  status: string;
  totalCents: number;
  deliveryType: string;
  deliveryFee: number;
  createdAt: Date;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  notes: string;
  adminNotes: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  payment?: {
    id: string;
    method: string;
    status: string;
    senderPhone: string;
    paymentScreenshot: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
  };
  orderDocuments: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    documentType: string;
    uploadedAt: Date;
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deliveryFilter, setDeliveryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, deliveryFilter, sortBy]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/admin/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortOrders = () => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(order => 
        (order.service?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by delivery type
    if (deliveryFilter !== "all") {
      filtered = filtered.filter(order => order.deliveryType === deliveryFilter);
    }

    // Sort orders
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "price":
          return b.totalCents - a.totalCents;
        case "status":
          return a.status.localeCompare(b.status);
        case "customer":
          return a.customerName.localeCompare(b.customerName);
        default:
          return 0;
      }
    });

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { text: "في انتظار الدفع", class: "bg-yellow-100 text-yellow-800" },
      payment_pending: { text: "في انتظار تأكيد الدفع", class: "bg-orange-100 text-orange-800" },
      reviewing: { text: "قيد المراجعة", class: "bg-blue-100 text-blue-800" },
      processing: { text: "قيد التنفيذ", class: "bg-purple-100 text-purple-800" },
      completed: { text: "مكتمل", class: "bg-green-100 text-green-800" },
      cancelled: { text: "ملغي", class: "bg-red-100 text-red-800" }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: "💳",
      payment_pending: "⏳",
      reviewing: "🔍",
      processing: "⚡",
      completed: "✅",
      cancelled: "❌"
    };
    return icons[status as keyof typeof icons] || "❓";
  };

  const getDeliveryInfo = (order: Order) => {
    if (order.deliveryType === "OFFICE") {
      return {
        type: "استلام من المكتب",
        fee: "مجاناً",
        color: "text-blue-600"
      };
    } else {
      return {
        type: "توصيل على العنوان",
        fee: `+${(order.deliveryFee / 100).toFixed(2)} جنيه`,
        color: "text-green-600"
      };
    }
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-900">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 admin-panel">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة الطلبات</h1>
              <p className="text-gray-900 mt-1">عرض وإدارة جميع طلبات العملاء</p>
            </div>
            <Link
              href="/admin"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              العودة للإدارة
            </Link>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-900 mb-2">البحث</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث في الطلبات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">الحالة</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all">جميع الحالات</option>
                <option value="pending">في انتظار الدفع</option>
                <option value="payment_pending">في انتظار تأكيد الدفع</option>
                <option value="reviewing">قيد المراجعة</option>
                <option value="processing">قيد التنفيذ</option>
                <option value="completed">مكتمل</option>
                <option value="cancelled">ملغي</option>
              </select>
            </div>

            {/* Delivery Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">التوصيل</label>
              <select
                value={deliveryFilter}
                onChange={(e) => setDeliveryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="all">جميع أنواع التوصيل</option>
                <option value="OFFICE">استلام من المكتب</option>
                <option value="ADDRESS">توصيل على العنوان</option>
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">ترتيب حسب</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
              >
                <option value="date">التاريخ</option>
                <option value="price">السعر</option>
                <option value="status">الحالة</option>
                <option value="customer">اسم العميل</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">قائمة الطلبات</h2>
            <span className="text-sm text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
              {filteredOrders.length} طلب
            </span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد طلبات</h3>
              <p className="text-gray-900">
                {searchTerm || statusFilter !== "all" || deliveryFilter !== "all"
                  ? "لا توجد طلبات تطابق معايير البحث المحددة"
                  : "لم يتم إنشاء أي طلبات بعد"
                }
              </p>
            </div>
          ) : (
            <>
              {currentOrders.map((order) => {
                const deliveryInfo = getDeliveryInfo(order);
                return (
                  <div key={order.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200">
                    {/* Order Header - Basic Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="text-3xl">{getStatusIcon(order.status)}</div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">{order.service?.name || 'خدمة غير محددة'}</h3>
                          <p className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded inline-block">{order.variant?.name || 'نوع غير محدد'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600 mb-1">
                          {(order.totalCents / 100).toFixed(2)} جنيه
                        </div>
                        <div className="text-sm text-gray-900 bg-gray-50 px-2 py-1 rounded">#{order.id}</div>
                      </div>
                    </div>

                    {/* Basic Order Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-900 block mb-1 text-xs font-medium">اسم العميل:</span>
                        <p className="font-medium text-gray-900">{order.customerName}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-900 block mb-1 text-xs font-medium">رقم الهاتف:</span>
                        <p className="font-medium text-gray-900">
                          {order.customerPhone && order.customerPhone !== 'unknown' 
                            ? order.customerPhone 
                            : order.user?.phone && order.user.phone !== 'unknown'
                            ? order.user.phone
                            : 'غير محدد'
                          }
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-900 block mb-1 text-xs font-medium">التوصيل:</span>
                        <p className={`font-medium ${deliveryInfo.color}`}>{deliveryInfo.type}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <span className="text-gray-900 block mb-1 text-xs font-medium">تاريخ الطلب:</span>
                        <p className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                      </div>
                    </div>

                    {/* Order Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="bg-blue-50 px-3 py-1 rounded-lg">
                          <span className="text-sm text-blue-700 font-medium">المدة: {order.variant?.etaDays || 'غير محدد'} يوم</span>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                      
                      <div className="flex items-center space-x-2 space-x-reverse">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                          عرض التفاصيل
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-8">
                  <nav className="flex items-center space-x-2 space-x-reverse">
                    <button
                      onClick={() => paginate(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`px-3 py-2 rounded-lg ${
                          currentPage === number
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-900 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => paginate(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>

        {/* Summary Stats - Excluding Completed Orders */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-6">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-blue-600">{filteredOrders.filter(o => o.status !== 'completed').length}</div>
              <div className="text-sm text-gray-900">الطلبات النشطة</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {filteredOrders.filter(o => o.status === 'pending' || o.status === 'reviewing').length}
              </div>
              <div className="text-sm text-gray-900">قيد المعالجة</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-purple-600">
                {filteredOrders.filter(o => o.deliveryType === 'ADDRESS' && o.status !== 'completed').length}
              </div>
              <div className="text-sm text-gray-900">توصيل على العنوان</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-indigo-600">
                {filteredOrders.filter(o => o.deliveryType === 'OFFICE' && o.status !== 'completed').length}
              </div>
              <div className="text-sm text-gray-900">استلام من المكتب</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-green-600">
                {filteredOrders.filter(o => o.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-900">مكتمل</div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">
                {(filteredOrders.filter(o => o.status !== 'completed').reduce((sum, o) => sum + o.totalCents, 0) / 100).toFixed(2)}
              </div>
              <div className="text-sm text-gray-900">إجمالي القيمة النشطة (جنيه)</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


