import Link from 'next/link';

export default function NotFound() {
  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
        <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <svg
            className='w-8 h-8 text-blue-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-gray-900 mb-4'>الصفحة غير موجودة</h1>

        <p className='text-gray-600 mb-6'>عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.</p>

        <div className='space-y-3'>
          <Link
            href='/'
            className='block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
          >
            العودة للصفحة الرئيسية
          </Link>

          <Link
            href='/services'
            className='block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200'
          >
            تصفح الخدمات
          </Link>
        </div>

        <div className='mt-8 text-sm text-gray-500'>
          <p>رمز الخطأ: 404</p>
        </div>
      </div>
    </div>
  );
}
