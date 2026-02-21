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
  ReviewSection,
  ActionsSection,
  SuccessModal,
  Tabs,
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
    phoneConflict,
    handleSubmit,
    handleReset,
    showSuccessModal,
    setShowSuccessModal,
    createdOrderId,
  } = useCreateOrder();

  // Aliases for compatibility with existing JSX
  const removeFile = handleRemoveAttachment;
  const toggleFine = handleFineToggle;

  const [activeTab, setActiveTab] = useState('customer');

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

        <Tabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'customer', label: '1. بيانات العميل', icon: '👤' },
            { id: 'service', label: '2. تفاصيل الخدمة', icon: '⚡' },
            { id: 'details', label: '3. تفاصيل الطلب والمرفقات', icon: '📄' },
            { id: 'financials', label: '4. الحسابات والدفع', icon: '💰' },
            { id: 'review', label: '5. المراجعة والتأكيد', icon: '✅' },
          ]}
        />

        <form onSubmit={handleSubmit}>
          {/* Tab Content Container */}
          <div className='bg-white/50 backdrop-blur-sm rounded-3xl p-1'>
            {/* Tab 1: Customer Info */}
            {activeTab === 'customer' && (
              <div className='space-y-4 animate-fadeIn'>
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
                  // Dependent Props
                  searchingDependent={searchingDependent}
                  suggestedDependent={suggestedDependent}
                  dependentSearchResults={dependentSearchResults}
                  showDependentDropdown={showDependentDropdown}
                  setShowDependentDropdown={setShowDependentDropdown}
                  searchDependent={searchDependent}
                  selectDependent={selectDependent}
                  saveNewDependent={saveNewDependent}
                  dependentSuggestion={dependentSuggestion}
                  showAddressModal={showAddressModal}
                  setShowAddressModal={setShowAddressModal}
                  suggestion={suggestion}
                  handleKeyDown={handleKeyDown}
                  selectedService={selectedService}
                  phoneConflict={phoneConflict}
                />

                <div className='flex justify-end pt-4 gap-3'>
                  <button
                    type='button'
                    onClick={() => setActiveTab('service')}
                    className='px-8 py-3 bg-cyan-600 text-white rounded-xl shadow-lg hover:bg-cyan-700 transition-all font-bold flex items-center gap-2'
                  >
                    <span>التالي: تفاصيل الخدمة</span>
                    <svg
                      className='w-5 h-5 rotate-180'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Service Selection */}
            {activeTab === 'service' && (
              <div className='space-y-4 animate-fadeIn'>
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

                <div className='flex justify-between pt-4 gap-3'>
                  <button
                    type='button'
                    onClick={() => setActiveTab('customer')}
                    className='px-6 py-3 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-medium'
                  >
                    السابق
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveTab('details')}
                    className='px-8 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all font-bold flex items-center gap-2'
                  >
                    <span>التالي: تفاصيل الطلب</span>
                    <svg
                      className='w-5 h-5 rotate-180'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Order Details */}
            {activeTab === 'details' && (
              <div className='space-y-4 animate-fadeIn'>
                <DocumentsSection
                  formData={formData}
                  setFormData={setFormData}
                  setShowAttachmentModal={setShowAttachmentModal}
                  handleRemoveAttachment={handleRemoveAttachment}
                  uploadedFiles={uploadedFiles}
                  requiredDocuments={requiredDocuments}
                />

                <div className='flex justify-between pt-4 gap-3'>
                  <button
                    type='button'
                    onClick={() => setActiveTab('service')}
                    className='px-6 py-3 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-medium'
                  >
                    السابق
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveTab('financials')}
                    className='px-8 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all font-bold flex items-center gap-2'
                  >
                    <span>التالي: الحسابات</span>
                    <svg
                      className='w-5 h-5 rotate-180'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 3: Financials */}
            {activeTab === 'financials' && (
              <div className='space-y-4 animate-fadeIn'>
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

                <div className='flex justify-between pt-4 gap-3'>
                  <button
                    type='button'
                    onClick={() => setActiveTab('details')}
                    className='px-6 py-3 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-medium'
                  >
                    السابق
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveTab('review')}
                    className='px-8 py-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 transition-all font-bold flex items-center gap-2'
                  >
                    <span>التالي: المراجعة</span>
                    <svg
                      className='w-5 h-5 rotate-180'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M9 5l7 7-7 7'
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Tab 4: Review */}
            {activeTab === 'review' && (
              <div className='space-y-4 animate-fadeIn'>
                <ReviewSection
                  formData={formData}
                  setFormData={setFormData}
                  customer={customer}
                  selectedService={selectedService}
                  selectedVariant={selectedVariant}
                  selectedFines={selectedFines}
                  manualServices={manualServices}
                  calculateTotal={calculateTotal}
                  submitting={submitting}
                  handleReset={handleReset}
                  setActiveTab={setActiveTab}
                />

                <div className='flex justify-start pt-4'>
                  <button
                    type='button'
                    onClick={() => setActiveTab('financials')}
                    className='px-6 py-3 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-medium'
                  >
                    السابق: الحسابات
                  </button>
                </div>
              </div>
            )}
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
