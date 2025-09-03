import Link from "next/link";
import { getServerSession } from "next-auth";
import { authConfig } from "@/auth.config";

export default async function HomeSimple() {
  // Check if user is authenticated
  const session = await getServerSession(authConfig) as any;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Dark Header */}
      <div className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
              الخدمات الحكومية
            </h1>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* المستخرجات الرسمية */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-48 bg-blue-100 flex items-center justify-center">
              {/* Document representation */}
              <div className="text-center">
                <div className="w-20 h-24 bg-white rounded-lg shadow-md mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <div className="w-16 h-1 bg-blue-300 rounded mx-auto"></div>
                  <div className="w-12 h-1 bg-blue-200 rounded mx-auto"></div>
                  <div className="w-20 h-1 bg-blue-300 rounded mx-auto"></div>
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
                أحجز الان
              </Link>
            </div>
          </div>

          {/* الخارجية المصرية */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-48 bg-red-100 flex items-center justify-center">
              {/* Passport representation */}
              <div className="text-center">
                <div className="w-20 h-24 bg-red-600 rounded-lg shadow-md mx-auto mb-4 flex items-center justify-center">
                  <div className="w-16 h-20 bg-white rounded flex flex-col justify-between p-2">
                    <div className="text-xs font-bold text-red-600 text-center">جمهورية مصر العربية</div>
                    <div className="flex justify-between items-center">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <div className="text-xs text-gray-600">05 AUG 2014</div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <div className="text-xs text-gray-600">15 AUG 2015</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="w-20 h-1 bg-red-300 rounded mx-auto"></div>
                  <div className="w-16 h-1 bg-red-200 rounded mx-auto"></div>
                  <div className="w-18 h-1 bg-red-300 rounded mx-auto"></div>
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
                أحجز الان
              </Link>
            </div>
          </div>

          {/* الجوازات */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="h-48 bg-green-100 flex items-center justify-center">
              {/* Egyptian Passport representation */}
              <div className="text-center">
                <div className="w-20 h-24 bg-green-600 rounded-lg shadow-md mx-auto mb-4 flex items-center justify-center">
                  <div className="w-16 h-20 bg-white rounded flex flex-col justify-between p-2">
                    <div className="text-xs font-bold text-green-600 text-center">جمهورية مصر العربية</div>
                    <div className="text-xs text-gray-600 text-center">ARAB REPUBLIC OF EGYPT</div>
                    <div className="flex justify-center">
                      <div className="w-4 h-4 bg-green-600 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="w-16 h-1 bg-green-300 rounded mx-auto"></div>
                  <div className="w-20 h-1 bg-green-200 rounded mx-auto"></div>
                  <div className="w-14 h-1 bg-green-300 rounded mx-auto"></div>
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
