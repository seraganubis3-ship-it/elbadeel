'use client';

import { motion } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface Text3DProps {
  text: string;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export default function Text3D({ text, className = '', delay = 0, direction = 'up' }: Text3DProps) {
  const [mounted, setMounted] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <span className={className}>{text}</span>;
  }

  const words = text.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: delay,
      },
    },
  };

  const getWordVariants = () => {
    const baseVariants = {
      hidden: {
        opacity: 0,
        y: direction === 'up' ? 50 : direction === 'down' ? -50 : 0,
        x: direction === 'left' ? 50 : direction === 'right' ? -50 : 0,
        rotateX: -90,
        scale: 0.8,
      },
      visible: {
        opacity: 1,
        y: 0,
        x: 0,
        rotateX: 0,
        scale: 1,
        transition: {
          duration: 0.6,
          ease: [0.25, 0.46, 0.45, 0.94] as const,
        },
      },
    };

    return baseVariants;
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={containerVariants}
      initial='hidden'
      animate={inView ? 'visible' : 'hidden'}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          variants={getWordVariants()}
          className='inline-block mr-2'
          style={{
            transformStyle: 'preserve-3d',
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
