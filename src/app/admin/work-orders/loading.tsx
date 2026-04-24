import { FileText } from 'lucide-react';

export default function WorkOrdersLoading() {
  return (
    <div className='min-h-screen bg-emerald-50/40 p-4 sm:p-6' dir='rtl'>
      <div className='mx-auto w-full max-w-7xl space-y-6'>
        <div className='rounded-2xl border border-white/70 bg-white/90 p-5 shadow-sm shadow-slate-200/80'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
              <FileText className='h-5 w-5' />
            </div>
            <div>
              <div className='h-6 w-40 animate-pulse rounded bg-slate-200' />
              <div className='mt-2 h-4 w-64 animate-pulse rounded bg-slate-100' />
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          {[0, 1, 2].map(item => (
            <div key={item} className='h-32 animate-pulse rounded-2xl bg-white shadow-sm' />
          ))}
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
          <div className='mb-5 flex items-center justify-between'>
            <div>
              <div className='h-6 w-56 animate-pulse rounded bg-slate-200' />
              <div className='mt-2 h-4 w-40 animate-pulse rounded bg-slate-100' />
            </div>
            <div className='h-11 w-72 animate-pulse rounded-xl bg-slate-100' />
          </div>
          <div className='space-y-3'>
            {[0, 1, 2, 3].map(item => (
              <div key={item} className='h-16 animate-pulse rounded-xl bg-slate-50' />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
