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
  WorkOrderModal,
  SelectDelegateModal,
  EditReportDataModal,
  LastOrderAlert, // Add this
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
    setPhotographyDate,
    toggleService,
    setSortBy,
    sortBy,
    currentPage,
    totalPages,
    paginate,
    selectedOrders,
    selectedOrdersData,
    toggleOrderSelection,
    selectAllOrders,
    bulkStatus,
    setBulkStatus,
    updateBulkStatus,
    updateOrderStatus,
    deleteOrder,
    hasFilter,
  } = useOrders(showSuccess, showError);

  // Last Order Alert Logic
  const LastOrderAlertComponent = <LastOrderAlert searchTerm={filters.searchTerm} />;

  // WhatsApp Modal State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [whatsappOrder, setWhatsappOrder] = useState<Order | null>(null);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  // Payment Alert State
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);
  const [paymentAlertOrder, setPaymentAlertOrder] = useState<Order | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);
  const [quickPayMethod, setQuickPayMethod] = useState('CASH');

  // Status Reason Modal State
  const [showStatusReasonModal, setShowStatusReasonModal] = useState(false);
  const [statusReasonText, setStatusReasonText] = useState('');
  const [pendingStatusReason, setPendingStatusReason] = useState<{orderId: string; newStatus: string} | null>(null);
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
  // 1. Initial trigger: Choose Delegate
  const printReport = () => {
    if (selectedOrders.length === 0 && filteredOrders.length === 0) {
      showError('تنبيه', 'لا توجد طلبات للطباعة');
      return;
    }

    // Open Delegate Selection Modal FIRST
    // Reset previous state
    setTargetReport('GENERAL');
    setShowDelegateModal(true);
  };

  // 2. Delegate Selected -> Open Edit Modal
  const handleDelegateForGeneralReport = (delegate: any, reportDate?: string) => {
    setShowDelegateModal(false);

    // Prepare data for editing
    const ordersToPrint = selectedOrders.length > 0 ? selectedOrdersData : filteredOrders;

    if (ordersToPrint.length === 0) {
      showError('تنبيه', 'لا توجد طلبات للطباعة');
      return;
    }

    const classifyOrder = (o: Order) => {
      if (!o.service) return 'GENERAL';
      const name = o.service.name.toLowerCase();
      const slug = (o.service.slug || '').toLowerCase();

      if (name.includes('مترجم') && (name.includes('بطاقة') || slug === 'national-id'))
        return 'TRANSLATED_ID';
      if (name.includes('بطاقة') || slug === 'national-id') return 'NATIONAL_ID';
      if (name.includes('جواز') || slug === 'passports') return 'PASSPORT';
      if (name.includes('وفاة') || slug.includes('death')) return 'DEATH_CERT';
      if (name.includes('ميلاد') || slug.includes('birth')) return 'BIRTH_CERT';
      if (name.includes('زواج') || slug.includes('marriage')) return 'MARRIAGE_CERT';
      return 'GENERAL';
    };

    const groupedOrders: Record<string, any[]> = {
      NATIONAL_ID: [],
      TRANSLATED_ID: [],
      BIRTH_CERT: [],
      DEATH_CERT: [],
      PASSPORT: [],
      MARRIAGE_CERT: [],
      GENERAL: [],
    };

    // Map orders to editable format first
    const mappedOrders = ordersToPrint.map(order => {
      const finesDetails = order.finesDetails ? JSON.parse(order.finesDetails) : [];
      const otherFines = finesDetails.filter(
        (f: any) =>
          !f.name ||
          (!f.name.toLowerCase().includes('محضر') && !f.name.toLowerCase().includes('فقد'))
      );
      const calcFines = otherFines.reduce((sum: number, f: any) => sum + (f.amount || 0), 0) / 100;

      const fineNames = finesDetails.map((f: any) => f.name).join(' - ');
      const calcDetails = [fineNames, order.serviceDetails].filter(Boolean).join(' / ');

      return {
        ...order,
        customerName: order.customerName || '',
        idNumber: order.idNumber || '',
        overrideTotalFines: order.otherFees ? order.otherFees : calcFines,
        overrideDetails: calcDetails,
        motherName: order.motherName || '',
        wifeName: order.wifeName || '',
        wifeMotherName: order.wifeMotherName || '',
        birthDate: order.birthDate ? new Date(order.birthDate).toLocaleDateString('ar-EG') : '',
        marriageDate: order.marriageDate
          ? new Date(order.marriageDate).toLocaleDateString('ar-EG')
          : '',
        policeStation: order.policeStation || '',
        pickupLocation: order.pickupLocation || '',
        quantity: order.quantity || 1,
        sourceService: order.service, // Keep ref
      };
    });

    mappedOrders.forEach(o => {
      const type = classifyOrder(o);
      const group = groupedOrders[type];
      if (group) group.push(o);
    });

    const sections: any[] = [];

    // 1. National ID
    // 1. National ID - Grouped by Variant
    if (groupedOrders.NATIONAL_ID && groupedOrders.NATIONAL_ID.length > 0) {
      const variants: Record<string, any[]> = {};

      groupedOrders.NATIONAL_ID.forEach(order => {
        const vName = order.variant?.name || 'عادية';
        if (!variants[vName]) {
          variants[vName] = [];
        }
        variants[vName]!.push(order);
      });

      Object.entries(variants).forEach(([variantName, variantOrders]) => {
        sections.push({
          title: `بطاقات الرقم القومي - ${variantName}`,
          data: variantOrders,
          columns: [
            { key: 'customerName', label: 'الاسم' },
            { key: 'idNumber', label: 'الرقم القومي' },
            { key: 'overrideTotalFines', label: 'الغرامات', type: 'number' },
            { key: 'overrideDetails', label: 'التفاصيل' },
          ],
          defaultRowData: {
            service: { name: 'بطاقة رقم قومي', slug: 'national-id' },
            variant: { name: variantName },
          },
        });
      });
    }

    // 1.5 Translated ID
    if (groupedOrders.TRANSLATED_ID && groupedOrders.TRANSLATED_ID.length > 0) {
      sections.push({
        title: 'بطاقات الرقم القومي المترجمة',
        data: groupedOrders.TRANSLATED_ID,
        columns: [
          { key: 'customerName', label: 'الاسم' },
          { key: 'idNumber', label: 'الرقم القومي' },
          { key: 'overrideTotalFines', label: 'الغرامات', type: 'number' },
          { key: 'overrideDetails', label: 'التفاصيل' },
        ],
        defaultRowData: {
          service: { name: 'بطاقة رقم قومي مترجم', slug: 'national-id' },
        },
      });
    }

    // 2. Birth Cert
    if (groupedOrders.BIRTH_CERT && groupedOrders.BIRTH_CERT.length > 0) {
      sections.push({
        title: 'شهادات الميلاد',
        data: groupedOrders.BIRTH_CERT,
        columns: [
          { key: 'customerName', label: 'الاسم' },
          { key: 'birthDate', label: 'تاريخ الميلاد' },
          { key: 'motherName', label: 'اسم الأم' },
          { key: 'quantity', label: 'العدد', type: 'number' },
          { key: 'idNumber', label: 'الرقم القومي' },
        ],
        defaultRowData: {
          service: { name: 'شهادة ميلاد', slug: 'birth-certificate' },
        },
      });
    }

    // 3. Death Cert
    if (groupedOrders.DEATH_CERT && groupedOrders.DEATH_CERT.length > 0) {
      sections.push({
        title: 'شهادات الوفاة',
        data: groupedOrders.DEATH_CERT,
        columns: [
          { key: 'customerName', label: 'الاسم' },
          { key: 'birthDate', label: 'تاريخ الوفاة' },
          { key: 'motherName', label: 'اسم الأم' },
          { key: 'quantity', label: 'العدد', type: 'number' },
        ],
        defaultRowData: {
          service: { name: 'شهادة وفاة', slug: 'death-certificate' },
        },
      });
    }

    // 4. Passport
    if (groupedOrders.PASSPORT && groupedOrders.PASSPORT.length > 0) {
      sections.push({
        title: 'جوازات السفر',
        data: groupedOrders.PASSPORT,
        columns: [
          { key: 'customerName', label: 'الاسم' },
          { key: 'idNumber', label: 'الرقم القومي' },
          { key: 'policeStation', label: 'القسم' },
          { key: 'pickupLocation', label: 'مكان الاستلام' },
        ],
        defaultRowData: {
          service: { name: 'جواز سفر', slug: 'passports' },
        },
      });
    }

    // 5. Marriage
    if (groupedOrders.MARRIAGE_CERT && groupedOrders.MARRIAGE_CERT.length > 0) {
      sections.push({
        title: 'قسيمة زواج',
        data: groupedOrders.MARRIAGE_CERT,
        columns: [
          { key: 'customerName', label: 'اسم الزوج/الزوجة' },
          { key: 'motherName', label: 'اسم الأم' },
          { key: 'wifeName', label: 'الطرف الآخر' },
          { key: 'wifeMotherName', label: 'أم الطرف الآخر' },
          { key: 'marriageDate', label: 'تاريخ الزواج' },
          { key: 'quantity', label: 'العدد', type: 'number' },
        ],
        defaultRowData: {
          service: { name: 'وثيقة زواج', slug: 'marriage-certificate' },
        },
      });
    }

    // 6. General
    if (groupedOrders.GENERAL && groupedOrders.GENERAL.length > 0) {
      sections.push({
        title: 'خدمات أخرى',
        data: groupedOrders.GENERAL,
        columns: [
          { key: 'customerName', label: 'الاسم' },
          { key: 'idNumber', label: 'الرقم القومي' },
          { key: 'overrideTotalFines', label: 'الرسوم', type: 'number' },
          { key: 'overrideDetails', label: 'التفاصيل' },
        ],
      });
    }

    setReportEditingState({
      type: 'GENERAL',
      sections: sections, // USE SECTIONS
      delegate: delegate || null, // Store selected delegate (or null)
      reportDate: reportDate || new Date().toLocaleDateString('ar-EG'),
      title: 'مراجعة بيانات الطباعة (شامل)',
    });
    setShowEditReportModal(true);
  };

  // ... (rest of the file remains unchanged)

  // Phone Report Logic
  // ...
  // Editable Report Modal
  // ...
  /* Edit Report Data Modal */

  // Phone Report Logic
  const handleOpenPhoneReport = () => {
    if (selectedOrders.length === 0) {
      showError('تنبيه', 'برجاء تحديد طلبات أولاً');
      return;
    }

    const reportData = (selectedOrders.length > 0 ? selectedOrdersData : currentOrders)
      .filter(o => o)
      .map(order => ({
        name: order?.customerName || '',
        phone: order?.customerPhone || order?.user?.phone || '',
        note: '',
      }));

    setReportEditingState({
      type: 'PHONE',
      data: reportData,
      delegate: null, // No delegate for phone report
      title: 'كشف أرقام التليفونات',
      columns: [
        { key: 'name', label: 'الاسم' },
        { key: 'phone', label: 'رقم الهاتف' },
        { key: 'note', label: 'ملاحظات' },
      ],
    });
    setShowEditReportModal(true);
  };

  // Translation Report Logic
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  /* REMOVED DUPLICATE */
  const [targetReport, setTargetReport] = useState<
    | 'TRANSLATION'
    | 'FAMILY'
    | 'GENERAL'
    | 'AUTHORIZATION'
    | 'ID_CARD_SIGNATURES'
    | 'OFFICIAL_DOCUMENTS_SIGNATURES'
  >('GENERAL');

  const handlePrintTranslationReport = () => {
    if (selectedOrders.length === 0) {
      showError('تنبيه', 'برجاء تحديد طلبات أولاً لطباعة الكشف');
      return;
    }
    setTargetReport('TRANSLATION');
    setShowDelegateModal(true);
  };

  // Editable Report Modal State
  const [showEditReportModal, setShowEditReportModal] = useState(false);
  const [reportEditingState, setReportEditingState] = useState<{
    type:
      | 'TRANSLATION'
      | 'FAMILY'
      | 'GENERAL'
      | 'ID_CARD_SIGNATURES'
      | 'OFFICIAL_DOCUMENTS_SIGNATURES'
      | 'PHONE';
    data?: any[]; // Legacy
    columns?: any[]; // Legacy
    sections?: any[]; // New
    delegate: any;
    title: string;
    reportDate?: string | undefined;
  } | null>(null);

  const handleConfirmEditReport = (data: any[], reportDate?: string) => {
    if (!reportEditingState) return;

    const { type, delegate } = reportEditingState;

    if (type === 'TRANSLATION') {
      localStorage.setItem(
        'temp_translation_report_data',
        JSON.stringify({
          orders: data,
          reportDate: reportDate || reportEditingState.reportDate,
          delegate: {
            name: delegate.name,
            idNumber: delegate.idNumber,
            unionCard: delegate.unionCardFront || delegate.idCardFront || '',
          },
        })
      );
      window.open('/admin/orders/print-translation-report', '_blank');
      setShowEditReportModal(false); // Close Modal
    } else if (type === 'FAMILY') {
      localStorage.setItem(
        'temp_family_report_data',
        JSON.stringify({
          orders: data,
          reportDate: reportDate || reportEditingState.reportDate,
          delegate: {
            name: delegate.name,
            idNumber: delegate.idNumber,
            unionCard: delegate.unionCardFront || delegate.idCardFront || '',
          },
        })
      );
      window.open('/admin/orders/print-family-report', '_blank');
      setShowEditReportModal(false); // Close Modal
    } else if (type === 'ID_CARD_SIGNATURES') {
      localStorage.setItem(
        'temp_id_card_signatures_report_data',
        JSON.stringify({
          orders: data,
          reportDate: reportDate || reportEditingState.reportDate,
          delegate: {
            name: delegate.name,
            idNumber: delegate.idNumber,
            unionCard: delegate.unionCardFront || delegate.idCardFront || '',
          },
        })
      );
      window.open('/admin/orders/print-id-card-signatures-report', '_blank');
      setShowEditReportModal(false); // Close Modal
    } else if (type === 'OFFICIAL_DOCUMENTS_SIGNATURES') {
      localStorage.setItem(
        'temp_official_docs_signature_report_data',
        JSON.stringify({
          orders: data,
          reportDate: reportDate || reportEditingState.reportDate,
          delegate: {
            name: delegate.name,
            idNumber: delegate.idNumber,
            unionCard: delegate.unionCardFront || delegate.idCardFront || '',
          },
        })
      );
      window.open('/admin/orders/print-official-documents-signature-report', '_blank');
      setShowEditReportModal(false); // Close Modal
    } else if (type === 'PHONE') {
      localStorage.setItem('temp_phone_report_data', JSON.stringify(data));
      window.open('/admin/orders/print-phone-report', '_blank');
      setShowEditReportModal(false); // Close Modal
    } else if (type === 'GENERAL') {
      // Reconstruct orders with overrides

      printOrdersReport({
        orders: data, // Use the data from arguments
        selectedOrders: [], // All passed in 'orders' are to be printed
        filters: filters,
        delegate: delegate, // Pass delegate info
        reportDate: reportDate, // Pass manual date from modal
      });
      setShowEditReportModal(false); // Close Modal
    }

    setReportEditingState(null);
  };
  const executePrintTranslationReport = (delegate: any, reportDate?: string) => {
    const reportData = (selectedOrders.length > 0 ? selectedOrdersData : currentOrders)
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
        } else if (serviceName.includes('فيش')) source = 'فيش جنائي';
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
          language,
        };
      });

    // OPEN EDIT MODAL INSTEAD OF PRINTING DIRECTLY
    setReportEditingState({
      type: 'TRANSLATION',
      data: reportData,
      delegate,
      reportDate,
      title: 'مراجعة بيانات كشف الترجمة',
      columns: [
        { key: 'name', label: 'الاسم' },
        { key: 'idNumber', label: 'الرقم القومي / تاريخ الميلاد' },
        { key: 'source', label: 'المصدر' },
        { key: 'language', label: 'اللغة' },
        { key: 'quantity', label: 'العدد', type: 'number' },
      ],
    });
    setShowEditReportModal(true);
    setShowDelegateModal(false);
  };

  // Family Record Report Logic
  const handlePrintFamilyReport = () => {
    if (selectedOrders.length === 0) {
      showError('تنبيه', 'برجاء تحديد طلبات أولاً لطباعة الكشف');
      return;
    }
    setTargetReport('FAMILY');
    setShowDelegateModal(true);
  };

  const executePrintFamilyReport = (delegate: any, reportDate?: string) => {
    const reportData = (selectedOrders.length > 0 ? selectedOrdersData : currentOrders)
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
          source: order?.destination || '', // Authority
          quantity,
        };
      });

    // OPEN EDIT MODAL
    setReportEditingState({
      type: 'FAMILY',
      data: reportData,
      delegate,
      reportDate,
      title: 'مراجعة بيانات كشف القيد العائلي',
      columns: [
        { key: 'name', label: 'الاسم' },
        { key: 'idNumber', label: 'الرقم القومي' },
        { key: 'source', label: 'الجهة' },
        { key: 'quantity', label: 'العدد', type: 'number' },
      ],
    });
    setShowEditReportModal(true);
    setShowDelegateModal(false);
  };

  // ID Card Signatures Report Logic
  const handlePrintIdCardSignaturesReport = () => {
    if (selectedOrders.length === 0) {
      showError('تنبيه', 'برجاء تحديد طلبات أولاً لطباعة الكشف');
      return;
    }
    setTargetReport('ID_CARD_SIGNATURES');
    setShowDelegateModal(true);
  };

  const executePrintIdCardSignaturesReport = (delegate: any, reportDate?: string) => {
    const reportData = (selectedOrders.length > 0 ? selectedOrdersData : currentOrders)
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

        // Card Type Logic (from variant name or defaulting to 'عادية')
        // Card Type Logic
        const variantName = (order.variant?.name || '').toLowerCase();
        let cardType = 'عادي';
        if (variantName.includes('سريع') || variantName.includes('urgent')) cardType = 'سريع';
        if (variantName.includes('فوري') || variantName.includes('immediate')) cardType = 'فوري';
        if (variantName.includes('سوبر فوري') || variantName.includes('immediate')) cardType = 'فوري';
        if (variantName.includes('عاجل') || variantName.includes('immediate')) cardType = 'عاجل';
        if (variantName.includes('عادي') || variantName.includes('immediate')) cardType = 'عادي';

        return {
          name: order?.customerName || '',
          idNumber,
          cardType,
        };
      });

    // OPEN EDIT MODAL
    setReportEditingState({
      type: 'ID_CARD_SIGNATURES',
      data: reportData,
      delegate,
      reportDate,
      title: 'مراجعة كشف توقيعات البطاقة',
      columns: [
        { key: 'name', label: 'الاسم' },
        { key: 'idNumber', label: 'الرقم القومي' },
        { key: 'cardType', label: 'نوع البطاقة' },
      ],
    });
    setShowEditReportModal(true);
    setShowDelegateModal(false);
  };

  // Official Documents Signature Report Logic
  const handlePrintOfficialDocumentsSignatureReport = () => {
    if (selectedOrders.length === 0) {
      showError('تنبيه', 'برجاء تحديد طلبات أولاً لطباعة الكشف');
      return;
    }
    setTargetReport('OFFICIAL_DOCUMENTS_SIGNATURES');
    setShowDelegateModal(true);
  };

  const executePrintOfficialDocumentsSignatureReport = (delegate: any, reportDate?: string) => {
    const reportData = (selectedOrders.length > 0 ? selectedOrdersData : currentOrders)
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

        // Source Logic
        const serviceName = order?.service?.name || '';
        let source = serviceName;
        if (serviceName.includes('ميلاد')) source = 'ميلاد';
        else if (serviceName.includes('زواج')) source = 'زواج';
        else if (serviceName.includes('طلاق')) source = 'طلاق';
        else if (serviceName.includes('قيد فردي')) source = 'قيد فردي';
        else if (serviceName.includes('قيد عائلي')) source = 'قيد عائلي';

        return {
          name: order?.customerName || '',
          idNumber,
          source,
          quantity: order?.quantity || 1,
          relation: order?.title || '',
        };
      });

    // OPEN EDIT MODAL
    setReportEditingState({
      type: 'OFFICIAL_DOCUMENTS_SIGNATURES',
      data: reportData,
      delegate,
      reportDate,
      title: 'مراجعة كشف توقيعات المستخرجات',
      columns: [
        { key: 'name', label: 'الاسم' },
        { key: 'idNumber', label: 'الرقم القومي' },
        { key: 'source', label: 'المصدر' },
        { key: 'quantity', label: 'العدد', type: 'number' },
        { key: 'relation', label: 'الصفة' },
      ],
    });
    setShowEditReportModal(true);
    setShowDelegateModal(false);
  };

  const [authorizationOrder, setAuthorizationOrder] = useState<Order | null>(null);

  // Authorization Report Logic
  const handlePrintAuthorization = (order: Order) => {
    setAuthorizationOrder(order);
    setTargetReport('AUTHORIZATION');
    setShowDelegateModal(true);
  };

  const executePrintAuthorization = (delegate: any, authType: 'passport' | 'work-permit') => {
    if (!authorizationOrder) return;
    const basePath =
      authType === 'passport'
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

    // Exclude translated and correction services
    if (serviceName.includes('مترجم') || serviceName.includes('تصحيح')) {
      return false;
    }

    return (
      serviceSlug === 'national-id' || serviceName.includes('بطاقة') || serviceName.includes('قومي')
    );
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId);

    // Check for outstanding balance when delivering or settling
    if (
      (newStatus === 'settlement' || newStatus === 'delivered') &&
      order &&
      (order.remainingAmount || 0) > 0
    ) {
      setPaymentAlertOrder(order);
      setPendingStatus(newStatus); // Track intended status
      setShowPaymentAlert(true);
      return;
    }

    // Ask for reason FIRST for all settlement/returned (before national ID check)
    if (newStatus === 'settlement' || newStatus === 'returned') {
      setPendingStatusReason({ orderId, newStatus });
      setStatusReasonText('');
      setShowStatusReasonModal(true);
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

    if (
      pendingWorkOrder.type === 'single' &&
      pendingWorkOrder.orderId &&
      pendingWorkOrder.newStatus
    ) {
      await updateOrderStatus(
        pendingWorkOrder.orderId,
        pendingWorkOrder.newStatus,
        workOrderNumber,
        statusReasonText || undefined
      );
    } else if (pendingWorkOrder.type === 'bulk') {
      await updateBulkStatus(workOrderNumber);
    }

    setShowWorkOrderModal(false);
    setPendingWorkOrder(null);
    setStatusReasonText('');
  };

  // Calculate stats
  const activeOrdersCount = filteredOrders.filter(
    o => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;
  const completedOrdersCount = filteredOrders.filter(o => o.status === 'completed').length;

  // Loading state
  if (loading) {
    return <OrdersLoading />;
  }

  // Collective Receipt Logic
  const handlePrintCollectiveReceipt = () => {
    if (selectedOrders.length < 2) {
      showError('تنبيه', 'يجب تحديد طلبين أو أكثر لطباعة إيصال مجمع');
      return;
    }

    // Validation: All orders must belong to the same customer (by phone or ID)
    const firstOrder = selectedOrdersData[0];
    if (!firstOrder) return;

    const customerIdToCheck = firstOrder.user?.id || firstOrder.customerPhone; // Prefer user ID if linked, else phone

    const isSameCustomer = selectedOrdersData.every(order => {
      const thisId = order.user?.id || order.customerPhone;
      return thisId === customerIdToCheck;
    });

    if (!isSameCustomer) {
      showError('خطأ', 'جميع الطلبات المحددة يجب أن تكون لنفس العميل');
      return;
    }

    // Check if customerId is present
    if (!firstOrder.user?.id) {
      // Ideally we need a customer ID. If guest, we might need a workaround or ensure phone logic works on backend.
      // The backend page expects 'customerId'. If it's a guest order, we might not have a systematic customerId.
      // Let's rely on the user ID if available, otherwise show error for now (or improve backend handling).
      // Actually the collective page fetches via /api/admin/collective-receipt?customerId=...
      if (!firstOrder.customerPhone) {
        showError('خطأ', 'تعذر تحديد هوية العميل');
        return;
      }
    }

    // Based on collective-receipt/page.tsx logic, let's see how it fetches.
    // It passes customerId to API.

    // Construct URL
    // We pass the IDs and let the backend/page handle the rest.
    // BUT the page requires customerId param.
    // Let's pass the first order's user ID. If it's null (guest), we might face an issue.
    // Let's assume for now most "Collective" are for registered users or agents.

    if (!firstOrder.user?.id) {
      showError('تنبيه', 'يجب أن يكون العميل مسجلاً (له حساب) لطباعة إيصال مجمع في الوقت الحالي');
      return;
    }

    const orderIdsParam = selectedOrders.join(',');
    const dateParam = new Date().toISOString(); // Current date for the report

    // Open in new tab
    const url = `/admin/collective-receipt?customerId=${firstOrder.user.id}&date=${dateParam}&orderIds=${orderIdsParam}`;
    window.open(url, '_blank');
  };

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
            dateFrom={filters.dateFrom || ''}
            dateTo={filters.dateTo || ''}
            selectedServiceIds={filters.selectedServiceIds}
            orderSourceFilter={filters.orderSourceFilter}
            categoryId={filters.categoryId}
            employeeId={filters.employeeId}
            photographyDate={filters.photographyDate || ''}
            onSearchChange={setSearchTerm}
            onStatusChange={setStatusFilter}
            onDeliveryChange={setDeliveryFilter}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
            onServiceToggle={toggleService}
            onOrderSourceChange={setOrderSourceFilter}
            onPhotographyDateChange={setPhotographyDate}
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
              onPrintIdCardSignaturesReport={handlePrintIdCardSignaturesReport}
              onPrintOfficialDocumentsSignatureReport={handlePrintOfficialDocumentsSignatureReport}
              onPrintFamilyReport={handlePrintFamilyReport}
              onOpenPhoneReport={handleOpenPhoneReport}
              onPrintCollectiveReceipt={handlePrintCollectiveReceipt}
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
              <div
                className={`relative transition-opacity duration-200 ${isRefetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}
              >
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
                      onDelete={deleteOrder}
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
                totalItems={filteredOrders.length}
              />

              {/* Search Alert */}
              {LastOrderAlertComponent}
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

      {/* Work Order Modal */}
      <WorkOrderModal
        isOpen={showWorkOrderModal}
        onClose={() => {
          setShowWorkOrderModal(false);
          setPendingWorkOrder(null);
        }}
        onSubmit={handleWorkOrderSubmit}
        count={pendingWorkOrder?.type === 'single' ? 1 : selectedOrders.length}
      />

      <SelectDelegateModal
        isOpen={showDelegateModal}
        onClose={() => setShowDelegateModal(false)}
        onConfirm={(delegate, authType, reportDate) => {
          if (targetReport === 'TRANSLATION') {
            executePrintTranslationReport(delegate!, reportDate);
          } else if (targetReport === 'FAMILY') {
            executePrintFamilyReport(delegate!, reportDate);
          } else if (targetReport === 'ID_CARD_SIGNATURES') {
            executePrintIdCardSignaturesReport(delegate!, reportDate);
          } else if (targetReport === 'OFFICIAL_DOCUMENTS_SIGNATURES') {
            executePrintOfficialDocumentsSignatureReport(delegate!, reportDate);
          } else if (targetReport === 'GENERAL') {
            handleDelegateForGeneralReport(delegate, reportDate);
          } else if (targetReport === 'AUTHORIZATION' && authType) {
            executePrintAuthorization(delegate, authType);
          }
          setShowDelegateModal(false);
        }}
        isOptional={targetReport === 'GENERAL'}
        mode={targetReport === 'AUTHORIZATION' ? 'authorization' : 'default'}
      />

      {/* Edit Report Data Modal */}
      {reportEditingState && (
        <EditReportDataModal
          isOpen={showEditReportModal}
          onClose={() => setShowEditReportModal(false)}
          onConfirm={(data, rDate) => handleConfirmEditReport(data, rDate)}
          sections={reportEditingState?.sections}
          initialData={reportEditingState?.data}
          columns={reportEditingState?.columns}
          title={reportEditingState?.title || ''}
          initialReportDate={reportEditingState?.reportDate}
        />
      )}

      {/* Payment Alert Modal */}
      {showPaymentAlert && paymentAlertOrder && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
          <div className='bg-white rounded-3xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200 overflow-hidden'>
            <div className='p-8 border-b bg-amber-50 relative'>
              <div className='absolute top-4 right-4 text-4xl opacity-20'>⚠️</div>
              <h3 className='text-2xl font-bold text-amber-900 mb-1'>يوجد مبالغ مستحقة</h3>
              <p className='text-amber-700 font-bold text-sm'>
                لا يمكن التسليم بدون سداد الرصيد المتبقي
              </p>
            </div>

            <div className='p-8'>
              <div className='bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100 italic'>
                <p className='text-slate-700 font-bold'>
                  لا يزال هناك{' '}
                  <span className='font-bold text-amber-600 text-xl mx-1'>
                    {((paymentAlertOrder.remainingAmount || 0) / 100).toFixed(2)} ج.م
                  </span>{' '}
                  مستحقة على هذا الطلب.
                </p>
              </div>

              <div className='space-y-4'>
                <label className='block text-sm font-black text-slate-700'>
                  اختر طريقة الدفع للسداد الآن:
                </label>
                <select
                  value={quickPayMethod}
                  onChange={e => setQuickPayMethod(e.target.value)}
                  className='w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-lg font-black text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 transition-all'
                >
                  <option value='CASH'>💵 كاش</option>
                  <option value='INSTAPAY'>🏦 إنستا باي</option>
                  <option value='WALLET'>📱 محفظة إلكترونية</option>
                </select>
              </div>
            </div>

            <div className='p-8 border-t bg-slate-50 flex flex-col gap-3'>
              <button
                onClick={async () => {
                  try {
                    // 1. Record payment
                    const payRes = await fetch(
                      `/api/admin/orders/${paymentAlertOrder.id}/payment`,
                      {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          method: quickPayMethod,
                          amount: paymentAlertOrder.remainingAmount || 0,
                          discount: 0,
                          notes: 'دفع سريع عند التسليم',
                          workDate: new Date().toLocaleDateString('en-GB').replace(/\//g, '-'), // Basic fallback
                        }),
                      }
                    );

                    if (!payRes.ok) throw new Error('فشل تسجيل الدفع');

                    // 2. Update status
                    if (pendingStatus) {
                      await updateOrderStatus(paymentAlertOrder.id, pendingStatus);
                    }

                    setShowPaymentAlert(false);
                    setPaymentAlertOrder(null);
                    setPendingStatus(null);
                  } catch (error) {
                    showError('خطأ', 'حدث خطأ أثناء معالجة الدفع السريع');
                  }
                }}
                className='w-full justify-center rounded-2xl bg-emerald-600 px-6 py-4 text-lg font-black text-white shadow-xl shadow-emerald-100 hover:bg-emerald-500 transition-all active:scale-[0.98] flex items-center gap-2'
              >
                ✅ تسجيل الدفع والتسليم
              </button>
              <button
                onClick={() => {
                  setShowPaymentAlert(false);
                  setPaymentAlertOrder(null);
                  setPendingStatus(null);
                }}
                className='w-full justify-center rounded-2xl bg-white px-6 py-4 text-lg font-black text-red-600 shadow-sm ring-1 ring-inset ring-red-100 hover:bg-red-50 transition-all flex items-center gap-2'
              >
                ✖️ إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Reason Modal */}
      {showStatusReasonModal && pendingStatusReason && (
        <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
          <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-6'>
            <h3 className='text-xl font-black text-slate-900 mb-2'>
              {pendingStatusReason.newStatus === 'settlement' ? '⚠️ سبب الاستيفاء' : '↩️ سبب المرتجع'}
            </h3>
            <p className='text-slate-500 text-sm mb-4'>اكتب السبب ليظهر في تفاصيل الطلب</p>
            <textarea
              value={statusReasonText}
              onChange={e => setStatusReasonText(e.target.value)}
              placeholder='اكتب السبب هنا...'
              rows={3}
              className='w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-0 resize-none transition-colors'
              autoFocus
            />
            <div className='flex gap-3 mt-4'>
              <button
                onClick={() => { setShowStatusReasonModal(false); setPendingStatusReason(null); }}
                className='flex-1 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50'
              >
                إلغاء
              </button>
              <button
                onClick={async () => {
                  if (!pendingStatusReason) return;
                  await updateOrderStatus(pendingStatusReason.orderId, pendingStatusReason.newStatus, undefined, statusReasonText);
                  setShowStatusReasonModal(false);
                  setPendingStatusReason(null);
                  setStatusReasonText('');
                }}
                className={`flex-1 py-3 rounded-xl font-bold text-white ${
                  pendingStatusReason.newStatus === 'settlement' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-rose-500 hover:bg-rose-600'
                }`}
              >
                تأكيد التغيير
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}
