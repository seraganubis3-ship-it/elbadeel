'use client';

import { useState, useEffect } from 'react';

interface MascotProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
}

export default function DoctorMascot({ size = 'md', message, className = '' }: MascotProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);

  // Blink animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3000);

    return () => clearInterval(blinkInterval);
  }, []);

  // Wave on hover
  const handleHover = () => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 600);
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  return (
    <div className={`relative inline-block cursor-pointer ${className}`} onMouseEnter={handleHover}>
      {/* Speech Bubble */}
      {message && (
        <div className='absolute -top-14 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-4 py-2.5 shadow-xl text-sm font-medium text-gray-700 whitespace-nowrap border border-gray-100'>
          {message}
          <div className='absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white transform rotate-45 border-r border-b border-gray-100'></div>
        </div>
      )}

      {/* Doctor SVG */}
      <svg
        viewBox='0 0 100 120'
        className={`${sizeClasses[size]} transition-transform duration-300 hover:scale-110 drop-shadow-lg`}
      >
        {/* Body/White Coat */}
        <path
          d='M30 70 L30 100 Q30 110 50 110 Q70 110 70 100 L70 70 Q70 60 50 55 Q30 60 30 70'
          fill='#FFFFFF'
          stroke='#E2E8F0'
          strokeWidth='1'
        />
        {/* Inner Shirt/Tie Area */}
        <path d='M50 55 L50 85' stroke='#E2E8F0' strokeWidth='1' />
        <path d='M50 55 L45 70 L50 85 L55 70 Z' fill='#3B82F6' /> {/* Blue Tie */}
        {/* Stethoscope */}
        <path d='M40 70 Q40 90 50 90 Q60 90 60 70' stroke='#475569' strokeWidth='2' fill='none' />
        <circle cx='50' cy='90' r='4' fill='#94A3B8' stroke='#475569' strokeWidth='1' />
        <path d='M40 70 L35 55' stroke='#475569' strokeWidth='2' />
        <path d='M60 70 L65 55' stroke='#475569' strokeWidth='2' />
        {/* Neck */}
        <rect x='44' y='48' width='12' height='10' fill='#F5D0B0' rx='2' />
        {/* Head */}
        <ellipse cx='50' cy='35' rx='18' ry='20' fill='#F5D0B0' />
        {/* Hair - Neat Doctor Style */}
        <path
          d='M32 30 Q32 18 50 15 Q68 18 68 30 L68 28 Q68 22 50 19 Q32 22 32 28 Z'
          fill='#2C1810'
        />
        {/* Glasses (Optional but looks smart) */}
        <g stroke='#334155' strokeWidth='1.5' fill='none'>
          <circle cx='42' cy='33' r='6' />
          <circle cx='58' cy='33' r='6' />
          <path d='M48 33 L52 33' />
        </g>
        {/* Eyebrows */}
        <path
          d='M38 26 Q42 24 46 26'
          stroke='#2C1810'
          strokeWidth='1.5'
          fill='none'
          strokeLinecap='round'
        />
        <path
          d='M54 26 Q58 24 62 26'
          stroke='#2C1810'
          strokeWidth='1.5'
          fill='none'
          strokeLinecap='round'
        />
        {/* Eyes */}
        <g>
          {/* Left eye */}
          <ellipse cx='42' cy='33' rx='2' ry='2' fill='#2C1810' opacity={isBlinking ? 0 : 1} />
          {/* Right eye */}
          <ellipse cx='58' cy='33' rx='2' ry='2' fill='#2C1810' opacity={isBlinking ? 0 : 1} />
        </g>
        {/* Nose */}
        <ellipse cx='50' cy='40' rx='2' ry='2.5' fill='#E8C4A0' />
        {/* Smile */}
        <path
          d='M44 45 Q50 50 56 45'
          stroke='#2C1810'
          strokeWidth='1.5'
          fill='none'
          strokeLinecap='round'
        />
        {/* Ears */}
        <ellipse cx='32' cy='35' rx='3' ry='5' fill='#F5D0B0' />
        <ellipse cx='68' cy='35' rx='3' ry='5' fill='#F5D0B0' />
        {/* Arms - White Coat Sleeves */}
        <g className={`origin-top transition-transform duration-300 ${isWaving ? '' : ''}`}>
          {/* Left arm */}
          <path
            d='M30 70 Q20 75 18 90 Q16 95 22 95 L26 95 Q30 95 30 90 L30 75'
            fill='#FFFFFF'
            stroke='#E2E8F0'
            strokeWidth='1'
          />
          {/* Left hand */}
          <ellipse cx='22' cy='96' rx='5' ry='4' fill='#F5D0B0' />
          {/* Clipboard (Optional) */}
          <rect
            x='18'
            y='92'
            width='12'
            height='16'
            fill='#78350F'
            transform='rotate(-10 24 100)'
          />
          <rect
            x='19'
            y='93'
            width='10'
            height='14'
            fill='#FFFFFF'
            transform='rotate(-10 24 100)'
          />
        </g>
        {/* Right arm - waving */}
        <g
          className={`transition-transform duration-300`}
          style={{
            transformOrigin: '70px 70px',
            transform: isWaving ? 'rotate(-30deg)' : 'rotate(0deg)',
          }}
        >
          <path
            d='M70 70 Q80 65 85 55 Q88 50 82 48 L78 50 Q75 52 72 60 L70 70'
            fill='#FFFFFF'
            stroke='#E2E8F0'
            strokeWidth='1'
          />
          {/* Right hand - waving */}
          <g
            style={{
              transformOrigin: '83px 48px',
              animation: isWaving ? 'wave-hand 0.3s ease-in-out 2' : 'none',
            }}
          >
            <ellipse cx='83' cy='48' rx='5' ry='4' fill='#F5D0B0' />
            {/* Fingers */}
            <path d='M80 45 L79 42' stroke='#F5D0B0' strokeWidth='2' strokeLinecap='round' />
            <path d='M82 44 L82 41' stroke='#F5D0B0' strokeWidth='2' strokeLinecap='round' />
            <path d='M84 44 L85 41' stroke='#F5D0B0' strokeWidth='2' strokeLinecap='round' />
            <path d='M86 45 L88 43' stroke='#F5D0B0' strokeWidth='2' strokeLinecap='round' />
          </g>
        </g>
        {/* Cheek blush */}
        <ellipse cx='36' cy='42' rx='4' ry='2' fill='#FFB6C1' opacity='0.4' />
        <ellipse cx='64' cy='42' rx='4' ry='2' fill='#FFB6C1' opacity='0.4' />
      </svg>

      {/* Animations */}
      <style jsx>{`
        @keyframes wave-hand {
          0%,
          100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(20deg);
          }
        }
      `}</style>
    </div>
  );
}

// Floating mascot that appears on the side
export function FloatingMascot({ message = 'أهلاً بيك! 👋' }: { message?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    // Show after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
      setShowMessage(true);

      // Hide message after 5 seconds
      setTimeout(() => setShowMessage(false), 5000);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className='fixed bottom-6 right-6 z-50'
      style={{
        animation: 'slideInUp 0.5s ease-out',
      }}
    >
      <DoctorMascot size='lg' message={showMessage ? message : ''} />

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
