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
      }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">حدث خطأ غير متوقع</h2>
              <p className="text-gray-600 mb-6">عذراً، حدث خطأ جسيم أدى لتوقف التطبيق.</p>
              <button
                onClick={() => reset()}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                حاول مرة أخرى
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
