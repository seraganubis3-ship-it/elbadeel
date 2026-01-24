'use client';

import { useEffect, useState } from 'react';

export default function SimpleFloatingElements() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='absolute inset-0 w-full h-full pointer-events-none'>
        <div className='w-full h-full bg-gradient-to-br from-green-500/10 to-blue-500/10 animate-pulse'></div>
      </div>
    );
  }

  return (
    <div className='absolute inset-0 w-full h-full pointer-events-none overflow-hidden'>
      {/* Floating circles with CSS animations */}
      <div className='absolute top-20 left-10 w-20 h-20 bg-green-400/20 rounded-full blur-xl animate-float'></div>
      <div
        className='absolute top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-float'
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className='absolute bottom-40 left-1/4 w-16 h-16 bg-purple-400/20 rounded-full blur-xl animate-float'
        style={{ animationDelay: '4s' }}
      ></div>
      <div
        className='absolute top-1/2 right-1/3 w-24 h-24 bg-amber-400/20 rounded-full blur-xl animate-float'
        style={{ animationDelay: '1s' }}
      ></div>

      {/* Gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5'></div>
    </div>
  );
}
