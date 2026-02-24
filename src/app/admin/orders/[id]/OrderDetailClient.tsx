'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { hasPermission } from '@/lib/permissions';
import {
  PREDEFINED_FINES,
  calculateActualFineAmounts,
  calculateFineExpenses,
  calculateLostReportForServices,
  Fine,
} from '@/constants/fines';
import { useToast } from '@/components/Toast';

interface OrderDetailClientProps {
  order: any;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [currentOrder, setCurrentOrder] = useState(order);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Status reason modal
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState('');
  const [statusReasonInput, setStatusReasonInput] = useState('');

  // WhatsApp modal state
  const [showWaModal, setShowWaModal] = useState(false);
  const [waTemplates, setWaTemplates] = useState<{ id: string; title: string; body: string }[]>([]);
  const [waMessage, setWaMessage] = useState('');
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Independent State for inline editing
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');
  const [isEditingService, setIsEditingService] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);

  // Fines state
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [finesList] = useState<Fine[]>(PREDEFINED_FINES);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [showFinesDropdown, setShowFinesDropdown] = useState(false);
  const [finesSearchTerm, setFinesSearchTerm] = useState('');
  const [servicesSearchTerm, setServicesSearchTerm] = useState('');
  const [manualServices, setManualServices] = useState<{ [key: string]: number }>({});
  const [isEditingFines, setIsEditingFines] = useState(false);

  // Initialize fines from order
  useEffect(() => {
    if (currentOrder.selectedFines) {
      try {
        const fines = JSON.parse(currentOrder.selectedFines);
        if (Array.isArray(fines)) setSelectedFines(fines);
      } catch (e) {
        // Fallback for non-JSON or malformed data
      }
    }

    if (currentOrder.servicesDetails) {
      try {
        const services = JSON.parse(currentOrder.servicesDetails);
        if (Array.isArray(services)) {
          const manual: { [key: string]: number } = {};
          services.forEach((s: any) => {
            if (s.id && s.id !== 'service_001') {
              manual[s.id] = s.amount / 100;
            }
          });
          setManualServices(manual);
        }
      } catch (e) {}
    }
  }, [currentOrder.selectedFines, currentOrder.servicesDetails]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'IN_PROGRESS':
        return 'bg-blue-50 text-blue-700 border-blue-100';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'CANCELLED':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'في الانتظار';
      case 'IN_PROGRESS':
        return 'قيد التنفيذ';
      case 'COMPLETED':
        return 'مكتملة';
      case 'CANCELLED':
        return 'ملغية';
      default:
        return status;
    }
  };

  // Load WhatsApp templates
  const loadTemplates = useCallback(async () => {
    if (waTemplates.length > 0) return;
    setTemplatesLoading(true);
    try {
      const res = await fetch('/api/admin/whatsapp/templates');
      const data = await res.json();
      if (data.success) setWaTemplates(data.templates);
    } finally {
      setTemplatesLoading(false);
    }
  }, [waTemplates.length]);

  // Open WhatsApp modal
  const openWaModal = () => {
    const phone = currentOrder.customerPhone;
    if (!phone || phone.trim() === '' || phone === 'غير محدد') {
      alert('رقم الهاتف غير متوفر');
      return;
    }
    setWaMessage('');
    setShowWaModal(true);
    loadTemplates();
  };

  // Send to wa.me
  const sendWhatsAppMessage = () => {
    if (!waMessage.trim()) return;
    let phone = currentOrder.customerPhone.replace(/[\s\+]/g, '');
    if (phone.startsWith('0')) phone = '20' + phone.substring(1);
    else if (!phone.startsWith('20')) phone = '20' + phone;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(waMessage)}`, '_blank');
    setShowWaModal(false);
  };

  // Function to export order as text file
  const exportOrder = () => {
    const orderData = {
      orderId: order.id,
      service: order.service.name,
      variant: order.variant.name,
      customer: order.customerName || 'غير محدد',
      phone: order.customerPhone || 'غير محدد',
      email: order.customerEmail || 'غير محدد',
      address: order.address || 'غير محدد',
      total: (order.totalCents / 100).toFixed(2),
      status: getStatusText(order.status),
      date: new Date(order.createdAt).toLocaleDateString('ar-EG'),
      notes: order.notes || 'لا توجد ملاحظات',
    };

    const orderText = `
طلب رقم: ${orderData.orderId}
الخدمة: ${orderData.service}
النوع: ${orderData.variant}
العميل: ${orderData.customer}
الهاتف: ${orderData.phone}
البريد الإلكتروني: ${orderData.email}
 العنوان: ${orderData.address || 'غير محدد'}
السعر: ${orderData.total} جنيه
الحالة: ${orderData.status}
التاريخ: ${orderData.date}
الملاحظات: ${orderData.notes || 'لا توجد ملاحظات'}
    `.trim();

    const blob = new Blob([orderText], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `طلب_${order.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getCurrentWorkDate = () => {
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
  };

  const updateOrderStatus = async (newStatus: string, reason?: string) => {
    setIsUpdating(true);
    try {
      const requestData: any = {
        status: newStatus,
        workDate: getCurrentWorkDate(),
      };
      if (reason !== undefined) requestData.statusReason = reason;

      const response = await fetch(`/api/admin/orders/${currentOrder.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentOrder((prev: any) => ({
            ...prev,
            status: newStatus,
            statusReason: reason ?? prev.statusReason,
          }));
          setSuccessMessage(result.message);
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }
      } else {
        alert('حدث خطأ أثناء تحديث حالة الطلب');
      }
    } catch (error) {
      // alert('حدث خطأ أثناء تحديث حالة الطلب');
    } finally {
      setIsUpdating(false);
    }
  };

  // Intercept status change - show reason modal for settlement/returned
  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'settlement' || newStatus === 'returned') {
      setPendingStatus(newStatus);
      setStatusReasonInput('');
      setShowReasonModal(true);
    } else {
      updateOrderStatus(newStatus);
    }
  };

  const confirmStatusWithReason = () => {
    updateOrderStatus(pendingStatus, statusReasonInput);
    setShowReasonModal(false);
    setStatusReasonInput('');
    setPendingStatus('');
  };

  // Inline Editing Handlers
  const handleStartEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value || '');
  };

  const handleSaveField = async () => {
    if (!editingField) return;

    try {
      let finalValue: any = tempValue;
      const isFinancialField = [
        'quantity',
        'deliveryFee',
        'otherFees',
        'discount',
        'photographyLocation',
      ].includes(editingField);

      // Parse numeric fields
      if (['quantity', 'deliveryFee', 'otherFees', 'discount'].includes(editingField)) {
        finalValue = parseFloat(tempValue) || 0;
      }

      // Handle Date fields
      if (editingField === 'photographyDate' && tempValue) {
        finalValue = new Date(tempValue).toISOString();
      }

      const body: any = { [editingField]: finalValue };
      let newTotalCents = currentOrder.totalCents;

      // If it's a financial field, we need to recalculate the total
      if (isFinancialField || editingField === 'policeStation') {
        // We need to update currentOrder locally first so calculateTotalPrice sees the new value
        const updatedTempOrder = { ...currentOrder, [editingField]: finalValue };

        // Temporarily set currentOrder to calculate total accurately
        // (Wait, calculateTotalPrice uses state, so let's pass the override to it)
        newTotalCents = calculateTotalPriceOverride(updatedTempOrder);
        body.totalCents = newTotalCents;
      }

      const response = await fetch(`/api/admin/orders/${currentOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentOrder((prev: any) => ({
            ...prev,
            [editingField]: finalValue,
            totalCents: body.totalCents !== undefined ? body.totalCents : prev.totalCents,
          }));
          setEditingField(null);
          setSuccessMessage('تم التحديث بنجاح');
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }
      } else {
        alert('فشل التحديث');
      }
    } catch (error) {
      alert('فشل التحديث');
    }
  };

  // Helper for recalculation during inline edits
  const calculateTotalPriceOverride = (overriddenOrder: any) => {
    if (!overriddenOrder.variant) return 0;
    let total = overriddenOrder.variant.priceCents * overriddenOrder.quantity;

    // Photography fee
    if (overriddenOrder.photographyLocation === 'dandy_mall') total += 200 * 100;
    else if (overriddenOrder.photographyLocation === 'civil_registry_haram') total += 50 * 100;
    else if (overriddenOrder.photographyLocation === 'home_photography') total += 200 * 100;

    // Delivery fee
    if (overriddenOrder.deliveryType === 'ADDRESS')
      total += (overriddenOrder.deliveryFee || 0) * 100;

    // Fines
    total += calculateActualFineAmounts(selectedFines, finesList);
    total += calculateFineExpenses(selectedFines, finesList);
    total += calculateLostReportForServices(selectedFines, finesList);

    // Manual services
    const manualServicesTotal = Object.values(manualServices).reduce(
      (sum, amount) => sum + (Number(amount) || 0) * 100,
      0
    );
    total += manualServicesTotal;

    // Other fees
    total += (overriddenOrder.otherFees || 0) * 100;

    // Passport Surcharge logic
    const isPassportService =
      overriddenOrder.service.name.includes('جواز') || overriddenOrder.service.name.includes('سفر');

    if (
      isPassportService &&
      (overriddenOrder.variant.name.includes('عادي') ||
        overriddenOrder.variant.name.includes('سريع'))
    ) {
      const station = overriddenOrder.policeStation?.trim();
      if (['العجوزة', 'الشيخ زايد', '6 أكتوبر'].includes(station)) {
        total += 20000;
      }
    }

    // Discount
    const discountAmount = overriddenOrder.discount || 0;
    total -= discountAmount;

    return Math.max(0, total);
  };

  // Fine Handlers
  const handleFineToggle = useCallback(
    (fineId: string) => {
      setSelectedFines(prev => {
        let newSelectedFines;
        if (prev.includes(fineId)) {
          newSelectedFines = prev.filter(id => id !== fineId);
        } else {
          newSelectedFines = [...prev, fineId];
        }
        // Auto-select مصاريف غرامة
        const hasActualFines = newSelectedFines.some(id => {
          const fine = finesList.find(f => f.id === id);
          return fine?.category === 'غرامات' && id !== 'fine_004';
        });
        if (hasActualFines && !newSelectedFines.includes('service_001')) {
          newSelectedFines = [...newSelectedFines, 'service_001'];
        } else if (!hasActualFines && newSelectedFines.includes('service_001')) {
          newSelectedFines = newSelectedFines.filter(id => id !== 'service_001');
        }
        return newSelectedFines;
      });
    },
    [finesList]
  );

  const handleManualServiceChange = useCallback((serviceId: string, amount: number) => {
    setManualServices(prev => ({ ...prev, [serviceId]: amount }));
  }, []);

  const calculateTotalPrice = useCallback(() => {
    if (!currentOrder.variant) return 0;
    let total = currentOrder.variant.priceCents * currentOrder.quantity;

    // Photography fee (logic from useCreateOrder)
    if (currentOrder.photographyLocation === 'dandy_mall') total += 200 * 100;
    else if (currentOrder.photographyLocation === 'civil_registry_haram') total += 50 * 100;
    else if (currentOrder.photographyLocation === 'home_photography') total += 200 * 100;

    // Delivery fee
    if (currentOrder.deliveryType === 'ADDRESS') total += (currentOrder.deliveryFee || 0) * 100;

    // Fines
    total += calculateActualFineAmounts(selectedFines, finesList);
    total += calculateFineExpenses(selectedFines, finesList);
    total += calculateLostReportForServices(selectedFines, finesList);

    // Manual services
    const manualServicesTotal = Object.values(manualServices).reduce(
      (sum, amount) => sum + (Number(amount) || 0) * 100,
      0
    );
    total += manualServicesTotal;

    // Other fees
    total += (currentOrder.otherFees || 0) * 100;

    // Passport Surcharge logic
    const isPassportService =
      currentOrder.service.name.includes('جواز') || currentOrder.service.name.includes('سفر');

    if (
      isPassportService &&
      (currentOrder.variant.name.includes('عادي') || currentOrder.variant.name.includes('سريع'))
    ) {
      const station = currentOrder.policeStation?.trim();
      if (['العجوزة', 'الشيخ زايد', '6 أكتوبر'].includes(station)) {
        total += 20000;
      }
    }

    // Discount
    const discountAmount = currentOrder.discount || 0;
    total -= discountAmount;

    return Math.max(0, total);
  }, [
    currentOrder.variant,
    currentOrder.quantity,
    currentOrder.photographyLocation,
    currentOrder.deliveryType,
    currentOrder.deliveryFee,
    currentOrder.otherFees,
    currentOrder.discount,
    currentOrder.service.name,
    currentOrder.policeStation,
    selectedFines,
    finesList,
    manualServices,
  ]);

  const saveFinesChanges = async () => {
    setIsUpdating(true);
    try {
      const newTotalCents = calculateTotalPrice();
      const finesDetails = selectedFines
        .filter(id => {
          const fine = finesList.find(f => f.id === id);
          return fine?.category === 'غرامات';
        })
        .map(fineId => {
          const fine = finesList.find(f => f.id === fineId);
          return { id: fineId, name: fine?.name || '', amount: fine?.amountCents || 0 };
        });

      const servicesDetails = selectedFines
        .filter(id => {
          const fine = finesList.find(f => f.id === id);
          return fine?.category === 'خدمات اضافية';
        })
        .map(serviceId => {
          const service = finesList.find(f => f.id === serviceId);
          const manualAmount = manualServices[serviceId] || 0;
          return {
            id: serviceId,
            name: service?.name || '',
            amount:
              serviceId === 'service_001'
                ? calculateActualFineAmounts(selectedFines, finesList)
                : manualAmount * 100,
          };
        });

      const response = await fetch(`/api/admin/orders/${currentOrder.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedFines: selectedFines,
          finesDetails: finesDetails,
          servicesDetails: servicesDetails,
          totalCents: newTotalCents,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCurrentOrder((prev: any) => ({
            ...prev,
            selectedFines: JSON.stringify(selectedFines),
            finesDetails: JSON.stringify(finesDetails),
            servicesDetails: JSON.stringify(servicesDetails),
            totalCents: newTotalCents,
          }));
          setIsEditingFines(false);
          setSuccessMessage('تم تحديث الغرامات والحسابات بنجاح');
          setShowSuccessMessage(true);
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }
      } else {
        alert('فشل في حفظ التعديلات');
      }
    } catch (error) {
      alert('حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 font-sans pb-20'>
      {/* WhatsApp Message Modal */}
      {showWaModal && (
        <div
          className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4'
          onClick={() => setShowWaModal(false)}
        >
          <div
            className='bg-white rounded-2xl shadow-2xl w-full max-w-lg'
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className='flex items-center justify-between px-6 py-4 border-b'>
              <div className='flex items-center gap-2'>
                <div className='w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center'>
                  <svg className='w-4 h-4 text-green-600' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
                  </svg>
                </div>
                <div>
                  <div className='font-bold text-gray-900 text-sm'>مراسلة العميل</div>
                  <div className='text-xs text-gray-400'>
                    {currentOrder.customerName} — {currentOrder.customerPhone}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowWaModal(false)}
                className='text-gray-400 hover:text-gray-600 text-xl leading-none'
              >
                ✕
              </button>
            </div>

            {/* Templates */}
            {templatesLoading ? (
              <div className='px-6 py-4 text-center text-gray-400 text-sm'>
                جاري تحميل الرسائل...
              </div>
            ) : waTemplates.length > 0 ? (
              <div className='px-6 pt-4'>
                <p className='text-xs font-bold text-gray-400 mb-2'>رسائل جاهزة</p>
                <div className='flex flex-col gap-2 max-h-40 overflow-y-auto'>
                  {waTemplates.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setWaMessage(t.body)}
                      className={`text-right px-3 py-2 rounded-xl border text-sm transition-colors ${
                        waMessage === t.body
                          ? 'border-green-400 bg-green-50 text-green-800 font-bold'
                          : 'border-gray-100 bg-gray-50 hover:border-green-300 hover:bg-green-50 text-gray-700'
                      }`}
                    >
                      <div className='font-bold text-xs'>{t.title}</div>
                      <div className='text-[11px] text-gray-400 truncate mt-0.5'>
                        {t.body.slice(0, 60)}...
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className='px-6 pt-4 text-xs text-gray-400 text-center'>
                لا توجد رسائل جاهزة — أضفها من صفحة إعدادات الواتساب
              </div>
            )}

            {/* Text area */}
            <div className='px-6 py-4'>
              <p className='text-xs font-bold text-gray-400 mb-2'>نص الرسالة</p>
              <textarea
                value={waMessage}
                onChange={e => setWaMessage(e.target.value)}
                rows={5}
                placeholder='اكتب رسالتك هنا أو اختر من الرسائل الجاهزة...'
                className='w-full border rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-400'
              />
            </div>

            {/* Footer */}
            <div className='flex gap-2 px-6 pb-5'>
              <button
                onClick={() => setShowWaModal(false)}
                className='flex-1 py-2.5 border rounded-xl text-sm text-gray-500 hover:bg-gray-50'
              >
                إلغاء
              </button>
              <button
                onClick={sendWhatsAppMessage}
                disabled={!waMessage.trim()}
                className='flex-1 py-2.5 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2'
              >
                <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                  <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
                </svg>
                إرسال على واتساب
              </button>
            </div>
          </div>
        </div>
      )}

      <div className='max-w-7xl mx-auto p-6 md:p-8 space-y-8'>
        {/* Success Toast */}
        {showSuccessMessage && (
          <div className='fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4'>
            <div className='bg-emerald-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 font-bold'>
              <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              {successMessage}
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className='bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6'>
          <div className='flex items-center gap-6'>
            <div className='w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100'>
              <span className='text-4xl'>📄</span>
            </div>
            <div>
              <div className='flex items-center gap-3 mb-2'>
                <h1 className='text-3xl font-black text-slate-900 tracking-tight'>تفاصيل الطلب</h1>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full border ${getStatusColor(currentOrder.status)}`}
                >
                  {getStatusText(currentOrder.status)}
                </span>
              </div>
              <p className='text-slate-500 font-mono text-lg'>#{currentOrder.id.slice(0, 8)}</p>
            </div>
          </div>

          <Link
            href='/admin/orders'
            className='px-6 py-3 bg-white text-slate-600 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 rounded-xl font-bold transition-all flex items-center gap-2 self-start md:self-auto'
          >
            <span>←</span>
            العودة للطلبات
          </Link>
        </div>

        {/* Status Reason Banner */}
        {currentOrder.statusReason &&
          (currentOrder.status === 'settlement' || currentOrder.status === 'returned') && (
            <div
              className={`rounded-2xl border-2 p-5 flex items-start gap-4 ${
                currentOrder.status === 'settlement'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-rose-50 border-rose-200'
              }`}
            >
              <span className='text-2xl mt-0.5'>
                {currentOrder.status === 'settlement' ? '⚠️' : '↩️'}
              </span>
              <div>
                <p
                  className={`font-black text-lg ${
                    currentOrder.status === 'settlement' ? 'text-amber-800' : 'text-rose-800'
                  }`}
                >
                  {currentOrder.status === 'settlement' ? 'سبب الاستيفاء' : 'سبب المرتجع'}
                </p>
                <p
                  className={`mt-1 text-base font-medium ${
                    currentOrder.status === 'settlement' ? 'text-amber-700' : 'text-rose-700'
                  }`}
                >
                  {currentOrder.statusReason}
                </p>
              </div>
            </div>
          )}

        {/* Reason Modal */}
        {showReasonModal && (
          <div className='fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-6'>
              <h3 className='text-xl font-black text-slate-900 mb-2'>
                {pendingStatus === 'settlement' ? '⚠️ سبب الاستيفاء' : '↩️ سبب المرتجع'}
              </h3>
              <p className='text-slate-500 text-sm mb-4'>اكتب السبب ليظهر في تفاصيل الطلب</p>
              <textarea
                value={statusReasonInput}
                onChange={e => setStatusReasonInput(e.target.value)}
                placeholder='اكتب السبب هنا...'
                rows={3}
                className='w-full border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-blue-500 focus:ring-0 resize-none transition-colors'
                autoFocus
              />
              <div className='flex gap-3 mt-4'>
                <button
                  onClick={() => {
                    setShowReasonModal(false);
                    setPendingStatus('');
                  }}
                  className='flex-1 py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50'
                >
                  إلغاء
                </button>
                <button
                  onClick={confirmStatusWithReason}
                  disabled={isUpdating}
                  className={`flex-1 py-3 rounded-xl font-bold text-white disabled:opacity-50 ${
                    pendingStatus === 'settlement'
                      ? 'bg-amber-500 hover:bg-amber-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                >
                  تأكيد التغيير
                </button>
              </div>
            </div>
          </div>
        )}

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Column */}
          <div className='lg:col-span-2 space-y-8'>
            {/* Status Card */}
            <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-8'>
              <h2 className='text-xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
                <span className='w-2 h-8 bg-blue-500 rounded-full'></span>
                حالة الطلب
              </h2>

              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1'>
                  <label className='block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2'>
                    الحالة الحالية
                  </label>
                  <div className='relative'>
                    <select
                      value={currentOrder.status}
                      onChange={e => handleStatusChange(e.target.value)}
                      disabled={isUpdating}
                      className='w-full appearance-none bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold focus:border-blue-500 focus:ring-0 transition-colors cursor-pointer disabled:opacity-50'
                    >
                      <option value='PENDING'>في الانتظار</option>
                      <option value='IN_PROGRESS'>قيد التنفيذ</option>
                      <option value='COMPLETED'>مكتملة</option>
                      <option value='CANCELLED'>ملغية</option>
                    </select>
                    <div className='absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500'>
                      <svg
                        className='w-4 h-4'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'
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
                </div>
                {isUpdating && (
                  <div className='flex items-center text-blue-600 font-bold animate-pulse px-4'>
                    جاري التحديث...
                  </div>
                )}
              </div>
            </div>

            {/* Service Details */}
            <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-8'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
                  <span className='w-2 h-8 bg-emerald-500 rounded-full'></span>
                  تفاصيل الخدمة
                </h2>
                {!isEditingService ? (
                  <button
                    onClick={() => setIsEditingService(true)}
                    className='px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold hover:bg-emerald-100 transition-all border border-emerald-100 flex items-center gap-2'
                  >
                    <span>تعديل التفاصيل</span>
                    <span className='text-lg'>📋</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingService(false);
                      setEditingField(null);
                    }}
                    className='px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all'
                  >
                    إغلاق التعديل
                  </button>
                )}
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8'>
                <div className='bg-slate-50 rounded-2xl p-4 border border-slate-100'>
                  <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                    اسم الخدمة
                  </p>
                  <p className='text-lg font-bold text-slate-900'>{currentOrder.service.name}</p>
                </div>
                <div className='bg-slate-50 rounded-2xl p-4 border border-slate-100'>
                  <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                    النوع
                  </p>
                  <p className='text-lg font-bold text-slate-900'>{currentOrder.variant.name}</p>
                </div>
                <div className='bg-slate-50 rounded-2xl p-4 border border-slate-100'>
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                      السعر الإجمالي
                    </p>
                  </div>
                  <p className='text-2xl font-black text-emerald-600'>
                    {(isEditingFines ? calculateTotalPrice() : currentOrder.totalCents) / 100} جنية
                  </p>
                </div>
                <div className='bg-slate-50 rounded-2xl p-4 border border-slate-100'>
                  <p className='text-xs font-bold text-slate-400 uppercase tracking-wider mb-1'>
                    المدة المتوقعة
                  </p>
                  <p className='text-lg font-bold text-slate-900'>
                    {currentOrder.variant.etaDays} يوم عمل
                  </p>
                </div>

                {/* Editable Quantity */}
                <div className='md:col-span-2 bg-emerald-50/30 rounded-2xl p-4 border border-emerald-100 hover:border-emerald-300 transition-colors group relative'>
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                      الكمية
                    </p>
                    {isEditingService && !editingField && (
                      <button
                        onClick={() =>
                          handleStartEdit('quantity', currentOrder.quantity.toString())
                        }
                        className='text-emerald-500 text-xs font-bold px-2 py-1 hover:bg-emerald-100 rounded-lg transition-all'
                      >
                        تعديل ✎
                      </button>
                    )}
                  </div>
                  {editingField === 'quantity' ? (
                    <div className='flex gap-2'>
                      <input
                        type='number'
                        autoFocus
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className='flex-1 bg-white border-2 border-emerald-200 rounded-lg px-3 py-1 text-sm font-bold focus:ring-0 focus:border-emerald-500'
                      />
                      <button
                        onClick={handleSaveField}
                        className='bg-green-500 text-white p-2 rounded-lg hover:bg-green-600'
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className='bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300'
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className='text-lg font-bold text-slate-900'>{currentOrder.quantity}</p>
                  )}
                </div>

                {/* Editable Fields - Police Station */}
                {(currentOrder.service.name.includes('جواز') ||
                  currentOrder.service.name.includes('سفر') ||
                  currentOrder.policeStation) && (
                  <div className='md:col-span-2 bg-blue-50/50 rounded-2xl p-4 border border-blue-100 hover:border-blue-300 transition-colors group relative'>
                    <div className='flex justify-between items-start mb-1'>
                      <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                        قسم الشرطة
                      </p>
                      {isEditingService && !editingField && (
                        <button
                          onClick={() =>
                            handleStartEdit('policeStation', currentOrder.policeStation)
                          }
                          className='text-blue-500 text-xs font-bold px-2 py-1 hover:bg-blue-100 rounded-lg transition-all'
                        >
                          تعديل ✎
                        </button>
                      )}
                    </div>
                    {editingField === 'policeStation' ? (
                      <div className='flex gap-2'>
                        <input
                          autoFocus
                          value={tempValue}
                          onChange={e => setTempValue(e.target.value)}
                          className='flex-1 bg-white border-2 border-blue-200 rounded-lg px-3 py-1 text-sm font-bold focus:ring-0 focus:border-blue-500'
                        />
                        <button
                          onClick={handleSaveField}
                          className='bg-green-500 text-white p-2 rounded-lg hover:bg-green-600'
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className='bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300'
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <p className='text-lg font-bold text-slate-900'>
                        {currentOrder.policeStation || (
                          <span className='text-slate-400 italic font-normal'>غير محدد</span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Editable Fields - Pickup Location */}
                {(currentOrder.service.name.includes('جواز') ||
                  currentOrder.service.name.includes('سفر') ||
                  currentOrder.pickupLocation) && (
                  <div className='md:col-span-2 bg-blue-50/50 rounded-2xl p-4 border border-blue-100 hover:border-blue-300 transition-colors group relative'>
                    <div className='flex justify-between items-start mb-1'>
                      <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                        مكان الاستلام
                      </p>
                      {isEditingService && !editingField && (
                        <button
                          onClick={() =>
                            handleStartEdit('pickupLocation', currentOrder.pickupLocation)
                          }
                          className='text-blue-500 text-xs font-bold px-2 py-1 hover:bg-blue-100 rounded-lg transition-all'
                        >
                          تعديل ✎
                        </button>
                      )}
                    </div>
                    {editingField === 'pickupLocation' ? (
                      <div className='flex gap-2'>
                        <input
                          autoFocus
                          value={tempValue}
                          onChange={e => setTempValue(e.target.value)}
                          className='flex-1 bg-white border-2 border-blue-200 rounded-lg px-3 py-1 text-sm font-bold focus:ring-0 focus:border-blue-500'
                        />
                        <button
                          onClick={handleSaveField}
                          className='bg-green-500 text-white p-2 rounded-lg hover:bg-green-600'
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className='bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300'
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <p className='text-lg font-bold text-slate-900'>
                        {currentOrder.pickupLocation || (
                          <span className='text-slate-400 italic font-normal'>غير محدد</span>
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Editable Fields - Capacity (الصفة) */}
                <div className='md:col-span-2 bg-purple-50/50 rounded-2xl p-4 border border-purple-100 hover:border-purple-300 transition-colors group relative'>
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                      الصفة
                    </p>
                    {isEditingService && !editingField && (
                      <button
                        onClick={() => handleStartEdit('title', currentOrder.title || '')}
                        className='text-purple-500 text-xs font-bold px-2 py-1 hover:bg-purple-100 rounded-lg transition-all'
                      >
                        تعديل ✎
                      </button>
                    )}
                  </div>
                  {editingField === 'title' ? (
                    <div className='flex gap-2'>
                      <input
                        type='text'
                        autoFocus
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        placeholder='اكتب الصفة...'
                        className='flex-1 bg-white border-2 border-purple-200 rounded-lg px-3 py-1 text-sm font-bold focus:ring-0 focus:border-purple-500'
                      />
                      <button
                        onClick={handleSaveField}
                        className='bg-green-500 text-white p-2 rounded-lg hover:bg-green-600'
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className='bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300'
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className='text-lg font-bold text-slate-900'>
                      {currentOrder.title || (
                        <span className='text-slate-400 italic font-normal'>غير محدد</span>
                      )}
                    </p>
                  )}
                </div>

                {/* Editable Fields - Photography Location (مكان التصوير) */}
                <div className='md:col-span-2 bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 hover:border-indigo-300 transition-colors group relative'>
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                      مكان التصوير
                    </p>
                    {isEditingService && !editingField && (
                      <button
                        onClick={() =>
                          handleStartEdit(
                            'photographyLocation',
                            currentOrder.photographyLocation || ''
                          )
                        }
                        className='text-indigo-500 text-xs font-bold px-2 py-1 hover:bg-indigo-100 rounded-lg transition-all'
                      >
                        تعديل ✎
                      </button>
                    )}
                  </div>
                  {editingField === 'photographyLocation' ? (
                    <div className='flex gap-2'>
                      <select
                        autoFocus
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className='flex-1 bg-white border-2 border-indigo-200 rounded-lg px-3 py-1 text-sm font-bold focus:ring-0 focus:border-indigo-500'
                      >
                        <option value=''>غير محدد</option>
                        <option value='dandy_mall'>داندي مول</option>
                        <option value='civil_registry_haram'>سجل مدني الهرم</option>
                        <option value='home_photography'>تصوير منزلي</option>
                        <option value='office'>تصوير في المكتب</option>
                      </select>
                      <button
                        onClick={handleSaveField}
                        className='bg-green-500 text-white p-2 rounded-lg hover:bg-green-600'
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className='bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300'
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className='text-lg font-bold text-slate-900'>
                      {currentOrder.photographyLocation === 'dandy_mall'
                        ? 'داندي مول'
                        : currentOrder.photographyLocation === 'civil_registry_haram'
                          ? 'سجل مدني الهرم'
                          : currentOrder.photographyLocation === 'home_photography'
                            ? 'تصوير منزلي'
                            : currentOrder.photographyLocation === 'office'
                              ? 'تصوير في المكتب'
                              : currentOrder.photographyLocation || (
                                  <span className='text-slate-400 italic font-normal'>
                                    غير محدد
                                  </span>
                                )}
                    </p>
                  )}
                </div>

                {/* Editable Fields - Capture Date (تاريخ التصوير) */}
                <div className='md:col-span-2 bg-teal-50/50 rounded-2xl p-4 border border-teal-100 hover:border-teal-300 transition-colors group relative'>
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-500 uppercase tracking-wider'>
                      تاريخ التصوير
                    </p>
                    {isEditingService && !editingField && (
                      <button
                        onClick={() => {
                          const val = currentOrder.photographyDate
                            ? new Date(currentOrder.photographyDate).toISOString().split('T')[0] ||
                              ''
                            : '';
                          handleStartEdit('photographyDate', val);
                        }}
                        className='text-teal-500 text-xs font-bold px-2 py-1 hover:bg-teal-100 rounded-lg transition-all'
                      >
                        تعديل ✎
                      </button>
                    )}
                  </div>
                  {editingField === 'photographyDate' ? (
                    <div className='flex gap-2'>
                      <input
                        type='date'
                        autoFocus
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className='flex-1 bg-white border-2 border-teal-200 rounded-lg px-3 py-1 text-sm font-bold focus:ring-0 focus:border-teal-500'
                      />
                      <button
                        onClick={handleSaveField}
                        className='bg-green-500 text-white p-2 rounded-lg hover:bg-green-600'
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className='bg-slate-200 text-slate-600 p-2 rounded-lg hover:bg-slate-300'
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className='text-lg font-bold text-slate-900'>
                      {currentOrder.photographyDate ? (
                        new Date(currentOrder.photographyDate).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      ) : (
                        <span className='text-slate-400 italic font-normal'>غير محدد</span>
                      )}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fines & Additional Services */}
            <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-8'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
                  <span className='w-2 h-8 bg-rose-500 rounded-full'></span>
                  الغرامات والخدمات الإضافية
                </h2>
                {!isEditingFines ? (
                  <button
                    onClick={() => setIsEditingFines(true)}
                    className='px-4 py-2 bg-rose-50 text-rose-600 rounded-xl font-bold hover:bg-rose-100 transition-all border border-rose-100 flex items-center gap-2'
                  >
                    <span>تعديل الغرامات</span>
                    <span className='text-lg'>⚖️</span>
                  </button>
                ) : (
                  <div className='flex gap-2'>
                    <button
                      onClick={() => {
                        setIsEditingFines(false);
                        // Reset state from order
                        if (currentOrder.selectedFines) {
                          try {
                            const fines = JSON.parse(currentOrder.selectedFines);
                            if (Array.isArray(fines)) setSelectedFines(fines);
                          } catch (e) {}
                        }
                        if (currentOrder.servicesDetails) {
                          try {
                            const services = JSON.parse(currentOrder.servicesDetails);
                            if (Array.isArray(services)) {
                              const manual: { [key: string]: number } = {};
                              services.forEach((s: any) => {
                                if (s.id && s.id !== 'service_001') {
                                  manual[s.id] = s.amount / 100;
                                }
                              });
                              setManualServices(manual);
                            }
                          } catch (e) {}
                        }
                      }}
                      className='px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all'
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={saveFinesChanges}
                      disabled={isUpdating}
                      className='px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-200 flex items-center gap-2'
                    >
                      {isUpdating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                    </button>
                  </div>
                )}
              </div>

              {!isEditingFines ? (
                <div className='space-y-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='p-4 bg-rose-50/50 rounded-2xl border border-rose-100'>
                      <p className='text-xs font-bold text-rose-400 uppercase tracking-wider mb-2'>
                        الغرامات المختارة
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {selectedFines.filter(
                          id => finesList.find(f => f.id === id)?.category === 'غرامات'
                        ).length > 0 ? (
                          selectedFines
                            .filter(id => finesList.find(f => f.id === id)?.category === 'غرامات')
                            .map(id => (
                              <span
                                key={id}
                                className='px-3 py-1 bg-white text-rose-700 rounded-lg text-xs font-bold border border-rose-200'
                              >
                                {finesList.find(f => f.id === id)?.name}
                              </span>
                            ))
                        ) : (
                          <span className='text-sm text-slate-400'>لا توجد غرامات</span>
                        )}
                      </div>
                    </div>
                    <div className='p-4 bg-sky-50/50 rounded-2xl border border-sky-100'>
                      <p className='text-xs font-bold text-sky-400 uppercase tracking-wider mb-2'>
                        الخدمات الإضافية
                      </p>
                      <div className='flex flex-wrap gap-2'>
                        {selectedFines.filter(
                          id => finesList.find(f => f.id === id)?.category === 'خدمات اضافية'
                        ).length > 0 ? (
                          selectedFines
                            .filter(
                              id => finesList.find(f => f.id === id)?.category === 'خدمات اضافية'
                            )
                            .map(id => (
                              <span
                                key={id}
                                className='px-3 py-1 bg-white text-sky-700 rounded-lg text-xs font-bold border border-sky-200'
                              >
                                {finesList.find(f => f.id === id)?.name}
                                {id !== 'service_001' && manualServices[id]
                                  ? ` (${manualServices[id]} ج)`
                                  : ''}
                              </span>
                            ))
                        ) : (
                          <span className='text-sm text-slate-400'>لا توجد خدمات إضافية</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {isEditingFines && (
                    <div className='p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-between'>
                      <span className='font-bold text-emerald-800'>الإجمالي المتوقع:</span>
                      <span className='text-2xl font-black text-emerald-600'>
                        {(calculateTotalPrice() / 100).toFixed(2)} جنيه
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className='space-y-6 animate-in fade-in slide-in-from-top-4 duration-300'>
                  {/* Fines Selection UI (similar to PaymentSection) */}
                  <div className='grid grid-cols-2 gap-4'>
                    <button
                      type='button'
                      onClick={() => {
                        setShowFinesDropdown(!showFinesDropdown);
                        setShowServicesDropdown(false);
                      }}
                      className={`flex flex-col items-center justify-center p-5 border rounded-2xl transition-all ${
                        showFinesDropdown
                          ? 'bg-rose-50 border-rose-200 text-rose-800 ring-4 ring-rose-500/10'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className='text-3xl mb-2'>⚖️</span>
                      <span className='text-base font-black'>غرامات</span>
                      <span className='text-xs font-bold mt-1 text-rose-600'>
                        {
                          selectedFines.filter(
                            id => finesList.find(f => f.id === id)?.category === 'غرامات'
                          ).length
                        }{' '}
                        محدد
                      </span>
                    </button>

                    <button
                      type='button'
                      onClick={() => {
                        setShowServicesDropdown(!showServicesDropdown);
                        setShowFinesDropdown(false);
                      }}
                      className={`flex flex-col items-center justify-center p-5 border rounded-2xl transition-all ${
                        showServicesDropdown
                          ? 'bg-sky-50 border-sky-200 text-sky-800 ring-4 ring-sky-500/10'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className='text-3xl mb-2'>➕</span>
                      <span className='text-base font-black'>خدمات إضافية</span>
                      <span className='text-xs font-bold mt-1 text-sky-600'>
                        {
                          selectedFines.filter(
                            id => finesList.find(f => f.id === id)?.category === 'خدمات اضافية'
                          ).length
                        }{' '}
                        محدد
                      </span>
                    </button>
                  </div>

                  {/* Dropdowns */}
                  {(showFinesDropdown || showServicesDropdown) && (
                    <div className='p-4 bg-slate-50 border border-slate-200 rounded-2xl max-h-[400px] overflow-hidden flex flex-col'>
                      {showFinesDropdown && (
                        <div className='space-y-3 flex flex-col h-full'>
                          <input
                            type='text'
                            placeholder='ابحث في الغرامات...'
                            value={finesSearchTerm}
                            onChange={e => setFinesSearchTerm(e.target.value)}
                            className='w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:border-rose-400 outline-none shadow-sm'
                            autoFocus
                          />
                          <div className='overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
                            {finesList
                              .filter(
                                f => f.category === 'غرامات' && f.name.includes(finesSearchTerm)
                              )
                              .map(f => (
                                <div
                                  key={f.id}
                                  onClick={() => handleFineToggle(f.id)}
                                  className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all ${
                                    selectedFines.includes(f.id)
                                      ? 'bg-rose-500 text-white shadow-md'
                                      : 'bg-white hover:bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  <span className='text-base font-bold'>{f.name}</span>
                                  <span
                                    className={`text-sm font-black px-2 py-0.5 rounded ${
                                      selectedFines.includes(f.id) ? 'bg-black/20' : 'bg-slate-100'
                                    }`}
                                  >
                                    {(f.amountCents / 100).toFixed(0)} ج
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {showServicesDropdown && (
                        <div className='space-y-3 flex flex-col h-full'>
                          <input
                            type='text'
                            placeholder='ابحث في الخدمات...'
                            value={servicesSearchTerm}
                            onChange={e => setServicesSearchTerm(e.target.value)}
                            className='w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base focus:border-sky-400 outline-none shadow-sm'
                            autoFocus
                          />
                          <div className='overflow-y-auto space-y-1 pr-1 custom-scrollbar'>
                            {finesList
                              .filter(
                                s =>
                                  s.category === 'خدمات اضافية' &&
                                  s.name.includes(servicesSearchTerm)
                              )
                              .map(s => (
                                <div
                                  key={s.id}
                                  className='bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm'
                                >
                                  <div
                                    onClick={() => handleFineToggle(s.id)}
                                    className={`p-3 cursor-pointer flex justify-between items-center transition-all ${
                                      selectedFines.includes(s.id)
                                        ? 'bg-sky-50 text-sky-700'
                                        : 'hover:bg-slate-50 text-slate-700'
                                    }`}
                                  >
                                    <span className='text-base font-bold'>{s.name}</span>
                                    {selectedFines.includes(s.id) && (
                                      <span className='text-sky-500 font-bold font-mono'>✓</span>
                                    )}
                                  </div>
                                  {selectedFines.includes(s.id) && s.id !== 'service_001' && (
                                    <div className='p-3 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-top-1'>
                                      <div className='relative'>
                                        <input
                                          type='number'
                                          value={manualServices[s.id] || ''}
                                          onChange={e =>
                                            handleManualServiceChange(
                                              s.id,
                                              parseFloat(e.target.value) || 0
                                            )
                                          }
                                          className='w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-black outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10'
                                          placeholder='القيمة بالجنيه...'
                                          onClick={e => e.stopPropagation()}
                                        />
                                        <span className='absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400'>
                                          ج.م
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pricing Preview while editing */}
                  <div className='p-6 bg-slate-900 rounded-[2rem] text-white shadow-xl shadow-slate-200 animate-in zoom-in-95 duration-300'>
                    <p className='text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2'>
                      <span className='w-2 h-2 bg-emerald-400 rounded-full animate-pulse'></span>
                      معاينة الحسابات الجديدة
                    </p>
                    <div className='flex items-center justify-between'>
                      <div>
                        <p className='text-sm text-slate-300 font-medium'>
                          إجمالي الطلب بعد التعديل:
                        </p>
                        <p className='text-xs text-slate-500 mt-1 italic'>
                          * شامل جميع الغرامات والخدمات والخصومات
                        </p>
                      </div>
                      <div className='text-right'>
                        <span className='text-3xl font-black text-emerald-400'>
                          {(calculateTotalPrice() / 100).toFixed(2)}
                        </span>
                        <span className='text-sm font-bold text-slate-400 ml-2'>جنيه</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Information */}
            <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-8'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
                  <span className='w-2 h-8 bg-purple-500 rounded-full'></span>
                  بيانات العميل
                </h2>
                {!isEditingCustomer ? (
                  <button
                    onClick={() => setIsEditingCustomer(true)}
                    className='px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-bold hover:bg-purple-100 transition-all border border-purple-100 flex items-center gap-2'
                  >
                    <span>تعديل البيانات</span>
                    <span className='text-lg'>👤</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsEditingCustomer(false);
                      setEditingField(null);
                    }}
                    className='px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all'
                  >
                    إغلاق التعديل
                  </button>
                )}
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8'>
                {/* Editable Customer Name */}
                <div className='p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-purple-200 transition-all group relative'>
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                      الاسم
                    </p>
                    {isEditingCustomer && !editingField && (
                      <button
                        onClick={() => handleStartEdit('customerName', currentOrder.customerName)}
                        className='text-purple-500 text-xs font-bold px-2 py-1 hover:bg-purple-100 rounded-lg transition-all'
                      >
                        تعديل ✎
                      </button>
                    )}
                  </div>
                  {editingField === 'customerName' ? (
                    <div className='flex gap-2'>
                      <input
                        autoFocus
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className='flex-1 bg-white border-2 border-purple-200 rounded-lg px-3 py-1 text-sm font-bold'
                      />
                      <button
                        onClick={handleSaveField}
                        className='bg-green-500 text-white p-2 rounded-lg'
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className='bg-slate-200 text-slate-600 p-2 rounded-lg'
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className='text-lg font-bold text-slate-900'>
                      {currentOrder.customerName || '-'}
                    </p>
                  )}
                </div>

                {/* Editable Customer Phone */}
                <div
                  className={`p-4 rounded-2xl border transition-all relative ${isEditingCustomer ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}
                >
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                      الهاتف
                    </p>
                    {isEditingCustomer && !editingField && (
                      <button
                        onClick={() => handleStartEdit('customerPhone', currentOrder.customerPhone)}
                        className='text-purple-500 text-xs font-bold px-2 py-1 hover:bg-purple-100 rounded-lg transition-all'
                      >
                        تعديل ✎
                      </button>
                    )}
                  </div>
                  {editingField === 'customerPhone' ? (
                    <div className='flex gap-2'>
                      <input
                        autoFocus
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className='flex-1 bg-white border-2 border-purple-200 rounded-lg px-3 py-1 text-sm font-bold'
                      />
                      <button
                        onClick={handleSaveField}
                        className='bg-green-500 text-white p-2 rounded-lg'
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className='bg-slate-200 text-slate-600 p-2 rounded-lg'
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className='text-lg font-bold text-slate-900 font-mono dir-ltr text-right'>
                      {currentOrder.customerPhone || '-'}
                    </p>
                  )}
                </div>

                {/* Editable National ID */}
                <div
                  className={`p-4 rounded-2xl border transition-all relative ${isEditingCustomer ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}
                >
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                      الرقم القومي
                    </p>
                    {isEditingCustomer && !editingField && (
                      <button
                        onClick={() => handleStartEdit('idNumber', currentOrder.idNumber || '')}
                        className='text-purple-500 text-xs font-bold px-2 py-1 hover:bg-purple-100 rounded-lg transition-all'
                      >
                        تعديل ✎
                      </button>
                    )}
                  </div>
                  {editingField === 'idNumber' ? (
                    <div className='flex gap-2'>
                      <input
                        autoFocus
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className='flex-1 bg-white border-2 border-purple-200 rounded-lg px-3 py-1 text-sm font-bold'
                      />
                      <button
                        onClick={handleSaveField}
                        className='bg-green-500 text-white p-2 rounded-lg'
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className='bg-slate-200 text-slate-600 p-2 rounded-lg'
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className='text-lg font-bold text-slate-900 font-mono'>
                      {currentOrder.idNumber || '-'}
                    </p>
                  )}
                </div>

                {/* Editable Customer Email */}
                <div
                  className={`p-4 rounded-2xl border transition-all relative ${isEditingCustomer ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}
                >
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                      البريد الإلكتروني
                    </p>
                    {isEditingCustomer && !editingField && (
                      <button
                        onClick={() => handleStartEdit('customerEmail', currentOrder.customerEmail)}
                        className='text-purple-500 text-xs font-bold px-2 py-1 hover:bg-purple-100 rounded-lg transition-all'
                      >
                        تعديل ✎
                      </button>
                    )}
                  </div>
                  {editingField === 'customerEmail' ? (
                    <div className='flex gap-2'>
                      <input
                        autoFocus
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className='flex-1 bg-white border-2 border-purple-200 rounded-lg px-3 py-1 text-sm font-bold'
                      />
                      <button
                        onClick={handleSaveField}
                        className='bg-green-500 text-white p-2 rounded-lg'
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => setEditingField(null)}
                        className='bg-slate-200 text-slate-600 p-2 rounded-lg'
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <p className='text-lg font-bold text-slate-900'>
                      {currentOrder.customerEmail || '-'}
                    </p>
                  )}
                </div>

                {/* Editable Address */}
                <div
                  className={`md:col-span-2 p-4 rounded-2xl border transition-all relative ${isEditingCustomer ? 'bg-purple-50/50 border-purple-200' : 'bg-slate-50 border-slate-100'}`}
                >
                  <div className='flex justify-between items-start mb-1'>
                    <p className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                      العنوان
                    </p>
                    {isEditingCustomer && !editingField && (
                      <button
                        onClick={() => handleStartEdit('address', currentOrder.address || '')}
                        className='text-purple-500 text-xs font-bold px-2 py-1 hover:bg-purple-100 rounded-lg transition-all'
                      >
                        تعديل ✎
                      </button>
                    )}
                  </div>
                  {editingField === 'address' ? (
                    <div className='flex gap-2'>
                      <textarea
                        autoFocus
                        value={tempValue}
                        onChange={e => setTempValue(e.target.value)}
                        className='flex-1 bg-white border-2 border-purple-200 rounded-lg px-3 py-2 text-sm font-bold resize-none'
                        rows={2}
                      />
                      <div className='flex flex-col gap-2'>
                        <button
                          onClick={handleSaveField}
                          className='bg-green-500 text-white p-2 rounded-lg'
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingField(null)}
                          className='bg-slate-200 text-slate-600 p-2 rounded-lg'
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className='text-lg font-bold text-slate-900 leading-relaxed'>
                      {currentOrder.address || '-'}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-8'>
              <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-bold text-slate-900 flex items-center gap-2'>
                  <span className='w-2 h-8 bg-amber-500 rounded-full'></span>
                  ملاحظات
                </h2>
                {!editingField && (
                  <button
                    onClick={() => handleStartEdit('notes', currentOrder.notes || '')}
                    className='text-amber-500 text-xs font-bold px-3 py-1 hover:bg-amber-50 rounded-lg border border-amber-100 transition-colors'
                  >
                    تعديل الملاحظات ✎
                  </button>
                )}
              </div>

              {editingField === 'notes' ? (
                <div className='space-y-4'>
                  <textarea
                    autoFocus
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                    placeholder='أضف ملاحظاتك هنا...'
                    className='w-full bg-amber-50/50 border-2 border-amber-200 rounded-2xl p-4 text-slate-800 font-medium focus:ring-0 focus:border-amber-500 transition-all min-h-[120px]'
                  />
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={() => setEditingField(null)}
                      className='px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all'
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSaveField}
                      className='px-6 py-2 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-all shadow-md shadow-amber-100'
                    >
                      حفظ الملاحظات
                    </button>
                  </div>
                </div>
              ) : (
                <div className='bg-amber-50/50 rounded-2xl p-6 border border-amber-100 transition-all'>
                  {currentOrder.notes ? (
                    <p className='text-slate-800 font-medium leading-relaxed whitespace-pre-wrap'>
                      {currentOrder.notes}
                    </p>
                  ) : (
                    <p className='text-slate-400 italic'>لا توجد ملاحظات</p>
                  )}
                </div>
              )}
            </div>

            {/* Documents */}
            {currentOrder.documents && currentOrder.documents.length > 0 && (
              <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-8'>
                <h2 className='text-xl font-bold text-slate-900 mb-6 flex items-center gap-2'>
                  <span className='w-2 h-8 bg-slate-500 rounded-full'></span>
                  المرفقات
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {order.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className='flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all'
                    >
                      <div className='flex items-center'>
                        <div className='w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center ml-4'>
                          <svg
                            className='w-6 h-6'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                        </div>
                        <div>
                          <p className='font-bold text-slate-900 text-sm line-clamp-1'>
                            {doc.fileName}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.filePath}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='text-xs font-bold px-3 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors'
                      >
                        تحميل
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-6'>
            {/* Action Cards */}
            <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-6'>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>إجراءات سريعة</h3>
              <div className='space-y-3'>
                <button
                  onClick={openWaModal}
                  className='w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2'
                >
                  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 24 24'>
                    <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
                  </svg>
                  مراسلة العميل
                </button>
                <button
                  onClick={exportOrder}
                  className='w-full py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2'
                >
                  <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
                    />
                  </svg>
                  تصدير نصي
                </button>
              </div>
            </div>

            {/* Summary Card */}
            <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-6'>
              <h3 className='text-lg font-bold text-slate-900 mb-4'>ملخص سريع</h3>
              <div className='space-y-4 text-sm'>
                <div className='flex justify-between items-center py-2 border-b border-slate-100'>
                  <span className='text-slate-500'>تاريخ الطلب</span>
                  <span className='font-bold text-slate-900 dir-ltr'>
                    {new Date(currentOrder.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className='flex justify-between items-center py-2 border-b border-slate-100'>
                  <span className='text-slate-500'>آخر تحديث</span>
                  <span className='font-bold text-slate-900 dir-ltr'>
                    {new Date(currentOrder.updatedAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className='flex justify-between items-center pt-2'>
                  <div className='flex items-center gap-2'>
                    <span className='text-slate-900 font-bold'>الإجمالي النهائي</span>
                  </div>
                  <span className='font-black text-xl text-emerald-600'>
                    {(isEditingFines ? calculateTotalPrice() : currentOrder.totalCents) / 100}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
