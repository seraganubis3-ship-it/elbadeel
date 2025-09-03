"use client";

import { useState, useEffect } from "react";

export default function OrderForm({ 
  serviceId, 
  serviceName, 
  variants,
  user,
  requiredDocuments = []
}: { 
  serviceId: string; 
  serviceName: string;
  variants: any[];
  user: any;
  requiredDocuments?: any[];
}) {
  const [selectedFiles, setSelectedFiles] = useState<{[key: string]: File | null}>({});
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerName: user.name || "",
    customerPhone: user.phone || "",
    customerEmail: user.email || "",
    address: "",
    notes: "",
    deliveryType: "OFFICE", // OFFICE or ADDRESS
    // معلومات شخصية إضافية
    wifeName: user.wifeName || "",
    fatherName: user.fatherName || "",
    motherName: user.motherName || "",
    birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : "",
    nationality: user.nationality || "",
    idNumber: user.idNumber || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delivery fee in cents (50 EGP = 5000 cents)
  const DELIVERY_FEE = 5000;

  const totalSteps = 5; // Increased to 5 steps

  const handleFileSelect = (docId: string, file: File | null) => {
    setSelectedFiles(prev => ({
      ...prev,
      [docId]: file
    }));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVariantSelect = (variant: any) => {
    setSelectedVariant(variant);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1: return selectedVariant;
      case 2: return formData.customerName && formData.customerPhone && formData.customerEmail;
      case 3: return requiredDocuments.length === 0 || Object.keys(selectedFiles).length === requiredDocuments.length;
      case 4: return formData.deliveryType === "OFFICE" || (formData.deliveryType === "ADDRESS" && formData.address.trim());
      default: return true;
    }
  };

  const getFilePreview = (file: File): string | null => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate required data
    if (!selectedVariant) {
      alert('يرجى اختيار نوع الخدمة أولاً');
      return;
    }
    
    if (!formData.customerName || !formData.customerPhone || !formData.customerEmail) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }
    
    setIsSubmitting(true);
    
    const formDataToSubmit = new FormData();
    
    // Add all form data
    formDataToSubmit.append("serviceId", serviceId);
    formDataToSubmit.append("variantId", selectedVariant.id);
    formDataToSubmit.append("customerName", formData.customerName);
    formDataToSubmit.append("customerPhone", formData.customerPhone);
    formDataToSubmit.append("customerEmail", formData.customerEmail);
    formDataToSubmit.append("address", formData.address);
    formDataToSubmit.append("notes", formData.notes);
    formDataToSubmit.append("deliveryType", formData.deliveryType);
    formDataToSubmit.append("deliveryFee", formData.deliveryType === "ADDRESS" ? DELIVERY_FEE.toString() : "0");
    
    // Add personal information
    formDataToSubmit.append("wifeName", formData.wifeName);
    formDataToSubmit.append("fatherName", formData.fatherName);
    formDataToSubmit.append("motherName", formData.motherName);
    formDataToSubmit.append("birthDate", formData.birthDate);
    formDataToSubmit.append("nationality", formData.nationality);
    formDataToSubmit.append("idNumber", formData.idNumber);
    
    // Add files
    Object.entries(selectedFiles).forEach(([docId, file]) => {
      if (file) {
        formDataToSubmit.append(`document_${docId}`, file);
      }
    });
    
    try {
      console.log('Submitting order with data:', {
        serviceId,
        variantId: selectedVariant.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerEmail: formData.customerEmail,
        address: formData.address,
        notes: formData.notes
      });
      
      const response = await fetch('/api/orders', {
        method: 'POST',
        body: formDataToSubmit,
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      let result;
             const responseText = await response.text();
       console.log('Raw response text:', responseText);
       
       try {
         result = JSON.parse(responseText);
       } catch (parseError) {
         console.error('Failed to parse response as JSON:', parseError);
         console.log('Response was:', responseText);
         throw new Error('خطأ في تحليل الاستجابة من الخادم');
       }
      
      console.log('Response body:', result);
      
      if (response.ok && result.success) {
        // Redirect to payment page
        window.location.href = `/order/${result.orderId}/payment-simple`;
      } else {
        const errorMessage = result.error || `خطأ HTTP ${response.status}: حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.`;
        alert(errorMessage);
        console.error('Error submitting order:', result);
        console.error('Response status:', response.status);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('حدث خطأ أثناء تقديم الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 border border-gray-100">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 px-4">
        <div className="flex items-center w-full max-w-md">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex items-center flex-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                currentStep >= step 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {step}
              </div>
              {step < 5 && (
                <div className={`h-1 flex-1 mx-2 transition-all duration-300 ${
                  currentStep > step ? 'bg-green-600' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Service Selection */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">اختر نوع الخدمة</h3>
              <p className="text-gray-600 text-sm">حدد النوع المناسب لاحتياجاتك</p>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {variants.map((variant: any, index: number) => (
                <div 
                  key={variant.id}
                  className={`group border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                    selectedVariant?.id === variant.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 bg-gray-50'
                  }`}
                  onClick={() => handleVariantSelect(variant)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                        selectedVariant?.id === variant.id
                          ? 'border-green-500 bg-green-500'
                          : 'border-gray-300'
                      }`}>
                        {selectedVariant?.id === variant.id && (
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{variant.name}</h4>
                        <p className="text-sm text-gray-600">المدة المتوقعة: {variant.etaDays} يوم</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600 text-lg">
                        {(variant.priceCents / 100).toFixed(2)} جنيه
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Customer Information */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">معلومات العميل</h3>
              <p className="text-gray-600 text-sm">أدخل بياناتك الشخصية</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="أدخل اسمك الكامل"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="01xxxxxxxxx"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="example@email.com"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                  placeholder="أدخل عنوانك (اختياري)"
                />
              </div>
              
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات إضافية
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none text-black"
                  placeholder="أي ملاحظات أو متطلبات خاصة"
                />
              </div>
            </div>

            {/* معلومات شخصية إضافية */}
            <div className="border-t pt-6 mt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">معلومات شخصية إضافية</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الزوجة
                  </label>
                  <input
                    type="text"
                    value={formData.wifeName}
                    onChange={(e) => handleInputChange('wifeName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="اسم الزوجة (اختياري)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الأب
                  </label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="اسم الأب (اختياري)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    اسم الأم
                  </label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="اسم الأم (اختياري)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تاريخ الميلاد
                  </label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => handleInputChange('birthDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الجنسية
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="الجنسية (اختياري)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    رقم الهوية
                  </label>
                  <input
                    type="text"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange('idNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-black"
                    placeholder="رقم الهوية (اختياري)"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Document Upload */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">رفع المستندات</h3>
              <p className="text-gray-600 text-sm">
                {requiredDocuments.length > 0 
                  ? "أرفع جميع المستندات المطلوبة" 
                  : "لا توجد مستندات مطلوبة لهذه الخدمة"
                }
              </p>
            </div>
            
            <div className="space-y-4">
              {requiredDocuments.length > 0 ? (
                requiredDocuments.map((doc: any, index: number) => (
                  <div key={doc.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-900">{doc.title}</h5>
                          {doc.note && (
                            <p className="text-sm text-gray-600 mt-1">{doc.note}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-red-500 font-medium">مطلوب</span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* File Upload Input */}
                      <div className="relative">
                        <input
                          type="file"
                          name={`document_${doc.id}`}
                          id={`file-${doc.id}`}
                          accept=".pdf,.jpg,.jpeg,.png"
                          required
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            handleFileSelect(doc.id, file);
                          }}
                        />
                        
                        <label
                          htmlFor={`file-${doc.id}`}
                          className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 transition-colors duration-200 cursor-pointer bg-white"
                        >
                          <div className="text-center">
                            <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="text-sm text-gray-600">
                              اضغط لاختيار الملف
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PDF, JPG, PNG - حد أقصى 10 ميجابايت
                            </p>
                          </div>
                        </label>
                      </div>
                      
                      {/* File Preview and Name Display */}
                      {selectedFiles[doc.id] && (
                        <div className="space-y-3">
                          {/* File Name Display */}
                          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-green-700 font-medium">{selectedFiles[doc.id]?.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFileSelect(doc.id, null)}
                              className="text-red-500 hover:text-red-700 text-xs"
                            >
                              إزالة
                            </button>
                          </div>
                          
                          {/* File Preview for Images */}
                          {selectedFiles[doc.id] && getFilePreview(selectedFiles[doc.id]!) && (
                            <div className="relative">
                              <img 
                                src={getFilePreview(selectedFiles[doc.id]!)!} 
                                alt="Preview" 
                                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">لا توجد مستندات مطلوبة لهذه الخدمة</p>
                  <p className="text-sm text-gray-500 mt-1">يمكنك المتابعة للخطوة التالية</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Delivery Options */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">خيارات التوصيل</h3>
              <p className="text-gray-600 text-sm">اختر طريقة استلام الخدمة</p>
            </div>
            
            <div className="space-y-4">
              {/* Office Pickup Option */}
              <div 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                  formData.deliveryType === "OFFICE"
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 bg-gray-50'
                }`}
                onClick={() => handleInputChange('deliveryType', 'OFFICE')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                      formData.deliveryType === "OFFICE"
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.deliveryType === "OFFICE" && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">استلام من المكتب</h4>
                      <p className="text-sm text-gray-600">استلم الخدمة من مكتبنا</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">مجاناً</div>
                  </div>
                </div>
              </div>

              {/* Address Delivery Option */}
              <div 
                className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                  formData.deliveryType === "ADDRESS"
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 bg-gray-50'
                }`}
                onClick={() => handleInputChange('deliveryType', 'ADDRESS')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 transition-all duration-300 ${
                      formData.deliveryType === "ADDRESS"
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {formData.deliveryType === "ADDRESS" && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">توصيل على العنوان</h4>
                      <p className="text-sm text-gray-600">نقوم بتوصيل الخدمة إلى عنوانك</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600 text-lg">+50 جنيه</div>
                  </div>
                </div>
              </div>

              {/* Address Input for Delivery */}
              {formData.deliveryType === "ADDRESS" && (
                <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان التوصيل *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    required
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                    placeholder="أدخل عنوانك بالتفصيل (المحافظة، المدينة، الحي، الشارع، رقم المنزل)"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Review and Submit */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2">مراجعة الطلب</h3>
              <p className="text-gray-600 text-sm">راجع جميع البيانات قبل التأكيد</p>
            </div>
            
            {/* Order Summary */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-gray-900 mb-4">ملخص الطلب</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">الخدمة:</span>
                  <div className="font-medium text-gray-900">{serviceName}</div>
                </div>
                <div>
                  <span className="text-gray-600">النوع:</span>
                  <div className="font-medium text-gray-900">{selectedVariant?.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">السعر:</span>
                  <div className="font-bold text-green-600 text-lg">
                    {(selectedVariant?.priceCents / 100).toFixed(2)} جنيه
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">المدة:</span>
                  <div className="font-medium text-gray-900">{selectedVariant?.etaDays} يوم</div>
                </div>
                <div>
                  <span className="text-gray-600">التوصيل:</span>
                  <div className="font-medium text-gray-900">
                    {formData.deliveryType === "OFFICE" ? "استلام من المكتب" : "توصيل على العنوان"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">رسوم التوصيل:</span>
                  <div className="font-medium text-gray-900">
                    {formData.deliveryType === "ADDRESS" ? "+50.00 جنيه" : "مجاناً"}
                  </div>
                </div>
              </div>
              
              {/* Total Price */}
              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">الإجمالي:</span>
                  <div className="font-bold text-green-600 text-xl">
                    {((selectedVariant?.priceCents + (formData.deliveryType === "ADDRESS" ? DELIVERY_FEE : 0)) / 100).toFixed(2)} جنيه
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Information Review */}
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h4 className="font-semibold text-gray-900 mb-4">معلومات العميل</h4>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">الاسم:</span>
                  <div className="font-medium text-gray-900">{formData.customerName}</div>
                </div>
                <div>
                  <span className="text-gray-600">الهاتف:</span>
                  <div className="font-medium text-gray-900">{formData.customerPhone}</div>
                </div>
                <div>
                  <span className="text-gray-600">البريد الإلكتروني:</span>
                  <div className="font-medium text-gray-900">{formData.customerEmail}</div>
                </div>
                <div>
                  <span className="text-gray-600">العنوان:</span>
                  <div className="font-medium text-gray-900">{formData.address || "غير محدد"}</div>
                </div>
              </div>
            </div>

            {/* Documents Review */}
            {requiredDocuments.length > 0 && (
              <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">المستندات المرفوعة</h4>
                
                <div className="space-y-2">
                  {requiredDocuments.map((doc: any) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 text-green-600 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium text-gray-900">{doc.title}</span>
                      </div>
                      <span className="text-sm text-green-600">✓ مرفوع</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {formData.notes && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-2">ملاحظات إضافية</h4>
                <p className="text-gray-700">{formData.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
            >
              السابق
            </button>
          )}
          
          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!canProceedToNext()}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                canProceedToNext()
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } ${currentStep === 1 ? 'ml-auto' : ''}`}
            >
              التالي
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium transition-all duration-200 flex items-center ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري التأكيد...
                </>
              ) : (
                'تأكيد الطلب'
              )}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
