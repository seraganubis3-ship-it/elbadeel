'use client';

import { useState } from 'react';
import { useToast, ToastContainer } from '@/components/Toast';
import { useOrders } from './useOrders';
import { Order } from './types';
import {
  OrdersHeader,
  OrdersFilters,
  OrderCard,
  BulkActions,
  WhatsAppModal,
  Pagination,
  OrdersLoading,
  PhoneReportModal,
  WorkOrderModal,
  SelectDelegateModal,
} from './components';
import { printOrdersReport } from './utils/printReport';

export default function AdminOrdersPage() {
  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Custom hook for all order logic
  const {
    orders,
    filteredOrders,
    currentOrders,
    services,
    categories,
    admins,
    loading,
    isRefetching,
    updatingStatus,
    updatingBulk,
    filters,
    setSearchTerm,
    setStatusFilter,
    setDeliveryFilter,
    setDateFrom,
    setDateTo,
    setOrderSourceFilter,
    setCategoryId,
    setEmployeeId,
    toggleService,
    currentPage,
    totalPages,
    paginate,
    selectedOrders,
    toggleOrderSelection,
    selectAllOrders,
    bulkStatus,
    setBulkStatus,
    updateBulkStatus,
    updateOrderStatus,
    hasFilter,
  } = useOrders(showSuccess, showError);

  // WhatsApp Modal State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [whatsappOrder, setWhatsappOrder] = useState<Order | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // WhatsApp handlers
  const handleWhatsAppClick = (order: Order) => {
    setWhatsappOrder(order);
    setShowWhatsAppModal(true);
  };

  const sendWhatsApp = async () => {
    if (!whatsappOrder) return;

    const phone =
      whatsappOrder.customerPhone && whatsappOrder.customerPhone !== 'unknown'
        ? whatsappOrder.customerPhone
        : whatsappOrder.user?.phone || null;

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

  // Print comprehensive report
  const printReport = () => {
    printOrdersReport({
      orders: filteredOrders,
      selectedOrders,
      filters,
    });
  };

  // Phone Report Logic
  const [showPhoneReportModal, setShowPhoneReportModal] = useState(false);

  const handleOpenPhoneReport = () => {
    if (selectedOrders.length === 0) {
      showError('تنبيه', 'برجاء تحديد طلبات أولاً لطباعة الكشف');
      return;
    }
    setShowPhoneReportModal(true);
  };

  const handlePrintPhoneReport = (ordersWithNotes: { orderId: string; note: string }[]) => {
    // 1. Enrich data with names and phones
    const reportData = ordersWithNotes.map(item => {
      const order = currentOrders.find(o => o.id === item.orderId);
      return {
        name: order?.customerName || '',
        phone: order?.customerPhone || '',
        note: item.note,
      };
    });

    // 2. Save to localStorage to pass to new window
    localStorage.setItem('temp_phone_report_data', JSON.stringify(reportData));

    // 3. Open print page
    const printWindow = window.open('/admin/orders/print-phone-report', '_blank');
    
    // 4. Close modal
    setShowPhoneReportModal(false);
  };

  // Translation Report Logic
  const [showDelegateModal, setShowDelegateModal] = useState(false);

  const handlePrintTranslationReport = () => {
    if (selectedOrders.length === 0) {
      showError('تنبيه', 'برجاء تحديد طلبات أولاً لطباعة الكشف');
      return;
    }
    setShowDelegateModal(true);
    setTargetReport('TRANSLATION');
  };

  const executePrintTranslationReport = (delegate: any) => {
    const reportData = selectedOrders
      .map(id => currentOrders.find(o => o.id === id))
      .filter(o => o)
      .map(order => {
        // Source Logic
        const serviceName = order?.service?.name || '';
        let source = serviceName; // Default to service name (product name) directly
        
        if (serviceName.includes('ميلاد')) source = 'ميلاد';
        else if (serviceName.includes('وفاة')) source = 'وفاة';
        else if (serviceName.includes('زواج')) source = 'زواج';
        else if (serviceName.includes('طلاق')) source = 'طلاق';
        else if (serviceName.includes('قيد')) {
            if (serviceName.includes('عائلي')) source = 'قيد عائلي';
            else if (serviceName.includes('فردي')) source = 'قيد فردي';
            else source = 'قيد';
        }
        else if (serviceName.includes('فيش')) source = 'فيش جنائي';
        else if (serviceName.includes('رقم قومى')) source = 'رقم قومى';
        else if (serviceName.includes('سفر')) source = 'جواز سفر';
        else if (serviceName.includes('مترجم')) source = 'مترجم';

        // Translation Language Logic
        let language = 'غير محدد';
        const details = order?.serviceDetails || '';
        const langMatch = details.match(/لغة الترجمة:\s*([^\n]+)/);
        if (langMatch && langMatch[1]) {
           language = langMatch[1].trim();
        }

        // ID logic
        let idNumber = order?.idNumber;
        if (!idNumber && order?.birthDate) {
           const date = new Date(order.birthDate);
           if (!isNaN(date.getTime())) {
             idNumber = date.toLocaleDateString('en-GB');
           } else {
             idNumber = order.birthDate;
           }
        }
        idNumber = idNumber || '';
        
        // Quantity
        const quantity = order?.quantity || 1;

        return {
           name: order?.customerName || '',
           idNumber,
           source,
           quantity,
           language
        };
      });

    // Save Data + Delegate Info
    localStorage.setItem('temp_translation_report_data', JSON.stringify({
      orders: reportData,
      delegate: {
        name: delegate.name,
        idNumber: delegate.idNumber,
        unionCard: delegate.unionCardFront || delegate.idCardFront || '' // Fallback to ID card if Union card missing
      }
    }));
    
    setShowDelegateModal(false);
    window.open('/admin/orders/print-translation-report', '_blank');
  };

  // Family Record Report Logic
  const handlePrintFamilyReport = () => {
    if (selectedOrders.length === 0) {
      showError('تنبيه', 'برجاء تحديد طلبات أولاً لطباعة الكشف');
      return;
    }
    // Reuse delegate modal, we'll distinguish action by a state or just use a separate handler when modal submits
    // For simplicity, we can use the same modal state but set a 'targetReport' state
    setTargetReport('FAMILY');
    setShowDelegateModal(true);
  };

  const executePrintFamilyReport = (delegate: any) => {
    const reportData = selectedOrders
      .map(id => currentOrders.find(o => o.id === id))
      .filter(o => o)
      .map(order => {
        // ID logic
        let idNumber = order?.idNumber;
        if (!idNumber && order?.birthDate) {
           const date = new Date(order.birthDate);
           if (!isNaN(date.getTime())) {
             idNumber = date.toLocaleDateString('en-GB');
           } else {
             idNumber = order.birthDate;
           }
        }
        idNumber = idNumber || '';
        
        // Quantity
        const quantity = order?.quantity || 1;

        return {
           name: order?.customerName || '',
           idNumber,
           source: '', // Requested to be empty
           quantity
        };
      });

    // Save Data + Delegate Info
    localStorage.setItem('temp_family_report_data', JSON.stringify({
      orders: reportData,
      delegate: {
        name: delegate.name,
        idNumber: delegate.idNumber,
        unionCard: delegate.unionCardFront || delegate.idCardFront || '' 
      }
    }));
    
    setShowDelegateModal(false);
    window.open('/admin/orders/print-family-report', '_blank');
  };

  const [targetReport, setTargetReport] = useState<'TRANSLATION' | 'FAMILY' | 'AUTHORIZATION'>('TRANSLATION');
  const [authorizationOrder, setAuthorizationOrder] = useState<Order | null>(null);

  // Authorization Report Logic
  const handlePrintAuthorization = (order: Order) => {
    setAuthorizationOrder(order);
    setTargetReport('AUTHORIZATION');
    setShowDelegateModal(true);
  };

  const executePrintAuthorization = (delegate: any, authType: 'passport' | 'work-permit') => {
    if (!authorizationOrder) return;
    const basePath = authType === 'passport' 
      ? '/admin/print/passport-authorization'
      : '/admin/print/work-permit-authorization';
    const url = `${basePath}?orderId=${authorizationOrder.id}&delegateId=${delegate.id}`;
    window.open(url, '_blank');
    setShowDelegateModal(false);
    setAuthorizationOrder(null);
  };

  // Work Order Logic
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [pendingWorkOrder, setPendingWorkOrder] = useState<{
    type: 'single' | 'bulk';
    orderId?: string;
    newStatus?: string;
  } | null>(null);

  const isNationalIdOrder = (order: Order) => {
    const serviceName = order.service?.name || '';
    const serviceSlug = order.service?.slug || '';
    return serviceSlug === 'national-id' || serviceName.includes('بطاقة') || serviceName.includes('قومي');
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);
    if (newStatus === 'settlement' && order && isNationalIdOrder(order)) {
      setPendingWorkOrder({ type: 'single', orderId, newStatus });
      setShowWorkOrderModal(true);
      return;
    }
    await updateOrderStatus(orderId, newStatus);
  };

  const handleApplyBulkStatus = async () => {
    if (bulkStatus === 'settlement') {
      const hasNationalID = currentOrders
        .filter(o => selectedOrders.includes(o.id))
        .some(isNationalIdOrder);
      
      if (hasNationalID) {
        setPendingWorkOrder({ type: 'bulk' });
        setShowWorkOrderModal(true);
        return;
      }
    }
    await updateBulkStatus();
  };

  const handleWorkOrderSubmit = async (workOrderNumber: string) => {
    if (!pendingWorkOrder) return;

    if (pendingWorkOrder.type === 'single' && pendingWorkOrder.orderId && pendingWorkOrder.newStatus) {
      await updateOrderStatus(pendingWorkOrder.orderId, pendingWorkOrder.newStatus, workOrderNumber);
    } else if (pendingWorkOrder.type === 'bulk') {
      await updateBulkStatus(workOrderNumber);
    }

    setShowWorkOrderModal(false);
    setPendingWorkOrder(null);
  };

  // Calculate stats
  const activeOrdersCount = filteredOrders.filter(
    o => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;
  const completedOrdersCount = filteredOrders.filter(o => o.status === 'completed').length;
  const totalValue = Math.floor(filteredOrders.reduce((sum, o) => sum + o.totalCents, 0) / 100);

  // Loading state
  if (loading) {
    return <OrdersLoading />;
  }

  return (
    <>
      <div
        className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
        dir='rtl'
      >
        {/* Header with Stats */}
        <OrdersHeader
          orderSourceFilter={filters.orderSourceFilter}
          filteredOrdersCount={filteredOrders.length}
          activeOrdersCount={activeOrdersCount}
          completedOrdersCount={completedOrdersCount}
        />

        {/* Main Content */}
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          {/* Filters */}
          <OrdersFilters
            searchTerm={filters.searchTerm}
            statusFilter={filters.statusFilter}
            deliveryFilter={filters.deliveryFilter}
            dateFrom={filters.dateFrom}
            dateTo={filters.dateTo}
            selectedServiceIds={filters.selectedServiceIds}
            orderSourceFilter={filters.orderSourceFilter}
            categoryId={filters.categoryId}
            employeeId={filters.employeeId}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onDeliveryChange={setDeliveryFilter}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onServiceToggle={toggleService}
            onOrderSourceChange={setOrderSourceFilter}
            onCategoryChange={setCategoryId}
            onEmployeeChange={setEmployeeId}
            services={services}
            categories={categories}
            admins={admins}
            hasFilter={hasFilter}
          />

          {/* Bulk Actions */}
          {currentOrders.length > 0 && (
            <BulkActions
              selectedCount={selectedOrders.length}
              totalCount={currentOrders.length}
              bulkStatus={bulkStatus}
              updating={updatingBulk}
              onSelectAll={selectAllOrders}
              onBulkStatusChange={setBulkStatus}
              onApplyBulkStatus={handleApplyBulkStatus}
              onPrintReport={printReport}
              onPrintTranslationReport={handlePrintTranslationReport}
              onPrintFamilyReport={handlePrintFamilyReport}
              onOpenPhoneReport={handleOpenPhoneReport}
              hasOrders={filteredOrders.length > 0}
            />
          )}

          {/* Orders Grid */}
          {!hasFilter ? (
            <div className='bg-white rounded-2xl shadow-xl p-12 text-center'>
              <div className='text-6xl mb-4'>🔍</div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>اختر فلتر للبحث</h3>
              <p className='text-gray-600'>يرجى اختيار نطاق تاريخ أو فلتر آخر لعرض الطلبات</p>
            </div>
          ) : currentOrders.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-xl p-12 text-center'>
              <div className='text-6xl mb-4'>📭</div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>لا توجد طلبات</h3>
              <p className='text-gray-600'>لا توجد طلبات تطابق معايير البحث الحالية</p>
            </div>
          ) : (
            <>
              <div className={`relative transition-opacity duration-200 ${isRefetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                {isRefetching && (
                  <div className='absolute inset-0 z-50 flex items-center justify-center'>
                    <div className='bg-white/95  rounded-full px-6 py-3 shadow-lg flex items-center gap-3'>
                      <div className='w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin' />
                      <span className='text-blue-600 font-medium text-sm'>جاري التحديث...</span>
                    </div>
                  </div>
                )}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {currentOrders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    isSelected={selectedOrders.includes(order.id)}
                    isUpdating={updatingStatus === order.id}
                    onSelect={toggleOrderSelection}
                    onStatusChange={handleStatusUpdate}
                    onWhatsAppClick={handleWhatsAppClick}
                    onPrintAuthorization={handlePrintAuthorization}
                  />
                ))}
              </div>
              </div>

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={paginate}
              />
            </>
          )}
        </div>
      </div>

      {/* WhatsApp Modal */}
      <WhatsAppModal
        isOpen={showWhatsAppModal}
        order={whatsappOrder}
        message={whatsappMessage}
        selectedTemplate={selectedTemplate}
        sending={sendingWhatsApp}
        onClose={() => {
          setShowWhatsAppModal(false);
          setWhatsappMessage('');
          setSelectedTemplate('');
          setWhatsappOrder(null);
        }}
        onMessageChange={setWhatsappMessage}
        onTemplateSelect={setSelectedTemplate}
        onSend={sendWhatsApp}
      />

      {/* Phone Report Modal */}
      <PhoneReportModal
        isOpen={showPhoneReportModal}
        selectedOrders={selectedOrders}
        orders={currentOrders}
        onClose={() => setShowPhoneReportModal(false)}
        onPrint={handlePrintPhoneReport}
      />

      {/* Work Order Modal */}
      <WorkOrderModal
        isOpen={showWorkOrderModal}
        onClose={() => {
          setShowWorkOrderModal(false);
          setPendingWorkOrder(null);
        }}
        onSubmit={handleWorkOrderSubmit}
        count={
          pendingWorkOrder?.type === 'single'
            ? 1
            : selectedOrders.length
        }
      />

      <SelectDelegateModal
        isOpen={showDelegateModal}
        onClose={() => setShowDelegateModal(false)}
        onConfirm={(delegate, authType) => {
             if (targetReport === 'TRANSLATION') {
                 executePrintTranslationReport(delegate);
             } else if (targetReport === 'FAMILY') {
                 executePrintFamilyReport(delegate);
             } else if (targetReport === 'AUTHORIZATION' && authType) {
                 executePrintAuthorization(delegate, authType);
             }
        }}
        mode={targetReport === 'AUTHORIZATION' ? 'authorization' : 'default'}
      />

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}
