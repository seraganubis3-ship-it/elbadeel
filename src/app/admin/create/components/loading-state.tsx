'use client';

export function LoadingState() {
  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'>
      {/* Header */}
      <div className='bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
          <div className='flex items-center justify-between'>
            <div className='text-white'>
              <h1 className='text-5xl font-bold mb-3 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent'>
                إنشاء طلب جديد
              </h1>
              <p className='text-blue-100 text-xl mb-4'>جاري تحميل البيانات...</p>
            </div>
          </div>
        </div>
      </div>
      {/* Loading */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <div className='flex items-center justify-center min-h-96'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4'></div>
            <p className='text-xl text-gray-600'>جاري تحميل البيانات...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
