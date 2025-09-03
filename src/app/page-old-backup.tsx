import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";
import TestimonialsSlider from "@/components/TestimonialsSlider";

export default async function Home() {
  // Check if user is authenticated
  const session = await getServerSession(authConfig) as any;
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
        {/* Floating elements - Responsive sizes */}
        <div className="absolute top-16 sm:top-20 left-4 sm:left-10 w-12 h-12 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-green-400/20 rounded-full blur-lg sm:blur-xl animate-pulse"></div>
        <div className="absolute top-32 sm:top-40 right-4 sm:right-20 w-16 h-16 sm:w-32 sm:h-32 lg:w-40 lg:h-40 bg-blue-400/20 rounded-full blur-lg sm:blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-16 sm:bottom-20 left-1/4 w-8 h-8 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-purple-400/20 rounded-full blur-lg sm:blur-xl animate-pulse delay-2000"></div>
        
        <div className="relative w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12 lg:py-16 xl:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-lg mb-4 sm:mb-6 text-xs sm:text-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-700">منصة موثوقة ومعتمدة</span>
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900 mb-3 sm:mb-4 sm:mb-6 lg:mb-8 animate-fade-in leading-tight px-2">
              خدمات استخراج الأوراق الرسمية
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-600 max-w-4xl mx-auto mb-4 sm:mb-6 sm:mb-8 lg:mb-12 leading-relaxed px-2 sm:px-4">
              منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية مع ضمان الجودة والسرعة
            </p>
            
            {/* Office Experience Badge */}
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full shadow-lg mb-6 sm:mb-8 text-xs sm:text-sm font-medium">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span>خبرة أكثر من {new Date().getFullYear() - 2000} سنة في مجال الخدمات</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:gap-4 justify-center items-center px-2">
              {!session?.user ? (
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 sm:py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm sm:text-base lg:text-lg font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  ابدأ الآن
                  <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
              ) : (
                <Link
                  href="/orders"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm sm:text-base lg:text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  عرض طلباتي
                  <svg className="mr-2 w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </Link>
              )}
              <Link
                href="/services"
                className="w-full sm:w-auto inline-flex items-center justify-center px-3 sm:px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 sm:py-4 border-2 border-green-600 text-green-600 text-sm sm:text-base lg:text-lg font-semibold rounded-xl hover:bg-green-600 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                استعرض الخدمات
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">لماذا تختار منصتنا؟</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">نقدم أفضل الخدمات بأعلى معايير الجودة والسرعة</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">سرعة في التنفيذ</h3>
            <p className="text-sm sm:text-base text-gray-600">نضمن لك إنجاز طلبك في أسرع وقت ممكن مع الحفاظ على الجودة</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">جودة عالية</h3>
            <p className="text-sm sm:text-base text-gray-600">نعمل بأعلى معايير الجودة لضمان رضاك التام</p>
          </div>
          
          <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:hover:-translate-y-2 border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">دعم متواصل</h3>
            <p className="text-sm sm:text-base text-gray-600">فريق دعم متخصص لمساعدتك في أي وقت تحتاج إليه</p>
          </div>
        </div>
      </div>

      {/* Company Introduction Section */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12">
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-12">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">من نحن</h2>
            <div className="w-16 sm:w-20 h-1 bg-gradient-to-r from-green-500 to-blue-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">شركة رائدة في مجال الخدمات</h3>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                نحن شركة متخصصة في تقديم خدمات استخراج الأوراق الرسمية منذ عام 2000. نتميز بالخبرة الطويلة والسمعة الحسنة في السوق المصري.
              </p>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                نقدم خدماتنا لعشرات الآلاف من العملاء الراضين، ونضمن لهم الجودة العالية والسرعة في التنفيذ مع أسعار منافسة.
              </p>
              
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-1">{new Date().getFullYear() - 2000}+</div>
                  <div className="text-sm sm:text-base text-gray-700">سنة خبرة</div>
                </div>
                <div className="text-center p-3 sm:p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-1">آلاف</div>
                  <div className="text-sm sm:text-base text-gray-700">عميل راضي</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 lg:w-16 lg:h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-2 sm:mb-3">مضمون الجودة</h4>
                <p className="text-sm sm:text-base text-gray-600">نضمن لك الحصول على أفضل النتائج بأعلى معايير الجودة</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12">
        <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-950 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-full -translate-x-8 -translate-y-8 sm:-translate-x-16 sm:-translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-x-8 translate-y-8 sm:translate-x-12 sm:translate-y-12"></div>
          </div>
          
          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/20 mb-6 sm:mb-8">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm sm:text-base font-medium">خبرة طويلة</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              أكثر من {new Date().getFullYear() - 2000} سنة من الخبرة
            </h2>
            <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed opacity-90">
              منذ عام 2000 ونحن نقدم خدمات استخراج الأوراق الرسمية باحترافية عالية. خبرتنا الطويلة في المجال تجعلنا الخيار الأمثل لجميع احتياجاتكم.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-amber-400 mb-2">{new Date().getFullYear() - 2000}+</div>
                <div className="text-sm sm:text-base opacity-80">سنة خبرة</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-emerald-400 mb-2">آلاف</div>
                <div className="text-sm sm:text-base opacity-80">عميل راضي</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-400 mb-2">100%</div>
                <div className="text-sm sm:text-base opacity-80">ضمان الجودة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Overview Section */}
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">خدماتنا المتاحة</h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">نقدم مجموعة واسعة من الخدمات المميزة لجميع احتياجاتكم</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.slice(0, 6).map((cat: any) => (
            <div key={cat.id} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 overflow-hidden">
                {cat.icon ? (
                  <img 
                    src={cat.icon} 
                    alt={cat.name}
                    className="w-full h-full object-cover rounded-xl sm:rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    <span className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600">
                      {cat.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{cat.name}</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                {cat.services.length} خدمة متاحة
              </p>
              
              <Link
                href={`/category/${cat.slug || cat.id}`}
                className="inline-flex items-center justify-center w-full px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-105"
              >
                استعرض الخدمات
                <svg className="mr-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-8 sm:mt-12">
          <Link
            href="/services"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base sm:text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            عرض جميع الخدمات
            <svg className="mr-2 w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Testimonials Section */}
      <TestimonialsSlider />

      {/* CTA Section - Only for non-authenticated users */}
      {!session?.user ? (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12 lg:py-16">
          <div className="text-center bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-full -translate-x-8 -translate-y-8 sm:-translate-x-16 sm:-translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-x-8 translate-y-8 sm:translate-x-12 sm:translate-y-12"></div>
            </div>
            
            <div className="relative">
              <h2 className="text-lg sm:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 sm:mb-6 leading-tight">
                جاهز لبدء رحلتك؟
              </h2>
              <p className="text-xs sm:text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
                انضم إلينا الآن واحصل على أفضل الخدمات بأسعار منافسة وجودة عالية
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:gap-4 justify-center items-center">
                <Link
                  href="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 sm:px-8 py-2.5 sm:py-3 sm:py-4 bg-white text-green-600 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  إنشاء حساب مجاني
                  <svg className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/services"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 sm:px-8 py-2.5 sm:py-3 sm:py-4 border-2 border-white text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-white hover:text-green-600 transition-all duration-300 transform hover:scale-105"
                >
                  استعرض الخدمات
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 sm:px-6 lg:px-8 py-6 sm:py-8 sm:py-12 lg:py-16">
          <div className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 sm:p-8 lg:p-12 text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-20 h-20 sm:w-32 sm:h-32 bg-white rounded-full -translate-x-8 -translate-y-8 sm:-translate-x-16 sm:-translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-white rounded-full translate-x-8 translate-y-8 sm:translate-x-12 sm:translate-y-12"></div>
            </div>
            
            <div className="relative">
              <h2 className="text-lg sm:text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 sm:mb-4 sm:mb-6 leading-tight">
                مرحباً بك مرة أخرى!
              </h2>
              <p className="text-xs sm:text-sm sm:text-base lg:text-lg mb-4 sm:mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed opacity-90">
                استمر في استخدام خدماتنا المميزة أو اطلب خدمة جديدة
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:gap-4 justify-center items-center">
                <Link
                  href="/orders"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 sm:px-8 py-2.5 sm:py-3 sm:py-4 bg-white text-blue-600 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  عرض طلباتي
                  <svg className="mr-1.5 sm:mr-2 w-3 h-3 sm:w-4 sm:h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </Link>
                <Link
                  href="/services"
                  className="w-full sm:w-auto inline-flex items-center justify-center px-4 sm:px-6 sm:px-8 py-2.5 sm:py-3 sm:py-4 border-2 border-white text-white text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-300 transform hover:scale-105"
                >
                  خدمات جديدة
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
