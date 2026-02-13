import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200',
    warning: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200',
    danger: 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200',
    info: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200',
    purple: 'bg-gradient-to-r from-purple-50 to-violet-50 text-purple-700 border-purple-200',
  };

  return (
    <span
      className={`
        inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
