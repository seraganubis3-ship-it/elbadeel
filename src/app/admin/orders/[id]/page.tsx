"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function OrderDetailsPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [newAdminNotes, setNewAdminNotes] = useState("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: "VODAFONE_CASH",
    senderPhone: "",
    paymentScreenshot: ""
  });
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setNewStatus(data.order.status);
        setNewAdminNotes(data.order.adminNotes || "");
        if (data.order.payment) {
          setPaymentData({
            method: data.order.payment.method,
            senderPhone: data.order.payment.senderPhone || "",
            paymentScreenshot: data.order.payment.paymentScreenshot || ""
          });
        }
      } else {
        alert('فشل في جلب تفاصيل الطلب');
        router.push('/admin/orders');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      alert('حدث خطأ أثناء جلب تفاصيل الطلب');
    } finally {
      setLoading(false);
    }
  };

  const updateOrder = async () => {
    if (!order) return;
    
    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: newStatus,
          adminNotes: newAdminNotes 
        })
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder.order);
        alert('تم تحديث الطلب بنجاح');
      } else {
        alert('فشل في تحديث الطلب');
      }
    } catch (error) {
      console.error('Error updating order:', error);
      alert('حدث خطأ أثناء تحديث الطلب');
    } finally {
      setUpdating(false);
    }
  };

  const updatePayment = async () => {
    if (!order) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentData)
      });

      if (response.ok) {
        alert('تم تحديث معلومات الدفع بنجاح');
        fetchOrderDetails(); // Refresh data
        setShowPaymentForm(false);
      } else {
        alert('فشل في تحديث معلومات الدفع');
      }
    } catch (error) {
      console.error('Error updating payment:', error);
      alert('حدث خطأ أثناء تحديث معلومات الدفع');
    }
  };

  const deleteOrder = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;
    
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        alert('تم حذف الطلب بنجاح');
        router.push('/admin/orders');
      } else {
        alert('فشل في حذف الطلب');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('حدث خطأ أثناء حذف الطلب');
    }
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
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-900 text-lg">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">الطلب غير موجود</h1>
          <Link
            href="/admin/orders"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            العودة لقائمة الطلبات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 admin-panel">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">تفاصيل الطلب #{order.id}</h1>
              <p className="text-gray-700 mt-1 text-lg">
                {order.service?.name || 'خدمة غير محددة'} - {order.variant?.name || 'نوع غير محدد'}
              </p>
            </div>
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link
                href="/admin/orders"
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                ← العودة للطلبات
              </Link>
              <button
                onClick={deleteOrder}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                🗑️ حذف الطلب
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status & Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">حالة الطلب</h2>
                {getStatusBadge(order.status)}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{(order.totalCents / 100).toFixed(2)}</div>
                  <div className="text-sm text-gray-700">جنيه</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{order.variant?.etaDays || 'غير محدد'}</div>
                  <div className="text-sm text-gray-700">يوم</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{order.deliveryType === "ADDRESS" ? "توصيل" : "استلام"}</div>
                  <div className="text-sm text-gray-700">نوع التوصيل</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</div>
                  <div className="text-sm text-gray-700">تاريخ الطلب</div>
                </div>
              </div>
            </div>

            {/* Service & Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  🛠️ معلومات الخدمة
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">الخدمة:</span>
                    <span className="text-gray-900">{order.service?.name || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">النوع:</span>
                    <span className="text-gray-900">{order.variant?.name || 'غير محدد'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">السعر:</span>
                    <span className="text-gray-900">{order.variant?.priceCents ? (order.variant.priceCents / 100).toFixed(2) : 'غير محدد'} جنيه</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">المدة:</span>
                    <span className="text-gray-900">{order.variant?.etaDays || 'غير محدد'} يوم</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  👤 معلومات العميل
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">الاسم:</span>
                    <span className="text-gray-900">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">الهاتف:</span>
                    <span className="text-gray-900">
                      {order.customerPhone && order.customerPhone !== 'unknown' 
                        ? order.customerPhone 
                        : order.user?.phone && order.user.phone !== 'unknown'
                        ? order.user.phone
                        : 'غير محدد'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">البريد:</span>
                    <span className="text-gray-900">{order.customerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-700 font-medium">العنوان:</span>
                    <span className="text-gray-900">{order.address || "غير محدد"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                🚚 معلومات التوصيل
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-lg font-bold text-blue-900 mb-2">
                    {order.deliveryType === "OFFICE" ? "استلام من المكتب" : "توصيل على العنوان"}
                  </div>
                  <div className="text-sm text-blue-700">
                    {order.deliveryType === "ADDRESS" ? `+${(order.deliveryFee / 100).toFixed(2)} جنيه` : "مجاناً"}
                  </div>
                </div>
                {order.deliveryType === "ADDRESS" && (
                  <div className="md:col-span-2 p-4 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-900 mb-2">عنوان التوصيل</div>
                    <div className="text-green-700">{order.address}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  💳 معلومات الدفع
                </h2>
                <button
                  onClick={() => setShowPaymentForm(!showPaymentForm)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer"
                >
                  {showPaymentForm ? 'إلغاء التعديل' : 'تعديل الدفع'}
                </button>
              </div>

              {showPaymentForm ? (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">طريقة الدفع</label>
                      <select
                        value={paymentData.method}
                        onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="VODAFONE_CASH">فودافون كاش</option>
                        <option value="INSTA_PAY">انستا باي</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">رقم المحول</label>
                      <input
                        type="text"
                        value={paymentData.senderPhone}
                        onChange={(e) => setPaymentData({...paymentData, senderPhone: e.target.value})}
                        placeholder="رقم الهاتف"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">رابط سكرين شوت الدفع</label>
                    <input
                      type="text"
                      value={paymentData.paymentScreenshot}
                      onChange={(e) => setPaymentData({...paymentData, paymentScreenshot: e.target.value})}
                      placeholder="رابط الصورة"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-3 space-x-reverse">
                                    <button
                  onClick={updatePayment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                >
                  حفظ التعديلات
                </button>
                <button
                  onClick={() => setShowPaymentForm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-700 mb-1">طريقة الدفع</div>
                    <div className="font-bold text-green-900">
                      {order.payment?.method === "VODAFONE_CASH" ? "فودافون كاش" : "انستا باي"}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-700 mb-1">حالة الدفع</div>
                    <div className="font-bold text-blue-900">{order.payment?.status || "غير محدد"}</div>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="text-sm text-gray-700 mb-1">رقم المحول</div>
                    <div className="font-bold text-purple-900">{order.payment?.senderPhone || "غير محدد"}</div>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="text-sm text-gray-700 mb-1">تاريخ الدفع</div>
                    <div className="font-bold text-orange-900">
                      {order.payment?.createdAt ? new Date(order.payment.createdAt).toLocaleDateString('ar-EG') : "غير محدد"}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Screenshot */}
              {order.payment?.paymentScreenshot && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-700 mb-2">سكرين شوت الدفع</div>
                  <img 
                    src={order.payment.paymentScreenshot} 
                    alt="سكرين شوت الدفع"
                    className="max-w-xs rounded-lg border shadow-sm"
                  />
                </div>
              )}
            </div>

            {/* Documents */}
            {order.orderDocuments && order.orderDocuments.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  📄 المستندات المرفوعة
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.orderDocuments.map((doc) => (
                    <div key={doc.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{doc.fileName}</p>
                          <p className="text-sm text-gray-700">{doc.documentType}</p>
                        </div>
                        <Link
                          href={doc.filePath}
                          target="_blank"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          عرض
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {(order.notes || order.adminNotes) && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  📝 الملاحظات
                </h2>
                {order.notes && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">ملاحظات العميل:</h3>
                    <p className="text-gray-700">{order.notes}</p>
                  </div>
                )}
                {order.adminNotes && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h3 className="font-medium text-gray-900 mb-2">ملاحظات الإدارة:</h3>
                    <p className="text-gray-700">{order.adminNotes}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            {/* Status Update */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">تحديث حالة الطلب</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">الحالة الجديدة</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-black-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="pending" className="text-black">في انتظار الدفع</option>
                    <option value="payment_pending" className="text-black">في انتظار تأكيد الدفع</option>
                    <option value="reviewing" className="text-black">قيد المراجعة</option>
                    <option value="processing" className="text-black">قيد التنفيذ</option>
                    <option value="completed" className="text-black">مكتمل</option>
                    <option value="cancelled" className="text-black">ملغي</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات الإدارة</label>
                  <textarea
                    value={newAdminNotes}
                    onChange={(e) => setNewAdminNotes(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-black"
                    placeholder="أضف ملاحظات للإدارة..."
                  />
                </div>

                <button
                  onClick={updateOrder}
                  disabled={updating}
                  className="w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50 transition-colors font-medium cursor-pointer"
                >
                  {updating ? 'جاري التحديث...' : '💾 تحديث الطلب'}
                </button>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ملخص الطلب</h2>
              <div className="space-y-3">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">سعر الخدمة:</span>
                  <span className="text-gray-900 font-bold">{order.variant?.priceCents ? (order.variant.priceCents / 100).toFixed(2) : 'غير محدد'} جنيه</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700 font-medium">رسوم التوصيل:</span>
                  <span className="text-gray-900 font-bold">
                    {order.deliveryType === "ADDRESS" ? `+${(order.deliveryFee / 100).toFixed(2)} جنيه` : "مجاناً"}
                  </span>
                </div>
                <hr className="my-3" />
                <div className="flex justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-gray-700 font-medium">الإجمالي:</span>
                  <span className="text-blue-900 font-bold text-lg">{(order.totalCents / 100).toFixed(2)} جنيه</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    const phone = (order.customerPhone && order.customerPhone !== 'unknown') 
                      ? order.customerPhone 
                      : (order.user?.phone && order.user.phone !== 'unknown')
                      ? order.user.phone
                      : null;
                    
                    if (phone) {
                      window.open(`tel:${phone}`);
                    } else {
                      alert('رقم الهاتف غير متوفر');
                    }
                  }}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer"
                >
                  📞 الاتصال بالعميل
                </button>
                <button
                  onClick={() => window.open(`mailto:${order.customerEmail}`)}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                >
                  📧 إرسال بريد إلكتروني
                </button>
                <button
                  onClick={() => navigator.clipboard.writeText(order.id)}
                  className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium cursor-pointer"
                >
                  📋 نسخ رقم الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
