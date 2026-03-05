'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';

interface InactivityDialogProps {
  isOpen: boolean;
  remainingSeconds: number;
  onContinue: () => void;
  onLogout: () => void;
}

export default function InactivityDialog({
  isOpen,
  remainingSeconds,
  onContinue,
  onLogout,
}: InactivityDialogProps) {
  const [timeLeft, setTimeLeft] = useState(remainingSeconds);

  useEffect(() => {
    setTimeLeft(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-in fade-in zoom-in duration-300'>
        <div className='text-center'>
          <div className='mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-6'>
            <svg
              className='w-8 h-8 text-amber-600'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4l3 3m0 0l-3-3m3 3V8m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118z'
              />
            </svg>
          </div>

          <h2 className='text-2xl font-bold text-gray-900 mb-3'>تنبيه عدم النشاط</h2>

          <p className='text-gray-600 mb-2 text-lg'>
            لم يُلاحظ أي نشاط على حسابك منذ{' '}
            <span className='font-bold text-amber-600'>5 دقائق</span>
          </p>

          <p className='text-gray-700 mb-6'>سيتم تسجيل الخروج تلقائياً خلال:</p>

          <div className='text-4xl font-bold text-amber-600 mb-8 bg-amber-50 py-4 px-6 rounded-lg'>
            {formatTime(timeLeft)}
          </div>

          <div className='flex flex-col gap-3'>
            <button
              onClick={onContinue}
              className='w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-200'
            >
              استمر في الجلسة
            </button>

            <button
              onClick={onLogout}
              className='w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-200'
            >
              تسجيل الخروج
            </button>
          </div>

          <p className='text-sm text-gray-500 mt-4'>
            سيتم تسجيل الخروج تلقائياً إذا لم تتم الاستجابة
          </p>
        </div>
      </div>
    </div>
  );
}
