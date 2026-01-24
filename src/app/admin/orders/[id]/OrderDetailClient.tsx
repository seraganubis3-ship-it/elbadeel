'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface OrderDetailClientProps {
  order: any;
}

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  useRouter();
  const { data: session } = useSession();
  const [currentOrder, setCurrentOrder] = useState(order);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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

  // Function to send WhatsApp message
  const sendWhatsAppMessage = () => {
    const phone = currentOrder.customerPhone;

    // Check if phone number exists
    if (!phone || phone.trim() === '' || phone === 'غير محدد') {
      alert('رقم الهاتف غير متوفر لهذا العميل');
      return;
    }

    const message = `مرحباً ${currentOrder.customerName || 'عزيزي العميل'}،
    
طلبك رقم: ${currentOrder.id.slice(0, 8)}
الخدمة: ${currentOrder.service.name}
النوع: ${currentOrder.variant.name}
 الحالة: ${getStatusText(currentOrder.status)}
السعر: ${(currentOrder.totalCents / 100).toFixed(2)} جنيه

هل لديك أي استفسارات؟`;

    // Format phone number (ensure country code 20 is present and no leading 0)
    let formattedPhone = phone.replace(/[\s\+]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '20' + formattedPhone.substring(1);
    } else if (!formattedPhone.startsWith('20')) {
      formattedPhone = '20' + formattedPhone;
    }

    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
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

    // Create a simple text representation
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

    // Create and download file
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

  // Get current work date
  const getCurrentWorkDate = () => {
    if (session?.user) {
      const user = session.user as any;
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        const sessionWorkDate = user.workDate;
        const localWorkDate =
          typeof window !== 'undefined' ? localStorage.getItem('adminWorkDate') : null;
        return sessionWorkDate || localWorkDate;
      }
    }
    return null;
  };

  // Function to update order status
  const updateOrderStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const requestData = {
        status: newStatus,
        workDate: getCurrentWorkDate(),
      };

      const response = await fetch(`/api/admin/orders/${currentOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update local state
          setCurrentOrder((prev: any) => ({ ...prev, status: newStatus }));
          // Show success message
          setSuccessMessage(result.message);
          setShowSuccessMessage(true);

          // Hide message after 3 seconds
          setTimeout(() => setShowSuccessMessage(false), 3000);
        }
      } else {
        alert('حدث خطأ أثناء تحديث حالة الطلب');
      }
    } catch (error) {
      //
      // alert('حدث خطأ أثناء تحديث حالة الطلب');
      // } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6 order-detail'>
      <div className='max-w-4xl mx-auto'>
        {/* Success Message */}
        {showSuccessMessage && (
          <div className='mb-6 bg-green-50 border border-green-200 rounded-xl p-4 shadow-lg'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <svg className='h-5 w-5 text-green-400' viewBox='0 0 20 20' fill='currentColor'>
                  <path
                    fillRule='evenodd'
                    d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                    clipRule='evenodd'
                  />
                </svg>
              </div>
              <div className='mr-3'>
                <p className='text-sm font-medium text-green-800'>{successMessage}</p>
              </div>
              <div className='mr-auto pr-3'>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className='inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600'
                >
                  <span className='sr-only'>إغلاق</span>
                  <svg className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
                    <path
                      fillRule='evenodd'
                      d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                      clipRule='evenodd'
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className='mb-8'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-gray-900 mb-2'>تفاصيل الطلب</h1>
              <p className='text-gray-600'>رقم الطلب: #{order.id.slice(0, 8)}</p>
            </div>
            <Link
              href='/admin/orders'
              className='inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            >
              <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M10 19l-7-7m0 0l7-7m-7 7h18'
                />
              </svg>
              العودة للطلبات
            </Link>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Order Details */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Order Status */}
            <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-semibold text-gray-900'>حالة الطلب</h2>
                <span
                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(currentOrder.status)}`}
                >
                  {getStatusText(currentOrder.status)}
                </span>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    تحديث الحالة
                  </label>
                  <div className='flex space-x-3 space-x-reverse'>
                    <select
                      value={currentOrder.status}
                      onChange={e => updateOrderStatus(e.target.value)}
                      disabled={isUpdating}
                      className='flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 disabled:opacity-50'
                    >
                      <option value='PENDING' className='bg-white text-gray-900'>
                        في الانتظار
                      </option>
                      <option value='IN_PROGRESS' className='bg-white text-gray-900'>
                        قيد التنفيذ
                      </option>
                      <option value='COMPLETED' className='bg-white text-gray-900'>
                        مكتملة
                      </option>
                      <option value='CANCELLED' className='bg-white text-gray-900'>
                        ملغية
                      </option>
                    </select>
                    {isUpdating && (
                      <div className='px-4 py-2 bg-gray-100 text-gray-600 rounded-lg flex items-center'>
                        <svg
                          className='animate-spin -ml-1 mr-3 h-4 w-4 text-gray-500'
                          xmlns='http://www.w3.org/2000/svg'
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
                        جاري التحديث...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>تفاصيل الخدمة</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>اسم الخدمة</p>
                  <p className='text-lg font-semibold text-gray-900'>{currentOrder.service.name}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>نوع الخدمة</p>
                  <p className='text-lg font-semibold text-gray-900'>{currentOrder.variant.name}</p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>السعر</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {(currentOrder.totalCents / 100).toFixed(2)} جنيه
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>المدة المتوقعة</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {currentOrder.variant.etaDays} يوم
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>معلومات العميل</h2>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <p className='text-sm font-medium text-gray-500'>الاسم الكامل</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {currentOrder.customerName || 'غير محدد'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>رقم الهاتف</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {currentOrder.customerPhone || 'غير محدد'}
                  </p>
                </div>
                <div>
                  <p className='text-sm font-medium text-gray-500'>البريد الإلكتروني</p>
                  <p className='text-lg font-semibold text-gray-900'>
                    {currentOrder.customerEmail || 'غير محدد'}
                  </p>
                </div>
                {currentOrder.address && (
                  <div>
                    <p className='text-sm font-medium text-gray-500'>العنوان</p>
                    <p className='text-lg font-semibold text-gray-900'>{currentOrder.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {currentOrder.notes && (
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>ملاحظات العميل</h2>
                <p className='text-gray-700 leading-relaxed'>{currentOrder.notes}</p>
              </div>
            )}

            {/* Documents */}
            {currentOrder.documents && currentOrder.documents.length > 0 && (
              <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
                <h2 className='text-xl font-semibold text-gray-900 mb-4'>المستندات المرفوعة</h2>
                <div className='space-y-3'>
                  {order.documents.map((doc: any) => (
                    <div
                      key={doc.id}
                      className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'
                    >
                      <div className='flex items-center'>
                        <svg
                          className='w-5 h-5 text-blue-600 ml-3'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                          />
                        </svg>
                        <div>
                          <p className='font-medium text-gray-900'>{doc.fileName}</p>
                          <p className='text-sm text-gray-500'>
                            {(doc.fileSize / 1024 / 1024).toFixed(2)} ميجابايت
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.filePath}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
                      >
                        <svg
                          className='w-4 h-4 ml-2'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                          />
                        </svg>
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
            {/* Order Summary */}
            <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>ملخص الطلب</h3>
              <div className='space-y-3'>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>رقم الطلب</span>
                  <span className='font-medium text-gray-900'>#{currentOrder.id.slice(0, 8)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>تاريخ الطلب</span>
                  <span className='font-medium text-gray-900'>
                    {new Date(currentOrder.createdAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-gray-600'>آخر تحديث</span>
                  <span className='font-medium text-gray-900'>
                    {new Date(currentOrder.updatedAt).toLocaleDateString('ar-EG')}
                  </span>
                </div>
                <hr className='my-3' />
                <div className='flex justify-between'>
                  <span className='text-lg font-semibold text-gray-900'>الإجمالي</span>
                  <span className='text-2xl font-bold text-green-600'>
                    {(currentOrder.totalCents / 100).toFixed(2)} جنيه
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100 quick-actions'>
              <h3 className='text-lg font-semibold text-gray-900 mb-4'>إجراءات سريعة</h3>
              <div className='space-y-3'>
                <button
                  onClick={sendWhatsAppMessage}
                  className='w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200'
                >
                  <svg
                    className='w-4 h-4 ml-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                    />
                  </svg>
                  إرسال رسالة للعميل
                </button>
                <button
                  onClick={exportOrder}
                  className='w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200'
                >
                  <svg
                    className='w-4 h-4 ml-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  تصدير الطلب
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
