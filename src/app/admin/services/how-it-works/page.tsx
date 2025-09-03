"use client";

import Card from "@/components/Card";

export default function HowItWorksPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">كيف يعمل نظام إدارة الخدمات</h1>
        <p className="text-gray-600 mt-2">دليل شامل لفهم كيفية حفظ وإدارة الخدمات في النظام</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Database Structure */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 هيكل قاعدة البيانات</h2>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-medium text-blue-900">جدول الفئات (Categories)</h3>
                <ul className="text-sm text-blue-800 mt-2 space-y-1">
                  <li>• اسم الفئة (جواز السفر، الخارجية المصرية)</li>
                  <li>• ترتيب العرض</li>
                  <li>• حالة التفعيل</li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-medium text-green-900">جدول الخدمات (Services)</h3>
                <ul className="text-sm text-green-800 mt-2 space-y-1">
                  <li>• اسم الخدمة</li>
                  <li>• الوصف</li>
                  <li>• مسار الصورة</li>
                  <li>• معرف الفئة</li>
                  <li>• حالة التفعيل</li>
                </ul>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-medium text-purple-900">جدول أنواع الخدمة (ServiceVariants)</h3>
                <ul className="text-sm text-purple-800 mt-2 space-y-1">
                  <li>• اسم النوع (عادي، سريع)</li>
                  <li>• السعر (بالقروش)</li>
                  <li>• عدد الأيام المتوقع</li>
                  <li>• معرف الخدمة</li>
                </ul>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg">
                <h3 className="font-medium text-orange-900">جدول متطلبات الخدمة (ServiceDocuments)</h3>
                <ul className="text-sm text-orange-800 mt-2 space-y-1">
                  <li>• عنوان المتطلب</li>
                  <li>• وصف المتطلب</li>
                  <li>• هل مطلوب أم اختياري</li>
                  <li>• ترتيب العرض</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>

        {/* How Data is Saved */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💾 كيف يتم حفظ البيانات</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">إنشاء الفئة</h3>
                  <p className="text-sm text-gray-600">تحفظ في جدول Categories مع ترتيب العرض</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">إنشاء الخدمة</h3>
                  <p className="text-sm text-gray-600">تحفظ في جدول Services مع ربطها بالفئة</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">رفع الصورة</h3>
                  <p className="text-sm text-gray-600">تحفظ في مجلد public/uploads/services/</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">حفظ المتطلبات</h3>
                  <p className="text-sm text-gray-600">تحفظ في جدول ServiceDocuments</p>
                </div>
              </div>

              <div className="flex items-start space-x-3 space-x-reverse">
                <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold text-sm">5</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">إضافة الأنواع</h3>
                  <p className="text-sm text-gray-600">تحفظ في جدول ServiceVariants مع الأسعار</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Example Data Flow */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔄 مثال على تدفق البيانات</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-3">خدمة: "جواز السفر"</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">الفئة:</span>
                  <span className="font-medium">جواز السفر</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الوصف:</span>
                  <span className="font-medium">إصدار جواز سفر مصري جديد</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الصورة:</span>
                  <span className="font-medium">/uploads/services/1234567890_passport.jpg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">المتطلبات:</span>
                  <span className="font-medium">صورة شخصية، شهادة ميلاد</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">النوع العادي:</span>
                  <span className="font-medium">100 جنيه - 7 أيام</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">النوع السريع:</span>
                  <span className="font-medium">200 جنيه - 3 أيام</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* API Endpoints */}
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🔗 API Endpoints</h2>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded">
                <code className="text-sm text-blue-800">GET /api/admin/categories</code>
                <p className="text-xs text-blue-600 mt-1">جلب جميع الفئات</p>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <code className="text-sm text-green-800">POST /api/admin/services</code>
                <p className="text-xs text-green-600 mt-1">إنشاء خدمة جديدة</p>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <code className="text-sm text-purple-800">POST /api/admin/services/[id]/variants</code>
                <p className="text-xs text-purple-600 mt-1">إضافة نوع للخدمة</p>
              </div>
              <div className="bg-orange-50 p-3 rounded">
                <code className="text-sm text-orange-800">PUT /api/admin/services/[id]</code>
                <p className="text-xs text-orange-600 mt-1">تعديل خدمة موجودة</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mt-8">
        <Card>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">⚡ إجراءات سريعة</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <a href="/admin/categories" className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <h3 className="font-medium text-green-900">إدارة الفئات</h3>
                <p className="text-sm text-green-700 mt-1">إنشاء وتعديل الفئات</p>
              </a>
              <a href="/admin/services/wizard" className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <h3 className="font-medium text-purple-900">معالج الخدمات</h3>
                <p className="text-sm text-purple-700 mt-1">إنشاء خدمة بخطوات بسيطة</p>
              </a>
              <a href="/admin/services" className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <h3 className="font-medium text-blue-900">إدارة الخدمات</h3>
                <p className="text-sm text-blue-700 mt-1">عرض وتعديل الخدمات</p>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
