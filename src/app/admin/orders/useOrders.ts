'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order, OrderFilters, Service, Admin, getStatusText } from './types';

interface UseOrdersReturn {
  // Data
  orders: Order[];
  filteredOrders: Order[];
  currentOrders: Order[];
  services: Service[];
  admins: Admin[];

  // Loading states
  loading: boolean;
  updatingStatus: string | null;
  updatingBulk: boolean;

  // Filters
  filters: OrderFilters;
  setSearchTerm: (term: string) => void;
  setStatusFilter: (status: string) => void;
  setDeliveryFilter: (delivery: string) => void;
  setDateFrom: (date: string) => void;
  setDateTo: (date: string) => void;
  setSelectedServiceIds: (ids: string[]) => void;
  setOrderSourceFilter: (source: string) => void;
  toggleService: (serviceId: string) => void;

  // Pagination
  currentPage: number;
  totalPages: number;
  ordersPerPage: number;
  paginate: (page: number) => void;

  // Selection
  selectedOrders: string[];
  toggleOrderSelection: (orderId: string) => void;
  selectAllOrders: () => void;

  // Bulk actions
  bulkStatus: string;
  setBulkStatus: (status: string) => void;
  updateBulkStatus: () => Promise<void>;

  // Order actions
  updateOrderStatus: (orderId: string, newStatus: string) => Promise<void>;

  // Helpers
  hasFilter: boolean;
  refetch: () => Promise<void>;
}

export function useOrders(
  showSuccess: (title: string, message: string) => void,
  showError: (title: string, message: string) => void
): UseOrdersReturn {
  const searchParams = useSearchParams();
  const userIdFilter = searchParams.get('userId') || '';
  const createdByAdminIdFilter = searchParams.get('createdByAdminId') || '';
  const deliveryTodayFilter = searchParams.get('delivery') === 'today';

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingBulk, setUpdatingBulk] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [orderSourceFilter, setOrderSourceFilter] = useState('office');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 10;

  // Selection
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState('');

  // Compute hasFilter
  const hasFilter = Boolean(
    (dateFrom && dateTo) ||
      searchTerm ||
      userIdFilter ||
      createdByAdminIdFilter ||
      selectedServiceIds.length > 0 ||
      deliveryTodayFilter ||
      orderSourceFilter // Should always fetch if we have a source defined (even "all")
  );

  // Parse date helper
  const parseDate = (dateString: string): Date | null => {
    if (!dateString) return null;
    const dateRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const match = dateString.match(dateRegex);
    if (match && match[1] && match[2] && match[3]) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);
      const date = new Date(year, month, day);
      if (date.getDate() === day && date.getMonth() === month && date.getFullYear() === year) {
        return date;
      }
    }
    return null;
  };

  // Fetch orders
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
      if (orderSourceFilter === 'office') {
        params.set('createdByAdmin', 'true');
      } else if (orderSourceFilter === 'online') {
        params.set('createdByAdmin', 'false');
      }

      const response = await fetch(
        `/api/admin/orders${params.toString() ? `?${params.toString()}` : ''}`,
        {
          cache: 'no-store',
        }
      );
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  // Filter and sort orders
  const filterAndSortOrders = useCallback(() => {
    let filtered = orders;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        order =>
          (order.service?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.customerPhone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (order.user?.phone || '').toLowerCase().includes(searchTerm.toLowerCase())
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
        filtered = filtered.filter(order => new Date(order.createdAt) >= fromDate);
      }
    }
    if (dateTo) {
      const toDate = parseDate(dateTo);
      if (toDate) {
        toDate.setHours(23, 59, 59, 999);
        filtered = filtered.filter(order => new Date(order.createdAt) <= toDate);
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

    // Sort by date desc
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [
    orders,
    searchTerm,
    statusFilter,
    deliveryFilter,
    dateFrom,
    dateTo,
    deliveryTodayFilter,
    orderSourceFilter,
  ]);

  // Fetch services
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/services');
        if (res.ok) {
          const data = await res.json();
          setServices((data.services || []).map((s: any) => ({ id: s.id, name: s.name })));
        }
      } catch {}
    })();
  }, []);

  // Fetch admins (limit to 1 to just find recent ones or use a dedicated endpoint)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/orders?limit=10');
        if (res.ok) {
          const data = await res.json();
          const unique: Record<string, Admin> = {};
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

  // Fetch orders on filter change
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Filter orders when data changes
  useEffect(() => {
    filterAndSortOrders();
  }, [filterAndSortOrders]);

  // Service toggle
  const toggleService = (serviceId: string) => {
    setSelectedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(id => id !== serviceId) : [...prev, serviceId]
    );
  };

  // Order selection
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const selectAllOrders = () => {
    if (selectedOrders.length === currentOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(currentOrders.map(order => order.id));
    }
  };

  // Update single order status
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
        setOrders(prevOrders =>
          prevOrders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
        );
        const statusText = getStatusText(newStatus);
        showSuccess('تم تحديث حالة الطلب بنجاح! 🎉', `تم تغيير حالة الطلب إلى "${statusText}"`);
      } else {
        const errorData = await response.json();
        showError('فشل في تحديث حالة الطلب', errorData.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Update bulk status
  const updateBulkStatus = async () => {
    if (!bulkStatus || selectedOrders.length === 0) return;
    setUpdatingBulk(true);

    try {
      const response = await fetch('/api/admin/orders/bulk-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedOrders, status: bulkStatus }),
      });

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            selectedOrders.includes(order.id) ? { ...order, status: bulkStatus } : order
          )
        );
        const statusText = getStatusText(bulkStatus);
        showSuccess(
          'تم تحديث الطلبات بنجاح! 🚀',
          `تم تحديث ${selectedOrders.length} طلب إلى حالة "${statusText}"`
        );
        setSelectedOrders([]);
        setBulkStatus('');
      } else {
        const errorData = await response.json();
        showError('فشل في تحديث الطلبات', errorData.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      console.error('Error updating bulk status:', error);
    } finally {
      setUpdatingBulk(false);
    }
  };

  return {
    // Data
    orders,
    filteredOrders,
    currentOrders,
    services,
    admins,

    // Loading states
    loading,
    updatingStatus,
    updatingBulk,

    // Filters
    filters: {
      searchTerm,
      statusFilter,
      deliveryFilter,
      dateFrom,
      dateTo,
      selectedServiceIds,
      orderSourceFilter,
      userIdFilter,
      createdByAdminIdFilter,
      deliveryTodayFilter,
    },
    setSearchTerm,
    setStatusFilter,
    setDeliveryFilter,
    setDateFrom,
    setDateTo,
    setSelectedServiceIds,
    setOrderSourceFilter,
    toggleService,

    // Pagination
    currentPage,
    totalPages,
    ordersPerPage,
    paginate: setCurrentPage,

    // Selection
    selectedOrders,
    toggleOrderSelection,
    selectAllOrders,

    // Bulk actions
    bulkStatus,
    setBulkStatus,
    updateBulkStatus,

    // Order actions
    updateOrderStatus,

    // Helpers
    hasFilter,
    refetch: fetchOrders,
  };
}
