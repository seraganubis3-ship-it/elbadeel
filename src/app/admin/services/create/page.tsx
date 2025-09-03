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

export default function CreateServicePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [variants, setVariants] = useState<Array<{
    name: string;
    priceCents: string;
    etaDays: string;
    active: boolean;
  }>>([{ name: "", priceCents: "", etaDays: "", active: true }]);

  const [documents, setDocuments] = useState<Array<{
    title: string;
    description: string;
    required: boolean;
    active: boolean;
  }>>([{ title: "", description: "", required: true, active: true }]);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    active: true,
    image: null as File | null
  });

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
    setVariants(prev => [...prev, { name: "", priceCents: "", etaDays: "", active: true }]);
  };

  const removeVariant = (index: number) => {
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string | boolean) => {
    setVariants(prev => prev.map((variant, i) => 
      i === index ? { ...variant, [field]: value } : variant
    ));
  };

  const addDocument = () => {
    setDocuments(prev => [...prev, { title: "", description: "", required: true, active: true }]);
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const updateDocument = (index: number, field: string, value: string | boolean) => {
    setDocuments(prev => prev.map((document, i) => 
      i === index ? { ...document, [field]: value } : document
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("categoryId", formData.categoryId);
      formDataToSend.append("active", formData.active.toString());
      
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
        for (const variant of variants) {
          if (variant.name && variant.priceCents && variant.etaDays) {
            await fetch(`/api/admin/services/${data.service.id}/variants`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: variant.name,
                priceCents: parseInt(variant.priceCents) * 100, // Convert to cents
                etaDays: parseInt(variant.etaDays),
                active: variant.active
              })
            });
          }
        }

        // Add documents
        for (const document of documents) {
          if (document.title) {
            await fetch(`/api/admin/services/${data.service.id}/documents`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                title: document.title,
                description: document.description,
                required: document.required,
                active: document.active
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إضافة خدمة جديدة</h1>
        <p className="text-gray-600 mt-2">أضف خدمة جديدة مع أنواعها ومتطلباتها</p>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="مثال: جواز السفر"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط الخدمة (Slug) *
              </label>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="مثال: passport-service"
              />
              <p className="text-xs text-gray-500 mt-1">
                اكتب رابط باللغة الإنجليزية (بدون مسافات أو أحرف خاصة)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة *
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="اكتب وصفاً مفصلاً للخدمة..."
            />
          </div>

          {/* Service Documents */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">مستندات الخدمة المطلوبة</h3>
              <Button
                type="button"
                onClick={addDocument}
                className="bg-blue-600 hover:bg-blue-700"
              >
                إضافة مستند
              </Button>
            </div>

            <div className="space-y-4">
              {documents.map((document, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        عنوان المستند *
                      </label>
                      <input
                        type="text"
                        value={document.title}
                        onChange={(e) => updateDocument(index, "title", e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="مثال: صورة شخصية"
                      />
                    </div>

                    <div className="flex items-end space-x-4 space-x-reverse">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={document.required}
                          onChange={(e) => updateDocument(index, "required", e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="mr-2 text-sm text-gray-700">مطلوب</label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={document.active}
                          onChange={(e) => updateDocument(index, "active", e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="mr-2 text-sm text-gray-700">مفعل</label>
                      </div>
                      {documents.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          حذف
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      وصف المستند (اختياري)
                    </label>
                    <textarea
                      value={document.description}
                      onChange={(e) => updateDocument(index, "description", e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="اكتب وصفاً للمستند المطلوب..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              صورة الخدمة
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
            {formData.image && (
              <p className="text-sm text-gray-600 mt-1">
                الملف المحدد: {formData.image.name}
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
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "جاري الحفظ..." : "حفظ الخدمة"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
