import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export default async function HomeTasahil() {
  // Check if user is authenticated
  const session = await getServerSession(authConfig) as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Dark Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8">
              الخدمات الحكومية
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto">
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
            </div>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* المستخرجات الرسمية */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center relative">
              {/* Document Icons */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-2 gap-4">
                  <div className="w-16 h-20 bg-white rounded-lg shadow-md flex items-center justify-center transform rotate-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="w-16 h-20 bg-white rounded-lg shadow-md flex items-center justify-center transform -rotate-3">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="w-16 h-20 bg-white rounded-lg shadow-md flex items-center justify-center transform rotate-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="w-16 h-20 bg-white rounded-lg shadow-md flex items-center justify-center transform -rotate-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">المستخرجات الرسمية</h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                استخراج جميع أنواع المستخرجات الرسمية من الجهات الحكومية المختلفة بسرعة ودقة عالية
              </p>
              <Link
                href="/services"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center block"
              >
                أحجز الان
              </Link>
            </div>
          </div>

          {/* الخارجية المصرية */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="h-64 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center relative">
              {/* Passport with Stamps */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-32 h-20 bg-red-600 rounded-lg shadow-lg relative transform rotate-3">
                  <div className="absolute inset-2 bg-white rounded flex flex-col justify-between p-2">
                    <div className="text-xs font-bold text-red-600 text-center">جمهورية مصر العربية</div>
                    <div className="flex justify-between items-center">
                      <div className="w-4 h-4 bg-red-600 rounded-full"></div>
                      <div className="text-xs text-gray-600">05 AUG 2014</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                      <div className="text-xs text-gray-600">15 AUG 2015</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">الخارجية المصرية</h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                خدمات وزارة الخارجية المصرية من تأشيرات وتصديقات وخدمات القنصليات في جميع أنحاء العالم
              </p>
              <Link
                href="/services"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center block"
              >
                أحجز الان
              </Link>
            </div>
          </div>

          {/* الجوازات */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
            <div className="h-64 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center relative">
              {/* Egyptian Passport */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-28 h-20 bg-green-600 rounded-lg shadow-lg relative transform -rotate-3">
                  <div className="absolute inset-1 bg-white rounded flex flex-col justify-between p-1">
                    <div className="text-xs font-bold text-green-600 text-center">جمهورية مصر العربية</div>
                    <div className="text-xs text-gray-600 text-center">ARAB REPUBLIC OF EGYPT</div>
                    <div className="flex justify-center">
                      <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
                {/* Sunglasses */}
                <div className="absolute top-8 right-8 w-8 h-4 bg-gray-800 rounded-full transform rotate-12"></div>
                <div className="absolute top-8 right-6 w-8 h-4 bg-gray-800 rounded-full transform rotate-12"></div>
                <div className="absolute top-6 right-7 w-2 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">الجوازات</h3>
              <p className="text-gray-600 mb-6 text-lg leading-relaxed">
                تجديد وإصدار الجوازات المصرية بجميع أنواعها مع ضمان السرعة والدقة في التنفيذ
              </p>
              <Link
                href="/services"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg text-center block"
              >
                أحجز الان
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Services */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              خدمات إضافية
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              مجموعة متنوعة من الخدمات الحكومية الأخرى
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "الهوية الوطنية", icon: "🆔", color: "from-blue-500 to-blue-600" },
              { name: "رخصة القيادة", icon: "🚗", color: "from-purple-500 to-purple-600" },
              { name: "شهادة الميلاد", icon: "📋", color: "from-indigo-500 to-indigo-600" },
              { name: "شهادة الوفاة", icon: "📄", color: "from-gray-500 to-gray-600" },
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <div className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-2xl">{service.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{service.name}</h3>
                <Link
                  href="/services"
                  className="text-green-600 hover:text-green-700 font-semibold transition-colors duration-300"
                >
                  عرض التفاصيل
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              جاهز لبدء رحلتك؟
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              انضم إلينا الآن واحصل على أفضل الخدمات الحكومية بأسعار منافسة وجودة عالية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!session?.user ? (
                <Link
                  href="/register"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  إنشاء حساب مجاني
                </Link>
              ) : (
                <Link
                  href="/services"
                  className="bg-white text-green-600 hover:bg-gray-100 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  استعرض الخدمات
                </Link>
              )}
              <Link
                href="/services"
                className="border-2 border-white text-white hover:bg-white hover:text-green-600 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
              >
                عرض جميع الخدمات
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
