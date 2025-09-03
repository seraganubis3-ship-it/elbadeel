import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ServicesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: "asc" },
    include: {
      services: {
        where: { active: true },
        orderBy: { name: "asc" },
        include: {
          variants: true,
        },
      },
    },
  });

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 text-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden w-full">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600/20 to-blue-600/20"></div>
        {/* Floating elements */}
        <div className="absolute top-16 sm:top-20 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-green-400/20 rounded-full blur-lg sm:blur-xl animate-pulse"></div>
        <div className="absolute top-32 sm:top-40 right-4 sm:right-20 w-16 h-16 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-blue-400/20 rounded-full blur-lg sm:blur-xl animate-pulse delay-1000"></div>
        
        <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12 lg:py-16">
          <div className="text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 lg:mb-8 leading-tight">
              جميع خدماتنا المتاحة
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed">
              اختر من بين مجموعة واسعة من الخدمات المميزة لاستخراج جميع أنواع الأوراق الرسمية
            </p>
            
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg text-sm font-medium">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>خبرة أكثر من {new Date().getFullYear() - 2000} سنة في مجال الخدمات</span>
            </div>
          </div>
        </div>
      </div>

      {/* All Services Section */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 sm:mb-8">اختر الخدمة المناسبة لك</h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">جميع خدماتنا متاحة في مكان واحد مع أسعار واضحة ومواعيد محددة</p>
        </div>

        {/* Services Grid */}
        <div className="space-y-12 sm:space-y-16 lg:space-y-20">
          {categories.map((category: any, categoryIndex: number) => (
            <div key={category.id} className="bg-white rounded-3xl sm:rounded-4xl shadow-2xl p-8 sm:p-12 lg:p-16">
              {/* Category Header */}
              <div className="text-center mb-8 sm:mb-12 lg:mb-16">
                <div className="inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 rounded-3xl sm:rounded-4xl mb-6 sm:mb-8 overflow-hidden shadow-lg">
                  {category.icon ? (
                    <img 
                      src={category.icon} 
                      alt={category.name}
                      className="w-full h-full object-cover rounded-3xl sm:rounded-4xl"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl sm:rounded-4xl flex items-center justify-center">
                      <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-600">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
                  {category.name}
                </h3>
                <div className="w-20 sm:w-24 h-1.5 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
              </div>

              {/* Services in this category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
                {category.services.map((service: any, serviceIndex: number) => (
                  <div 
                    key={service.id} 
                    className="group rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative h-96"
                    style={{
                      animationDelay: `${(categoryIndex * 100) + (serviceIndex * 50)}ms`,
                      backgroundImage: service.icon ? `url('${service.icon}')` : `linear-gradient(135deg, #10b981 0%, #3b82f6 100%)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat"
                    }}
                  >
                    {/* Dark overlay for better text readability */}
                    <div className="absolute inset-0 bg-black bg-opacity-40 group-hover:bg-opacity-30 transition-all duration-300"></div>
                    
                    {/* Content overlay */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8 text-white">
                      <div>
                        <h4 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 group-hover:text-green-300 transition-colors duration-300">
                          {service.name}
                        </h4>
                        <p className="text-base sm:text-lg text-gray-200 leading-relaxed mb-6">
                          {service.description || "خدمة مميزة لاستخراج الأوراق الرسمية"}
                        </p>
                        
                        {/* Service Variants - Compact */}
                        <div className="space-y-2 sm:space-y-3">
                          {service.variants?.slice(0, 2).map((variant: any) => (
                            <div key={variant.id} className="bg-white/25 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/40">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-3 space-x-reverse">
                                  <div className="w-3 h-3 bg-green-400 rounded-full flex-shrink-0"></div>
                                  <span className="text-sm sm:text-base font-semibold text-white">
                                    {variant.name}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold text-green-300 text-sm sm:text-base">
                                    {(variant.priceCents / 100).toFixed(0)} ج
                                  </div>
                                  <div className="text-xs sm:text-sm text-gray-300">
                                    {variant.etaDays} يوم
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          {service.variants?.length > 2 && (
                            <div className="text-sm text-gray-300 text-center bg-white/10 rounded-lg py-2">
                              +{service.variants.length - 2} خيارات أخرى
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Order Button */}
                      <Link
                        href={`/service/${service.slug}`}
                        className="w-full inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-green-600 hover:bg-green-700 text-white text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-xl"
                      >
                        طلب الخدمة
                        <svg className="mr-2 w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-8 sm:py-12 sm:py-16 lg:py-20">
        <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-3xl sm:rounded-4xl shadow-2xl p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-24 h-24 sm:w-40 sm:h-40 bg-white rounded-full -translate-x-12 -translate-y-12 sm:-translate-x-20 sm:-translate-y-20"></div>
            <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-full translate-x-12 translate-y-12 sm:translate-x-16 sm:translate-y-16"></div>
          </div>
          
          <div className="relative">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-6 sm:mb-8 leading-tight">
              هل تحتاج مساعدة في اختيار الخدمة؟
            </h2>
            <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed opacity-90">
              فريق الدعم متاح لمساعدتك في اختيار الخدمة المناسبة لاحتياجاتك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link
                href="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 bg-white text-green-600 text-lg sm:text-xl font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-xl"
              >
                تواصل معنا
                <svg className="mr-2 w-6 h-6 sm:w-7 sm:h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>
              <Link
                href="/faq"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 sm:px-10 py-4 sm:py-5 border-2 border-white text-white text-lg sm:text-xl font-semibold rounded-2xl hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105"
              >
                الأسئلة الشائعة
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
