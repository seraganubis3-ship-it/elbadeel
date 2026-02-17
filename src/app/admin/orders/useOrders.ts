'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Order, OrderFilters, Service, Category, Admin, getStatusText } from './types';

interface UseOrdersReturn {
  // Data
  orders: Order[];
  filteredOrders: Order[];
  currentOrders: Order[];
  services: Service[];
  admins: Admin[];
  categories: Category[];

  // Loading states
  loading: boolean;
  isRefetching: boolean;
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
  setCategoryId: (id: string) => void;
  setEmployeeId: (id: string) => void;
  toggleService: (serviceId: string) => void;
  setSortBy: (sort: string) => void;
  sortBy: string;

  // Pagination
  currentPage: number;
  totalPages: number;
  ordersPerPage: number;
  paginate: (page: number) => void;

  // Selection
  selectedOrders: string[];
  selectedOrdersData: Order[];
  toggleOrderSelection: (orderId: string) => void;
  selectAllOrders: () => void;

  // Bulk actions
  bulkStatus: string;
  setBulkStatus: (status: string) => void;
  updateBulkStatus: (workOrderNumber?: string) => Promise<void>;

  // Order actions
  updateOrderStatus: (orderId: string, newStatus: string, workOrderNumber?: string) => Promise<void>;
  deleteOrder: (orderId: string) => Promise<void>;

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
  const createdByAdminIdParam = searchParams.get('createdByAdminId') || '';
  const deliveryTodayFilter = searchParams.get('delivery') === 'today';

  // Data state
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [isRefetching, setIsRefetching] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [updatingBulk, setUpdatingBulk] = useState(false);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deliveryFilter, setDeliveryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('id_desc');
  
  // Initialize dates from localStorage (work date)
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [orderSourceFilter, setOrderSourceFilter] = useState('all');
  const [categoryId, setCategoryId] = useState('');
  const [employeeId, setEmployeeId] = useState(createdByAdminIdParam);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 50;

  // Selection
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [selectedOrdersData, setSelectedOrdersData] = useState<Order[]>([]); // New state for persistence
  const [bulkStatus, setBulkStatus] = useState('');

  // Compute hasFilter
  const hasFilter = Boolean(
    (dateFrom && dateTo) ||
      searchTerm ||
      userIdFilter ||
      employeeId ||
      categoryId ||
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
  const fetchOrders = useCallback(async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      else setIsRefetching(true);

      if (!hasFilter) {
        setOrders([]);
        setLoading(false);
        setIsRefetching(false);
        return;
      }

      const params = new URLSearchParams();
      if (searchTerm) params.set('search', searchTerm);
      if (userIdFilter) params.set('userId', userIdFilter);
      if (employeeId) params.set('createdByAdminId', employeeId);
      if (categoryId) params.set('categoryId', categoryId);
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

      params.set('sortBy', sortBy);

      // Add default limits to fetch more data for client-side filtering options
      params.set('limit', '100'); 

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
      // console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setIsRefetching(false);
    }
  }, [
    hasFilter,
    userIdFilter,
    employeeId,
    categoryId,
    dateFrom,
    dateTo,
    selectedServiceIds,
    orderSourceFilter,
    searchTerm,
    sortBy,
  ]);

  // Filter and sort orders
  const filterAndSortOrders = useCallback(() => {
    let filtered = orders;

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

    // Sort by selection
    if (sortBy === 'id_desc') {
       filtered.sort((a, b) => b.id.localeCompare(a.id));
    } else if (sortBy === 'id_asc') {
       filtered.sort((a, b) => a.id.localeCompare(b.id));
    } else if (sortBy === 'createdAt_desc') {
       filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'createdAt_asc') {
       filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    }

    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [
    orders,
    statusFilter,
    deliveryFilter,
    dateFrom,
    dateTo,
    deliveryTodayFilter,
    sortBy,
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

  // Fetch categories
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories((data.categories || []).map((c: any) => ({ id: c.id, name: c.name })));
        }
      } catch {}
    })();
  }, []);

  // Fetch admins (employees)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/admin/users?role=MANAGEMENT&pageSize=100');
        if (res.ok) {
          const data = await res.json();
          setAdmins(
            (data.rows || []).map((u: any) => ({
              id: u.id,
              name: u.name || u.email || 'مشرف',
            }))
          );
        }
      } catch {}
    })();
  }, []);

  // Fetch orders on filter change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      // If we already have orders, do a background fetch (no full screen loading)
      const isBackground = orders.length > 0;
      fetchOrders(isBackground);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchOrders]); // Remove orders.length to avoid loops. fetchOrders checks filters.

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
    // Check main orders list first, then fallback to selectedOrdersData to avoiding losing data
    const order = orders.find(o => o.id === orderId) || selectedOrdersData.find(o => o.id === orderId);
    if (order?.status === 'cancelled') return;

    if (selectedOrders.includes(orderId)) {
        // Remove
        setSelectedOrders(prev => prev.filter(id => id !== orderId));
        setSelectedOrdersData(prev => prev.filter(o => o.id !== orderId));
    } else {
        // Add
        if (order) {
            setSelectedOrders(prev => [...prev, orderId]);
            setSelectedOrdersData(prev => [...prev, order]);
        }
    }
  };

  const selectAllOrders = () => {
    const validOrders = currentOrders.filter(o => o.status !== 'cancelled');
    const allSelected = validOrders.every(o => selectedOrders.includes(o.id));

    if (allSelected) {
       // Deselect current visible orders
       const idsToRemove = validOrders.map(o => o.id);
       setSelectedOrders(prev => prev.filter(id => !idsToRemove.includes(id)));
       setSelectedOrdersData(prev => prev.filter(o => !idsToRemove.includes(o.id)));
    } else {
       // Select all visible orders
       const newOrders = validOrders.filter(o => !selectedOrders.includes(o.id));
       const newIds = newOrders.map(o => o.id);
       
       setSelectedOrders(prev => [...prev, ...newIds]);
       setSelectedOrdersData(prev => [...prev, ...newOrders]);
    }
  };

  // Update single order status
  const updateOrderStatus = async (orderId: string, newStatus: string, workOrderNumber?: string) => {
    if (!newStatus) return;
    setUpdatingStatus(orderId);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, workOrderNumber }),
      });

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
        );
        // Also update selectedOrdersData
        setSelectedOrdersData(prev => 
            prev.map(order => (order.id === orderId ? { ...order, status: newStatus } : order))
        );
        const statusText = getStatusText(newStatus);
        showSuccess('تم تحديث حالة الطلب بنجاح! 🎉', `تم تغيير حالة الطلب إلى "${statusText}"`);
      } else {
        const errorData = await response.json();
        showError('فشل في تحديث حالة الطلب', errorData.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      // console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Delete single order
  const deleteOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    setUpdatingStatus(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        setSelectedOrdersData(prev => prev.filter(o => o.id !== orderId));
        setSelectedOrders(prev => prev.filter(id => id !== orderId));
        showSuccess('تم حذف الطلب بنجاح! 🗑️', 'تم إزالة الطلب من النظام نهائياً');
      } else {
        const errorData = await response.json();
        showError('فشل في حذف الطلب', errorData.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      showError('خطأ في الاتصال', 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Update bulk status
  const updateBulkStatus = async (workOrderNumber?: string) => {
    if (!bulkStatus || selectedOrders.length === 0) return;
    setUpdatingBulk(true);

    try {
      const response = await fetch('/api/admin/orders/bulk-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds: selectedOrders, status: bulkStatus, workOrderNumber }),
      });

      if (response.ok) {
        setOrders(prevOrders =>
          prevOrders.map(order =>
            selectedOrders.includes(order.id) ? { ...order, status: bulkStatus } : order
          )
        );
        // Also update selectedOrdersData if we were keeping them, but here we clear selection usually?
        // Code clears selection below: setSelectedOrders([]);
        // So we should also clear selectedOrdersData
        
        const statusText = getStatusText(bulkStatus);
        showSuccess(
          'تم تحديث الطلبات بنجاح! 🚀',
          `تم تحديث ${selectedOrders.length} طلب إلى حالة "${statusText}"`
        );
        setSelectedOrders([]);
        setSelectedOrdersData([]); // Clear persistent data too
        setBulkStatus('');
      } else {
        const errorData = await response.json();
        showError('فشل في تحديث الطلبات', errorData.error || 'حدث خطأ غير متوقع');
      }
    } catch (error) {
      // console.error('Error updating bulk status:', error);
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
    categories,

    // Loading states
    loading,
    isRefetching,
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
      createdByAdminIdFilter: employeeId, // Use employeeId as the source of truth for UI
      deliveryTodayFilter,
      categoryId,
      employeeId,
    },
    setSearchTerm,
    setStatusFilter,
    setDeliveryFilter,
    setDateFrom,
    setDateTo,
    setSelectedServiceIds,
    setOrderSourceFilter,
    setCategoryId,
    setEmployeeId,
    toggleService,
    setSortBy,
    sortBy,

    // Pagination
    currentPage,
    totalPages,
    ordersPerPage,
    paginate: setCurrentPage,

    // Selection
    selectedOrders,
    selectedOrdersData, // EXPORT THIS
    toggleOrderSelection,
    selectAllOrders,

    // Bulk actions
    bulkStatus,
    setBulkStatus,
    updateBulkStatus,

    // Order actions
    updateOrderStatus,
    deleteOrder,

    // Helpers
    hasFilter,
    refetch: fetchOrders,
  };
}
