'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // هنا ممكن تبعت error لأي خدمة logging
    //
  }, [error]);

  return (
    <div className='min-h-screen flex items-center justify-center px-4'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6'>
          <svg
            className='w-8 h-8 text-red-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>

        <h1 className='text-2xl font-bold text-gray-900 mb-4'>خطأ في التطبيق</h1>

        <p className='text-gray-600 mb-6'>
          حدث خطأ خطير في التطبيق. يرجى إعادة تحميل الصفحة أو المحاولة لاحقاً.
        </p>

        <div className='space-y-3'>
          <button
            onClick={reset}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200'
          >
            إعادة المحاولة
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className='w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200'
          >
            العودة للصفحة الرئيسية
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className='mt-6 text-left'>
            <summary className='cursor-pointer text-sm text-gray-500 hover:text-gray-700'>
              تفاصيل الخطأ (للمطورين)
            </summary>
            <pre className='mt-2 text-xs text-red-600 bg-red-50 p-3 rounded overflow-auto'>
              {error.message}
              {error.digest && `\nDigest: ${error.digest}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
