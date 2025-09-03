"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Button from "@/components/Button";
import Card from "@/components/Card";

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

interface Category {
  id: string;
  name: string;
  slug: string;
  orderIndex: number;
  active: boolean;
  services: Service[];
}

export default function AdminServices() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/admin/services");
      const data = await response.json();
      if (data.success) {
        // Group services by category
        const categoriesMap = new Map<string, Category>();
        
        data.services.forEach((service: Service) => {
          if (!categoriesMap.has(service.categoryId)) {
            categoriesMap.set(service.categoryId, {
              id: service.categoryId,
              name: "فئة غير محددة", // Will be updated when we get category data
              slug: "",
              orderIndex: 0,
              active: true,
              services: []
            });
          }
          categoriesMap.get(service.categoryId)!.services.push(service);
        });

        // Fetch categories to get names
        const categoriesResponse = await fetch("/api/admin/categories");
        const categoriesData = await categoriesResponse.json();
        
        if (categoriesData.success) {
          categoriesData.categories.forEach((cat: Category) => {
            if (categoriesMap.has(cat.id)) {
              categoriesMap.get(cat.id)!.name = cat.name;
              categoriesMap.get(cat.id)!.slug = cat.slug;
              categoriesMap.get(cat.id)!.orderIndex = cat.orderIndex;
              categoriesMap.get(cat.id)!.active = cat.active;
            }
          });
        }

        const sortedCategories = Array.from(categoriesMap.values())
          .sort((a, b) => a.orderIndex - b.orderIndex);
        
        setCategories(sortedCategories);
        
        // Expand first category by default
        if (sortedCategories.length > 0) {
          setExpandedCategories(new Set([sortedCategories[0].id]));
        }
      }
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟")) return;

    try {
      const response = await fetch(`/api/admin/services/${serviceId}`, {
        method: "DELETE"
      });

      const data = await response.json();

      if (data.success) {
        await fetchServices();
      } else {
        alert(data.error || "حدث خطأ أثناء حذف الخدمة");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("حدث خطأ أثناء حذف الخدمة");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الخدمات</h1>
            <p className="text-gray-600 mt-2">إدارة الخدمات وأنواعها ومتطلباتها</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/admin/categories">
              <Button className="bg-green-600 hover:bg-green-700">
                إدارة الفئات
              </Button>
            </Link>
            <Link href="/admin/services/wizard">
              <Button className="bg-purple-600 hover:bg-purple-700">
                معالج الخدمات
              </Button>
            </Link>
            <Link href="/admin/services/create">
              <Button className="bg-blue-600 hover:bg-blue-700">
                إضافة خدمة جديدة
              </Button>
            </Link>
            <Link href="/admin/services/how-it-works">
              <Button className="bg-gray-600 hover:bg-gray-700">
                كيف يعمل النظام
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {categories.map((category) => (
          <Card key={category.id}>
            <div 
              className="flex items-center justify-between cursor-pointer p-4 border-b border-gray-200"
              onClick={() => toggleCategory(category.id)}
            >
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className={`transform transition-transform ${
                  expandedCategories.has(category.id) ? 'rotate-90' : ''
                }`}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{category.name}</h2>
                  <p className="text-sm text-gray-600">
                    {category.services.length} خدمة
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

            {expandedCategories.has(category.id) && (
              <div className="p-4">
                {category.services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.services.map((service) => (
                      <div key={service.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 space-x-reverse mb-2">
                              {service.icon && (
                                <img 
                                  src={service.icon} 
                                  alt={service.name}
                                  className="w-8 h-8 rounded object-cover"
                                />
                              )}
                              <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            </div>
                            {service.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {service.description}
                              </p>
                            )}
                            {service.documents.length > 0 && (
                              <div className="text-xs text-blue-600 mb-2">
                                متطلبات: {service.documents.map(d => d.title).join("، ")}
                              </div>
                            )}
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            service.active 
                              ? "bg-green-100 text-green-800" 
                              : "bg-red-100 text-red-800"
                          }`}>
                            {service.active ? "مفعّل" : "موقّف"}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">أنواع الخدمة:</p>
                          <div className="space-y-1">
                            {service.variants.map((variant) => (
                              <div key={variant.id} className="flex justify-between text-xs">
                                <span className="text-gray-700">{variant.name}</span>
                                <span className="text-gray-600">
                                  {(variant.priceCents / 100).toFixed(0)} جنيه - {variant.etaDays} يوم
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 space-x-reverse">
                          <Link href={`/admin/services/edit/${service.id}`}>
                            <Button className="bg-blue-600 hover:bg-blue-700 text-xs">
                              تعديل
                            </Button>
                          </Link>
                          <Button
                            onClick={() => handleDeleteService(service.id)}
                            className="bg-red-600 hover:bg-red-700 text-xs"
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>لا توجد خدمات في هذه الفئة</p>
                    <Link href="/admin/services/create">
                      <Button className="mt-4 bg-blue-600 hover:bg-blue-700">
                        إضافة خدمة جديدة
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {categories.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">لا توجد خدمات بعد</p>
            <div className="flex justify-center space-x-4 space-x-reverse">
              <Link href="/admin/categories">
                <Button className="bg-green-600 hover:bg-green-700">
                  إدارة الفئات
                </Button>
              </Link>
              <Link href="/admin/services/create">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  إضافة خدمة جديدة
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}


