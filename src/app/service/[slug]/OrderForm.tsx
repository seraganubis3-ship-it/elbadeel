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
  options: { id: string; value: string; label: string; requiredDocs?: string[] }[];
}

const StepWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    {children}
  </div>
);

export default function OrderForm({
  serviceId,
  serviceSlug,
  serviceName,
  variants,
  user,
  requiredDocuments = [],
  dynamicFields = [],
  defaultDeliveryFee = 5000,
}: {
  serviceId: string;
  serviceSlug: string;
  serviceName: string;
  variants: any[];
  user: any;
  requiredDocuments?: any[];
  dynamicFields?: DynamicField[];
  defaultDeliveryFee?: number;
}) {
  // --- State Management ---
  // Must be first because logic depends on it
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File | null }>({});
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

  // Use defaultDeliveryFee from settings instead of hardcoded value
  const DELIVERY_FEE = defaultDeliveryFee;


  // --- Special Logic for Passport Service ---
  const isPassportService = serviceName.includes('جواز') || serviceSlug.includes('passport');

  // Inject "Governorate" field for Passport service if not present
  const effectiveDynamicFields = [...dynamicFields];
  if (isPassportService && !effectiveDynamicFields.find(f => f.name === 'governorate')) {
    effectiveDynamicFields.unshift({
      id: 'gov-auto-injected',
      name: 'governorate',
      label: 'المحافظة التابع لها',
      type: 'select',
      required: true,

      options: [
        { id: 'cairo', value: 'القاهرة', label: 'القاهرة' },
        { id: 'giza', value: 'الجيزة', label: 'الجيزة' },
        { id: 'alex', value: 'الإسكندرية', label: 'الإسكندرية' },
        { id: 'dakahlia', value: 'الدقهلية', label: 'الدقهلية' },
        { id: 'sharkia', value: 'الشرقية', label: 'الشرقية' },
        { id: 'monufia', value: 'المنوفية', label: 'المنوفية' },
        { id: 'qalubia', value: 'القليوبية', label: 'القليوبية' },
        { id: 'gharbia', value: 'الغربية', label: 'الغربية' },
        { id: 'beheira', value: 'البحيرة', label: 'البحيرة' },
        { id: 'damietta', value: 'دمياط', label: 'دمياط' },
        { id: 'port-said', value: 'بورسعيد', label: 'بورسعيد' },
        { id: 'ismailia', value: 'الإسماعيلية', label: 'الإسماعيلية' },
        { id: 'suez', value: 'السويس', label: 'السويس' },
        { id: 'matruh', value: 'مطروح', label: 'مطروح' },
        { id: 'north-sinai', value: 'شمال سيناء', label: 'شمال سيناء' },
        { id: 'south-sinai', value: 'جنوب سيناء', label: 'جنوب سيناء' },
        { id: 'beni-suef', value: 'بني سويف', label: 'بني سويف' },
        { id: 'fayoum', value: 'الفيوم', label: 'الفيوم' },
        { id: 'minya', value: 'المنيا', label: 'المنيا' },
        { id: 'assiut', value: 'أسيوط', label: 'أسيوط' },
        { id: 'sohag', value: 'سوهاج', label: 'سوهاج' },
        { id: 'qena', value: 'قنا', label: 'قنا' },
        { id: 'luxor', value: 'الأقصر', label: 'الأقصر' },
        { id: 'aswan', value: 'أسوان', label: 'أسوان' },
        { id: 'red-sea', value: 'البحر الأحمر', label: 'البحر الأحمر' },
        { id: 'new-valley', value: 'الوادي الجديد', label: 'الوادي الجديد' },
        { id: 'kafr-el-sheikh', value: 'كفر الشيخ', label: 'كفر الشيخ' },
      ],
    });
  }
  
  // Adjust total steps based on whether we have dynamic fields
  // Must be calculated after effectiveDynamicFields
  const hasDynamicFields = effectiveDynamicFields.length > 0;
  const totalSteps = hasDynamicFields ? 6 : 5;


  // Filter variants based on Passport logic
  const filteredVariants = variants.filter(variant => {
    if (!isPassportService) return true;
    
    // Step 1 is now questions. So by step 2, we will have the answer.
    const selectedGov = dynamicValues['governorate'];
    
    // If governorate is NOT Giza, strictly require 'فوري' (Immediate)
    // We only enforce this if they have answered (which they must have to pass step 1)
    if (selectedGov && selectedGov !== 'الجيزة') {
       return variant.name.includes('فوري');
    }
    
    return true;
  });

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
        body: JSON.stringify({
          code,
          orderTotal,
          userId: user?.id,
          phone: formData.customerPhone,
        }),
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

  // --- Derived State: Triggered Documents from Dynamic Answers ---
  const triggeredDocTitles = effectiveDynamicFields.reduce((acc: string[], field) => {
    const selectedValue = dynamicValues[field.name];
    if (selectedValue) {
      const selectedOption = field.options.find(opt => opt.value === selectedValue); // Match by value, not label!
      if (selectedOption?.requiredDocs) {
        // Parse if it's a string (JSON), otherwise assume array if strictly typed (it's string[] in type def usually, but check schema)
        // Schema says ServiceFieldOption.requiredDocs is String? (JSON array)
        let docs: string[] = [];
        if (Array.isArray(selectedOption.requiredDocs)) {
           docs = selectedOption.requiredDocs;
        } else if (typeof selectedOption.requiredDocs === 'string') {
           try { docs = JSON.parse(selectedOption.requiredDocs); } catch {}
        }
        return [...acc, ...docs];
      }
    }
    return acc;
  }, []);

  // --- Check if document is visible based on conditions ---
  const isDocumentVisible = (doc: any): boolean => {
    // 1. If it's triggered by a specific answer, it MUST be visible
    if (triggeredDocTitles.includes(doc.title)) return true;

    // 2. If it has a specific showIf condition, check it
    if (doc.showIf) {
      try {
        const condition = JSON.parse(doc.showIf);
        return dynamicValues[condition.field] === condition.value;
      } catch {
        // Validation failed, fall through to default
      }
    }

    // 3. If it's globally required, it must be visible
    if (doc.required) return true;

    // 4. Otherwise, HIDE IT (Optional documents are hidden unless triggered explicitly)
    // This matches the user's request: "It shouldn't appear ... unless I need this paper"
    return false;
  };

  // Process documents to update their 'required' status dynamically
  const processedDocuments = requiredDocuments
    .filter(isDocumentVisible)
    .map(doc => ({
      ...doc,
      // It is required if it's globally required OR triggered by an answer
      required: doc.required || triggeredDocTitles.includes(doc.title),
    }));

  // --- Navigation Guards ---
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        // Step 1 is now Questions (if hasDynamicFields) OR Variants (if not)
         if (hasDynamicFields) {
           const requiredFields = effectiveDynamicFields.filter(f => f.required && isFieldVisible(f));
           return requiredFields.every(f => !!dynamicValues[f.name]);
         } else {
             return !!selectedVariant;
         }
      case 2:
         // Step 2 is now Variants (if hasDynamicFields) OR Personal Data (if not)
         if (hasDynamicFields) {
             return !!selectedVariant;
         } else {
            return !!(formData.customerName && formData.customerPhone && formData.idNumber);
         }
      case 3:
        // Personal data (was step 2, now 3 if hasDynamicFields) OR Documents (if not)
        if (hasDynamicFields) {
             return !!(formData.customerName && formData.customerPhone && formData.idNumber);
        } else {
             return (
               processedDocuments.length === 0 ||
               processedDocuments.filter(d => d.required).every(d => !!selectedFiles[d.id])
             );
        }
      case 4:
        // Documents (was 3, now 4 if hasDynamicFields) OR Delivery (if not)
         if (hasDynamicFields) {
            return (
              processedDocuments.length === 0 ||
              processedDocuments.filter(d => d.required).every(d => !!selectedFiles[d.id])
            );
         } else {
            return (
              formData.deliveryType === 'OFFICE' ||
              (formData.deliveryType === 'ADDRESS' && formData.address.length > 5)
            );
         }
      case 5:
        // Delivery OR Confirm
        if (hasDynamicFields) {
             return (
              formData.deliveryType === 'OFFICE' ||
              (formData.deliveryType === 'ADDRESS' && formData.address.length > 5)
            );
        } else {
             return true;
        }
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
    // Shared transition wrapper - REMOVED (Defined externally)

    if (hasDynamicFields) {
      switch (currentStep) {
        case 1:
            // SWAPPED: Questions First
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">تفاصيل إضافية</h3>
                <p className="text-slate-500">يرجى الإجابة على الأسئلة التالية لتخصيص الخدمة</p>
              </div>
              <DynamicFields
                fields={effectiveDynamicFields}
                values={dynamicValues}
                onChange={handleDynamicChange}
              />
            </StepWrapper>
          );
        case 2:
            // SWAPPED: Variants Second
            // Show alert if no variants available
            if (filteredVariants.length === 0) {
                 return (
                    <StepWrapper>
                        <div className="text-center p-10 bg-amber-50 rounded-2xl border border-amber-200">
                             <h3 className="text-xl font-bold text-amber-800 mb-2">عفواً، لا توجد خيارات متاحة</h3>
                             <p className="text-amber-700">بناءً على اختياراتك، لا تتوفر خيارات خدمة حالياً.</p>
                             <button onClick={() => setCurrentStep(1)} className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg">العودة للتعديل</button>
                        </div>
                    </StepWrapper>
                 );
            }
          return (
            <StepWrapper>
              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">اختر نوع الخدمة</h3>
                <p className="text-slate-500">اختر الباقة المناسبة لاحتياجاتك</p>
              </div>
              <VariantSelection
                variants={filteredVariants} // USE FILTERED VARIANTS
                selectedVariant={selectedVariant}
                onSelect={setSelectedVariant}
              />
            </StepWrapper>
          );
        case 3:
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">البيانات الشخصية</h3>
                <p className="text-slate-500">أدخل بيانات صاحب الطلب بدقة</p>
              </div>
              <PersonalDataForm
                formData={formData}
                onChange={handleInputChange}
                serviceSlug={serviceSlug}
                serviceName={serviceName}
              />
            </StepWrapper>
          );
        case 4:
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">المستندات المطلوبة</h3>
                <p className="text-slate-500">ارفع صور واضحة للمستندات المطلوبة</p>
              </div>
              <DocumentUploader
                requiredDocuments={processedDocuments}
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
              />
            </StepWrapper>
          );
        case 5:
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">طريقة الاستلام</h3>
                <p className="text-slate-500">كيف تفضل استلام مستنداتك؟</p>
              </div>
              <DeliverySelection
                formData={formData}
                onChange={handleInputChange}
                deliveryFee={DELIVERY_FEE}
              />
            </StepWrapper>
          );
        case 6:
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">مراجعة الطلب</h3>
                <p className="text-slate-500">راجع تفاصيل طلبك قبل التأكيد النهائي</p>
              </div>
              <OrderReview
                selectedVariant={selectedVariant}
                deliveryType={formData.deliveryType}
                deliveryFee={DELIVERY_FEE}
                onApplyPromo={handlePromoApply}
                onRemovePromo={handlePromoRemove}
                appliedPromo={appliedPromo}
                dynamicFields={effectiveDynamicFields}
                dynamicValues={dynamicValues}
              />
            </StepWrapper>
          );
        default:
          return null;
      }
    } else {
      // Original 5-step flow for services without questions
      switch (currentStep) {
        case 1:
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">اختر نوع الخدمة</h3>
                <p className="text-slate-500">حدد الخيار المناسب لك</p>
              </div>
              <VariantSelection
                variants={variants}
                selectedVariant={selectedVariant}
                onSelect={setSelectedVariant}
              />
            </StepWrapper>
          );
        case 2:
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">البيانات الشخصية</h3>
                <p className="text-slate-500">أدخل البيانات المطلوبة لإتمام الخدمة</p>
              </div>
              <PersonalDataForm
                formData={formData}
                onChange={handleInputChange}
                serviceSlug={serviceSlug}
                serviceName={serviceName}
              />
            </StepWrapper>
          );
        case 3:
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">رفع المستندات</h3>
                <p className="text-slate-500">تأكد من وضوح صور المستندات</p>
              </div>
              <DocumentUploader
                requiredDocuments={processedDocuments}
                selectedFiles={selectedFiles}
                onFileSelect={handleFileSelect}
              />
            </StepWrapper>
          );
        case 4:
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">توصيل الطلب</h3>
                <p className="text-slate-500">اختر طريقة التوصيل المناسبة</p>
              </div>
              <DeliverySelection
                formData={formData}
                onChange={handleInputChange}
                deliveryFee={DELIVERY_FEE}
              />
            </StepWrapper>
          );
        case 5:
          return (
            <StepWrapper>
               <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-slate-900">ملخص الطلب</h3>
                <p className="text-slate-500">الخطوة الأخيرة قبل التنفيذ</p>
              </div>
              <OrderReview
                selectedVariant={selectedVariant}
                deliveryType={formData.deliveryType}
                deliveryFee={DELIVERY_FEE}
                onApplyPromo={handlePromoApply}
                onRemovePromo={handlePromoRemove}
                appliedPromo={appliedPromo}
              />
            </StepWrapper>
          );
        default:
          return null;
      }
    }
  };

  const stepsLabels = hasDynamicFields
    ? [
        'تخصيص', // Swapped
        'نوع الخدمة',
        'بياناتك',
        'المستندات',
        'التوصيل',
        'تأكيد',
      ]
    : ['الخدمة', 'بياناتك', 'المستندات', 'التوصيل', 'تأكيد'];

  return (
    <div className='relative'>
      <ToastContainer toasts={toasts} onRemoveToast={removeToast} />

      {/* Decorative Top Bar */}
      <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 rounded-t-[2rem]' />

      {/* Header Section */}
      <div className='px-6 sm:px-10 pt-10 pb-8 border-b border-slate-100 bg-white/50 backdrop-blur-sm rounded-t-[2rem]'>
        <div className='flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8'>
          <div>
            <h2 className='text-2xl sm:text-3xl font-black text-slate-900 tracking-tight'>إجراء طلب جديد</h2>
            <p className='text-slate-500 mt-2 font-medium'>خطوات بسيطة لإتمام خدمتك الحكومية</p>
          </div>
          
          <div className='bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 flex items-center gap-3 self-start md:self-auto'>
            <div className="flex -space-x-2 space-x-reverse">
               <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
               <div className="w-2 h-2 rounded-full bg-indigo-400" />
               <div className="w-2 h-2 rounded-full bg-indigo-300" />
            </div>
            <span className='text-indigo-700 font-bold text-sm'>
              الخطوة {currentStep} <span className="text-indigo-400 font-light mx-1">/</span> {totalSteps}
            </span>
          </div>
        </div>

        <div className="py-2">
           <StepIndicator currentStep={currentStep} totalSteps={totalSteps} steps={stepsLabels} />
        </div>
      </div>

      {/* Content Area */}
      <div className='p-6 sm:p-10 bg-white min-h-[500px]'>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="w-full max-w-3xl mx-auto"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Footer Navigation */}
        <div className='mt-12 pt-8 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-4'>
          {/* Back Button */}
          {currentStep > 1 ? (
            <button
              onClick={() => setCurrentStep(c => c - 1)}
              className='w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 transition-all flex items-center justify-center gap-2 group'
            >
              <svg className='w-5 h-5 group-hover:-translate-x-1 transition-transform' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2.5} d='M9 5l7 7-7 7' /> {/* LTR chevron adapted for RTL */}
              </svg>
              خطوة للخلف
            </button>
          ) : (
            <div className='hidden sm:block' />
          )}

          {/* Next/Submit Button */}
          <button
            onClick={() =>
              currentStep === totalSteps ? handleSubmit() : setCurrentStep(c => c + 1)
            }
            disabled={!canProceed() || isSubmitting}
            className={`
              w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-indigo-200/50 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3
              ${
                !canProceed() || isSubmitting
                  ? 'bg-slate-100 text-slate-400 shadow-none cursor-not-allowed border border-slate-200'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                جاري المعالجة...
              </>
            ) : currentStep === totalSteps ? (
              <>
                تأكيد وانتظار المراجعة
                <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                </svg>
              </>
            ) : (
              <>
                متابعة الخطوات
                <svg
                  className='w-5 h-5 rtl:rotate-180'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                   <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 19l-7-7 7-7' />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
