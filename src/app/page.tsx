import Link from "next/link";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export default async function HomeSimple() {
  // Check if user is authenticated
  const session = await getServerSession(authConfig) as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Background Image */}
      <div className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('/images/government-services-bg.png'), url('/images/government-services-bg.jpg'), linear-gradient(135deg, #1f2937 0%, #111827 50%, #000000 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center text-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight">
            الخدمات الحكومية
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl text-gray-200 mb-12 max-w-4xl mx-auto leading-relaxed">
            منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية والخدمات الحكومية
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            {!session?.user ? (
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                ابدأ الآن
              </Link>
            ) : (
              <Link
                href="/services"
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                استعرض الخدمات
              </Link>
            )}
            <Link
              href="/services"
              className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-10 py-4 rounded-xl text-xl font-bold transition-all duration-300 transform hover:scale-105"
            >
              عرض جميع الخدمات
            </Link>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* المستخرجات الرسمية */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative h-96" style={{
            backgroundImage: "url('/images/official-documents.png'), url('/images/official-documents.jpg'), linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}>
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
              <div>
                <h3 className="text-2xl font-bold mb-3">المستخرجات الرسمية</h3>
                <p className="text-lg text-gray-200 leading-relaxed">
                  استخراج جميع أنواع المستخرجات الرسمية من الجهات الحكومية المختلفة
                </p>
              </div>
              
              <Link
                href="/services"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 text-center block shadow-lg"
              >
                أحجز الان
              </Link>
            </div>
          </div>

          {/* الخارجية المصرية */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative h-96" style={{
            backgroundImage: "url('/images/egyptian-foreign-affairs.png'), url('/images/egyptian-foreign-affairs.jpg'), linear-gradient(135deg, #dc2626 0%, #991b1b 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}>
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
              <div>
                <h3 className="text-2xl font-bold mb-3">الخارجية المصرية</h3>
                <p className="text-lg text-gray-200 leading-relaxed">
                  خدمات وزارة الخارجية المصرية من تأشيرات وتصديقات وخدمات القنصليات
                </p>
              </div>
              
              <Link
                href="/services"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 text-center block shadow-lg"
              >
                أحجز الان
              </Link>
            </div>
          </div>

          {/* الجوازات */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative h-96" style={{
            backgroundImage: "url('/images/passports.png'), url('/images/passports.jpg'), linear-gradient(135deg, #059669 0%, #047857 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
          }}>
            {/* Dark overlay for better text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            
            {/* Content overlay */}
            <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
              <div>
                <h3 className="text-2xl font-bold mb-3">الجوازات</h3>
                <p className="text-lg text-gray-200 leading-relaxed">
                  تجديد وإصدار الجوازات المصرية بجميع أنواعها مع ضمان السرعة والدقة
                </p>
              </div>
              
              <Link
                href="/services"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-300 text-center block shadow-lg"
              >
                أحجز الان
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            خدمات حكومية موثوقة وسريعة
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            نقدم جميع الخدمات الحكومية بأسعار منافسة وجودة عالية مع ضمان السرعة في التنفيذ
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!session?.user ? (
              <Link
                href="/register"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                ابدأ الآن
              </Link>
            ) : (
              <Link
                href="/services"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
              >
                استعرض الخدمات
              </Link>
            )}
            <Link
              href="/services"
              className="border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-300"
            >
              عرض جميع الخدمات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
