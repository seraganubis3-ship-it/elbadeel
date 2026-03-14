'use client';

import { useEffect, useState } from 'react';

type InactivityDialogProps = {
  isOpen: boolean;
  remainingSeconds: number;
  isWarning: boolean;
  onContinue: () => void;
  onLogout: () => void;
};

export default function InactivityDialog({
  isOpen,
  remainingSeconds,
  isWarning,
  onContinue,
  onLogout,
}: InactivityDialogProps) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPulse(true);
      const pulseInterval = setInterval(() => {
        setPulse(p => !p);
      }, 1000);
      return () => clearInterval(pulseInterval);
    }
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (remainingSeconds > 40) return 'from-blue-500 to-cyan-500';
    if (remainingSeconds > 20) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-red-600';
  };

  const getProgressPercentage = () => {
    return ((remainingSeconds / 60) * 100).toFixed(0);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300'>
      <div className='bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full animate-in zoom-in duration-300'>
        <div className='text-center'>
          <div
            className={`mx-auto w-24 h-24 bg-gradient-to-br ${getProgressColor()} rounded-full flex items-center justify-center mb-6 shadow-lg ${pulse ? 'scale-110' : 'scale-100'} transition-all duration-300`}
          >
            <div className='text-white text-4xl font-bold'>{formatTime(remainingSeconds)}</div>
          </div>

          <div className='mb-6'>
            <div className='w-full bg-gray-200 rounded-full h-3 overflow-hidden'>
              <div
                className={`h-full bg-gradient-to-r ${getProgressColor()} transition-all duration-1000 ease-linear`}
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>

          <h2 className='text-3xl font-bold text-gray-900 mb-3'>تنبيه عدم النشاط</h2>

          <div className='space-y-2 mb-8'>
            لم يُلاحظ أي نشاط على حسابك منذ <span className='font-bold text-red-600'>10 دقائق</span>
            {isWarning && remainingSeconds <= 10 && (
              <p className='text-red-600 font-bold text-lg animate-pulse'>
                ⚠️ سيتم تسجيل الخروج قريباً!
              </p>
            )}
            <p className='text-gray-700'>للبقاء في الجلسة، يرجى الاستمرار في استخدام التطبيق</p>
          </div>

          <div className='flex flex-col gap-3'>
            <button
              onClick={onContinue}
              className='w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-200 text-lg flex items-center justify-center gap-2'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M5 13l4 4L19 7'
                />
              </svg>
              استمر في الجلسة
            </button>

            <button
              onClick={onLogout}
              className='w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-200 text-lg flex items-center justify-center gap-2'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 16l4-4m0 0l-4 4m4-4H3m2 4h6a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                />
              </svg>
              تسجيل الخروج
            </button>
          </div>

          <div className='mt-6 pt-4 border-t border-gray-200'>
            <div className='flex items-center justify-center gap-6 text-sm text-gray-500'>
              <div className='flex items-center gap-1'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
                  />
                </svg>
                <span>محمي</span>
              </div>
              <div className='flex items-center gap-1'>
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span>آمن</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
