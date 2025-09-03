"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/Button";
import Card from "@/components/Card";

interface Category {
  id: string;
  name: string;
  slug: string;
  orderIndex: number;
  active: boolean;
}

interface ServiceVariant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
  active: boolean;
}

interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  active: boolean;
  categoryId: string;
  variants: ServiceVariant[];
  documents: Array<{
    id: string;
    title: string;
    description?: string;
    required: boolean;
  }>;
}

export default function EditServicePage() {
  const router = useRouter();
  const params = useParams();
  const serviceId = params.id as string;
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [service, setService] = useState<Service | null>(null);
  const [variants, setVariants] = useState<ServiceVariant[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    active: true,
    requirements: "",
    image: null as File | null
  });

  useEffect(() => {
    if (serviceId) {
      fetchData();
    }
  }, [serviceId]);

  const fetchData = async () => {
    try {
      // Fetch categories
      const categoriesResponse = await fetch("/api/admin/categories");
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.success) {
        setCategories(categoriesData.categories);
      }

      // Fetch service
      const serviceResponse = await fetch(`/api/admin/services/${serviceId}`);
      const serviceData = await serviceResponse.json();
      if (serviceData.success) {
        const serviceInfo = serviceData.service;
        setService(serviceInfo);
        setVariants(serviceInfo.variants);
        
        // Find requirements document
        const requirementsDoc = serviceInfo.documents.find((doc: any) => 
          doc.title === "متطلبات الخدمة"
        );
        
        setFormData({
          name: serviceInfo.name,
          description: serviceInfo.description || "",
          categoryId: serviceInfo.categoryId,
          active: serviceInfo.active,
          requirements: requirementsDoc?.description || "",
          image: null
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
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
    setVariants(prev => [...prev, { 
      id: `temp-${Date.now()}`, 
      name: "", 
      priceCents: 0, 
      etaDays: 0, 
      active: true 
    }]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string | boolean) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { 
        ...variant, 
        [field]: field === 'priceCents' || field === 'etaDays' ? 
          parseInt(value as string) || 0 : value 
      } : variant
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

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

      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "PUT",
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        // Update variants
        for (const variant of variants) {
          if (variant.name && variant.priceCents && variant.etaDays) {
            if (variant.id.startsWith('temp-')) {
              // Create new variant
              await fetch(`/api/admin/services/${serviceId}/variants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: variant.name,
                  priceCents: variant.priceCents,
                  etaDays: variant.etaDays,
                  active: variant.active
                })
              });
            } else {
              // Update existing variant
              await fetch(`/api/admin/services/variants/${variant.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: variant.name,
                  priceCents: variant.priceCents,
                  etaDays: variant.etaDays,
                  active: variant.active
                })
              });
            }
          }
        }

        router.push("/admin/services");
      } else {
        alert(data.error || "حدث خطأ أثناء تحديث الخدمة");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      alert("حدث خطأ أثناء تحديث الخدمة");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">الخدمة غير موجودة</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">تعديل الخدمة</h1>
        <p className="text-gray-600 mt-2">تعديل خدمة: {service.name}</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">اختر الفئة</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              وصف الخدمة
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب وصفاً مفصلاً للخدمة..."
            />
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              متطلبات الخدمة
            </label>
            <textarea
              name="requirements"
              value={formData.requirements}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اكتب متطلبات الخدمة (مثل: صورة شخصية، شهادة ميلاد، إلخ)..."
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              صورة الخدمة
            </label>
            {service.icon && !formData.image && (
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-2">الصورة الحالية:</p>
                <img 
                  src={service.icon} 
                  alt={service.name}
                  className="w-20 h-20 rounded object-cover border"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.image && (
              <p className="text-sm text-gray-600 mt-1">
                الملف الجديد: {formData.image.name}
              </p>
            )}
          </div>

          {/* Service Variants */}
          <div>
            <div className="flex items-center justify-between mb-4">
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
              {variants.map((variant, index) => (
                <div key={variant.id} className="border border-gray-200 rounded-lg p-4">
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
                        value={variant.priceCents / 100}
                        onChange={(e) => updateVariant(index, "priceCents", String((parseInt(e.target.value) || 0) * 100))}
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
                      {variants.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="bg-red-600 hover:bg-red-700 mr-2"
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

          {/* Active Status */}
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

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 space-x-reverse">
            <Button
              type="button"
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700"
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
