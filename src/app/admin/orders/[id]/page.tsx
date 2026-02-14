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
    showPaymentAlert,
    setShowPaymentAlert,
    uploadDocument,
    deleteDocument,
    removeAttachedDocument,
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
    <div className='min-h-screen bg-[#F8FAFC] pb-20'>
      {/* Background patterns */}
      <div className='fixed inset-0 pointer-events-none opacity-30 overflow-hidden'>
        <div className='absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px]'></div>
        <div className='absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px]'></div>
      </div>

      <OrderDetailHeader order={order} onDelete={deleteOrder} onPrint={() => printReceipt(order as any)} />

      <main className='max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative'>
        <div className='grid grid-cols-1 xl:grid-cols-12 gap-8'>
          
          {/* Main Content Area (8 Cols) */}
          <div className='xl:col-span-8 space-y-8'>
            
            {/* Quick Metrics Row - Always Visible */}
            <OrderStatusMetrics order={order} />

            {/* Service Details Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">تفاصيل الخدمة</h2>
                  <p className="text-slate-500 text-xs">بيانات الطلب والخدمة المقدمة</p>
                </div>
              </div>
              <div className="p-6">
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
              </div>
            </div>
            
            {/* Attachments & Initial Notes */}
            <OrderAttachments 
              order={order} 
              onUpload={uploadDocument}
              onDelete={deleteDocument}
              onRemoveAttached={removeAttachedDocument}
            />
            <OrderNotes order={order} />

            {/* Combined Customer Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-50 flex items-center gap-3 bg-slate-50/50">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">بيانات العميل</h2>
                  <p className="text-slate-500 text-xs">المعلومات الشخصية والعنوان</p>
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                <div className="p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">بيانات الاتصال</h3>
                  <OrderCustomerDetails
                    order={order}
                    isEditing={!!editingSections['customer']}
                    onToggleEdit={() => toggleEditing('customer')}
                    onSave={fields => updateOrderField(fields, 'customer')}
                    updating={updating}
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">البيانات الشخصية</h3>
                   <OrderPersonalDetails
                    order={order}
                    isEditing={!!editingSections['personal']}
                    onToggleEdit={() => toggleEditing('personal')}
                    onSave={fields => updateOrderField(fields, 'personal')}
                    updating={updating}
                  />
                </div>
                
                <div className="p-6">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">العنوان</h3>
                  <OrderAddressDetails
                    order={order}
                    isEditing={!!editingSections['address']}
                    onToggleEdit={() => toggleEditing('address')}
                    onSave={fields => updateOrderField(fields, 'address')}
                    updating={updating}
                  />
                </div>
              </div>
            </div>

            {/* Financial Section */}
            <div className="space-y-8">
              <OrderSummary order={order} />  
              <OrderPaymentDetails
                order={order}
                showPaymentForm={showPaymentForm}
                setShowPaymentForm={setShowPaymentForm}
                paymentData={paymentData}
                setPaymentData={setPaymentData}
                onUpdatePayment={updatePayment}
              />
            </div>
          </div>

          {/* Sidebar Area (4 Cols) - Sticky */}
          <div className='xl:col-span-4 space-y-8'>
            <div className='sticky top-24 space-y-6'>
              
              {/* Actions Card */}
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

              {/* Extra Actions */}
              <div className='bg-white rounded-3xl shadow-sm border border-slate-100 p-6'>
                <h3 className='text-sm font-black text-slate-400 uppercase tracking-widest mb-4'>
                  إجراءات سريعة
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => printReceipt(order as any)}
                    className='flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors text-sm font-semibold border border-slate-100'
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    طباعة إيصال
                  </button>
                  <button
                    onClick={() => printWorkOrder()}
                    className='flex items-center justify-center gap-2 p-3 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-colors text-sm font-semibold border border-slate-100'
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    أمر شغل
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

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
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      </main>
    </div>
  );
}
