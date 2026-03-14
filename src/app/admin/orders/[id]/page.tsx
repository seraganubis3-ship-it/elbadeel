'use client';
import React from 'react';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ToastContainer, useToast } from '@/components/Toast';
import { useOrderDetail } from './hooks/useOrderDetail';
import { getStatusBadge } from './types';

// Components
import OrderServiceDetails from './components/OrderServiceDetails';
import OrderPaymentDetails from './components/OrderPaymentDetails';
import OrderCustomerDetails from './components/OrderCustomerDetails';
import OrderPersonalDetails from './components/OrderPersonalDetails';
import OrderAddressDetails from './components/OrderAddressDetails';
import OrderAttachments from './components/OrderAttachments';
import OrderNotes from './components/OrderNotes';
import OrderActionsSidebar from './components/OrderActionsSidebar';
import OrderSummary from './components/OrderSummary';
import OrderStatusMetrics from './components/OrderStatusMetrics';
import WhatsAppModal from './components/WhatsAppModal';
import { printReceipt } from '../utils/printReceipt';
import { ORDER_STATUS_CONFIG } from '@/constants/orderStatus';
import { safeLocaleDate } from '@/lib/date-utils';

export default function OrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { toasts, removeToast } = useToast();

  const {
    order,
    loading,
    updating,
    editingSections,
    toggleEditing,
    updateOrderField,
    formSerialNumber,
    setFormSerialNumber,
    formSerialProvider,
    setFormSerialProvider,
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
    addFormSerial,
    updateOrder,
    updatePayment,
    sendWhatsApp,
    deleteOrder,
    printWorkOrder,
    showPaymentAlert,
    setShowPaymentAlert,
    quickPayAndDeliver,
    uploadDocument,
    deleteDocument,
    removeFormSerial,
    removeAttachedDocument,
  } = useOrderDetail(orderId);

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='flex flex-col items-center gap-4'>
          <div className='w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin' />
          <p className='text-slate-600 font-bold animate-pulse'>جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-center p-12 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 max-w-lg w-full'>
          <div className='w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl'>
            ⚠️
          </div>
          <h1 className='text-2xl font-black text-slate-900 mb-3'>الطلب غير موجود!</h1>
          <p className='text-slate-500 mb-8 font-medium'>
            عذراً، الطلب الذي تبحث عنه غير موجود أو تم حذفه
          </p>
          <button
            onClick={() => (window.location.href = '/admin/orders')}
            className='w-full py-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-bold shadow-xl'
          >
            العودة لقائمة الطلبات
          </button>
        </div>
      </div>
    );
  }

  const status = getStatusBadge(order.status);

  return (
    <div className='min-h-screen bg-slate-100/60 pb-20' dir='rtl'>
      {/* ── Sticky Top Bar ── */}
      <div className='sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm'>
        <div className='max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4'>
          {/* Left: back + order id */}
          <div className='flex items-center gap-3 min-w-0'>
            <Link
              href='/admin/orders'
              className='w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0'
            >
              <svg
                className='w-5 h-5 text-slate-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2.5}
                  d='m14 18-6-6 6-6'
                />
              </svg>
            </Link>
            <div className='min-w-0'>
              <h1 className='text-base font-black text-slate-900 truncate'>
                {order.service?.name || 'تفاصيل الطلب'}
              </h1>
              <p className='text-[11px] text-slate-500 font-mono'>
                #{order.serialNumber || order.id.slice(-8)}
              </p>
            </div>
          </div>

          {/* Center: status badge */}
          <div
            className={`hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black ${status.color}`}
          >
            <span className='w-2 h-2 rounded-full bg-current opacity-60' />
            {status.text}
          </div>

          {/* Right: quick actions */}
          <div className='flex items-center gap-2 shrink-0'>
            <button
              onClick={() => {
                const phone = order.customerPhone || order.user?.phone;
                if (phone && phone !== 'unknown') window.open(`tel:${phone}`);
              }}
              className='flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors font-bold text-sm'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M20 15.5c-1.2 0-2.4-.2-3.6-.6-.3-.1-.7 0-1 .2l-2.2 2.2c-2.8-1.4-5.1-3.8-6.6-6.6l2.2-2.2c.3-.3.4-.7.2-1-.3-1.1-.5-2.3-.5-3.5 0-.6-.4-1-1-1H4c-.6 0-1 .4-1 1 0 9.4 7.6 17 17 17 .6 0 1-.4 1-1v-3.5c0-.6-.4-1-1-1z' />
              </svg>
              <span className='hidden md:inline'>اتصال</span>
            </button>
            <button
              onClick={() => setShowWhatsAppModal(true)}
              className='flex items-center gap-2 px-3 py-2 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors font-bold text-sm'
            >
              <svg className='w-4 h-4' fill='currentColor' viewBox='0 0 24 24'>
                <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z' />
              </svg>
              <span className='hidden md:inline'>واتساب</span>
            </button>
            <button
              onClick={() => printReceipt(order as any)}
              className='flex items-center gap-2 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                />
              </svg>
              <span className='hidden md:inline'>إيصال</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Hero Status Banner ── */}
      <div className='bg-slate-900 text-white border-b border-slate-800'>
        <div className='max-w-[1600px] mx-auto px-4 sm:px-6 py-5'>
          {/* Service row */}
          <div className='flex flex-wrap items-center justify-between gap-3 mb-5'>
            <div className='flex items-center gap-3'>
              <div className='w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center border border-white/10 shrink-0 text-lg'>
                📋
              </div>
              <div>
                <h2 className='text-xl font-black'>{order.service?.name || 'خدمة غير معروفة'}</h2>
                <p className='text-slate-400 font-bold text-xs mt-0.5'>
                  {order.variant?.name || 'نوع غير محدد'}
                </p>
              </div>
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-black border ${status.color}`}>
                {status.text}
              </span>
              {order.createdByAdmin && (
                <span className='px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300'>
                  📋 {order.createdByAdmin.name}
                </span>
              )}
              {order.estimatedCompletionDate && (
                <span className='px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300'>
                  🗓 {safeLocaleDate(order.estimatedCompletionDate)}
                </span>
              )}
            </div>
          </div>

          {/* KPI Strip — most important first */}
          <div className='grid grid-cols-2 sm:grid-cols-5 gap-2'>
            {/* 1. Remaining — most critical */}
            <div
              className={`rounded-2xl p-4 border col-span-1 ${(order.remainingAmount || 0) > 0 ? 'bg-rose-500/20 border-rose-400/30' : 'bg-emerald-500/20 border-emerald-400/30'}`}
            >
              <p className='text-xs font-bold text-white/60 mb-1'>المتبقي</p>
              <p
                className={`text-2xl font-black ${(order.remainingAmount || 0) > 0 ? 'text-rose-300' : 'text-emerald-300'}`}
              >
                {((order.remainingAmount || 0) / 100).toFixed(0)}
                <span className='text-sm font-bold mr-1'>ج.م</span>
              </p>
              <p className='text-[10px] text-white/40 mt-0.5'>
                {(order.remainingAmount || 0) > 0 ? '⚠️ مستحق' : '✅ مسدد'}
              </p>
            </div>

            {/* 2. Total */}
            <div className='rounded-2xl p-4 border bg-white/5 border-white/10'>
              <p className='text-xs font-bold text-white/60 mb-1'>الإجمالي</p>
              <p className='text-2xl font-black text-white'>
                {(order.totalCents / 100).toFixed(0)}
                <span className='text-sm font-bold mr-1'>ج.م</span>
              </p>
              <p className='text-[10px] text-white/40 mt-0.5'>💰 كامل الطلب</p>
            </div>

            {/* 3. Paid */}
            <div className='rounded-2xl p-4 border bg-white/5 border-white/10'>
              <p className='text-xs font-bold text-white/60 mb-1'>المدفوع</p>
              <p className='text-2xl font-black text-emerald-300'>
                {(order.paidAmount || 0).toFixed(0)}
                <span className='text-sm font-bold mr-1'>ج.م</span>
              </p>
              <p className='text-[10px] text-white/40 mt-0.5'>✅ تم دفعه</p>
            </div>

            {/* 4. Delivery type */}
            <div className='rounded-2xl p-4 border bg-white/5 border-white/10'>
              <p className='text-xs font-bold text-white/60 mb-1'>التسليم</p>
              <p className='text-xl font-black text-blue-300'>
                {order.deliveryType === 'ADDRESS' ? 'توصيل' : 'استلام'}
              </p>
              <p className='text-[10px] text-white/40 mt-0.5'>
                {order.deliveryType === 'ADDRESS' ? '🚚 على العنوان' : '🏢 من المكتب'}
              </p>
            </div>

            {/* 5. Created date — least critical */}
            <div className='rounded-2xl p-4 border bg-white/5 border-white/10'>
              <p className='text-xs font-bold text-white/60 mb-1'>تاريخ الطلب</p>
              <p className='text-base font-black text-slate-200'>
                {safeLocaleDate(order.createdAt)}
              </p>
              <p className='text-[10px] text-white/40 mt-0.5'>📅 تاريخ الإنشاء</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <main className='max-w-[1600px] mx-auto px-4 sm:px-6 py-6'>
        <div className='grid grid-cols-1 xl:grid-cols-12 gap-6'>
          {/* ━━━ Left Column: Details (8 cols) ━━━ */}
          <div className='xl:col-span-8 space-y-6'>
            {/* Status Reason Alert */}
            {order.statusReason && (
              <div className='flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl'>
                <span className='text-xl shrink-0'>⚠️</span>
                <div>
                  <p className='text-amber-900 font-black text-sm'>سبب تحديث الحالة</p>
                  <p className='text-amber-800 text-sm mt-0.5'>{order.statusReason}</p>
                </div>
              </div>
            )}

            {/* Customer Details — FIRST */}
            <Section title='بيانات العميل' icon='👤'>
              <div className='divide-y divide-slate-100'>
                <div className='pb-5'>
                  <SectionSubtitle>بيانات الاتصال</SectionSubtitle>
                  <OrderCustomerDetails
                    order={order}
                    isEditing={!!editingSections['customer']}
                    onToggleEdit={() => toggleEditing('customer')}
                    onSave={fields => updateOrderField(fields, 'customer')}
                    updating={updating}
                  />
                </div>
                <div className='py-5'>
                  <SectionSubtitle>البيانات الشخصية</SectionSubtitle>
                  <OrderPersonalDetails
                    order={order}
                    isEditing={!!editingSections['personal']}
                    onToggleEdit={() => toggleEditing('personal')}
                    onSave={fields => updateOrderField(fields, 'personal')}
                    updating={updating}
                  />
                </div>
                <div className='pt-5'>
                  <SectionSubtitle>العنوان</SectionSubtitle>
                  <OrderAddressDetails
                    order={order}
                    isEditing={!!editingSections['address']}
                    onToggleEdit={() => toggleEditing('address')}
                    onSave={fields => updateOrderField(fields, 'address')}
                    updating={updating}
                  />
                </div>
              </div>
            </Section>

            {/* Service Details */}
            <Section title='تفاصيل الخدمة' icon='📋'>
              <OrderServiceDetails
                order={order}
                formSerialNumber={formSerialNumber}
                setFormSerialNumber={setFormSerialNumber}
                formSerialProvider={formSerialProvider}
                setFormSerialProvider={setFormSerialProvider}
                onAddFormSerial={addFormSerial}
                onRemoveFormSerial={removeFormSerial}
                checkingSerial={checkingSerial}
                updating={updating}
                serialError={serialError}
                isEditing={!!editingSections['service']}
                onToggleEdit={() => toggleEditing('service')}
                onSave={fields => updateOrderField(fields, 'service')}
              />
            </Section>

            {/* Financials */}
            <Section title='الحسابات والمدفوعات' icon='💳'>
              <OrderSummary
                order={order}
                isEditing={!!editingSections['financials']}
                onToggleEdit={() => toggleEditing('financials')}
                onSave={fields => updateOrderField(fields, 'financials')}
                updating={updating}
              />
              <div className='mt-5 pt-5 border-t border-slate-100'>
                <OrderPaymentDetails
                  order={order}
                  showPaymentForm={showPaymentForm}
                  setShowPaymentForm={setShowPaymentForm}
                  paymentData={paymentData}
                  setPaymentData={setPaymentData}
                  onUpdatePayment={updatePayment}
                />
              </div>
            </Section>

            {/* Attachments */}
            <OrderAttachments
              order={order}
              onUpload={uploadDocument}
              onDelete={deleteDocument}
              onRemoveAttached={removeAttachedDocument}
            />

            {/* Notes */}
            <OrderNotes order={order} />
          </div>

          {/* ━━━ Right Column: Actions Sidebar (4 cols) ━━━ */}
          <div className='xl:col-span-4'>
            <div className='sticky top-20 space-y-4'>
              {/* Status Update Card */}
              <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
                <div className='px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3'>
                  <div className='w-8 h-8 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-sm'>
                    ✏️
                  </div>
                  <h3 className='font-black text-slate-800'>تحديث حالة الطلب</h3>
                </div>
                <div className='p-5 space-y-4'>
                  <div>
                    <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5'>
                      الحالة الجديدة
                    </label>
                    <select
                      value={newStatus}
                      onChange={e => {
                        if (e.target.value === 'delete_order') {
                          deleteOrder?.();
                        } else {
                          setNewStatus(e.target.value);
                        }
                      }}
                      className='w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-slate-900 font-bold transition-all bg-white text-sm'
                    >
                      {Object.entries(ORDER_STATUS_CONFIG)
                        .filter(([key]) => {
                          if (order.createdByAdmin) {
                            if (['waiting_confirmation', 'waiting_payment'].includes(key))
                              return false;
                          }
                          return true;
                        })
                        .map(([key, config]) => (
                          <option key={key} value={key}>
                            {(config as any).text}
                          </option>
                        ))}
                      <option value='delete_order' className='text-red-600 font-bold'>
                        ❌ إلغاء نهائي (حذف)
                      </option>
                    </select>
                  </div>
                  <div>
                    <label className='block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5'>
                      ملاحظات الإدارة
                    </label>
                    <textarea
                      value={newAdminNotes}
                      onChange={e => setNewAdminNotes(e.target.value)}
                      rows={3}
                      className='w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none text-sm transition-all bg-white resize-none'
                    />
                  </div>

                  {/* Current Admin Notes Display */}
                  {order.adminNotes && (
                    <div className='p-3 bg-amber-50 border border-amber-100 rounded-xl'>
                      <p className='text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1'>
                        الملاحظات الحالية المسجلة:
                      </p>
                      <p className='text-sm font-bold text-slate-700 whitespace-pre-wrap'>
                        {order.adminNotes}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => updateOrder()}
                    disabled={updating}
                    className='w-full py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all font-black text-sm shadow-lg shadow-blue-100 flex items-center justify-center gap-2 active:scale-[0.98]'
                  >
                    {updating ? (
                      <span className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    ) : (
                      '💾 حفظ التحديثات'
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Print & Work Actions */}
              <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
                <div className='px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3'>
                  <div className='w-8 h-8 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center text-sm'>
                    🖨️
                  </div>
                  <h3 className='font-black text-slate-800'>طباعة وإجراءات</h3>
                </div>
                <div className='p-4 grid grid-cols-2 gap-2'>
                  <button
                    onClick={() => printReceipt(order as any)}
                    className='flex flex-col items-center gap-1.5 p-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors text-xs font-bold border border-slate-100'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                      />
                    </svg>
                    طباعة إيصال
                  </button>
                  <button
                    onClick={() => printWorkOrder()}
                    className='flex flex-col items-center gap-1.5 p-3 bg-slate-50 text-slate-700 rounded-xl hover:bg-slate-100 transition-colors text-xs font-bold border border-slate-100'
                  >
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                      />
                    </svg>
                    أمر شغل
                  </button>
                </div>
              </div>

              {/* Authorization Print */}
              <AuthorizationPrintCard orderId={order.id} />
            </div>
          </div>
        </div>

        {/* Modals */}
        <WhatsAppModal
          order={order}
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          message={whatsappMessage}
          setMessage={setWhatsappMessage}
          onSend={sendWhatsApp}
          sending={sendingWhatsApp}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
        />

        {/* Payment Alert Modal */}
        {showPaymentAlert && order && (
          <div className='fixed inset-0 z-[3000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4'>
            <div className='bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-300 overflow-hidden'>
              <div className='p-8 border-b border-amber-100 bg-amber-50 relative'>
                <div className='absolute top-4 right-4 text-4xl opacity-20'>⚠️</div>
                <h3 className='text-2xl font-black text-amber-900 mb-1'>مبالغ مستحقة!</h3>
                <p className='text-amber-700 font-bold text-sm'>لا يمكن التسليم بدون سداد الرصيد</p>
              </div>
              <div className='p-8'>
                <div className='bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100'>
                  <p className='text-slate-700 font-bold'>
                    لا يزال هناك{' '}
                    <span className='text-amber-600 text-2xl mx-1 font-black'>
                      {((order.remainingAmount || 0) / 100).toFixed(2)} ج.م
                    </span>{' '}
                    مستحقة.
                  </p>
                </div>
                <div className='space-y-3'>
                  <label className='block text-xs font-black text-slate-400 uppercase tracking-widest'>
                    اختر طريقة الدفع:
                  </label>
                  <select
                    id='quickPayMethod'
                    className='w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-4 text-xl font-black text-slate-800 outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all appearance-none'
                    defaultValue='CASH'
                  >
                    <option value='CASH'>💵 كاش نقداً</option>
                    <option value='INSTAPAY'>🏦 إنستا باي</option>
                    <option value='WALLET'>📱 محفظة إلكترونية</option>
                  </select>
                </div>
              </div>
              <div className='p-8 pt-0 space-y-3'>
                <button
                  onClick={async () => {
                    const method = (document.getElementById('quickPayMethod') as HTMLSelectElement)
                      .value;
                    await quickPayAndDeliver(method);
                  }}
                  className='w-full py-5 rounded-2xl bg-emerald-600 text-white text-xl font-black shadow-xl shadow-emerald-100 hover:bg-emerald-500 transition-all active:scale-[0.98] flex items-center justify-center gap-3'
                >
                  <span className='w-6 h-6 bg-white/20 rounded-full flex items-center justify-center'>
                    ✓
                  </span>
                  تسجيل الدفع والتسليم
                </button>
                <button
                  onClick={() => setShowPaymentAlert(false)}
                  className='w-full py-4 rounded-2xl bg-white text-rose-500 font-black border border-rose-100 hover:bg-rose-50 transition-all active:scale-[0.98]'
                >
                  إلغاء العملية
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </main>
    </div>
  );
}

/* ── Reusable helpers ── */
function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
      <div className='px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center gap-3'>
        <span className='text-lg'>{icon}</span>
        <h2 className='font-black text-slate-800 text-base'>{title}</h2>
      </div>
      <div className='p-5'>{children}</div>
    </div>
  );
}

function SectionSubtitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className='text-xs font-black text-slate-400 uppercase tracking-widest mb-4'>{children}</h3>
  );
}

function AuthorizationPrintCard({ orderId }: { orderId: string }) {
  const [show, setShow] = React.useState(false);
  const [delegates, setDelegates] = React.useState<{ id: string; name: string }[]>([]);
  const [selectedDelegate, setSelectedDelegate] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [printType, setPrintType] = React.useState<'passport' | 'work-permit'>('passport');

  const open = async () => {
    setShow(true);
    if (delegates.length === 0) {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/delegates');
        const data = await res.json();
        setDelegates(data.delegates || []);
      } finally {
        setLoading(false);
      }
    }
  };

  const confirm = () => {
    if (!selectedDelegate) return;
    const base =
      printType === 'passport'
        ? '/admin/print/passport-authorization'
        : '/admin/print/work-permit-authorization';
    window.open(`${base}?orderId=${orderId}&delegateId=${selectedDelegate}`, '_blank');
    setShow(false);
  };

  return (
    <>
      <div className='bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3'>
          <span className='text-lg'>📄</span>
          <h3 className='font-black text-slate-800'>طباعة تفويض</h3>
        </div>
        <div className='p-4'>
          <button
            onClick={open}
            className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 text-white rounded-xl hover:bg-black transition-colors font-black text-sm'
          >
            <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            طباعة تفويض
          </button>
        </div>
      </div>

      {show && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-[2000] flex items-center justify-center p-4'>
          <div className='bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-300 overflow-hidden'>
            <div className='p-8'>
              <h3 className='text-2xl font-black text-slate-900 mb-1 text-center'>
                اختيار المندوب
              </h3>
              <p className='text-sm text-slate-500 text-center mb-8 font-bold'>
                حدد المندوب ونوع التفويض
              </p>
              {loading ? (
                <div className='flex justify-center py-8'>
                  <div className='w-10 h-10 border-4 border-slate-900 border-t-transparent rounded-full animate-spin' />
                </div>
              ) : (
                <div className='space-y-5'>
                  <div>
                    <label className='text-xs font-black text-slate-400 uppercase tracking-widest block mb-2'>
                      نوع التفويض
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      {(['passport', 'work-permit'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setPrintType(t)}
                          className={`py-3 px-4 rounded-xl font-black text-sm transition-all ${printType === t ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}
                        >
                          {t === 'passport' ? 'جواز سفر' : 'تصريح عمل'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className='text-xs font-black text-slate-400 uppercase tracking-widest block mb-2'>
                      اختر المندوب
                    </label>
                    <select
                      value={selectedDelegate}
                      onChange={e => setSelectedDelegate(e.target.value)}
                      className='w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 outline-none appearance-none'
                    >
                      <option value=''>-- اختر المندوب --</option>
                      {delegates.map(d => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='flex gap-3 pt-2'>
                    <button
                      onClick={confirm}
                      disabled={!selectedDelegate}
                      className='flex-1 py-3 bg-slate-900 text-white rounded-xl font-black hover:bg-black disabled:opacity-50 transition-all'
                    >
                      طباعة
                    </button>
                    <button
                      onClick={() => setShow(false)}
                      className='flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all'
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
