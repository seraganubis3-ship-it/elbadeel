'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCreateOrder } from './useCreateOrder';
import {
  LoadingState,
  AddressModal,
  AttachmentModal,
  CustomerInfoSection,
  DocumentsSection,
  PaymentSection,
  ReviewSection,
  SuccessModal,
  Tabs,
} from './components';
import { ServiceSelectionSection } from './components/sections/ServiceSelectionSection';

export default function CreateOrderPage() {
  const {
    filteredServices,
    selectedService,
    selectedVariant,
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
    handleSaveAttachment,
    handleRemoveAttachment,
    formSerialNumber,
    setFormSerialNumber,
    formSerialProvider,
    setFormSerialProvider,
    serialValid,
    validateSerialLive,
    selectedFines,
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
    formData,
    setFormData,
    handleNationalIdChange,
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
    finesList,
    clearCustomer,
  } = useCreateOrder();

  // Aliases for compatibility with existing JSX
  const toggleFine = handleFineToggle;

  const [activeTab, setActiveTab] = useState('service');

  // Auto-scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  if (loading) return <LoadingState />;

  return (
    <div className='enlarge-text min-h-screen bg-slate-100 text-slate-800 font-sans antialiased overflow-x-hidden selection:bg-emerald-500/25'>
      {/* Static Background Decoration - No Animations for Performance */}
      <div className='fixed inset-0 pointer-events-none overflow-hidden bg-[linear-gradient(180deg,#ecfdf5_0%,#f8fafc_34%,#f1f5f9_100%)]'>
        <div className='absolute inset-0 opacity-[0.38] [background-image:linear-gradient(to_right,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.06)_1px,transparent_1px)] [background-size:32px_32px]' />
        <div className='absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-emerald-200/45 via-cyan-100/30 to-transparent' />
      </div>

      <div className='relative z-10 max-w-[1500px] mx-auto px-3 py-4 sm:px-5 lg:px-8'>
        {/* Header - Optimized Arabic */}
        {/* Header - Green Theme */}
        <div className='mb-5 flex items-center justify-between rounded-2xl border border-white/70 bg-white/85 px-4 py-4 shadow-sm shadow-slate-200/80 backdrop-blur sm:px-6'>
          <div className='flex items-center gap-4'>
            <Link
              href='/admin/orders'
              className='w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-95 group'
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
              <div className='w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-100 ring-1 ring-emerald-500/20'>
                📝
              </div>
              <div>
                <h1 className='text-2xl font-black text-slate-900 tracking-tight'>
                  إنشاء طلب جديد
                </h1>
                <p className='text-slate-500 text-xs font-bold mt-1'>اللوحة الإدارية / الطلبات</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={[
            { id: 'service', label: '1. تفاصيل الخدمة', icon: '⚡' },
            { id: 'customer', label: '2. بيانات العميل', icon: '👤' },
            { id: 'details', label: '3. تفاصيل الطلب والمرفقات', icon: '📄' },
            { id: 'financials', label: '4. الحسابات والدفع', icon: '💰' },
            { id: 'review', label: '5. المراجعة والتأكيد', icon: '✅' },
          ]}
        />

        <form onSubmit={handleSubmit}>
          {/* Tab Content Container */}
          <div className='rounded-2xl border border-white/70 bg-white/70 p-2 shadow-sm shadow-slate-200/80 backdrop-blur'>
            {/* Tab 1: Service Selection */}
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
                  formSerialProvider={formSerialProvider}
                  setFormSerialProvider={setFormSerialProvider}
                  serialValid={serialValid}
                  validateSerialLive={validateSerialLive}
                />

                <div className='flex justify-end pt-4 gap-3'>
                  <button
                    type='button'
                    onClick={() => setActiveTab('customer')}
                    className='px-8 py-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all font-bold flex items-center gap-2 active:scale-[0.98]'
                  >
                    <span>التالي: بيانات العميل</span>
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

            {/* Tab 2: Customer Info */}
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
                  handleNationalIdChange={handleNationalIdChange}
                  phoneConflict={phoneConflict}
                  clearCustomer={clearCustomer}
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
                    onClick={() => setActiveTab('details')}
                    className='px-8 py-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all font-bold flex items-center gap-2 active:scale-[0.98]'
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
                    onClick={() => setActiveTab('customer')}
                    className='px-6 py-3 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 transition-all font-medium'
                  >
                    السابق
                  </button>
                  <button
                    type='button'
                    onClick={() => setActiveTab('financials')}
                    className='px-8 py-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all font-bold flex items-center gap-2 active:scale-[0.98]'
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
                  finesList={finesList}
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
                  handleFineToggle={toggleFine}
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
                    className='px-8 py-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all font-bold flex items-center gap-2 active:scale-[0.98]'
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
                  finesList={finesList}
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
          setActiveTab('service');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
