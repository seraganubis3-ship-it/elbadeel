import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export default async function HomeNew() {
  // Check if user is authenticated
  const session = await getServerSession(authConfig) as any;
  
  // Get featured services
  const featuredServices = await prisma.service.findMany({
    where: { active: true },
    include: {
      category: true,
      variants: true,
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              الخدمات الحكومية
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية والخدمات الحكومية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session?.user ? (
                <Link
                  href="/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300"
                >
                  ابدأ الآن
                </Link>
              ) : (
                <Link
                  href="/services"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors duration-300"
                >
                  استعرض الخدمات
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            خدماتنا المتاحة
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            نقدم مجموعة واسعة من الخدمات الحكومية بأسعار منافسة وجودة عالية
          </p>
        </div>

        {/* Featured Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* المستخرجات الرسمية */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="w-20 h-2 bg-blue-300 rounded mx-auto"></div>
                  <div className="w-16 h-2 bg-blue-200 rounded mx-auto"></div>
                  <div className="w-24 h-2 bg-blue-300 rounded mx-auto"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">المستخرجات الرسمية</h3>
              <p className="text-gray-600 mb-4">
                استخراج جميع أنواع المستخرجات الرسمية من الجهات الحكومية المختلفة
              </p>
              <Link
                href="/services"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 text-center block"
              >
                أحجز الآن
              </Link>
            </div>
          </div>

          {/* الخارجية المصرية */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="w-24 h-3 bg-red-300 rounded mx-auto"></div>
                  <div className="w-20 h-2 bg-red-200 rounded mx-auto"></div>
                  <div className="w-16 h-2 bg-red-300 rounded mx-auto"></div>
                  <div className="w-22 h-2 bg-red-200 rounded mx-auto"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">الخارجية المصرية</h3>
              <p className="text-gray-600 mb-4">
                خدمات وزارة الخارجية المصرية من تأشيرات وتصديقات وخدمات القنصليات
              </p>
              <Link
                href="/services"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 text-center block"
              >
                أحجز الآن
              </Link>
            </div>
          </div>

          {/* الجوازات */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <div className="w-20 h-3 bg-green-300 rounded mx-auto"></div>
                  <div className="w-24 h-2 bg-green-200 rounded mx-auto"></div>
                  <div className="w-18 h-2 bg-green-300 rounded mx-auto"></div>
                </div>
              </div>
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">الجوازات</h3>
              <p className="text-gray-600 mb-4">
                تجديد وإصدار الجوازات المصرية بجميع أنواعها مع ضمان السرعة والدقة
              </p>
              <Link
                href="/services"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 text-center block"
              >
                أحجز الآن
              </Link>
            </div>
          </div>

          {/* خدمات إضافية من قاعدة البيانات */}
          {featuredServices.slice(0, 3).map((service) => (
            <div key={service.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="h-48 bg-gradient-to-br from-indigo-100 to-indigo-200 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    {service.category?.icon ? (
                      <img 
                        src={service.category.icon} 
                        alt={service.category.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {service.category?.name?.charAt(0) || service.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="w-20 h-2 bg-indigo-300 rounded mx-auto"></div>
                    <div className="w-16 h-2 bg-indigo-200 rounded mx-auto"></div>
                    <div className="w-24 h-2 bg-indigo-300 rounded mx-auto"></div>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{service.name}</h3>
                <p className="text-gray-600 mb-4">
                  {service.description || `خدمة ${service.name} من ${service.category?.name || 'الخدمات الحكومية'}`}
                </p>
                <Link
                  href={`/service/${service.slug || service.id}`}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 text-center block"
                >
                  أحجز الآن
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Services Button */}
        <div className="text-center mt-12">
          <Link
            href="/services"
            className="inline-flex items-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-semibold transition-colors duration-300"
          >
            عرض جميع الخدمات
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              لماذا تختار منصتنا؟
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              نقدم أفضل الخدمات بأعلى معايير الجودة والسرعة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">سرعة في التنفيذ</h3>
              <p className="text-gray-600">نضمن لك الحصول على خدماتك في أسرع وقت ممكن</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">جودة مضمونة</h3>
              <p className="text-gray-600">جميع خدماتنا تتميز بالدقة والجودة العالية</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">أسعار منافسة</h3>
              <p className="text-gray-600">أفضل الأسعار في السوق مع ضمان الجودة</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
