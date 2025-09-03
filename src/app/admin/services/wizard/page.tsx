"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";

interface Category {
  id: string;
  name: string;
  slug: string;
  orderIndex: number;
  active: boolean;
}

interface WizardStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

export default function ServiceWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: "",
    description: "",
    categoryId: "",
    
    // Step 2: Image & Requirements
    image: null as File | null,
    requirements: "",
    
    // Step 3: Service Variants
    variants: [
      { name: "", priceCents: "", etaDays: "", active: true }
    ],
    
    // Step 4: Settings
    active: true
  });

  const steps: WizardStep[] = [
    {
      id: 1,
      title: "معلومات أساسية",
      description: "اسم الخدمة والوصف والفئة",
      completed: false
    },
    {
      id: 2,
      title: "الصورة والمتطلبات",
      description: "صورة الخدمة ومتطلباتها",
      completed: false
    },
    {
      id: 3,
      title: "أنواع الخدمة",
      description: "أنواع الخدمة والأسعار",
      completed: false
    },
    {
      id: 4,
      title: "الإعدادات النهائية",
      description: "مراجعة وحفظ الخدمة",
      completed: false
    }
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, image: file }));
  };

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: "", priceCents: "", etaDays: "", active: true }]
    }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const updateVariant = (index: number, field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((variant, i) => 
        i === index ? { ...variant, [field]: value } : variant
      )
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("active", formData.active.toString());
      formDataToSend.append("requirements", formData.requirements);
      
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      const response = await fetch("/api/admin/services", {
        method: "POST",
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        // Add variants
        for (const variant of formData.variants) {
          if (variant.name && variant.priceCents && variant.etaDays) {
            await fetch(`/api/admin/services/${data.service.id}/variants`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: variant.name,
                priceCents: parseInt(variant.priceCents) * 100,
                etaDays: parseInt(variant.etaDays),
                active: variant.active
              })
            });
          }
        }

        router.push("/admin/services");
      } else {
        alert(data.error || "حدث خطأ أثناء إنشاء الخدمة");
      }
    } catch (error) {
      console.error("Error creating service:", error);
      alert("حدث خطأ أثناء إنشاء الخدمة");
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.name && formData.categoryId;
      case 2:
        return true; // Image and requirements are optional
      case 3:
        return formData.variants.some(v => v.name && v.priceCents && v.etaDays);
      case 4:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم الخدمة *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: جواز السفر"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الفئة</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف الخدمة
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اكتب وصفاً مفصلاً للخدمة..."
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الخدمة
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {formData.image && (
                <p className="text-sm text-gray-600 mt-2">
                  الملف المحدد: {formData.image.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                متطلبات الخدمة
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="اكتب متطلبات الخدمة (مثل: صورة شخصية، شهادة ميلاد، إلخ)..."
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">أنواع الخدمة</h3>
              <Button
                type="button"
                onClick={addVariant}
                className="bg-green-600 hover:bg-green-700"
              >
                إضافة نوع
              </Button>
            </div>

            <div className="space-y-4">
              {formData.variants.map((variant, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        اسم النوع
                      </label>
                      <input
                        type="text"
                        value={variant.name}
                        onChange={(e) => updateVariant(index, "name", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="مثال: عادي"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        السعر (جنيه)
                      </label>
                      <input
                        type="number"
                        value={variant.priceCents}
                        onChange={(e) => updateVariant(index, "priceCents", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        عدد الأيام
                      </label>
                      <input
                        type="number"
                        value={variant.etaDays}
                        onChange={(e) => updateVariant(index, "etaDays", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="7"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={variant.active}
                          onChange={(e) => updateVariant(index, "active", e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="mr-2 text-sm text-gray-700">مفعل</label>
                      </div>
                      {formData.variants.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="bg-red-600 hover:bg-red-700 mr-2 text-sm"
                        >
                          حذف
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">مراجعة الخدمة</h3>
              
              <div className="space-y-4">
                <div>
                  <span className="font-medium text-gray-700">اسم الخدمة:</span>
                  <span className="mr-2">{formData.name}</span>
                </div>
                
                <div>
                  <span className="font-medium text-gray-700">الفئة:</span>
                  <span className="mr-2">
                    {categories.find(c => c.id === formData.categoryId)?.name}
                  </span>
                </div>
                
                {formData.description && (
                  <div>
                    <span className="font-medium text-gray-700">الوصف:</span>
                    <p className="mr-2 text-gray-600">{formData.description}</p>
                  </div>
                )}
                
                {formData.image && (
                  <div>
                    <span className="font-medium text-gray-700">الصورة:</span>
                    <span className="mr-2">{formData.image.name}</span>
                  </div>
                )}
                
                {formData.requirements && (
                  <div>
                    <span className="font-medium text-gray-700">المتطلبات:</span>
                    <p className="mr-2 text-gray-600">{formData.requirements}</p>
                  </div>
                )}
                
                <div>
                  <span className="font-medium text-gray-700">أنواع الخدمة:</span>
                  <div className="mr-2 mt-2 space-y-2">
                    {formData.variants.map((variant, index) => (
                      variant.name && (
                        <div key={index} className="bg-white p-3 rounded border">
                          <span className="font-medium">{variant.name}</span>
                          <span className="mr-2 text-gray-600">
                            - {variant.priceCents} جنيه - {variant.etaDays} يوم
                          </span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="mr-2 text-sm text-gray-700">تفعيل الخدمة</label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">معالج إنشاء الخدمة</h1>
        <p className="text-gray-600 mt-2">أنشئ خدمة جديدة بسهولة في خطوات بسيطة</p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                currentStep >= step.id
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'border-gray-300 text-gray-500'
              }`}>
                {currentStep > step.id ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <div className="mr-4">
                <h3 className="text-sm font-medium text-gray-900">{step.title}</h3>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 ${
                  currentStep > step.id ? 'bg-blue-600' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {steps[currentStep - 1].title}
            </h2>
            <p className="text-gray-600">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300"
            >
              السابق
            </Button>

            {currentStep < steps.length ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid(currentStep)}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
              >
                التالي
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !isStepValid(currentStep)}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
              >
                {loading ? "جاري الحفظ..." : "إنشاء الخدمة"}
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
