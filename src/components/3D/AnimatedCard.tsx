'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface AnimatedCardProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  hover?: boolean;
  style?: React.CSSProperties;
}

export default function AnimatedCard({
  children,
  delay = 0,
  className = '',
  hover = true,
  style,
}: AnimatedCardProps) {
  const [mounted, setMounted] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  const cardVariants = {
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
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  const hoverVariants = hover
    ? {
        hover: {
          y: -10,
          rotateX: 5,
          rotateY: 5,
          scale: 1.02,
          transition: {
            duration: 0.3,
            ease: 'easeOut',
          },
        },
      }
    : {};

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={cardVariants}
      initial='hidden'
      animate={inView ? 'visible' : 'hidden'}
      {...(hover ? { whileHover: 'hover' as const } : {})}
      style={
        {
          transformStyle: 'preserve-3d',
          perspective: '1000px',
          ...(style || {}),
        } as any
      }
    >
      {children}
    </motion.div>
  );
}
