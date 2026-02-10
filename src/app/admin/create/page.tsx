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
  DocumentsSection,
  PaymentSection,
  ActionsSection,
  SuccessModal,
} from './components';
import { ServiceSelectionSection } from './components/sections/ServiceSelectionSection';

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
    dependentSuggestion,
    handleKeyDown,
    handleSubmit,
    handleReset,
    showSuccessModal,
    setShowSuccessModal,
    createdOrderId,
  } = useCreateOrder();

  // Aliases for compatibility with existing JSX
  const removeFile = handleRemoveAttachment;
  const toggleFine = handleFineToggle;

  if (loading) return <LoadingState />;

  return (
    <div className='min-h-screen bg-slate-50 text-slate-800 font-sans antialiased overflow-x-hidden selection:bg-emerald-500/30'>
      {/* Static Background Decoration - No Animations for Performance */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden'>
        <div className='absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-gradient-to-bl from-emerald-400/15 to-green-500/15 rounded-full' />
        <div className='absolute bottom-[-20%] left-[-10%] w-[900px] h-[900px] bg-gradient-to-tr from-emerald-600/10 to-teal-500/10 rounded-full' />
      </div>

      <div className='relative z-10 max-w-[1700px] mx-auto px-4 py-4'>
        {/* Header - Optimized Arabic */}
        {/* Header - Green Theme */}
        <div className='flex items-center justify-between mb-6 px-2'>
          <div className='flex items-center gap-4'>
            <Link
              href='/admin/orders'
              className='w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 group'
            >
              <svg
                className='w-6 h-6 text-slate-700 group-hover:-translate-x-1 transition-transform'
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
            
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-200'>
                📝
              </div>
              <div>
                <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
                  إنشاء طلب جديد
                </h1>
                <p className='text-slate-500 text-[10px] font-bold mt-1'>
                  اللوحة الإدارية / الطلبات
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Balanced 2-Column Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 items-start'>
            {/* Right Column (Customer & Documents) */}
            <div className='space-y-4'>
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
                dependentSuggestion={dependentSuggestion}
                handleKeyDown={handleKeyDown}
                selectedService={selectedService}
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

            {/* Left Column (Service & Payment) */}
            <div className='space-y-4'>
              <ServiceSelectionSection
                formData={formData}
                setFormData={setFormData}
                selectedService={selectedService}
                serviceSearchTerm={serviceSearchTerm}
                setServiceSearchTerm={setServiceSearchTerm}
                showServiceDropdown={showServiceDropdown}
                setShowServiceDropdown={setShowServiceDropdown}
                filteredServices={filteredServices}
                selectService={selectService}
                selectedVariant={selectedVariant}
                handleVariantChange={handleVariantChange}
                formSerialNumber={formSerialNumber}
                serialValid={serialValid}
                validateSerialLive={validateSerialLive}
              />

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

                <div className='p-6'>
                  <h3 className='text-xl font-black text-slate-900 mb-6 flex items-center justify-between'>
                    <span>تأكيد العملية</span>
                    <div className='flex items-center gap-2'>
                      <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
                      <span className='text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full'>
                        جاهز للتسجيل
                      </span>
                    </div>
                  </h3>

                  {/* Summary Details */}
                  <div className='space-y-4 mb-6'>
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

                      {/* Passport Fee Summary */}
                      {selectedService && selectedVariant && 
                       (selectedService.slug.toLowerCase().includes('passport') || selectedService.name.toLowerCase().includes('passport') || selectedService.name.includes('جواز')) &&
                       (selectedVariant.name.includes('عادي') || selectedVariant.name.includes('سريع')) &&
                       ['العجوزة', 'الشيخ زايد', '6 أكتوبر'].includes(formData.policeStation) && (
                        <div className='flex justify-between items-center text-sm'>
                          <span className='text-slate-500 font-bold'>رسوم منطقة جوازات</span>
                          <span className='text-emerald-600 font-black'>
                            +200 ج.م
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ActionsSection
                    formData={formData}
                    setFormData={setFormData}
                    customer={customer}
                    submitting={submitting}
                    handleReset={handleReset}
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

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        orderId={createdOrderId}
        onReset={() => {
          setShowSuccessModal(false);
          handleReset();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
      
    </div>
  );
}
