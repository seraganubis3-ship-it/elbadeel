'use client';

import { useEffect, useState } from 'react';

interface SimpleScrollParallaxProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export default function SimpleScrollParallax({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
}: SimpleScrollParallaxProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  // Use CSS transforms instead of Framer Motion for better SSR compatibility
  const getTransformClass = () => {
    switch (direction) {
      case 'up':
        return 'transform-gpu transition-transform duration-1000 ease-out';
      case 'down':
        return 'transform-gpu transition-transform duration-1000 ease-out';
      case 'left':
        return 'transform-gpu transition-transform duration-1000 ease-out';
      case 'right':
        return 'transform-gpu transition-transform duration-1000 ease-out';
      default:
        return 'transform-gpu transition-transform duration-1000 ease-out';
    }
  };

  return (
    <div
      className={`${className} ${getTransformClass()}`}
      style={{
        transform: `translateY(${speed * 20}px)`,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}
