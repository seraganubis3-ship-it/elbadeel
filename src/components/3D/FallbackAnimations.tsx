'use client';

import { useEffect, useState } from 'react';

interface FallbackAnimationsProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export default function FallbackAnimations({
  children,
  className = '',
  delay = 0,
}: FallbackAnimationsProps) {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Simple intersection observer for fallback
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry && entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay * 1000);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById(`fallback-${Math.random().toString(36).substr(2, 9)}`);
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [delay]);

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      id={`fallback-${Math.random().toString(36).substr(2, 9)}`}
      className={`${className} transition-all duration-700 ease-out ${
        isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
      }`}
    >
      {children}
    </div>
  );
}

// Simple floating elements without Three.js
export function SimpleFloatingBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className='absolute inset-0 w-full h-full pointer-events-none'>
        <div className='w-full h-full bg-gradient-to-br from-green-500/10 to-blue-500/10'></div>
      </div>
    );
  }

  return (
    <div className='absolute inset-0 w-full h-full pointer-events-none overflow-hidden'>
      {/* CSS-only floating elements */}
      <div className='absolute top-20 left-10 w-20 h-20 bg-green-400/20 rounded-full blur-xl animate-pulse'></div>
      <div
        className='absolute top-40 right-20 w-32 h-32 bg-blue-400/20 rounded-full blur-xl animate-pulse'
        style={{ animationDelay: '1s' }}
      ></div>
      <div
        className='absolute bottom-40 left-1/4 w-16 h-16 bg-purple-400/20 rounded-full blur-xl animate-pulse'
        style={{ animationDelay: '2s' }}
      ></div>
      <div
        className='absolute top-1/2 right-1/3 w-24 h-24 bg-amber-400/20 rounded-full blur-xl animate-pulse'
        style={{ animationDelay: '0.5s' }}
      ></div>

      {/* Gradient overlay */}
      <div className='absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5'></div>
    </div>
  );
}
