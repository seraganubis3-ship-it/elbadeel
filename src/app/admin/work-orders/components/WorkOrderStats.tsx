'use client';

interface WorkOrderStatsProps {
  totalWorkOrders: number;
  ordersToday: number;
  totalPending: number;
}

export function WorkOrderStats({
  totalWorkOrders,
  ordersToday,
  totalPending,
}: WorkOrderStatsProps) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
      <div className='bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg shadow-blue-200'>
        <div className='flex items-center justify-between mb-4'>
          <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
            <svg
              className='w-6 h-6 text-white'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'
              />
            </svg>
          </div>
          <span className='text-xs font-bold bg-white/20 px-2 py-1 rounded-full backdrop-blur-sm'>
            الإجمالي
          </span>
        </div>
        <div className='text-3xl font-black mb-1'>{totalWorkOrders}</div>
        <div className='text-blue-100 text-sm font-medium opacity-90'>إجمالي أوامر الشغل</div>
      </div>

      <div className='bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md'>
        <div className='flex items-center justify-between mb-4'>
          <div className='p-2 bg-emerald-50 rounded-lg'>
            <svg
              className='w-6 h-6 text-emerald-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
          <span className='text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full'>
            اليوم
          </span>
        </div>
        <div className='text-3xl font-black text-slate-800 mb-1'>{ordersToday}</div>
        <div className='text-slate-500 text-sm font-medium'>شهادات ميلاد كمبيوتر اليوم</div>
      </div>

      <div className='bg-white rounded-2xl p-5 border border-slate-100 shadow-sm transition-all hover:shadow-md'>
        <div className='flex items-center justify-between mb-4'>
          <div className='p-2 bg-amber-50 rounded-lg'>
            <svg
              className='w-6 h-6 text-amber-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          </div>
          <span className='text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-full'>
            معلق
          </span>
        </div>
        <div className='text-3xl font-black text-slate-800 mb-1'>{totalPending}</div>
        <div className='text-slate-500 text-sm font-medium'>إجمالي الحالات المعلقة</div>
      </div>
    </div>
  );
}
