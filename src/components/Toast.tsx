'use client';

import { useState, useEffect, useCallback } from 'react';

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ id, type, title, message, duration = 5000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const handleClose = useCallback(() => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  }, [onClose, id]);

  useEffect(() => {
    // Show toast with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto hide after duration
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration, handleClose]);

  const getToastStyles = () => {
    const baseStyles =
      'relative overflow-hidden rounded-xl shadow-lg border-2 transform transition-all duration-300 ease-in-out';

    if (isLeaving) {
      return `${baseStyles} translate-x-full opacity-0 scale-95`;
    }

    if (isVisible) {
      return `${baseStyles} translate-x-0 opacity-100 scale-100`;
    }

    return `${baseStyles} translate-x-full opacity-0 scale-95`;
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
          icon: 'bg-green-100 text-green-600',
          iconSvg: (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          ),
          title: 'text-green-800',
          message: 'text-green-700',
        };
      case 'error':
        return {
          container: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200',
          icon: 'bg-red-100 text-red-600',
          iconSvg: (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          ),
          title: 'text-red-800',
          message: 'text-red-700',
        };
      case 'warning':
        return {
          container: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
          icon: 'bg-yellow-100 text-yellow-600',
          iconSvg: (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
              />
            </svg>
          ),
          title: 'text-yellow-800',
          message: 'text-yellow-700',
        };
      case 'info':
        return {
          container: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
          icon: 'bg-blue-100 text-blue-600',
          iconSvg: (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          ),
          title: 'text-blue-800',
          message: 'text-blue-700',
        };
      default:
        return {
          container: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
          icon: 'bg-gray-100 text-gray-600',
          iconSvg: (
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              />
            </svg>
          ),
          title: 'text-gray-800',
          message: 'text-gray-700',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={getToastStyles()}>
      <div className={`p-4 ${styles.container}`}>
        <div className='flex items-start space-x-3 space-x-reverse'>
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${styles.icon}`}
          >
            {styles.iconSvg}
          </div>

          {/* Content */}
          <div className='flex-1 min-w-0'>
            <h4 className={`text-sm font-semibold ${styles.title}`}>{title}</h4>
            {message && <p className={`text-sm mt-1 ${styles.message}`}>{message}</p>}
          </div>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className='flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200'
          >
            <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className='absolute bottom-0 left-0 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden'>
          <div
            className='h-full bg-white bg-opacity-50 rounded-full animate-progress'
            style={{
              animation: `progress ${duration}ms linear forwards`,
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[];
  onRemoveToast: (id: string) => void;
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  return (
    <div className='fixed top-4 right-4 z-50 space-y-3 max-w-sm w-full pointer-events-none'>
      {toasts.map(toast => (
        <div key={toast.id} className='pointer-events-auto'>
          <Toast {...toast} onClose={onRemoveToast} />
        </div>
      ))}
    </div>
  );
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const addToast = useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      onClose: (_id: string) => {},
    };

    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'success', title, ...(message !== undefined && { message }) });
    },
    [addToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'error', title, ...(message !== undefined && { message }) });
    },
    [addToast]
  );

  const showWarning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'warning', title, ...(message !== undefined && { message }) });
    },
    [addToast]
  );

  const showInfo = useCallback(
    (title: string, message?: string) => {
      addToast({ type: 'info', title, ...(message !== undefined && { message }) });
    },
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
}
