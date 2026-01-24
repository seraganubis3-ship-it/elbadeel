'use client';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { ToastContainer } from '@/components/Toast';
import {
  PREDEFINED_FINES,
  calculateActualFineAmounts,
  calculateFineExpenses,
} from '@/constants/fines';
import { useCreateOrder } from './useCreateOrder';
import {
  LoadingState,
  QuickNavigation,
  AddressModal,
  AttachmentModal,
  CustomerInfoSection,
  ServiceSelectionSection,
  DocumentsSection,
  PaymentSection,
  ActionsSection,
} from './components';

export default function CreateOrderPage() {
  const {
    session,
    router,
    toasts,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    services,
    filteredServices,
    selectedService,
    setSelectedService, // Maybe not returned? Check hook. It is.
    selectedVariant,
    setSelectedVariant,
    serviceSearchTerm,
    showServiceDropdown,
    setServiceSearchTerm,
    setShowServiceDropdown,
    selectService,
    handleVariantChange,
    customer,
    suggestedUser,
    searchResults,
    showSearchDropdown,
    searching,
    setShowSearchDropdown,
    searchCustomer,
    selectCustomer,
    suggestedDependent,
    dependentSearchResults,
    showDependentDropdown,
    searchingDependent,
    setShowDependentDropdown,
    searchDependent,
    selectDependent,
    saveNewDependent,
    loading,
    submitting,
    showAttachmentModal,
    setShowAttachmentModal,
    showAddressModal,
    setShowAddressModal,
    uploadedFiles,
    attachmentName,
    attachmentFile,
    setAttachmentName,
    setAttachmentFile,
    handleSaveAttachment,
    handleRemoveAttachment,
    formSerialNumber,
    serialValid,
    validateSerialLive,
    selectedFines,
    setSelectedFines,
    showServicesDropdown,
    showFinesDropdown,
    finesSearchTerm,
    servicesSearchTerm,
    manualServices,
    setShowServicesDropdown,
    setShowFinesDropdown,
    setFinesSearchTerm,
    setServicesSearchTerm,
    handleFineToggle,
    handleManualServiceChange,
    removeManualService,
    formData,
    setFormData,
    handleNationalIdChange,
    handleUpdateCustomerName,
    requiredDocuments,
    calculateTotal,
    suggestion,
    handleKeyDown,
    handleSubmit,
  } = useCreateOrder();

  // Aliases for compatibility with existing JSX
  const removeFile = handleRemoveAttachment;
  const toggleFine = handleFineToggle;

  if (loading) return <LoadingState />;

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden selection:bg-indigo-500/30'>
      {/* Dynamic Background Decoration */}
      <div className='fixed inset-0 pointer-events-none'>
        <div className='absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-blue-100/60 to-purple-100/60 blur-[130px] rounded-full -translate-y-1/2 translate-x-1/3 opacity-70'></div>
        <div className='absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-100/60 to-sky-100/60 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/4 opacity-70'></div>
        <div className='absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-indigo-100/40 blur-[150px] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-50'></div>
      </div>

      <div className='relative z-10 max-w-[1700px] mx-auto px-4 py-8'>
        {/* Header - Optimized Arabic */}
        <div className='flex items-center justify-between mb-10 px-4'>
          <div className='flex items-center gap-6'>
            <Link
              href='/admin/orders'
              className='group w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xl border border-slate-100 hover:bg-slate-50 transition-all active:scale-95'
            >
              <svg
                className='w-8 h-8 text-slate-700 group-hover:-translate-x-1 transition-transform'
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
            <div>
              <h1 className='text-4xl font-black text-slate-950 tracking-tight leading-none'>
                إضافة طلب جديد
              </h1>
              <p className='text-slate-500 mt-2 font-bold'>تسجيل طلب خدمة جديد في النظام</p>
            </div>
          </div>

          <div className='bg-white/80 backdrop-blur-md px-8 py-4 rounded-3xl border border-white shadow-2xl flex items-center gap-10'>
            <div className='flex flex-col items-center'>
              <span className='text-[11px] uppercase font-black text-slate-400 tracking-widest mb-1'>
                التاريخ
              </span>
              <span className='text-base font-black text-slate-800'>
                {new Date().toLocaleDateString('ar-EG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className='w-[1px] h-10 bg-slate-100'></div>
            <div className='flex flex-col items-center'>
              <span className='text-[11px] uppercase font-black text-slate-400 tracking-widest mb-1'>
                توقيت العمل
              </span>
              <span className='text-base font-black text-blue-600'>الوردية الصباحية</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 3-Column Grid Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
            {/* Column 1: Customer Info */}
            <div className='space-y-6'>
              <CustomerInfoSection
                formData={formData}
                setFormData={setFormData}
                customer={customer}
                searching={searching}
                suggestedUser={suggestedUser}
                searchResults={searchResults}
                showSearchDropdown={showSearchDropdown}
                setShowSearchDropdown={setShowSearchDropdown}
                searchCustomer={searchCustomer}
                selectCustomer={selectCustomer}
                handleUpdateCustomerName={handleUpdateCustomerName}
                handleNationalIdChange={handleNationalIdChange}
                searchingDependent={searchingDependent}
                suggestedDependent={suggestedDependent}
                dependentSearchResults={dependentSearchResults}
                showDependentDropdown={showDependentDropdown}
                setShowDependentDropdown={setShowDependentDropdown}
                searchDependent={searchDependent}
                selectDependent={selectDependent}
                saveNewDependent={saveNewDependent}
                showAddressModal={showAddressModal}
                setShowAddressModal={setShowAddressModal}
                suggestion={suggestion}
                handleKeyDown={handleKeyDown}
              />
            </div>

            {/* Column 2: Service & Documents */}
            <div className='space-y-6'>
              <ServiceSelectionSection
                formData={formData}
                setFormData={setFormData}
                serviceSearchTerm={serviceSearchTerm}
                setServiceSearchTerm={setServiceSearchTerm}
                showServiceDropdown={showServiceDropdown}
                setShowServiceDropdown={setShowServiceDropdown}
                filteredServices={filteredServices}
                selectedService={selectedService}
                selectedVariant={selectedVariant}
                handleVariantChange={handleVariantChange}
                formSerialNumber={formSerialNumber}
                serialValid={serialValid}
                validateSerialLive={validateSerialLive}
                selectService={selectService}
                calculateTotal={calculateTotal}
              />
              <DocumentsSection
                formData={formData}
                setFormData={setFormData}
                setShowAttachmentModal={setShowAttachmentModal}
                handleRemoveAttachment={handleRemoveAttachment}
                uploadedFiles={uploadedFiles}
                requiredDocuments={requiredDocuments}
              />
            </div>

            {/* Column 3: Confirmation Card */}
            <div className='space-y-6 lg:sticky lg:top-8'>
              <PaymentSection
                formData={formData}
                setFormData={setFormData}
                selectedVariant={selectedVariant}
                calculateTotal={calculateTotal}
                selectedFines={selectedFines}
                showFinesDropdown={showFinesDropdown}
                setShowFinesDropdown={setShowFinesDropdown}
                showServicesDropdown={showServicesDropdown}
                setShowServicesDropdown={setShowServicesDropdown}
                finesSearchTerm={finesSearchTerm}
                setFinesSearchTerm={setFinesSearchTerm}
                servicesSearchTerm={servicesSearchTerm}
                setServicesSearchTerm={setServicesSearchTerm}
                manualServices={manualServices}
                handleFineToggle={handleFineToggle}
                handleManualServiceChange={handleManualServiceChange}
              />

              <div className='bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 overflow-hidden relative group'>
                {/* Visual Accent */}
                <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600'></div>

                <div className='p-10'>
                  <h3 className='text-2xl font-black text-slate-900 mb-8 flex items-center justify-between'>
                    <span>تأكيد العملية</span>
                    <div className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
                      <span className='text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full'>
                        جاهز للتسجيل
                      </span>
                    </div>
                  </h3>

                  {/* Summary Details */}
                  <div className='space-y-5 mb-10'>
                    <div className='p-5 bg-slate-50 rounded-3xl border border-slate-100 space-y-3'>
                      <div className='flex justify-between items-center text-xs'>
                        <span className='text-slate-400 font-bold uppercase tracking-wider'>
                          العميل المختص
                        </span>
                        <span className='text-slate-900 font-black'>
                          {formData.customerName || 'لم يتم التحديد'}
                        </span>
                      </div>
                      <div className='flex justify-between items-center text-xs'>
                        <span className='text-slate-400 font-bold uppercase tracking-wider'>
                          الخدمة المطلوبة
                        </span>
                        <span className='text-blue-700 font-black'>
                          {selectedService?.name || 'لم يتم التحديد'}
                        </span>
                      </div>
                    </div>

                    <div className='space-y-4 px-2'>
                      <div className='flex justify-between items-center text-sm'>
                        <span className='text-slate-500 font-bold'>سعر الخدمة الأساسي</span>
                        <span className='text-slate-900 font-black'>
                          {(selectedVariant?.priceCents || 0) / 100} ج.م
                        </span>
                      </div>

                      {selectedFines.length > 0 && (
                        <div className='flex justify-between items-center text-sm'>
                          <span className='text-slate-500 font-bold'>إضافات وغرامات</span>
                          <span className='text-rose-600 font-black'>
                            +
                            {(
                              selectedFines.reduce((acc: number, id: string) => {
                                const f = PREDEFINED_FINES.find(p => p.id === id);
                                if (f?.id === 'service_001') {
                                  return acc + calculateFineExpenses(selectedFines);
                                }
                                return acc + (manualServices[id] || f?.amountCents || 0);
                              }, 0) / 100
                            ).toFixed(0)}{' '}
                            ج.م
                          </span>
                        </div>
                      )}

                      {formData.deliveryFee > 0 && (
                        <div className='flex justify-between items-center text-sm'>
                          <span className='text-slate-500 font-bold'>رسوم التوصيل</span>
                          <span className='text-indigo-600 font-black'>
                            +{formData.deliveryFee} ج.م
                          </span>
                        </div>
                      )}

                      <div className='h-[1px] bg-slate-100 my-6'></div>

                      <div className='flex justify-between items-end bg-slate-900 p-6 rounded-2xl text-white shadow-xl transform scale-105 origin-right'>
                        <div>
                          <span className='text-slate-400 font-bold block mb-2 text-[10px] uppercase tracking-[0.2em]'>
                            الإجمالي النهائي
                          </span>
                          <span className='text-4xl font-black tracking-tighter flex items-baseline gap-2'>
                            {calculateTotal().toLocaleString('ar-EG')}
                            <span className='text-lg text-slate-500 font-bold'>ج.م</span>
                          </span>
                        </div>

                        <div className='text-left border-r border-slate-700 pr-6 mr-6'>
                          <span className='text-slate-500 font-bold block mb-2 text-[10px] uppercase tracking-widest'>
                            المتبقي للدفع
                          </span>
                          <span className='text-xl font-black text-rose-400'>
                            {formData.remainingAmount.toFixed(0)}{' '}
                            <span className='text-xs opacity-70'>ج.م</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ActionsSection
                    formData={formData}
                    setFormData={setFormData}
                    customer={customer}
                    submitting={submitting}
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      <AddressModal
        isOpen={showAddressModal}
        formData={formData}
        onFormDataChange={data => setFormData((prev: any) => ({ ...prev, ...data }))}
        onClose={() => setShowAddressModal(false)}
      />

      <AttachmentModal
        isOpen={showAttachmentModal}
        onClose={() => setShowAttachmentModal(false)}
        onSave={handleSaveAttachment}
      />

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
    </div>
  );
}
