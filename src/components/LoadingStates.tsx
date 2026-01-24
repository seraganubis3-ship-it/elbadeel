'use client';

import { ReactNode } from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  color = 'primary',
  className = '',
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const colorClasses = {
    primary: 'border-blue-600',
    white: 'border-white',
    gray: 'border-gray-600',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}

interface LoadingButtonProps {
  loading: boolean;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function LoadingButton({
  loading,
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`relative flex items-center justify-center gap-2 ${className} ${
        loading || disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading && <LoadingSpinner size='sm' color='white' />}
      {children}
    </button>
  );
}

interface LoadingCardProps {
  loading: boolean;
  children: ReactNode;
  className?: string;
  skeleton?: ReactNode;
}

export function LoadingCard({ loading, children, className = '', skeleton }: LoadingCardProps) {
  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {skeleton || (
          <div className='space-y-4'>
            <div className='h-4 bg-gray-200 rounded w-3/4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            <div className='h-4 bg-gray-200 rounded w-5/6'></div>
          </div>
        )}
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}

interface LoadingPageProps {
  loading: boolean;
  children: ReactNode;
  message?: string;
}

export function LoadingPage({ loading, children, message = 'جاري التحميل...' }: LoadingPageProps) {
  if (loading) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <LoadingSpinner size='lg' color='primary' className='mx-auto mb-4' />
          <p className='text-gray-600 text-lg'>{message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Skeleton components
export function SkeletonCard() {
  return (
    <div className='bg-white rounded-lg shadow-md p-6 animate-pulse'>
      <div className='h-4 bg-gray-200 rounded w-3/4 mb-4'></div>
      <div className='h-4 bg-gray-200 rounded w-1/2 mb-2'></div>
      <div className='h-4 bg-gray-200 rounded w-5/6'></div>
    </div>
  );
}

export function SkeletonTable() {
  return (
    <div className='bg-white rounded-lg shadow-md overflow-hidden animate-pulse'>
      <div className='p-4 border-b'>
        <div className='h-4 bg-gray-200 rounded w-1/4'></div>
      </div>
      <div className='divide-y'>
        {[...Array(5)].map((_, i) => (
          <div key={i} className='p-4 flex items-center space-x-4'>
            <div className='h-4 bg-gray-200 rounded w-1/6'></div>
            <div className='h-4 bg-gray-200 rounded w-1/4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/3'></div>
            <div className='h-4 bg-gray-200 rounded w-1/5'></div>
          </div>
        ))}
      </div>
    </div>
  );
}
