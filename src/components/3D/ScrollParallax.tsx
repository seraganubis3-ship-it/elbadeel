'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface ScrollParallaxProps {
  children: React.ReactNode;
  speed?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export default function ScrollParallax({
  children,
  speed = 0.5,
  direction = 'up',
  className = '',
}: ScrollParallaxProps) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always call hooks at the top level
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const springConfig = { stiffness: 100, damping: 30, restDelta: 0.001 };
  const y = useSpring(useTransform(scrollYProgress, [0, 1], [0, -100 * speed]), springConfig);
  const x = useSpring(useTransform(scrollYProgress, [0, 1], [0, -50 * speed]), springConfig);

  if (!mounted) {
    return <div className={className}>{children}</div>;
  }

  let transform = '';
  switch (direction) {
    case 'up':
      transform = `translateY(${y}px)`;
      break;
    case 'down':
      transform = `translateY(${-y}px)`;
      break;
    case 'left':
      transform = `translateX(${x}px)`;
      break;
    case 'right':
      transform = `translateX(${-x}px)`;
      break;
  }

  return (
    <motion.div ref={ref} className={className} style={{ transform }}>
      {children}
    </motion.div>
  );
}
