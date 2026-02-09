'use client';

import { useParams } from 'next/navigation';
import { ToastContainer, useToast } from '@/components/Toast';
import { useOrderDetail } from './hooks/useOrderDetail';

// Components
import OrderDetailHeader from './components/OrderDetailHeader';
import OrderStatusMetrics from './components/OrderStatusMetrics';
import OrderServiceDetails from './components/OrderServiceDetails';
import OrderPaymentDetails from './components/OrderPaymentDetails';
import OrderCustomerDetails from './components/OrderCustomerDetails';
import OrderPersonalDetails from './components/OrderPersonalDetails';
import OrderAddressDetails from './components/OrderAddressDetails';
import OrderAttachments from './components/OrderAttachments';
import OrderNotes from './components/OrderNotes';
import OrderActionsSidebar from './components/OrderActionsSidebar';
import OrderSummary from './components/OrderSummary';
import WhatsAppModal from './components/WhatsAppModal';
import { printReceipt } from '../utils/printReceipt';

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
  } = useOrderDetail(orderId);

  if (loading) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='flex flex-col items-center'>
          <div className='w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4'></div>
          <p className='text-slate-600 font-medium animate-pulse text-lg'>
            جاري تحميل تفاصيل الطلب...
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='min-h-screen bg-slate-50 flex items-center justify-center'>
        <div className='text-center p-12 bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 max-w-lg w-full'>
          <div className='w-24 h-24 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6 rotate-12'>
            <svg className='w-12 h-12' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          </div>
          <h1 className='text-3xl font-black text-slate-900 mb-3'>الطلب غير موجود!</h1>
          <p className='text-slate-600 mb-8 font-medium'>
            عذراً، الطلب الذي تبحث عنه غير موجود أو تم حذفه من النظام
          </p>
          <button
            onClick={() => (window.location.href = '/admin/orders')}
            className='w-full py-4 bg-slate-900 text-white rounded-2xl hover:bg-black transition-all font-bold shadow-xl shadow-slate-200'
          >
            العودة لقائمة الطلبات
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-[#F8FAFC]'>
      {/* Background patterns */}
      <div className='fixed inset-0 pointer-events-none opacity-40 overflow-hidden'>
        <div className='absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[120px]'></div>
        <div className='absolute bottom-[10%] left-[5%] w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[120px]'></div>
      </div>

      <OrderDetailHeader order={order} onDelete={deleteOrder} onPrint={() => window.print()} />

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative'>
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-10'>
          {/* Main Content Area */}
          <div className='xl:col-span-2 space-y-10'>
            <OrderStatusMetrics order={order} />

            <OrderServiceDetails
              order={order}
              formSerialNumber={formSerialNumber}
              setFormSerialNumber={setFormSerialNumber}
              onAddFormSerial={addFormSerial}
              checkingSerial={checkingSerial}
              updating={updating}
              serialError={serialError}
              isEditing={!!editingSections['service']}
              onToggleEdit={() => toggleEditing('service')}
              onSave={fields => updateOrderField(fields, 'service')}
            />

            <OrderPaymentDetails
              order={order}
              showPaymentForm={showPaymentForm}
              setShowPaymentForm={setShowPaymentForm}
              paymentData={paymentData}
              setPaymentData={setPaymentData}
              onUpdatePayment={updatePayment}
            />

            <OrderCustomerDetails
              order={order}
              isEditing={!!editingSections['customer']}
              onToggleEdit={() => toggleEditing('customer')}
              onSave={fields => updateOrderField(fields, 'customer')}
              updating={updating}
            />

            <OrderPersonalDetails
              order={order}
              isEditing={!!editingSections['personal']}
              onToggleEdit={() => toggleEditing('personal')}
              onSave={fields => updateOrderField(fields, 'personal')}
              updating={updating}
            />

            <OrderAddressDetails
              order={order}
              isEditing={!!editingSections['address']}
              onToggleEdit={() => toggleEditing('address')}
              onSave={fields => updateOrderField(fields, 'address')}
              updating={updating}
            />

            <OrderAttachments order={order} />

            <OrderNotes order={order} />
          </div>

          {/* Sidebar Area */}
          <div className='space-y-10'>
            <div className='sticky top-32 space-y-10'>
              <OrderActionsSidebar
                order={order}
                newStatus={newStatus}
                setNewStatus={setNewStatus}
                newAdminNotes={newAdminNotes}
                setNewAdminNotes={setNewAdminNotes}
                updating={updating}
                onUpdateOrder={updateOrder}
                onCallCustomer={() => {
                  const phone = order.customerPhone || order.user.phone;
                  if (phone && phone !== 'unknown') window.open(`tel:${phone}`);
                }}
                onWhatsAppClick={() => setShowWhatsAppModal(true)}
              />

              <OrderSummary order={order} />

              <div className='bg-white/60 backdrop-blur-xl rounded-[2.5rem] shadow-xl border border-white/60 p-8 space-y-4'>
                <h3 className='text-sm font-black text-slate-400 uppercase tracking-widest mb-6 border-b pb-4'>
                  إجراءات إضافية
                </h3>
                <button
                  onClick={() => printReceipt(order as any)}
                  className='w-full px-6 py-4 bg-indigo-50 text-indigo-700 rounded-2xl hover:bg-indigo-100 transition-all font-bold text-center border border-indigo-100 flex items-center justify-center gap-3'
                >
                  <span>🖨️ إعادة طباعة الإيصال</span>
                </button>
                {order.status === 'settlement' && (
                  <button
                    onClick={printWorkOrder}
                    className='w-full px-6 py-4 bg-emerald-50 text-emerald-700 rounded-2xl hover:bg-emerald-100 transition-all font-bold text-center border border-emerald-100 flex items-center justify-center gap-3'
                  >
                    <span>📋 طباعة أمر شغل</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(order.id);
                  }}
                  className='w-full px-6 py-4 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 transition-all font-bold text-center border border-slate-200 flex items-center justify-center gap-3'
                >
                  <span>📋 نسخ رقم الطلب</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <WhatsAppModal
        order={order}
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        message={whatsappMessage}
        setMessage={setWhatsappMessage}
        sending={sendingWhatsApp}
        onSend={sendWhatsApp}
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
      />

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
