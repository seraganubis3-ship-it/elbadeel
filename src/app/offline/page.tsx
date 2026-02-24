import Link from 'next/link';

export default function OfflinePage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50 to-slate-100 px-4'>
      <div className='text-center max-w-md w-full p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white'>
        <div className='w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6'>
          📡
        </div>
        <h1 className='text-2xl font-bold text-gray-900 mb-4'>أنت غير متصل بالإنترنت</h1>
        <p className='text-gray-600 mb-8'>
          يبدو أنك فقدت الاتصال بالإنترنت. ولكن لا تقلق، يمكنك الاستمرار في استخدام لوحة التحكم
          لإنشاء الطلبات، وسيتم حفظها تلقائياً على جهازك للمزامنة لاحقاً.
        </p>
        <div className='space-y-4'>
          <Link
            href='/admin/create'
            className='block w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20'
          >
            الذهاب لإنشاء طلب جديد
          </Link>
          <Link
            href='/admin/orders'
            className='block w-full py-4 bg-slate-100 text-slate-700 font-bold rounded-2xl hover:bg-slate-200 transition-all'
          >
            عرض الطلبات السابقة
          </Link>
        </div>
      </div>
    </div>
  );
}
