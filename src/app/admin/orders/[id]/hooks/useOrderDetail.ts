'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/Toast';
import { Order, getStatusBadge } from '../types';
import { hasPermission } from '@/lib/permissions';

export function useOrderDetail(orderId: string) {
  const { data: session } = useSession();
  const router = useRouter();
  const { showSuccess, showError } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Section Edit States
  const [editingSections, setEditingSections] = useState<Record<string, boolean>>({});

  // Form Serial State
  const [formSerialNumber, setFormSerialNumber] = useState('');
  const [checkingSerial, setCheckingSerial] = useState(false);
  const [serialError, setSerialError] = useState('');

  // Status Update State
  const [newStatus, setNewStatus] = useState('');
  const [newAdminNotes, setNewAdminNotes] = useState('');

  // Payment Form State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentData, setPaymentData] = useState({
    method: 'VODAFONE_CASH',
    senderPhone: '',
    paymentScreenshot: '',
    amount: 0,
    discount: 0,
    notes: '',
  });

  // WhatsApp Modal State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState('');
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Payment Alert State
  const [showPaymentAlert, setShowPaymentAlert] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setNewStatus(data.order.status);
        setNewAdminNotes(data.order.adminNotes || '');

        if (data.order.payment) {
          setPaymentData({
            method: data.order.payment.method,
            senderPhone: data.order.payment.senderPhone || '',
            paymentScreenshot: data.order.payment.paymentScreenshot || '',
            amount: (data.order.payment.amount || 0) / 100,
            discount: (data.order.discount || 0) / 100,
            notes: data.order.payment.notes || '',
          });
        } else {
          setPaymentData(prev => ({
            ...prev,
            discount: (data.order.discount || 0) / 100,
          }));
        }
      } else {
        setTimeout(() => router.push('/admin/orders'), 2000);
      }
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId, fetchOrderDetails]);

  const toggleEditing = (section: string) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const updateOrderField = async (fields: Partial<Order>, section?: string) => {
    if (!order) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(prev => (prev ? { ...prev, ...data.order } : data.order));
        showSuccess('تم التحديث بنجاح! ✅', 'تم حفظ التغييرات بنجاح');
        if (section) toggleEditing(section);
      } else {
        showError('فشل التحديث', 'حدث خطأ أثناء حفظ التغييرات');
      }
    } catch (error) {
      showError('خطأ في الاتصال', 'حدث خطأ غير متوقع');
    } finally {
      setUpdating(false);
    }
  };

  const getCurrentWorkDate = useCallback(() => {
    if (session?.user) {
      const user = session.user as any;
      if (hasPermission(user, 'MANAGE_ORDERS')) {
        const sessionWorkDate = user.workDate;
        const localWorkDate =
          typeof window !== 'undefined' ? localStorage.getItem('adminWorkDate') : null;
        return sessionWorkDate || localWorkDate;
      }
    }
    return null;
  }, [session]);

  const checkFormSerial = async () => {
    if (!formSerialNumber.trim() || !order) return;

    setCheckingSerial(true);
    setSerialError('');

    try {
      const response = await fetch('/api/admin/forms/check-serial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serialNumber: formSerialNumber,
          serviceId: order.service.id,
          variantId: order.variant.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSerialError('');
        return true;
      } else {
        setSerialError(data.error || 'رقم الاستمارة غير صحيح');
        return false;
      }
    } catch (error) {
      setSerialError('حدث خطأ أثناء التحقق من رقم الاستمارة');
      return false;
    } finally {
      setCheckingSerial(false);
    }
  };

  const addFormSerial = async () => {
    if (!formSerialNumber.trim() || !order) return;

    const isValid = await checkFormSerial();
    if (!isValid) return;

    setUpdating(true);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/add-form-serial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serialNumber: formSerialNumber }),
      });

      const data = await response.json();

      if (data.success) {
        setFormSerialNumber('');
        setSerialError('');
        await fetchOrderDetails();
        showSuccess(
          'تم ربط رقم الاستمارة بنجاح! 📋',
          `تم ربط رقم الاستمارة ${formSerialNumber} بالطلب بنجاح`
        );
      } else {
        setSerialError(data.error || 'حدث خطأ أثناء ربط رقم الاستمارة');
        showError('فشل في ربط رقم الاستمارة', data.error || 'حدث خطأ أثناء ربط رقم الاستمارة');
      }
    } catch (error) {
      setSerialError('حدث خطأ أثناء ربط رقم الاستمارة');
    } finally {
      setUpdating(false);
    }
  };

  const updateOrder = async (force = false) => {
    if (!order) return;

    // Check for outstanding balance when delivering
    if (!force && newStatus === 'delivered' && (order.remainingAmount || 0) > 0) {
      setShowPaymentAlert(true);
      return;
    }

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: newAdminNotes,
        }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder.order);
        showSuccess('تم تحديث الطلب بنجاح! ✅', 'تم حفظ التغييرات بنجاح');
      } else {
        showError('فشل في تحديث الطلب', 'حدث خطأ أثناء تحديث الطلب');
      }
    } catch (error) {
      showError('خطأ في الاتصال', 'حدث خطأ أثناء تحديث الطلب. يرجى المحاولة مرة أخرى');
    } finally {
      setUpdating(false);
    }
  };

  const updatePayment = async () => {
    if (!order) return;

    try {
      const paymentRequestData = {
        ...paymentData,
        amount: Math.round(paymentData.amount * 100),
        discount: Math.round(paymentData.discount * 100),
        workDate: getCurrentWorkDate(),
      };

      const response = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequestData),
      });

      if (response.ok) {
        showSuccess('تم تحديث معلومات الدفع بنجاح! 💰', 'تم حفظ معلومات الدفع بنجاح');
        fetchOrderDetails();
        setShowPaymentForm(false);
      } else {
        showError('فشل في تحديث معلومات الدفع', 'حدث خطأ أثناء تحديث معلومات الدفع');
      }
    } catch (error) {
      showError('خطأ في الاتصال', 'حدث خطأ أثناء تحديث معلومات الدفع. يرجى المحاولة مرة أخرى');
    }
  };

  const quickPayAndDeliver = async (method: string) => {
    if (!order) return;
    setUpdating(true);
    try {
      // 1. Record payment for full remaining amount
      const remainingAmount = order.remainingAmount || 0;
      const paymentRequestData = {
        method,
        amount: remainingAmount,
        discount: 0,
        notes: 'دفع سريع عند التسليم',
        workDate: getCurrentWorkDate(),
      };

      const payRes = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequestData),
      });

      if (!payRes.ok) {
        throw new Error('فشل تسجيل الدفع');
      }

      // 2. Update status to the intended newStatus (delivered or settlement)
      const statusRes = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: newAdminNotes,
        }),
      });

      if (statusRes.ok) {
        const updatedOrder = await statusRes.json();
        setOrder(updatedOrder.order);
        showSuccess('تم الدفع والتسليم بنجاح! ✅', 'تم تحديث حالة الطلب وتسجيل الدفع');
        setShowPaymentAlert(false);
      } else {
        showError('فشل تحديث الحالة', 'تم تسجيل الدفع ولكن فشل تحديث حالة الطلب');
      }
    } catch (error) {
      showError('خطأ', 'حدث خطأ أثناء معالجة الطلب');
    } finally {
      setUpdating(false);
    }
  };

  const uploadDocument = async (name: string, file: File | null) => {
    if (!name.trim()) {
      showError('بيانات ناقصة', 'يرجى إدخال اسم المرفق');
      return;
    }

    if (!file) {
      // Add to attachedDocuments text list
      try {
        const currentDocs =
          typeof order?.attachedDocuments === 'string'
            ? JSON.parse(order.attachedDocuments)
            : order?.attachedDocuments || [];

        const newDocs = [...currentDocs, name.trim()];

        await updateOrderField({
          attachedDocuments: JSON.stringify(newDocs),
          hasAttachments: true,
        });
        showSuccess('تمت الإضافة', `تم إضافة "${name.trim()}" للمستندات`);
        return;
      } catch (error) {
        showError('خطأ', 'فشل في تحديث قائمة المرفقات');
        return;
      }
    }

    setUpdating(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('files', file);

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formDataUpload });
      if (!uploadRes.ok) throw new Error('فشل رفع الملف');

      const uploadData = await uploadRes.json();
      const uploadedFile = uploadData.files[0];

      const response = await fetch(`/api/admin/orders/${orderId}/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: name.trim(),
          filePath: uploadedFile.filename,
          fileSize: uploadedFile.fileSize,
          fileType: uploadedFile.fileType,
        }),
      });

      if (response.ok) {
        showSuccess('تم رفع المستند بنجاح! 📁', `تمت إضافة "${name.trim()}" للطلب`);
        fetchOrderDetails();
      } else {
        showError('فشل إضافة المستند', 'حدث خطأ أثناء ربط الملف بالطلب');
      }
    } catch (error) {
      showError('خطأ في الرفع', 'تعذر رفع الملف في الوقت الحالي');
    } finally {
      setUpdating(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المستند؟')) return;

    setUpdating(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/documents?docId=${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('تم حذف المستند بنجاح! 🗑️', 'تمت إزالة الملف من الطلب');
        fetchOrderDetails();
      } else {
        showError('فشل الحذف', 'حدث خطأ أثناء حذف المستند');
      }
    } catch (error) {
      showError('خطأ في الاتصال', 'تعذر حذف المستند في الوقت الحالي');
    } finally {
      setUpdating(false);
    }
  };

  const removeAttachedDocument = async (index: number) => {
    if (!order || !confirm('هل أنت متأكد من إزالة هذا المرفق؟')) return;

    try {
      const currentDocs =
        typeof order.attachedDocuments === 'string'
          ? JSON.parse(order.attachedDocuments)
          : order.attachedDocuments || [];

      const newDocs = currentDocs.filter((_: any, i: number) => i !== index);

      await updateOrderField({ attachedDocuments: JSON.stringify(newDocs) });
    } catch (error) {
      showError('خطأ', 'فشل في تحديث قائمة المرفقات');
    }
  };

  const sendWhatsApp = async () => {
    if (!order) return;

    const phone =
      order.customerPhone && order.customerPhone !== 'unknown'
        ? order.customerPhone
        : order.user?.phone && order.user.phone !== 'unknown'
          ? order.user.phone
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
      } else {
        showError('فشل إرسال الرسالة', data.error || 'حدث خطأ أثناء إرسال الرسالة');
      }
    } catch (error) {
      // console.error('WhatsApp Error:', error);
      showError(
        'خطأ في الاتصال',
        'تأكد من أن بوت الواتساب متصل. التفاصيل: ' + (error as Error).message
      );
    } finally {
      setSendingWhatsApp(false);
    }
  };

  const deleteOrder = async () => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) return;

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showSuccess('تم حذف الطلب بنجاح! 🗑️', 'تم حذف الطلب نهائياً من النظام');
        setTimeout(() => router.push('/admin/orders'), 1500);
      } else {
        showError('فشل في حذف الطلب', 'حدث خطأ أثناء حذف الطلب');
      }
    } catch (error) {
      showError('خطأ في الاتصال', 'حدث خطأ أثناء حذف الطلب. يرجى المحاولة مرة أخرى');
    }
  };

  const printWorkOrder = () => {
    if (!order) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const currentDate = new Date().toLocaleDateString('ar-EG');
    const settlementDate = new Date().toLocaleDateString('ar-EG');
    const deliveryDate = order.estimatedCompletionDate
      ? new Date(order.estimatedCompletionDate).toLocaleDateString('ar-EG')
      : '----';

    const statusInfo = getStatusBadge(order.status);

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>أمر شغل - ${order.id}</title>
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
            <tr>
              <td>${settlementDate}</td>
              <td>${order.customerName}</td>
              <td>${statusInfo.text}</td>
              <td>${deliveryDate}</td>
            </tr>
          </tbody>
        </table>
        
        <div class="footer">
          <p>تم إنشاء هذا التقرير في: ${currentDate}</p>
          <p>رقم الطلب: ${order.id}</p>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return {
    order,
    loading,
    updating,
    editingSections,
    toggleEditing,
    updateOrderField,

    formSerialNumber,
    setFormSerialNumber,
    checkingSerial,
    serialError,
    newStatus,
    setNewStatus,
    newAdminNotes,
    setNewAdminNotes,
    showPaymentForm,
    setShowPaymentForm,
    paymentData,
    setPaymentData,
    showWhatsAppModal,
    setShowWhatsAppModal,
    whatsappMessage,
    setWhatsappMessage,
    sendingWhatsApp,
    selectedTemplate,
    setSelectedTemplate,

    // Handlers
    addFormSerial,
    updateOrder,
    updatePayment,
    sendWhatsApp,
    deleteOrder,
    printWorkOrder,
    fetchOrderDetails,
    showPaymentAlert,
    setShowPaymentAlert,
    uploadDocument,
    quickPayAndDeliver,
    deleteDocument,
    removeAttachedDocument,
  };
}
