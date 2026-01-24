'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast, ToastContainer } from '@/components/Toast';
import { Skeleton } from '@/components/ui/skeleton';

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
  estimatedCompletionDate?: Date;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  notes: string;
  adminNotes: string;
  // Additional fields for birth certificate
  birthDate?: string;
  motherName?: string;
  idNumber?: string;
  quantity?: number;
  customerFollowUp?: string;
  // Fines and services details
  selectedFines?: string;
  finesDetails?: string;
  servicesDetails?: string;
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
  createdByAdmin?: { id: string; name: string; email: string } | null;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [services, setServices] = useState<{ id: string; name: string }[]>([]);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [isServicesDropdownOpen, setIsServicesDropdownOpen] = useState(false);
  const [orderSourceFilter, setOrderSourceFilter] = useState('office'); // Default to office orders
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userIdFilter = searchParams.get('userId') || '';
  const createdByAdminIdFilter = searchParams.get('createdByAdminId') || '';
  const deliveryTodayFilter = searchParams.get('delivery') === 'today';
  const [admins, setAdmins] = useState<{ id: string; name: string }[]>([]);
  const hasFilter = Boolean(
    (dateFrom && dateTo) ||
      searchTerm ||
      userIdFilter ||
      createdByAdminIdFilter ||
      selectedServiceIds.length > 0 ||
      deliveryTodayFilter ||
      orderSourceFilter !== 'all'
  );

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Status update state
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Bulk selection state
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [updatingBulk, setUpdatingBulk] = useState(false);

  // WhatsApp Modal State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [whatsappOrder, setWhatsappOrder] = useState<Order | null>(null);

  // Function to update order status directly
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!newStatus) return;

    setUpdatingStatus(orderId);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Update the order status in the local state immediately for better UX
        setOrders(prevOrders =>
          prevOrders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
        );

        // Show success toast
        const statusText = getStatusText(newStatus);
        showSuccess(
          'تم تحديث حالة الطلب بنجاح! 🎉',
          `تم تغيير حالة الطلب #${orderId} إلى "${statusText}"`
        );
      } else {
        const errorData = await response.json();
        showError('فشل في تحديث حالة الطلب', errorData.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      //
      // showError(
      // "خطأ في الاتصال",
      // "حدث خطأ أثناء تحديث حالة الطلب. يرجى المحاولة مرة أخرى"
      // );
      // } finally {
      setUpdatingStatus(null);
    }
  };

  // Function to handle bulk status update
  const updateBulkStatus = async () => {
    if (!bulkStatus || selectedOrders.length === 0) return;

    setUpdatingBulk(true);

    try {
      const response = await fetch('/api/admin/orders/bulk-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedOrders,
          status: bulkStatus,
        }),
      });

      if (response.ok) {
        await response.json();

        // Update the orders status in the local state
        setOrders(prevOrders =>
          prevOrders.map(order =>
            selectedOrders.includes(order.id) ? { ...order, status: bulkStatus } : order
          )
        );

        // Show success toast
        const statusText = getStatusText(bulkStatus);
        showSuccess(
          'تم تحديث الطلبات بنجاح! 🚀',
          `تم تحديث ${selectedOrders.length} طلب إلى حالة "${statusText}"`
        );

        // Clear selection
        setSelectedOrders([]);
        setBulkStatus('');
      } else {
        const errorData = await response.json();
        showError('فشل في تحديث الطلبات', errorData.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      //
      // showError(
      // "خطأ في الاتصال",
      // "حدث خطأ أثناء تحديث حالات الطلبات. يرجى المحاولة مرة أخرى"
      // );
      // } finally {
      setUpdatingBulk(false);
    }
  };

  // WhatsApp message templates
  const getWhatsappTemplates = (order: Order | null) => [
    {
      id: 'new_order',
      name: '🆕 طلب جديد',
      message: `🏢 *منصة البديل*\n\nمرحباً *${order?.customerName}* 👋\n\n✅ تم استلام طلبك بنجاح!\n\n📋 *تفاصيل الطلب:*\n• رقم الطلب: #${order?.id}\n• الخدمة: ${order?.service?.name}\n• المبلغ: ${order ? (order.totalCents / 100).toFixed(2) : 0} جنيه\n\nسنقوم بالتواصل معك قريباً.\n\n🌐 منصة البديل`,
    },
    {
      id: 'order_ready',
      name: '✅ جاهز للاستلام',
      message: `🏢 *منصة البديل*\n\nمرحباً *${order?.customerName}* 👋\n\n🎉 *طلبك جاهز للاستلام!*\n\n📋 رقم الطلب: #${order?.id}\n📌 الخدمة: ${order?.service?.name}\n\n📍 يمكنك استلام طلبك من مكتبنا.\n\n🌐 منصة البديل`,
    },
    {
      id: 'payment_reminder',
      name: '💰 تذكير بالدفع',
      message: `🏢 *منصة البديل*\n\nمرحباً *${order?.customerName}* 👋\n\n💰 *تذكير بالدفع*\n\n📋 رقم الطلب: #${order?.id}\n💵 المبلغ: ${order ? (order.totalCents / 100).toFixed(2) : 0} جنيه\n\nيرجى سداد المبلغ لاستكمال الطلب.\n\n🌐 منصة البديل`,
    },
    {
      id: 'order_delivered',
      name: '🚚 تم التسليم',
      message: `🏢 *منصة البديل*\n\nمرحباً *${order?.customerName}* 👋\n\n✅ *تم تسليم طلبك بنجاح!*\n\n📋 رقم الطلب: #${order?.id}\n📌 الخدمة: ${order?.service?.name}\n\nشكراً لثقتك في منصة البديل 🙏\n\n🌐 منصة البديل`,
    },
  ];

  // Send WhatsApp message
  const sendWhatsApp = async () => {
    if (!whatsappOrder) return;

    const phone =
      whatsappOrder.customerPhone && whatsappOrder.customerPhone !== 'unknown'
        ? whatsappOrder.customerPhone
        : whatsappOrder.user?.phone && whatsappOrder.user.phone !== 'unknown'
          ? whatsappOrder.user.phone
          : null;

    if (!phone) {
      showError('رقم الهاتف غير متوفر', 'لا يوجد رقم واتساب مسجل للعميل');
      return;
    }

    if (!whatsappMessage.trim()) {
      showError('الرسالة فارغة', 'يرجى كتابة رسالة أو اختيار قالب جاهز');
      return;
    }

    setSendingWhatsApp(true);

    try {
      const response = await fetch('/api/admin/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message: whatsappMessage }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess('تم إرسال الرسالة! ✅', 'تم إرسال رسالة واتساب للعميل بنجاح');
        setShowWhatsAppModal(false);
        setWhatsappMessage('');
        setSelectedTemplate('');
        setWhatsappOrder(null);
      } else {
        showError('فشل إرسال الرسالة', data.error || 'حدث خطأ أثناء إرسال الرسالة');
      }
    } catch (error) {
      showError('خطأ في الاتصال', 'تأكد من أن بوت الواتساب متصل ثم حاول مرة أخرى');
    } finally {
      setSendingWhatsApp(false);
    }
  };

  // Function to handle order selection
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  // Function to select all orders
  const selectAllOrders = () => {
    if (selectedOrders.length === currentOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map(order => order.id));
    }
  };

  // Helper function to get status text
  const getStatusText = (status: string) => {
    const statusConfig = {
      pending: 'في انتظار الدفع',
      payment_pending: 'في انتظار تأكيد الدفع',
      payment_confirmed: 'مدفوع بالكامل',
      partial_payment: 'دفع جزئي',
      reviewing: 'قيد المراجعة',
      processing: 'قيد التنفيذ',
      completed: 'مكتمل',
      cancelled: 'ملغي',
    };
    return statusConfig[status as keyof typeof statusConfig] || status;
  };

  // Service selection handlers
  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  // Function to parse dd/mm/yyyy format
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;

    // Check if it's in dd/mm/yyyy format
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);

    if (match && match[1] && match[2] && match[3]) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-based
      const year = parseInt(match[3], 10);

      const date = new Date(year, month, day);

      // Check if the date is valid
      if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date;
      }
    }

    return null;
  };

  const fetchOrders = useCallback(async () => {
    try {
      if (!hasFilter) {
        setOrders([]);
        setLoading(false);
        return;
      }
      const params = new URLSearchParams();
      if (userIdFilter) params.set('userId', userIdFilter);
      if (createdByAdminIdFilter) params.set('createdByAdminId', createdByAdminIdFilter);
      if (dateFrom && dateTo) {
        params.set('from', dateFrom);
        params.set('to', dateTo);
      }
      if (selectedServiceIds.length > 0) {
        selectedServiceIds.forEach(id => params.append('serviceIds', id));
      }
      // Add order source filter
      if (orderSourceFilter === 'office') {
        params.set('createdByAdmin', 'true');
      } else if (orderSourceFilter === 'online') {
        params.set('createdByAdmin', 'false');
      }
      const response = await fetch(
        `/api/admin/orders${params.toString() ? `?${params.toString()}` : ''}`
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      //
    } finally {
      setLoading(false);
    }
  }, [
    hasFilter,
    userIdFilter,
    createdByAdminIdFilter,
    dateFrom,
    dateTo,
    selectedServiceIds,
    orderSourceFilter,
  ]);

  const filterAndSortOrders = useCallback(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        order =>
          (order.service?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          // Search by phone number
          (order.customerPhone &&
            order.customerPhone.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (order.user?.phone &&
            order.user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
          // Search by form number (order ID)
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filter by delivery type
    if (deliveryFilter !== 'all') {
      filtered = filtered.filter(order => order.deliveryType === deliveryFilter);
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = parseDate(dateFrom);
      if (fromDate) {
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= fromDate;
        });
      }
    }

    if (dateTo) {
      const toDate = parseDate(dateTo);
      if (toDate) {
        toDate.setHours(23, 59, 59, 999); // Include the entire day
        filtered = filtered.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate <= toDate;
        });
      }
    }

    // Filter by delivery today
    if (deliveryTodayFilter) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      filtered = filtered.filter(order => {
        const expectedDeliveryDate = new Date(order.createdAt);
        expectedDeliveryDate.setDate(
          expectedDeliveryDate.getDate() + (order.variant?.etaDays || 0)
        );

        return expectedDeliveryDate >= today && expectedDeliveryDate < tomorrow;
      });
    }

    // Default sort by date desc
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  }, [orders, searchTerm, statusFilter, deliveryFilter, dateFrom, dateTo, deliveryTodayFilter]);

  useEffect(() => {
    fetchOrders();
  }, [
    userIdFilter,
    createdByAdminIdFilter,
    dateFrom,
    dateTo,
    searchTerm,
    selectedServiceIds,
    orderSourceFilter,
    fetchOrders,
  ]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.services-dropdown')) {
        setIsServicesDropdownOpen(false);
      }
    };

    if (isServicesDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isServicesDropdownOpen]);

  useEffect(() => {
    // fetch admins who created orders (distinct)
    (async () => {
      try {
        const res = await fetch('/api/admin/orders');
        if (res.ok) {
          const data = await res.json();
          const unique: Record<string, { id: string; name: string }> = {};
          (data.orders || []).forEach((o: any) => {
            if (o.createdByAdmin?.id && !unique[o.createdByAdmin.id]) {
              unique[o.createdByAdmin.id] = {
                id: o.createdByAdmin.id,
                name: o.createdByAdmin.name || 'مشرف',
              };
            }
          });
          setAdmins(Object.values(unique));
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    // fetch services for multi-select filter
    (async () => {
      try {
        const res = await fetch('/api/admin/services');
        if (res.ok) {
          const data = await res.json();
          const list = (data.services || []).map((s: any) => ({ id: s.id, name: s.name }));
          setServices(list);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    filterAndSortOrders();
  }, [orders, searchTerm, statusFilter, deliveryFilter, dateFrom, dateTo, filterAndSortOrders]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      waiting_confirmation: { text: 'انتظار التاكيد', class: 'bg-yellow-100 text-yellow-800' },
      waiting_payment: { text: 'انتظار الدفع', class: 'bg-orange-100 text-orange-800' },
      paid: { text: 'تم تدفع', class: 'bg-green-100 text-green-800' },
      settlement: { text: 'تسديد', class: 'bg-blue-100 text-blue-800' },
      fulfillment: { text: 'استيفاء', class: 'bg-purple-100 text-purple-800' },
      supply: { text: 'توريد', class: 'bg-indigo-100 text-indigo-800' },
      delivery: { text: 'تسليم', class: 'bg-teal-100 text-teal-800' },
      returned: { text: 'مرتجع', class: 'bg-red-100 text-red-800' },
      cancelled: { text: 'الغاء', class: 'bg-gray-100 text-gray-800' },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.waiting_confirmation;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.class}`}
      >
        {config.text}
      </span>
    );
  };

  const printWorkOrders = () => {
    const settlementOrders = filteredOrders.filter(order => order.status === 'settlement');
    if (settlementOrders.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('ar-EG');
    const settlementDate = new Date().toLocaleDateString('ar-EG');

    const tableRows = settlementOrders
      .map(order => {
        const deliveryDate = order.estimatedCompletionDate
          ? new Date(order.estimatedCompletionDate).toLocaleDateString('ar-EG')
          : '----';

        return `
        <tr>
          <td>${settlementDate}</td>
          <td>${order.customerName}</td>
          <td>تسديد</td>
          <td>${deliveryDate}</td>
        </tr>
      `;
      })
      .join('');

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>أوامر شغل - ${settlementOrders.length} طلب</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
            direction: rtl;
            text-align: right;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .company-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
          }
          .document-title {
            font-size: 18px;
            color: #666;
            margin-bottom: 20px;
          }
          .table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 14px;
          }
          .table th, .table td {
            border: 1px solid #333;
            padding: 12px 8px;
            text-align: center;
          }
          .table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">منصة البديل</div>
          <div class="document-title">تفصيلي أمر شغل</div>
        </div>
        
        <table class="table">
          <thead>
            <tr>
              <th>تاريخ التسديد</th>
              <th>اسم العميل</th>
              <th>حالة الطلب</th>
              <th>تاريخ التسليم</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
        
        <div class="footer">
          <p>تم إنشاء هذا التقرير في: ${currentDate}</p>
          <p>عدد الطلبات: ${settlementOrders.length} طلب</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: '💳',
      payment_pending: '⏳',
      payment_confirmed: '💰',
      partial_payment: '💵',
      reviewing: '🔍',
      processing: '⚡',
      completed: '✅',
      cancelled: '❌',
    };
    return icons[status as keyof typeof icons] || '❓';
  };

  const getDeliveryInfo = (order: Order) => {
    if (order.deliveryType === 'OFFICE') {
      return {
        type: 'استلام من المكتب',
        fee: 'مجاناً',
        color: 'text-blue-600',
      };
    } else {
      return {
        type: 'توصيل على العنوان',
        fee: `+${(order.deliveryFee / 100).toFixed(2)} جنيه`,
        color: 'text-green-600',
      };
    }
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Build print-ready grouped content (service -> variant)
  const printGroups = useMemo(() => {
    // group by service then by variant
    const serviceGroups = new Map<
      string,
      { name: string; slug: string | undefined; orders: Order[] }
    >();
    filteredOrders.forEach(o => {
      const key = o.service?.name || 'خدمات أخرى';
      if (!serviceGroups.has(key)) {
        serviceGroups.set(key, { name: key, slug: o.service?.slug, orders: [] });
      }
      serviceGroups.get(key)!.orders.push(o);
    });

    const renderVariantTable = (orders: Order[]) => {
      const variantGroups = new Map<string, Order[]>();
      orders.forEach(o => {
        const v = o.variant?.name || 'بدون نوع';
        if (!variantGroups.has(v)) variantGroups.set(v, []);
        variantGroups.get(v)!.push(o);
      });

      return Array.from(variantGroups.entries()).map(([variantName, list], idx) => {
        const isBirthCertificate = list.some(o => o.service?.name?.includes('شهادة الميلاد'));

        return (
          <div key={variantName + idx} className='mb-1'>
            <div className='text-sm font-bold bg-cyan-100 border border-cyan-300 px-3 py-1'>
              {variantName}
            </div>
            <table className='w-full border-collapse text-[11px]'>
              <thead>
                <tr>
                  {isBirthCertificate ? (
                    // Birth Certificate Table Headers
                    <>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-center w-10'>م</th>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-right'>
                        اسم العميل
                      </th>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-center'>
                        تاريخ الميلاد
                      </th>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-right'>
                        اسم الوالدة
                      </th>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-center'>
                        الرقم القومي
                      </th>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-center w-12'>
                        العدد
                      </th>
                    </>
                  ) : (
                    // Regular Table Headers
                    <>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-center w-10'>م</th>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-right'>
                        اسم العميل
                      </th>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-center'>
                        رقم البطاقة القومي
                      </th>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-center'>غرامات</th>
                      <th className='border border-gray-400 bg-cyan-50 p-1 text-center'>
                        تفاصيل الخدمة
                      </th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {list.map((o, orderIdx) => (
                  <tr key={o.id}>
                    {isBirthCertificate ? (
                      // Birth Certificate Table Data
                      <>
                        <td className='border border-gray-400 p-1 text-center font-bold'>
                          {orderIdx + 1}
                        </td>
                        <td
                          className='border border-gray-400 p-1 text-right'
                          dir='rtl'
                          style={{ textAlign: 'right' }}
                        >
                          <div
                            className='flex items-center justify-end gap-1'
                            style={{ direction: 'rtl', justifyContent: 'flex-end' }}
                          >
                            <span style={{ textAlign: 'right' }}>{o.customerName}</span>
                            {o.customerFollowUp &&
                              o.customerFollowUp !== '' &&
                              o.customerFollowUp !== 'null' && (
                                <span className='text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded'>
                                  تابع
                                </span>
                              )}
                          </div>
                        </td>
                        <td className='border border-gray-400 p-1 text-center'>
                          {o.birthDate && o.birthDate !== 'null' && o.birthDate !== ''
                            ? new Date(o.birthDate).toLocaleDateString('ar-EG')
                            : 'غير محدد'}
                        </td>
                        <td className='border border-gray-400 p-1 text-right'>
                          {o.motherName || 'غير محدد'}
                        </td>
                        <td className='border border-gray-400 p-1 text-center'>
                          {o.idNumber || 'غير محدد'}
                        </td>
                        <td className='border border-gray-400 p-1 text-center font-bold'>
                          {o.quantity || 1}
                        </td>
                      </>
                    ) : (
                      // Regular Table Data
                      <>
                        <td className='border border-gray-400 p-1 text-center font-bold'>
                          {orderIdx + 1}
                        </td>
                        <td
                          className='border border-gray-400 p-1 customer-name-cell'
                          dir='rtl'
                          style={{ textAlign: 'right', direction: 'rtl' }}
                        >
                          <div
                            style={{
                              textAlign: 'right',
                              direction: 'rtl',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '4px',
                            }}
                          >
                            <span style={{ textAlign: 'right', direction: 'rtl' }}>
                              {o.customerName}
                            </span>
                            {o.customerFollowUp &&
                              o.customerFollowUp !== '' &&
                              o.customerFollowUp !== 'null' && (
                                <span className='text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded'>
                                  تابع
                                </span>
                              )}
                          </div>
                        </td>
                        <td className='border border-gray-400 p-1 text-center'>
                          {o.idNumber || 'غير محدد'}
                        </td>
                        <td className='border border-gray-400 p-1 text-center'>
                          {(() => {
                            // Calculate fines from finesDetails if available
                            if (o.finesDetails) {
                              try {
                                const finesDetails = JSON.parse(o.finesDetails);
                                const totalFines = finesDetails.reduce((sum: number, fine: any) => {
                                  // Exclude "محضر فقد" from the total
                                  if (fine.name === 'محضر فقد') {
                                    return sum; // Don't add this fine to the total
                                  }
                                  return sum + (fine.amount || 0);
                                }, 0);
                                return totalFines > 0 ? `${(totalFines / 100).toFixed(2)}` : '0.00';
                              } catch {
                                return '0.00';
                              }
                            }
                            return '0.00';
                          })()}
                        </td>
                        <td className='border border-gray-400 p-1 text-center'>
                          {(() => {
                            // Get fines names from finesDetails if available
                            if (o.finesDetails) {
                              try {
                                const finesDetails = JSON.parse(o.finesDetails);

                                // Check if there's a "محضر فقد" fine
                                const hasLostReport = finesDetails.some(
                                  (fine: any) => fine.name === 'محضر فقد'
                                );

                                // Get other fines (excluding محضر فقد)
                                const otherFinesNames = finesDetails
                                  .filter(
                                    (fine: any) => fine.amount > 0 && fine.name !== 'محضر فقد'
                                  )
                                  .map((fine: any) => fine.name)
                                  .join(', ');

                                // Combine "فقد" with other fines
                                if (hasLostReport && otherFinesNames) {
                                  return `فقد, ${otherFinesNames}`;
                                } else if (hasLostReport) {
                                  return 'فقد';
                                } else if (otherFinesNames) {
                                  return otherFinesNames;
                                }

                                return o.variant?.name || 'غير محدد';
                              } catch (error) {
                                return o.variant?.name || 'غير محدد';
                              }
                            }

                            // Try selectedFines as fallback
                            if (o.selectedFines) {
                              try {
                                const selectedFines = JSON.parse(o.selectedFines);
                                return selectedFines.length > 0
                                  ? `غرامات (${selectedFines.length})`
                                  : o.variant?.name || 'غير محدد';
                              } catch (error) {
                                // Continue to fallback
                              }
                            }

                            return o.variant?.name || 'غير محدد';
                          })()}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
                {!isBirthCertificate && (
                  <tr>
                    <td className='border border-gray-400 p-1 font-bold' colSpan={5}>
                      العدد المطلوب: {list.length}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        );
      });
    };

    const overallTotal = filteredOrders.reduce((s, o) => s + (o.totalCents || 0), 0);
    const overallCount = filteredOrders.length;

    return (
      <div>
        {Array.from(serviceGroups.values()).map((g, i) => (
          <div key={g.name + i} className='mb-2 no-break-inside'>
            <div className='text-sm font-extrabold bg-gray-200 border border-gray-400 px-3 py-1'>
              {g.name}
            </div>
            {g.name.includes('بطاقات الرقم القومي') && (
              <div className='text-right mb-1'>
                <div className='text-xs'>رقم أمر التشغيل: ________________________________</div>
              </div>
            )}
            {renderVariantTable(g.orders)}
          </div>
        ))}

        {/* Footer summary table */}
        <div className='mt-2'>
          <table className='w-full border-collapse text-[11px]'>
            <thead>
              <tr>
                <th className='border border-gray-400 bg-cyan-50 p-1 text-right'>
                  إجمالي عدد الطلبات
                </th>
                <th className='border border-gray-400 bg-cyan-50 p-1 text-right'>
                  إجمالي القيمة (جنيه)
                </th>
                <th className='border border-gray-400 bg-cyan-50 p-1 text-right'>ملاحظات</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border border-gray-400 p-1'>{overallCount}</td>
                <td className='border border-gray-400 p-1'>{(overallTotal / 100).toFixed(2)}</td>
                <td className='border border-gray-400 p-1'>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }, [filteredOrders]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 dark:bg-gray-900' dir='rtl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Skeleton Header */}
          <div className='mb-8'>
            <div className='flex justify-between items-center mb-6'>
              <Skeleton className='h-10 w-48' />
              <Skeleton className='h-10 w-32' />
            </div>

            {/* Filters Skeleton */}
            <div className='bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                <Skeleton className='h-12 w-full rounded-xl' />
                <Skeleton className='h-12 w-full rounded-xl' />
                <Skeleton className='h-12 w-full rounded-xl' />
                <Skeleton className='h-12 w-full rounded-xl' />
              </div>
            </div>
          </div>

          {/* Skeleton Table */}
          <div className='bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden'>
            <div className='p-6'>
              <div className='space-y-4'>
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className='flex flex-col md:flex-row gap-4 p-4 border border-gray-100 rounded-xl'
                  >
                    <Skeleton className='h-12 w-12 rounded-full flex-shrink-0' />
                    <div className='flex-1 space-y-2'>
                      <Skeleton className='h-4 w-1/3' />
                      <Skeleton className='h-4 w-1/4' />
                    </div>
                    <div className='flex gap-2'>
                      <Skeleton className='h-8 w-20 rounded-full' />
                      <Skeleton className='h-8 w-20 rounded-full' />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 admin-panel print:hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-2xl'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8'>
            <div className='flex items-center justify-between mb-4 lg:mb-8'>
              {/* Logo and Title - Responsive */}
              <div className='flex items-center space-x-2 lg:space-x-4 space-x-reverse'>
                <div className='w-12 h-12 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 lg:w-8 lg:h-8 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
                    />
                  </svg>
                </div>
                <div className='hidden sm:block'>
                  <h1 className='text-2xl lg:text-4xl font-bold text-white mb-1 lg:mb-2'>
                    إدارة الطلبات -{' '}
                    {orderSourceFilter === 'office'
                      ? 'طلبات المكتب'
                      : orderSourceFilter === 'online'
                        ? 'طلبات أونلاين'
                        : 'جميع الطلبات'}
                  </h1>
                  <p className='text-blue-100 text-sm lg:text-lg hidden lg:block'>
                    {orderSourceFilter === 'office'
                      ? 'عرض وإدارة الطلبات المُنشأة من لوحة التحكم'
                      : orderSourceFilter === 'online'
                        ? 'عرض وإدارة الطلبات الواردة من الموقع'
                        : 'عرض وإدارة جميع طلبات العملاء بكفاءة عالية'}
                  </p>
                </div>
                {/* Mobile Title */}
                <div className='sm:hidden'>
                  <h1 className='text-lg font-bold text-white'>إدارة الطلبات</h1>
                </div>
              </div>

              {/* Desktop Navigation */}
              <div className='hidden lg:flex items-center space-x-4 space-x-reverse'>
                <Link
                  href='/admin/create'
                  className='px-6 lg:px-8 py-3 lg:py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 border border-white/30 hover:border-white/50 flex items-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  <span className='font-semibold'>إنشاء طلب جديد</span>
                </Link>
                <Link
                  href='/admin'
                  className='px-4 lg:px-6 py-3 lg:py-4 bg-white/10 backdrop-blur-sm text-white rounded-xl hover:bg-white/20 transition-all duration-300 border border-white/20 hover:border-white/40 flex items-center space-x-2 space-x-reverse'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M10 19l-7-7m0 0l7-7m-7 7h18'
                    />
                  </svg>
                  <span>العودة للإدارة</span>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <div className='lg:hidden'>
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className='p-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    {isMobileMenuOpen ? (
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    ) : (
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M4 6h16M4 12h16M4 18h16'
                      />
                    )}
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className='lg:hidden mb-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20'>
                <div className='space-y-3'>
                  <Link
                    href='/admin/create'
                    className='w-full px-4 py-3 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-all duration-300 border border-white/30 flex items-center space-x-2 space-x-reverse'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                      />
                    </svg>
                    <span className='font-semibold'>إنشاء طلب جديد</span>
                  </Link>
                  <Link
                    href='/admin'
                    className='w-full px-4 py-3 bg-white/10 backdrop-blur-sm text-white rounded-lg hover:bg-white/20 transition-all duration-300 border border-white/20 flex items-center space-x-2 space-x-reverse'
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M10 19l-7-7m0 0l7-7m-7 7h18'
                      />
                    </svg>
                    <span>العودة للإدارة</span>
                  </Link>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-blue-100 text-sm font-medium'>إجمالي الطلبات</p>
                    <p className='text-3xl font-bold text-white mt-2'>{filteredOrders.length}</p>
                  </div>
                  <div className='w-12 h-12 bg-blue-500/30 rounded-xl flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-blue-100 text-sm font-medium'>الطلبات النشطة</p>
                    <p className='text-3xl font-bold text-white mt-2'>
                      {
                        filteredOrders.filter(
                          o => o.status !== 'completed' && o.status !== 'cancelled'
                        ).length
                      }
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-yellow-500/30 rounded-xl flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-blue-100 text-sm font-medium'>الطلبات المكتملة</p>
                    <p className='text-3xl font-bold text-white mt-2'>
                      {filteredOrders.filter(o => o.status === 'completed').length}
                    </p>
                  </div>
                  <div className='w-12 h-12 bg-green-500/30 rounded-xl flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className='bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-blue-100 text-sm font-medium'>إجمالي القيمة</p>
                    <p className='text-3xl font-bold text-white mt-2'>
                      {(filteredOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100).toFixed(0)}
                    </p>
                    <p className='text-blue-100 text-xs'>جنيه</p>
                  </div>
                  <div className='w-12 h-12 bg-purple-500/30 rounded-xl flex items-center justify-center'>
                    <svg
                      className='w-6 h-6 text-white'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 mb-8'>
            <div className='flex items-center gap-4 mb-6'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
                  />
                </svg>
              </div>
              <div>
                <h2 className='text-2xl font-bold text-gray-900'>البحث والتصفية</h2>
                <p className='text-gray-600'>ابحث وصف الطلبات حسب المعايير المطلوبة</p>
              </div>
            </div>
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
              {/* Search */}
              <div className='sm:col-span-2 lg:col-span-2'>
                <label className='block text-sm font-semibold text-gray-800 mb-3'>
                  البحث الذكي
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='ابحث بالاسم، الهاتف، رقم الاستمارة، أو البريد الإلكتروني...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/50 backdrop-blur-sm placeholder-gray-500 transition-all duration-300 hover:border-gray-300'
                  />
                  <div className='absolute left-4 top-1/2 transform -translate-y-1/2'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Date From */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-3'>من تاريخ</label>
                <div className='relative'>
                  <input
                    type='text'
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    placeholder='dd/mm/yyyy'
                    className='w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/50 backdrop-blur-sm placeholder-gray-500 transition-all duration-300 hover:border-gray-300'
                    onFocus={e => {
                      if (e.target.value === '') {
                        const today = new Date();
                        const dd = String(today.getDate()).padStart(2, '0');
                        const mm = String(today.getMonth() + 1).padStart(2, '0');
                        const yyyy = today.getFullYear();
                        setDateFrom(`${dd}/${mm}/${yyyy}`);
                      }
                    }}
                  />
                  <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Date To */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-3'>إلى تاريخ</label>
                <div className='relative'>
                  <input
                    type='text'
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    placeholder='dd/mm/yyyy'
                    className='w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/50 backdrop-blur-sm placeholder-gray-500 transition-all duration-300 hover:border-gray-300'
                    onFocus={e => {
                      if (e.target.value === '') {
                        const today = new Date();
                        const dd = String(today.getDate()).padStart(2, '0');
                        const mm = String(today.getMonth() + 1).padStart(2, '0');
                        const yyyy = today.getFullYear();
                        setDateTo(`${dd}/${mm}/${yyyy}`);
                      }
                    }}
                  />
                  <div className='absolute left-3 top-1/2 transform -translate-y-1/2'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-3'>حالة الطلب</label>
                <div className='relative'>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className='w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 appearance-none cursor-pointer'
                  >
                    <option value='all'>جميع الحالات</option>
                    <option value='pending'>في انتظار الدفع</option>
                    <option value='payment_pending'>في انتظار تأكيد الدفع</option>
                    <option value='payment_confirmed'>مدفوع بالكامل</option>
                    <option value='partial_payment'>دفع جزئي</option>
                    <option value='reviewing'>قيد المراجعة</option>
                    <option value='processing'>قيد التنفيذ</option>
                    <option value='completed'>مكتمل</option>
                    <option value='cancelled'>ملغي</option>
                  </select>
                  <div className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Delivery Filter */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-3'>
                  نوع التوصيل
                </label>
                <div className='relative'>
                  <select
                    value={deliveryFilter}
                    onChange={e => setDeliveryFilter(e.target.value)}
                    className='w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 appearance-none cursor-pointer'
                  >
                    <option value='all'>جميع أنواع التوصيل</option>
                    <option value='OFFICE'>استلام من المكتب</option>
                    <option value='ADDRESS'>توصيل على العنوان</option>
                  </select>
                  <div className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Order Source Filter */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-3'>مصدر الطلب</label>
                <div className='relative'>
                  <select
                    value={orderSourceFilter}
                    onChange={e => setOrderSourceFilter(e.target.value)}
                    className='w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 appearance-none cursor-pointer'
                  >
                    <option value='office'>طلبات المكتب</option>
                    <option value='online'>طلبات أونلاين</option>
                    <option value='all'>جميع الطلبات</option>
                  </select>
                  <div className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Services Filter */}
              <div className='relative services-dropdown'>
                <div className='flex items-center justify-between mb-3'>
                  <label className='block text-sm font-semibold text-gray-800'>الخدمات</label>
                  {selectedServiceIds.length > 0 && (
                    <button
                      type='button'
                      onClick={() => setSelectedServiceIds([])}
                      className='text-xs text-red-600 hover:text-red-800 font-medium transition-colors duration-200'
                    >
                      مسح الكل
                    </button>
                  )}
                </div>
                <div className='relative'>
                  <button
                    type='button'
                    onClick={() => setIsServicesDropdownOpen(!isServicesDropdownOpen)}
                    className='w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/50 backdrop-blur-sm text-right flex items-center justify-between transition-all duration-300 hover:border-gray-300'
                  >
                    <span className='font-medium'>
                      {selectedServiceIds.length === 0
                        ? 'جميع الخدمات'
                        : selectedServiceIds.length === 1
                          ? services.find(s => s.id === selectedServiceIds[0])?.name ||
                            'خدمة مختارة'
                          : `${selectedServiceIds.length} خدمات مختارة`}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform duration-300 ${isServicesDropdownOpen ? 'rotate-180' : ''}`}
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </button>

                  {isServicesDropdownOpen && (
                    <div
                      className='absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl'
                      style={{ maxHeight: '180px', overflowY: 'auto' }}
                    >
                      {services.length === 0 ? (
                        <div className='p-4 text-gray-500 text-sm text-center'>
                          جاري تحميل الخدمات...
                        </div>
                      ) : (
                        <div className='py-2'>
                          {/* Select All Option */}
                          <label className='flex items-center space-x-3 cursor-pointer hover:bg-blue-50 px-4 py-3 transition-colors duration-200 border-b border-gray-100'>
                            <input
                              type='checkbox'
                              checked={
                                selectedServiceIds.length === services.length && services.length > 0
                              }
                              onChange={() => {
                                if (selectedServiceIds.length === services.length) {
                                  setSelectedServiceIds([]);
                                } else {
                                  setSelectedServiceIds(services.map(s => s.id));
                                }
                              }}
                              className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                            />
                            <span className='text-sm text-gray-700 flex-1 text-right font-bold'>
                              اختيار الكل
                            </span>
                          </label>

                          {services.map(service => (
                            <label
                              key={service.id}
                              className='flex items-center space-x-3 cursor-pointer hover:bg-blue-50 px-4 py-3 transition-colors duration-200'
                            >
                              <input
                                type='checkbox'
                                checked={selectedServiceIds.includes(service.id)}
                                onChange={() => toggleService(service.id)}
                                className='w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                              />
                              <span className='text-sm text-gray-700 flex-1 text-right font-medium'>
                                {service.name}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Admin Creator Filter */}
              <div>
                <label className='block text-sm font-semibold text-gray-800 mb-3'>
                  المشرف المنشئ
                </label>
                <div className='relative'>
                  <select
                    value={createdByAdminIdFilter}
                    onChange={e =>
                      router.push(
                        `/admin/orders${e.target.value ? `?createdByAdminId=${e.target.value}` : ''}`
                      )
                    }
                    className='w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 appearance-none cursor-pointer'
                  >
                    <option value=''>كل المشرفين</option>
                    {admins.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name || 'مشرف'}
                      </option>
                    ))}
                  </select>
                  <div className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-gray-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Clear Filters */}
              <div className='flex items-end'>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setDeliveryFilter('all');
                    setSelectedServiceIds([]);
                    const today = new Date();
                    const dd = String(today.getDate()).padStart(2, '0');
                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                    const yyyy = today.getFullYear();
                    const todayStr = `${dd}/${mm}/${yyyy}`;
                    setDateFrom(todayStr);
                    setDateTo(todayStr);
                    // Clear delivery today filter
                    router.push('/admin/orders');
                  }}
                  className='w-full px-6 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 space-x-reverse font-semibold'
                >
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                    />
                  </svg>
                  <span>مسح الفلاتر</span>
                </button>
              </div>
            </div>
          </div>

          {/* Orders List */}
          <div className='space-y-6'>
            <div className='flex items-center justify-between mb-6'>
              <div className='flex items-center gap-4'>
                <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                </div>
                <div>
                  <h2 className='text-2xl font-bold text-gray-900'>قائمة الطلبات</h2>
                  <p className='text-gray-600'>إدارة ومتابعة جميع طلبات العملاء</p>
                </div>
                {deliveryTodayFilter && (
                  <span className='inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border border-red-200'>
                    <svg
                      className='w-4 h-4 mr-2'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                    تسليم اليوم
                  </span>
                )}
              </div>
              <div className='flex items-center space-x-3 space-x-reverse'>
                <span className='text-sm text-gray-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 font-semibold'>
                  {filteredOrders.length} طلب
                </span>
                {filteredOrders.length > 0 && (
                  <button
                    onClick={() => window.print()}
                    className='px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2 space-x-reverse'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                      />
                    </svg>
                    <span>طباعة النتائج</span>
                  </button>
                )}
                {filteredOrders.some(order => order.status === 'settlement') && (
                  <button
                    onClick={printWorkOrders}
                    className='px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2 space-x-reverse'
                  >
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                    <span>طباعة أمر شغل</span>
                  </button>
                )}
              </div>
            </div>

            {!hasFilter ? (
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-16 text-center'>
                <div className='w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <svg
                    className='w-12 h-12 text-blue-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                    />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-3'>ابدأ بالتصفية أو البحث</h3>
                <p className='text-gray-600 text-lg'>
                  حدد نطاق التاريخ أو اكتب بحثاً أو اختر مشرفاً لعرض الطلبات
                </p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-16 text-center'>
                <div className='w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6'>
                  <svg
                    className='w-12 h-12 text-gray-600'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
                    />
                  </svg>
                </div>
                <h3 className='text-2xl font-bold text-gray-900 mb-3'>لا توجد طلبات</h3>
                <p className='text-gray-600 text-lg'>
                  {searchTerm || statusFilter !== 'all' || deliveryFilter !== 'all'
                    ? 'لا توجد طلبات تطابق معايير البحث المحددة'
                    : 'لم يتم إنشاء أي طلبات بعد'}
                </p>
              </div>
            ) : (
              <>
                {/* Bulk Actions Bar */}
                {selectedOrders.length > 0 && (
                  <div className='bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6 mb-6 shadow-lg'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-4 space-x-reverse'>
                        <div className='flex items-center space-x-3 space-x-reverse'>
                          <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center'>
                            <svg
                              className='w-6 h-6 text-white'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                              />
                            </svg>
                          </div>
                          <div>
                            <span className='text-blue-800 font-bold text-lg'>
                              {selectedOrders.length} طلب مختار
                            </span>
                            <p className='text-blue-600 text-sm'>
                              اختر الحالة الجديدة لتحديث الطلبات المختارة
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className='flex items-center space-x-4 space-x-reverse'>
                        <div className='relative'>
                          <select
                            value={bulkStatus}
                            onChange={e => setBulkStatus(e.target.value)}
                            className='px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white text-gray-900 min-w-[180px] appearance-none cursor-pointer hover:border-blue-400 transition-all duration-300'
                          >
                            <option value=''>اختر الحالة الجديدة</option>
                            <option value='pending'>في انتظار الدفع</option>
                            <option value='payment_pending'>في انتظار تأكيد الدفع</option>
                            <option value='payment_confirmed'>مدفوع بالكامل</option>
                            <option value='partial_payment'>دفع جزئي</option>
                            <option value='reviewing'>قيد المراجعة</option>
                            <option value='processing'>قيد التنفيذ</option>
                            <option value='completed'>مكتمل</option>
                            <option value='cancelled'>ملغي</option>
                          </select>
                          <div className='absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none'>
                            <svg
                              className='w-4 h-4 text-gray-400'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 9l-7 7-7-7'
                              />
                            </svg>
                          </div>
                        </div>

                        <button
                          onClick={updateBulkStatus}
                          disabled={!bulkStatus || updatingBulk}
                          className='px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 text-sm font-semibold flex items-center space-x-2 space-x-reverse shadow-lg hover:shadow-xl'
                        >
                          {updatingBulk ? (
                            <>
                              <svg className='animate-spin w-4 h-4' fill='none' viewBox='0 0 24 24'>
                                <circle
                                  className='opacity-25'
                                  cx='12'
                                  cy='12'
                                  r='10'
                                  stroke='currentColor'
                                  strokeWidth='4'
                                ></circle>
                                <path
                                  className='opacity-75'
                                  fill='currentColor'
                                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                ></path>
                              </svg>
                              <span>جاري التحديث...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className='w-4 h-4'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
                                />
                              </svg>
                              <span>تحديث المختارة</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => setSelectedOrders([])}
                          className='px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-300 text-sm font-medium'
                        >
                          إلغاء الاختيار
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Select All Checkbox */}
                <div className='mb-6 flex items-center justify-between bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200'>
                  <div className='flex items-center space-x-3 space-x-reverse'>
                    <label className='flex items-center space-x-3 space-x-reverse cursor-pointer'>
                      <input
                        type='checkbox'
                        checked={
                          selectedOrders.length === currentOrders.length && currentOrders.length > 0
                        }
                        onChange={selectAllOrders}
                        className='w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                      />
                      <span className='text-sm font-semibold text-gray-800'>
                        {selectedOrders.length === currentOrders.length && currentOrders.length > 0
                          ? 'إلغاء اختيار الكل'
                          : 'اختيار الكل'}
                      </span>
                    </label>
                  </div>

                  {selectedOrders.length > 0 && (
                    <div className='text-sm text-blue-600 font-semibold bg-blue-50 px-3 py-1 rounded-lg'>
                      {selectedOrders.length} من {currentOrders.length} طلب مختار
                    </div>
                  )}
                </div>

                {currentOrders.map(order => {
                  const deliveryInfo = getDeliveryInfo(order);
                  return (
                    <div
                      key={order.id}
                      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 lg:p-8 hover:shadow-2xl transition-all duration-300 border-2 ${
                        selectedOrders.includes(order.id)
                          ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 shadow-blue-200'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                      }`}
                    >
                      {/* Order Header - Basic Info - Responsive */}
                      <div className='flex flex-col sm:flex-row items-start justify-between mb-4 lg:mb-6 gap-4'>
                        <div className='flex items-center space-x-3 lg:space-x-4 space-x-reverse w-full sm:w-auto'>
                          {/* Selection Checkbox */}
                          <label className='flex items-center cursor-pointer'>
                            <input
                              type='checkbox'
                              checked={selectedOrders.includes(order.id)}
                              onChange={() => toggleOrderSelection(order.id)}
                              className='w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2'
                            />
                          </label>

                          <div className='w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center'>
                            <div className='text-xl lg:text-2xl'>{getStatusIcon(order.status)}</div>
                          </div>
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-lg lg:text-xl font-bold text-gray-900 mb-1 lg:mb-2 truncate'>
                              {order.service?.name || 'خدمة غير محددة'}
                            </h3>
                            <div className='flex flex-wrap items-center gap-2'>
                              <span className='text-xs lg:text-sm text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 px-2 lg:px-3 py-1 rounded-full font-medium'>
                                {order.variant?.name || 'نوع غير محدد'}
                              </span>
                              <span className='text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full'>
                                #{order.id}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='text-3xl font-bold text-green-600 mb-2'>
                            {(order.totalCents / 100).toFixed(2)} جنيه
                          </div>
                          <div className='text-sm text-gray-600 bg-gray-50 px-3 py-1 rounded-lg font-medium'>
                            إجمالي الطلب
                          </div>
                        </div>
                      </div>

                      {/* Basic Order Details - Responsive Grid */}
                      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4 lg:mb-6'>
                        <div className='bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200'>
                          <div className='flex items-center space-x-2 space-x-reverse mb-2'>
                            <svg
                              className='w-4 h-4 text-blue-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                              />
                            </svg>
                            <span className='text-blue-800 text-xs font-semibold'>اسم العميل</span>
                          </div>
                          <p className='font-bold text-gray-900 text-sm'>{order.customerName}</p>
                        </div>
                        <div className='bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200'>
                          <div className='flex items-center space-x-2 space-x-reverse mb-2'>
                            <svg
                              className='w-4 h-4 text-green-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                              />
                            </svg>
                            <span className='text-green-800 text-xs font-semibold'>رقم الهاتف</span>
                          </div>
                          <p className='font-bold text-gray-900 text-sm'>
                            {order.customerPhone && order.customerPhone !== 'unknown'
                              ? order.customerPhone
                              : order.user?.phone && order.user.phone !== 'unknown'
                                ? order.user.phone
                                : 'غير محدد'}
                          </p>
                        </div>
                        <div className='bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200'>
                          <div className='flex items-center space-x-2 space-x-reverse mb-2'>
                            <svg
                              className='w-4 h-4 text-purple-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
                              />
                            </svg>
                            <span className='text-purple-800 text-xs font-semibold'>التوصيل</span>
                          </div>
                          <p className={`font-bold text-sm ${deliveryInfo.color}`}>
                            {deliveryInfo.type}
                          </p>
                        </div>
                        <div className='bg-gradient-to-r from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200'>
                          <div className='flex items-center space-x-2 space-x-reverse mb-2'>
                            <svg
                              className='w-4 h-4 text-orange-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                              />
                            </svg>
                            <span className='text-orange-800 text-xs font-semibold'>
                              تاريخ الطلب
                            </span>
                          </div>
                          <p className='font-bold text-gray-900 text-sm'>
                            {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                          </p>
                        </div>
                        {order.createdByAdmin?.name && (
                          <div className='bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200 md:col-span-2'>
                            <div className='flex items-center space-x-2 space-x-reverse mb-2'>
                              <svg
                                className='w-4 h-4 text-indigo-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
                                />
                              </svg>
                              <span className='text-indigo-800 text-xs font-semibold'>
                                أنشأه المشرف
                              </span>
                            </div>
                            <p className='font-bold text-indigo-900 text-sm'>
                              {order.createdByAdmin.name}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Order Footer */}
                      <div className='flex items-center justify-between pt-6 border-t-2 border-gray-100'>
                        <div className='flex items-center space-x-4 space-x-reverse'>
                          <div className='bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-2 rounded-xl border border-blue-200'>
                            <div className='flex items-center space-x-2 space-x-reverse'>
                              <svg
                                className='w-4 h-4 text-blue-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                                />
                              </svg>
                              <span className='text-sm text-blue-800 font-semibold'>
                                المدة: {order.variant?.etaDays || 'غير محدد'} يوم
                              </span>
                            </div>
                            {order.status === 'settlement' && order.estimatedCompletionDate && (
                              <div className='mt-2 flex items-center space-x-2 space-x-reverse'>
                                <svg
                                  className='w-4 h-4 text-green-600'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                                  />
                                </svg>
                                <span className='text-sm text-green-800 font-semibold'>
                                  الوقت المتوقع:{' '}
                                  {new Date(order.estimatedCompletionDate).toLocaleDateString(
                                    'ar-EG'
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                          {getStatusBadge(order.status)}
                        </div>

                        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto'>
                          {/* Status Select Menu - Responsive */}
                          <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto'>
                            <label className='text-sm font-semibold text-gray-700 whitespace-nowrap'>
                              الحالة:
                            </label>
                            <div className='relative w-full sm:w-auto'>
                              <select
                                value={order.status}
                                onChange={e => updateOrderStatus(order.id, e.target.value)}
                                disabled={updatingStatus === order.id}
                                className='w-full sm:w-auto px-3 lg:px-4 py-2 lg:py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white/50 backdrop-blur-sm text-gray-900 min-w-[140px] sm:min-w-[180px] appearance-none cursor-pointer hover:border-gray-300 transition-all duration-300'
                              >
                                <option value='waiting_confirmation'>انتظار التاكيد</option>
                                <option value='waiting_payment'>انتظار الدفع</option>
                                <option value='paid'>تم تدفع</option>
                                <option value='settlement'>تسديد</option>
                                <option value='fulfillment'>استيفاء</option>
                                <option value='supply'>توريد</option>
                                <option value='delivery'>تسليم</option>
                                <option value='returned'>مرتجع</option>
                                <option value='cancelled'>الغاء</option>
                              </select>
                              <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
                                <svg
                                  className='w-4 h-4 text-gray-400'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={2}
                                    d='M19 9l-7 7-7-7'
                                  />
                                </svg>
                              </div>
                              {updatingStatus === order.id && (
                                <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                                  <svg
                                    className='animate-spin w-4 h-4 text-blue-600'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                  >
                                    <circle
                                      className='opacity-25'
                                      cx='12'
                                      cy='12'
                                      r='10'
                                      stroke='currentColor'
                                      strokeWidth='4'
                                    ></circle>
                                    <path
                                      className='opacity-75'
                                      fill='currentColor'
                                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                    ></path>
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* WhatsApp Button */}
                          {(order.customerPhone && order.customerPhone !== 'unknown') ||
                          (order.user?.phone && order.user.phone !== 'unknown') ? (
                            <button
                              onClick={() => {
                                setWhatsappOrder(order);
                                setShowWhatsAppModal(true);
                              }}
                              className='w-full sm:w-auto px-4 lg:px-5 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 space-x-reverse'
                            >
                              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                              </svg>
                              <span className='hidden sm:inline'>واتساب</span>
                            </button>
                          ) : null}

                          <Link
                            href={`/admin/orders/${order.id}`}
                            className='w-full sm:w-auto px-4 lg:px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 space-x-reverse'
                          >
                            <svg
                              className='w-4 h-4'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                              />
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                              />
                            </svg>
                            <span className='hidden sm:inline'>عرض التفاصيل</span>
                            <span className='sm:hidden'>التفاصيل</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='flex items-center justify-center mt-12'>
                    <nav className='flex items-center space-x-3 space-x-reverse bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-gray-200'>
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className='px-4 py-3 text-gray-700 bg-white/50 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center space-x-2 space-x-reverse'
                      >
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M15 19l-7-7 7-7'
                          />
                        </svg>
                        <span>السابق</span>
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                            currentPage === number
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                              : 'text-gray-700 bg-white/50 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                          }`}
                        >
                          {number}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className='px-4 py-3 text-gray-700 bg-white/50 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold flex items-center space-x-2 space-x-reverse'
                      >
                        <span>التالي</span>
                        <svg
                          className='w-4 h-4'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Summary Stats - Excluding Completed Orders */}
          {filteredOrders.length > 0 && (
            <div className='mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6'>
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 text-center hover:shadow-2xl transition-all duration-300'>
                <div className='w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div className='text-3xl font-bold text-blue-600 mb-2'>
                  {
                    filteredOrders.filter(o => o.status !== 'completed' && o.status !== 'cancelled')
                      .length
                  }
                </div>
                <div className='text-sm text-gray-700 font-semibold'>الطلبات النشطة</div>
              </div>
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 text-center hover:shadow-2xl transition-all duration-300'>
                <div className='w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div className='text-3xl font-bold text-yellow-600 mb-2'>
                  {
                    filteredOrders.filter(o => o.status === 'pending' || o.status === 'reviewing')
                      .length
                  }
                </div>
                <div className='text-sm text-gray-700 font-semibold'>قيد المعالجة</div>
              </div>
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 text-center hover:shadow-2xl transition-all duration-300'>
                <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                    />
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                    />
                  </svg>
                </div>
                <div className='text-3xl font-bold text-purple-600 mb-2'>
                  {
                    filteredOrders.filter(
                      o => o.deliveryType === 'ADDRESS' && o.status !== 'completed'
                    ).length
                  }
                </div>
                <div className='text-sm text-gray-700 font-semibold'>توصيل على العنوان</div>
              </div>
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 text-center hover:shadow-2xl transition-all duration-300'>
                <div className='w-12 h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                    />
                  </svg>
                </div>
                <div className='text-3xl font-bold text-indigo-600 mb-2'>
                  {
                    filteredOrders.filter(
                      o => o.deliveryType === 'OFFICE' && o.status !== 'completed'
                    ).length
                  }
                </div>
                <div className='text-sm text-gray-700 font-semibold'>استلام من المكتب</div>
              </div>
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 text-center hover:shadow-2xl transition-all duration-300'>
                <div className='w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
                <div className='text-3xl font-bold text-green-600 mb-2'>
                  {filteredOrders.filter(o => o.status === 'completed').length}
                </div>
                <div className='text-sm text-gray-700 font-semibold'>مكتمل</div>
              </div>
              <div className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 text-center hover:shadow-2xl transition-all duration-300'>
                <div className='w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mx-auto mb-4'>
                  <svg
                    className='w-6 h-6 text-white'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1'
                    />
                  </svg>
                </div>
                <div className='text-3xl font-bold text-orange-600 mb-2'>
                  {(
                    filteredOrders
                      .filter(o => o.status !== 'completed' && o.status !== 'cancelled')
                      .reduce((sum, o) => sum + o.totalCents, 0) / 100
                  ).toFixed(0)}
                </div>
                <div className='text-sm text-gray-700 font-semibold'>
                  إجمالي القيمة النشطة (جنيه)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Print Layout (only visible when printing) - styled similar to provided photo */}
      <div className='hidden print:block text-black' dir='rtl' style={{ padding: '8px' }}>
        <style>{`
        @media print {
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { margin: 0 !important; padding: 0 !important; }
          .no-break-inside { break-inside: avoid; page-break-inside: avoid; }
          thead { display: table-header-group !important; }
          tfoot { display: table-footer-group !important; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .customer-name-cell { text-align: right !important; direction: rtl !important; }
          .customer-name-cell * { text-align: right !important; direction: rtl !important; }
          .customer-name-cell div { justify-content: flex-end !important; }
        }
      `}</style>
        {/* Header */}
        <div className='flex items-start justify-between text-xs' style={{ marginBottom: '4px' }}>
          <div style={{ lineHeight: '1.2' }}>
            <div>{new Date().toLocaleDateString('ar-EG', { weekday: 'long' })}</div>
            <div>
              {new Date().toLocaleDateString('ar-EG')} - {new Date().toLocaleTimeString('ar-EG')}
            </div>
            <div>صفحة: 1</div>
          </div>
          <div className='flex items-center' style={{ gap: '8px' }}>
            <Image
              src='/images/egyptian-foreign-affairs.png'
              alt='شعار'
              width={60}
              height={60}
              className='w-auto'
              style={{ height: '24px' }}
            />
            <Image
              src='/logo.jpg'
              alt='الشعار'
              width={60}
              height={60}
              className='w-auto'
              style={{ height: '24px' }}
            />
          </div>
        </div>

        {/* Title and range */}
        <div className='text-center' style={{ marginBottom: '4px' }}>
          <div className='text-sm font-extrabold'>كشف الطلبات</div>
          <div className='text-xs'>
            عن الفترة: {dateFrom || '—'} إلى {dateTo || '—'}
          </div>
        </div>

        {/* Operation Order Number */}
        <div className='text-right' style={{ marginBottom: '4px' }}>
          <div className='text-xs'>رقم أمر التشغيل: ________________________________</div>
        </div>

        {printGroups}
      </div>

      {/* WhatsApp Modal */}
      {showWhatsAppModal && whatsappOrder && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto'>
            {/* Header */}
            <div className='bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-t-2xl'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center'>
                    <svg className='w-6 h-6 text-white' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
                    </svg>
                  </div>
                  <div>
                    <h3 className='text-white font-bold text-xl'>إرسال رسالة واتساب</h3>
                    <p className='text-white/80 text-sm'>{whatsappOrder.customerName}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowWhatsAppModal(false);
                    setWhatsappMessage('');
                    setSelectedTemplate('');
                    setWhatsappOrder(null);
                  }}
                  className='text-white/80 hover:text-white transition-colors'
                >
                  <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className='p-6 space-y-6'>
              {/* Templates */}
              <div>
                <label className='block text-gray-700 font-semibold mb-3'>رسائل جاهزة:</label>
                <div className='grid grid-cols-2 gap-2'>
                  {getWhatsappTemplates(whatsappOrder).map(template => (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setWhatsappMessage(template.message);
                      }}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedTemplate === template.id
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {template.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div>
                <label className='block text-gray-700 font-semibold mb-2'>نص الرسالة:</label>
                <textarea
                  value={whatsappMessage}
                  onChange={e => {
                    setWhatsappMessage(e.target.value);
                    setSelectedTemplate('');
                  }}
                  placeholder='اكتب رسالتك هنا أو اختر قالب جاهز...'
                  rows={6}
                  className='w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none text-gray-900'
                  dir='rtl'
                />
              </div>

              {/* Phone Info */}
              <div className='bg-gray-50 p-4 rounded-xl'>
                <div className='flex items-center gap-2 text-gray-600'>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                    />
                  </svg>
                  <span>سيتم الإرسال إلى: </span>
                  <span className='font-bold text-gray-900'>
                    {whatsappOrder.customerPhone && whatsappOrder.customerPhone !== 'unknown'
                      ? whatsappOrder.customerPhone
                      : whatsappOrder.user?.phone || 'غير محدد'}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className='p-6 pt-0 flex gap-3'>
              <button
                onClick={() => {
                  setShowWhatsAppModal(false);
                  setWhatsappMessage('');
                  setSelectedTemplate('');
                  setWhatsappOrder(null);
                }}
                className='flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium'
              >
                إلغاء
              </button>
              <button
                onClick={sendWhatsApp}
                disabled={sendingWhatsApp || !whatsappMessage.trim()}
                className='flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
              >
                {sendingWhatsApp ? (
                  <>
                    <svg className='animate-spin w-5 h-5' fill='none' viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    جاري الإرسال...
                  </>
                ) : (
                  <>
                    <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                      <path d='M2.01 21L23 12 2.01 3 2 10l15 2-15 2z' />
                    </svg>
                    إرسال الرسالة
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}
