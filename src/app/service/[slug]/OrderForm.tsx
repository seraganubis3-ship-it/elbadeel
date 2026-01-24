'use client';

import { useState } from 'react';
import { useToast, ToastContainer } from '@/components/Toast';
import StepIndicator from '@/components/order/StepIndicator';
import VariantSelection from '@/components/order/VariantSelection';
import PersonalDataForm from '@/components/order/PersonalDataForm';
import DocumentUploader from '@/components/order/DocumentUploader';
import DeliverySelection from '@/components/order/DeliverySelection';
import OrderReview from '@/components/order/OrderReview';
import DynamicFields from '@/components/order/DynamicFields';
import { AnimatePresence, motion } from 'framer-motion';

interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  showIf?: string;
  options: { id: string; value: string; label: string }[];
}

export default function OrderForm({
  serviceId,
  serviceSlug,
  serviceName,
  variants,
  user,
  requiredDocuments = [],
  dynamicFields = [],
}: {
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  variants: any[];
  user: any;
  requiredDocuments?: any[];
  dynamicFields?: DynamicField[];
}) {
  // --- State Management ---
  const [currentStep, setCurrentStep] = useState(1);
  // Adjust total steps based on whether we have dynamic fields
  const hasDynamicFields = dynamicFields.length > 0;
  const totalSteps = hasDynamicFields ? 6 : 5;

  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});

  // Dynamic field values
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    customerName: user.name || '',
    customerPhone: user.phone || '',
    customerEmail: user.email || '',
    address: '',
    notes: '',
    deliveryType: 'OFFICE',
    wifeName: '',
    wifeMotherName: '',
    marriageDate: '',
    fatherName: '',
    motherName: user.motherName || '',
    birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
    nationality: user.nationality || 'مصري',
    idNumber: user.idNumber || '',
  });

  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountAmount: number;
    id: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showSuccess, showError, showWarning, toasts, removeToast } = useToast();

  const DELIVERY_FEE = 5000; // 50 EGP

  // --- Handlers ---
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleDynamicChange = (name: string, value: string) => {
    setDynamicValues(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (docId: string, file: File | null) => {
    setSelectedFiles(prev => ({ ...prev, [docId]: file }));
  };

  const handlePromoApply = async (code: string) => {
    const orderTotal =
      selectedVariant.priceCents + (formData.deliveryType === 'ADDRESS' ? DELIVERY_FEE : 0);

    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, orderTotal }),
      });
      const data = await response.json();

      if (response.ok && data.valid) {
        setAppliedPromo({ code: data.code, discountAmount: data.discountAmount, id: data.id });
        return { success: true, message: `تم خصم ${(data.discountAmount / 100).toFixed(2)} جنيه` };
      } else {
        return { success: false, message: data.error || 'الكود غير صالح' };
      }
    } catch {
      return { success: false, message: 'خطأ في الاتصال' };
    }
  };

  const handlePromoRemove = () => setAppliedPromo(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const formDataToSubmit = new FormData();

    // Append standard fields
    formDataToSubmit.append('serviceId', serviceId);
    formDataToSubmit.append('variantId', selectedVariant.id);
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSubmit.append(key, value);
    });

    // Append dynamic field values
    formDataToSubmit.append('serviceDetails', JSON.stringify(dynamicValues));

    // Address check
    formDataToSubmit.append(
      'deliveryFee',
      formData.deliveryType === 'ADDRESS' ? DELIVERY_FEE.toString() : '0'
    );

    // Files
    Object.entries(selectedFiles).forEach(([docId, file]) => {
      if (file) formDataToSubmit.append(`document_${docId}`, file);
    });

    // Promo
    if (appliedPromo) formDataToSubmit.append('promoCode', appliedPromo.code);

    try {
      const response = await fetch('/api/orders', { method: 'POST', body: formDataToSubmit });
      const result = await response.json();

      if (response.ok && result.success) {
        window.location.href = `/order/${result.orderId}/payment`;
      } else {
        showError('فشل الطلب', result.error || 'حدث خطأ ما');
      }
    } catch (e) {
      showError('خطأ', 'فشل الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Check if field is visible based on conditions ---
  const isFieldVisible = (field: DynamicField): boolean => {
    if (!field.showIf) return true;
    try {
      const condition = JSON.parse(field.showIf);
      return dynamicValues[condition.field] === condition.value;
    } catch {
      return true;
    }
  };

  // --- Check if document is visible based on conditions ---
  const isDocumentVisible = (doc: any): boolean => {
    if (!doc.showIf) return true;
    try {
      const condition = JSON.parse(doc.showIf);
      // Check if the field exists in dynamicValues and matches
      return dynamicValues[condition.field] === condition.value;
    } catch {
      return true;
    }
  };

  // Filter visible documents
  const visibleDocuments = requiredDocuments.filter(isDocumentVisible);

  // --- Navigation Guards ---
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!selectedVariant;
      case 2:
        // Check dynamic fields if present
        if (hasDynamicFields) {
          const requiredFields = dynamicFields.filter(f => f.required && isFieldVisible(f));
          return requiredFields.every(f => !!dynamicValues[f.name]);
        }
        return true;
      case 3:
        // Personal data (was step 2)
        return !!(formData.customerName && formData.customerPhone && formData.idNumber);
      case 4:
        // Documents (was step 3)
        // Only validate visible documents
        return (
          visibleDocuments.length === 0 ||
          visibleDocuments.filter(d => d.required).every(d => !!selectedFiles[d.id])
        );
      case 5:
        // Delivery (was step 4)
        return (
          formData.deliveryType === 'OFFICE' ||
          (formData.deliveryType === 'ADDRESS' && formData.address.length > 5)
        );
      default:
        return true;
    }
  };

  // Adjust step numbers when no dynamic fields
  const getActualStep = (step: number) => {
    if (!hasDynamicFields && step >= 2) {
      return step - 1;
    }
    return step;
  };

  // --- Render Steps ---
  const renderStepContent = () => {
    if (hasDynamicFields) {
      switch (currentStep) {
        case 1:
          return (
            <VariantSelection
              variants={variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />
          );
        case 2:
          return (
            <DynamicFields
              fields={dynamicFields}
              values={dynamicValues}
              onChange={handleDynamicChange}
            />
          );
        case 3:
          return (
            <PersonalDataForm
              formData={formData}
              onChange={handleInputChange}
              serviceSlug={serviceSlug}
              serviceName={serviceName}
            />
          );
        case 4:
          return (
            <DocumentUploader
              requiredDocuments={visibleDocuments}
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
            />
          );
        case 5:
          return (
            <DeliverySelection
              formData={formData}
              onChange={handleInputChange}
              deliveryFee={DELIVERY_FEE}
            />
          );
        case 6:
          return (
            <OrderReview
              selectedVariant={selectedVariant}
              deliveryType={formData.deliveryType}
              deliveryFee={DELIVERY_FEE}
              onApplyPromo={handlePromoApply}
              onRemovePromo={handlePromoRemove}
              appliedPromo={appliedPromo}
              dynamicFields={dynamicFields}
              dynamicValues={dynamicValues}
            />
          );
        default:
          return null;
      }
    } else {
      // Original 5-step flow
      switch (currentStep) {
        case 1:
          return (
            <VariantSelection
              variants={variants}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
            />
          );
        case 2:
          return (
            <PersonalDataForm
              formData={formData}
              onChange={handleInputChange}
              serviceSlug={serviceSlug}
              serviceName={serviceName}
            />
          );
        case 3:
          return (
            <DocumentUploader
              requiredDocuments={visibleDocuments}
              selectedFiles={selectedFiles}
              onFileSelect={handleFileSelect}
            />
          );
        case 4:
          return (
            <DeliverySelection
              formData={formData}
              onChange={handleInputChange}
              deliveryFee={DELIVERY_FEE}
            />
          );
        case 5:
          return (
            <OrderReview
              selectedVariant={selectedVariant}
              deliveryType={formData.deliveryType}
              deliveryFee={DELIVERY_FEE}
              onApplyPromo={handlePromoApply}
              onRemovePromo={handlePromoRemove}
              appliedPromo={appliedPromo}
            />
          );
        default:
          return null;
      }
    }
  };

  const stepsLabels = hasDynamicFields
    ? [
        'نوع الخدمة',
        'تفاصيل الخدمة',
        'بيانات مقدم الطلب',
        'المستندات',
        'طريقة الاستلام',
        'تأكيد الطلب',
      ]
    : ['تفاصيل الخدمة', 'بيانات مقدم الطلب', 'المستندات', 'طريقة الاستلام', 'تأكيد الطلب'];

  return (
    <div className='relative'>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Top Gradient Banner */}
      <div className='h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500' />

      {/* Header Section */}
      <div className='bg-gradient-to-b from-slate-50 to-white px-6 sm:px-10 pt-8 pb-6 border-b border-slate-100'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6'>
          <div>
            <h2 className='text-xl sm:text-2xl font-black text-slate-900'>إتمام الطلب</h2>
            <p className='text-slate-500 text-sm mt-1'>أكمل الخطوات التالية لإرسال طلبك</p>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <span className='px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full font-bold'>
              الخطوة {currentStep} من {totalSteps}
            </span>
          </div>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} steps={stepsLabels} />
      </div>

      {/* Content Area */}
      <div className='p-6 sm:p-10'>
        <div className='min-h-[380px] sm:min-h-[420px]'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {renderStepContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className='flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-10 pt-6 border-t border-slate-100'>
          {/* Back Button */}
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(c => c - 1)}
              className='w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 transition-all flex items-center justify-center gap-2'
            >
              <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M15 19l-7-7 7-7'
                />
              </svg>
              رجوع
            </button>
          ) : (
            <div className='hidden sm:block' />
          )}

          {/* Progress Bar (Mobile) */}
          <div className='w-full sm:hidden bg-slate-100 rounded-full h-2 mb-2'>
            <div
              className='bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500'
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Next/Submit Button */}
          <button
            onClick={() =>
              currentStep === totalSteps ? handleSubmit() : setCurrentStep(c => c + 1)
            }
            disabled={!canProceed() || isSubmitting}
            className={`
              w-full sm:w-auto px-8 sm:px-10 py-4 rounded-xl font-black text-white shadow-lg transition-all transform active:scale-[0.98] flex items-center justify-center gap-3
              ${
                !canProceed() || isSubmitting
                  ? 'bg-slate-200 text-slate-400 shadow-none cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-200 hover:shadow-xl'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <svg className='w-5 h-5 animate-spin' fill='none' viewBox='0 0 24 24'>
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
                جاري الإرسال...
              </>
            ) : currentStep === totalSteps ? (
              <>
                <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                تأكيد ودفع
              </>
            ) : (
              <>
                متابعة
                <svg
                  className='w-5 h-5 rtl:rotate-180'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 5l7 7-7 7'
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
