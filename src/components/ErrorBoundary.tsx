'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    //

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to external service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='min-h-screen flex items-center justify-center bg-gray-50'>
          <div className='max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg
                className='w-8 h-8 text-red-600'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z'
                />
              </svg>
            </div>
            <h2 className='text-xl font-semibold text-gray-900 mb-2'>حدث خطأ غير متوقع</h2>
            <p className='text-gray-600 mb-4'>
              نعتذر، حدث خطأ في تحميل هذه الصفحة. يرجى المحاولة مرة أخرى.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling
export function useErrorHandler() {
  const handleError = (_error: Error, _errorInfo?: any) => {
    //
    // Log to external service
    // logErrorToService(error, errorInfo);
    // Show user-friendly message
    // toast.error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.');
  };

  return { handleError };
}

// Error fallback components
export function ErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center'>
        <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
          <svg
            className='w-8 h-8 text-red-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        </div>
        <h2 className='text-xl font-semibold text-gray-900 mb-2'>حدث خطأ</h2>
        <p className='text-gray-600 mb-4'>{error.message || 'حدث خطأ غير متوقع'}</p>
        <button
          onClick={resetError}
          className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
        >
          إعادة المحاولة
        </button>
      </div>
    </div>
  );
}
