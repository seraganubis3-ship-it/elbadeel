"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import Card from "@/components/Card";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  orderIndex: number;
  active: boolean;
  services: Array<{
    id: string;
    name: string;
    active: boolean;
  }>;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    orderIndex: 0,
    active: true
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : 
              type === "number" ? parseInt(value) || 0 : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories";
      
      const method = editingCategory ? "PUT" : "POST";

      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("orderIndex", formData.orderIndex.toString());
      formDataToSend.append("active", formData.active.toString());
      
      if (selectedImage) {
        formDataToSend.append("image", selectedImage);
      }

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
        setShowCreateForm(false);
        setEditingCategory(null);
        setFormData({ name: "", slug: "", orderIndex: 0, active: true });
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        alert(data.error || "حدث خطأ أثناء حفظ الفئة");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("حدث خطأ أثناء حفظ الفئة");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      orderIndex: category.orderIndex,
      active: category.active
    });
    setImagePreview(category.icon || null);
    setSelectedImage(null);
    setShowCreateForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الفئة؟")) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        await fetchCategories();
      } else {
        alert(data.error || "حدث خطأ أثناء حذف الفئة");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("حدث خطأ أثناء حذف الفئة");
    }
  };

  const resetForm = () => {
    setFormData({ name: "", slug: "", orderIndex: 0, active: true });
    setEditingCategory(null);
    setShowCreateForm(false);
    setSelectedImage(null);
    setImagePreview(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الفئات</h1>
            <p className="text-gray-600 mt-2">إدارة فئات الخدمات وتنظيمها</p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            إضافة فئة جديدة
          </Button>
        </div>
      </div>

      {/* Create/Edit Form */}
      {showCreateForm && (
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCategory ? "تعديل الفئة" : "إضافة فئة جديدة"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم الفئة *
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
                  رابط الفئة (Slug) *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="مثال: passport-category"
                />
                <p className="text-xs text-gray-500 mt-1">
                  اكتب رابط باللغة الإنجليزية (بدون مسافات أو أحرف خاصة)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ترتيب العرض
                </label>
                <input
                  type="number"
                  name="orderIndex"
                  value={formData.orderIndex}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="mr-2 text-sm text-gray-700">تفعيل الفئة</label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صورة الفئة
              </label>
              <div className="flex items-center space-x-4 space-x-reverse">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {imagePreview && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-300">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4 space-x-reverse">
              <Button
                type="button"
                onClick={resetForm}
                className="bg-gray-600 hover:bg-gray-700"
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? "جاري الحفظ..." : "حفظ الفئة"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                {category.icon && (
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0">
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    ترتيب العرض: {category.orderIndex}
                  </p>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded ${
                category.active 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {category.active ? "مفعّل" : "موقّف"}
              </span>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                عدد الخدمات: {category.services.length}
              </p>
              {category.services.length > 0 && (
                <div className="text-xs text-gray-500">
                  الخدمات: {category.services.map(s => s.name).join("، ")}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button
                onClick={() => handleEdit(category)}
                className="bg-blue-600 hover:bg-blue-700 text-sm"
              >
                تعديل
              </Button>
              <Button
                onClick={() => handleDelete(category.id)}
                className="bg-red-600 hover:bg-red-700 text-sm"
                disabled={category.services.length > 0}
              >
                حذف
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600">لا توجد فئات بعد</p>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 bg-blue-600 hover:bg-blue-700"
            >
              إضافة أول فئة
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
