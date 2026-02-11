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
  const handleDelegateForGeneralReport = (delegate?: any) => {
     setShowDelegateModal(false);

     // Prepare data for editing
     const ordersToPrint = selectedOrders.length > 0 
        ? currentOrders.filter(order => selectedOrders.includes(order.id)) 
        : filteredOrders;

     if (ordersToPrint.length === 0) {
        showError('تنبيه', 'لا توجد طلبات للطباعة');
        return;
     }

     const classifyOrder = (o: Order) => {
        if (!o.service) return 'GENERAL';
        const name = o.service.name.toLowerCase();
        const slug = (o.service.slug || '').toLowerCase();
        
        if (name.includes('مترجم') && (name.includes('بطاقة') || slug === 'national-id')) return 'TRANSLATED_ID';
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
            (f: any) => !f.name || (!f.name.toLowerCase().includes('محضر') && !f.name.toLowerCase().includes('فقد'))
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
             marriageDate: order.marriageDate ? new Date(order.marriageDate).toLocaleDateString('ar-EG') : '',
             policeStation: order.policeStation || '',
             pickupLocation: order.pickupLocation || '',
             quantity: order.quantity || 1,
             sourceService: order.service // Keep ref
        };
     });

     mappedOrders.forEach(o => {
        const type = classifyOrder(o);
        const group = groupedOrders[type];
        if (group) group.push(o);
     });

     const sections: any[] = [];

     // 1. National ID
     if (groupedOrders.NATIONAL_ID && groupedOrders.NATIONAL_ID.length > 0) {
        sections.push({
            title: 'بطاقات الرقم القومي',
            data: groupedOrders.NATIONAL_ID,
            columns: [
                { key: 'customerName', label: 'الاسم' },
                { key: 'idNumber', label: 'الرقم القومي' },
                { key: 'overrideTotalFines', label: 'الغرامات', type: 'number' },
                { key: 'overrideDetails', label: 'التفاصيل' },
            ]
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
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
            ]
        });
     }

     setReportEditingState({
        type: 'GENERAL',
        sections: sections, // USE SECTIONS
        delegate: delegate || null, // Store selected delegate (or null)
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

    const reportData = selectedOrders
      .map(id => currentOrders.find(o => o.id === id))
      .filter(o => o)
      .map(order => ({
        name: order?.customerName || '',
        phone: order?.customerPhone || order?.user?.phone || '',
        note: ''
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
        ]
    });
    setShowEditReportModal(true);
  };

  // Translation Report Logic
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  /* REMOVED DUPLICATE */
  const [targetReport, setTargetReport] = useState<'TRANSLATION' | 'FAMILY' | 'GENERAL' | 'AUTHORIZATION' | 'ID_CARD_SIGNATURES' | 'OFFICIAL_DOCUMENTS_SIGNATURES'>('GENERAL');

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
    type: 'TRANSLATION' | 'FAMILY' | 'GENERAL' | 'ID_CARD_SIGNATURES' | 'OFFICIAL_DOCUMENTS_SIGNATURES' | 'PHONE';
    data?: any[]; // Legacy
    columns?: any[]; // Legacy
    sections?: any[]; // New
    delegate: any;
    title: string;
  } | null>(null);

  const handleConfirmEditReport = (finalData: any[]) => {
      if (!reportEditingState) return;
      
      const { type, delegate } = reportEditingState;
      
      if (type === 'TRANSLATION') {
           localStorage.setItem('temp_translation_report_data', JSON.stringify({
              orders: finalData,
              delegate: {
                  name: delegate.name,
                  idNumber: delegate.idNumber,
                  unionCard: delegate.unionCardFront || delegate.idCardFront || '' 
              }
           }));
           window.open('/admin/orders/print-translation-report', '_blank');
           setShowEditReportModal(false); // Close Modal

      } else if (type === 'FAMILY') {
           localStorage.setItem('temp_family_report_data', JSON.stringify({
              orders: finalData,
              delegate: {
                  name: delegate.name,
                  idNumber: delegate.idNumber,
                  unionCard: delegate.unionCardFront || delegate.idCardFront || '' 
              }
           }));
           window.open('/admin/orders/print-family-report', '_blank');
           setShowEditReportModal(false); // Close Modal
      } else if (type === 'ID_CARD_SIGNATURES') {
           localStorage.setItem('temp_id_card_signatures_report_data', JSON.stringify({
              orders: finalData,
              delegate: {
                  name: delegate.name,
                  idNumber: delegate.idNumber,
                  unionCard: delegate.unionCardFront || delegate.idCardFront || '' 
              }
           }));
           window.open('/admin/orders/print-id-card-signatures-report', '_blank');
           setShowEditReportModal(false); // Close Modal
      } else if (type === 'OFFICIAL_DOCUMENTS_SIGNATURES') {
           localStorage.setItem('temp_official_docs_signature_report_data', JSON.stringify({
              orders: finalData,
              delegate: {
                  name: delegate.name,
                  idNumber: delegate.idNumber,
                  unionCard: delegate.unionCardFront || delegate.idCardFront || '' 
              }
           }));
           window.open('/admin/orders/print-official-documents-signature-report', '_blank');
           setShowEditReportModal(false); // Close Modal
      } else if (type === 'PHONE') {
          localStorage.setItem('temp_phone_report_data', JSON.stringify(finalData));
           window.open('/admin/orders/print-phone-report', '_blank');
           setShowEditReportModal(false); // Close Modal
      } else if (type === 'GENERAL') {
          // Reconstruct orders with overrides
          
          printOrdersReport({
            orders: finalData, // These are the edited objects but keeping order structure
            selectedOrders: [], // All passed in 'orders' are to be printed
            filters: filters,
            delegate: delegate // Pass delegate info
          });
          setShowEditReportModal(false); // Close Modal
      }

      setReportEditingState(null);
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

    // OPEN EDIT MODAL INSTEAD OF PRINTING DIRECTLY
    setReportEditingState({
        type: 'TRANSLATION',
        data: reportData,
        delegate,
        title: 'مراجعة بيانات كشف الترجمة',
        columns: [
            { key: 'name', label: 'الاسم' },
            { key: 'idNumber', label: 'الرقم القومي / تاريخ الميلاد' },
            { key: 'source', label: 'المصدر' },
            { key: 'language', label: 'اللغة' },
            { key: 'quantity', label: 'العدد', type: 'number' },
        ]
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
           source: order?.destination || '', // Authority
           quantity
        };
      });

    // OPEN EDIT MODAL
    setReportEditingState({
        type: 'FAMILY',
        data: reportData,
        delegate,
        title: 'مراجعة بيانات كشف القيد العائلي',
        columns: [
            { key: 'name', label: 'الاسم' },
            { key: 'idNumber', label: 'الرقم القومي' },
            { key: 'source', label: 'الجهة' },
            { key: 'quantity', label: 'العدد', type: 'number' },
        ]
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

  const executePrintIdCardSignaturesReport = (delegate: any) => {
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

        // Card Type Logic (from variant name or defaulting to 'عادية')
        const variantName = order?.variant?.name || '';
        let cardType = 'عادية';
        if (variantName.includes('مستعجل')) cardType = 'مستعجلة';
        if (variantName.includes('VIP') || variantName.includes('vip')) cardType = 'VIP';

        return {
           name: order?.customerName || '',
           idNumber,
           cardType
        };
      });

    // OPEN EDIT MODAL
    setReportEditingState({
        type: 'ID_CARD_SIGNATURES',
        data: reportData,
        delegate,
        title: 'مراجعة بيانات كشف توقيعات البطاقة',
        columns: [
            { key: 'name', label: 'الاسم' },
            { key: 'idNumber', label: 'الرقم القومي' },
            { key: 'cardType', label: 'نوع البطاقة' },
        ]
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

  const executePrintOfficialDocumentsSignatureReport = (delegate: any) => {
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
           relation: order?.title || ''
        };
      });

    // OPEN EDIT MODAL
    setReportEditingState({
        type: 'OFFICIAL_DOCUMENTS_SIGNATURES',
        data: reportData,
        delegate,
        title: 'مراجعة بيانات كشف توقيعات المستخرجات',
        columns: [
            { key: 'name', label: 'الاسم' },
            { key: 'idNumber', label: 'الرقم القومي' },
            { key: 'source', label: 'المصدر' },
            { key: 'quantity', label: 'العدد', type: 'number' },
            { key: 'relation', label: 'الصفة' },
        ]
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
              onPrintIdCardSignaturesReport={handlePrintIdCardSignaturesReport}
              onPrintOfficialDocumentsSignatureReport={handlePrintOfficialDocumentsSignatureReport}
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
              executePrintTranslationReport(delegate!);
           } else if (targetReport === 'FAMILY') {
              executePrintFamilyReport(delegate!);
           } else if (targetReport === 'ID_CARD_SIGNATURES') {
              executePrintIdCardSignaturesReport(delegate!);
           } else if (targetReport === 'OFFICIAL_DOCUMENTS_SIGNATURES') {
              executePrintOfficialDocumentsSignatureReport(delegate!);
           } else if (targetReport === 'GENERAL') {
              handleDelegateForGeneralReport(delegate);
           } else if (targetReport === 'AUTHORIZATION' && authType) {
                 executePrintAuthorization(delegate, authType);
             }
        }}
        isOptional={targetReport === 'GENERAL'}
        mode={targetReport === 'AUTHORIZATION' ? 'authorization' : 'default'}
      />

      {/* Edit Report Data Modal */}
      {reportEditingState && (
        <EditReportDataModal
            isOpen={showEditReportModal}
            onClose={() => setShowEditReportModal(false)}
            onConfirm={handleConfirmEditReport}
            initialData={reportEditingState.data || []}
            columns={reportEditingState.columns || []}
            sections={reportEditingState.sections || []} // Pass sections
            title={reportEditingState.title}
        />
      )}

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </>
  );
}
