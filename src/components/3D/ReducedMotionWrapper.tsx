'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ReducedMotionWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ReducedMotionWrapper({ children, fallback }: ReducedMotionWrapperProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  if (prefersReducedMotion) {
    return fallback ? <>{fallback}</> : <>{children}</>;
  }

  return <>{children}</>;
}

// Simplified motion variants for reduced motion
export const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

// Standard motion variants
export const standardMotionVariants = {
  hidden: {
    opacity: 0,
    y: 50,
    rotateX: -15,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};
