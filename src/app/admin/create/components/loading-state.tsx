'use client';

export function LoadingState() {
  return (
    <div className='min-h-screen bg-slate-50 relative overflow-hidden'>
      {/* Background Skeletons */}
      <div className='absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-slate-200/20 rounded-full animate-pulse' />

      <div className='relative z-10 max-w-[1700px] mx-auto px-4 py-4'>
        {/* Header Skeleton */}
        <div className='flex items-center justify-between mb-8 px-2'>
          <div className='flex items-center gap-4'>
            <div className='w-12 h-12 bg-slate-200 rounded-2xl animate-pulse'></div>
            <div className='flex items-center gap-4'>
              <div className='w-12 h-12 bg-slate-200 rounded-2xl animate-pulse'></div>
              <div className='space-y-2'>
                <div className='h-8 w-48 bg-slate-200 rounded-lg animate-pulse'></div>
                <div className='h-3 w-32 bg-slate-200 rounded-full animate-pulse'></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Skeleton */}
        <div className='flex gap-4 mb-8 overflow-hidden'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className='h-12 w-40 bg-slate-200 rounded-xl animate-pulse'></div>
          ))}
        </div>

        {/* Content Skeleton */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 items-start'>
          <div className='space-y-4'>
            <div className='h-96 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 p-6 animate-pulse'>
              <div className='flex items-center gap-4 mb-8'>
                <div className='w-14 h-14 bg-slate-200 rounded-2xl'></div>
                <div className='space-y-2'>
                  <div className='h-6 w-40 bg-slate-200 rounded'></div>
                  <div className='h-4 w-24 bg-slate-200 rounded'></div>
                </div>
              </div>
              <div className='space-y-4'>
                <div className='h-16 w-full bg-slate-200 rounded-2xl'></div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='h-16 w-full bg-slate-200 rounded-2xl'></div>
                  <div className='h-16 w-full bg-slate-200 rounded-2xl'></div>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-4 hidden lg:block'>
            <div className='h-64 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 p-6 animate-pulse'></div>
            <div className='h-32 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-slate-100 p-6 animate-pulse'></div>
          </div>
        </div>
      </div>
    </div>
  );
}
