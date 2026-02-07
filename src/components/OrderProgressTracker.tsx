'use client';

import { ORDER_STATUS_CONFIG } from '@/constants/orderStatuses';
import { CUSTOMER_PROGRESS_STEPS, getCurrentStepIndex, getCustomerStatus } from '@/app/orders/customerStatusMapping';

interface OrderProgressTrackerProps {
  orderId: string;
  currentStatus: string;
  estimatedCompletion?: Date;
}

export default function OrderProgressTracker({
  orderId,
  currentStatus,
  estimatedCompletion,
}: OrderProgressTrackerProps) {
  
  const currentStepIndex = getCurrentStepIndex(currentStatus);
  const isCancelled = currentStepIndex === -1; // Assuming -1 for cancelled/returned based on helper
  const customerStatus = getCustomerStatus(currentStatus);

  const getStatusClass = (index: number) => {
    if (isCancelled) return 'text-gray-400 bg-gray-50 border-gray-200';

    if (index < currentStepIndex) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (index === currentStepIndex) {
      return 'text-blue-600 bg-blue-50 border-blue-200';
    } else {
      return 'text-gray-400 bg-gray-50 border-gray-200';
    }
  };

  const getIconClass = (index: number) => {
    if (isCancelled) return 'bg-gray-300 text-gray-500';

    if (index < currentStepIndex) {
      return 'bg-green-500 text-white';
    } else if (index === currentStepIndex) {
      return 'bg-blue-500 text-white';
    } else {
      return 'bg-gray-300 text-gray-500';
    }
  };

  return (
    <div className='bg-white rounded-2xl shadow-lg p-6 border border-gray-100'>
      <div className='text-center mb-6'>
        <h3 className='text-xl font-bold text-gray-900 mb-2'>تتبع حالة الطلب</h3>
        <p className='text-gray-600 text-sm'>رقم الطلب: {orderId}</p>
      </div>

      {isCancelled ? (
        <div className="text-center p-8 bg-red-50 rounded-xl border border-red-200">
          <div className="text-4xl mb-4">❌</div>
          <h4 className="text-xl font-bold text-red-800 mb-2">الطلب {customerStatus.label}</h4>
          <p className="text-red-600">هذا الطلب تم إلغاؤه أو إرجاعه.</p>
        </div>
      ) : (
        /* Progress Steps */
        <div className='space-y-6'>
          {CUSTOMER_PROGRESS_STEPS.map((step, index) => (
            <div key={step.id} className='flex items-start space-x-4 space-x-reverse'>
              {/* Status Icon */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold flex-shrink-0 transition-all duration-300 ${getIconClass(index)}`}
              >
                {step.icon}
              </div>

              {/* Status Content */}
              <div
                className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${getStatusClass(index)}`}
              >
                <div className='flex items-center justify-between mb-2'>
                  <h4 className='font-semibold text-lg'>{step.label}</h4>
                  {index === currentStepIndex && (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                      حالياً
                    </span>
                  )}
                </div>
                <p className='text-sm opacity-80'>{step.description}</p>

                {/* Estimated Time for Current Status */}
                {index === currentStepIndex && estimatedCompletion && (
                  <div className='mt-3 p-3 bg-blue-100 rounded-lg'>
                    <div className='flex items-center text-sm text-blue-700'>
                      <svg
                        className='w-4 h-4 ml-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                        />
                      </svg>
                      <span>
                        الوقت المتوقع للإنجاز: {estimatedCompletion.toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Current Status Summary */}
      <div className='mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200'>
        <div className='flex items-center justify-between'>
          <div>
            <h4 className='font-semibold text-blue-900'>الحالة الحالية</h4>
            <p className='text-sm text-blue-700'>
              {customerStatus.label}
            </p>
          </div>
          <div className='text-right'>
            <div className='text-2xl'>{customerStatus.icon}</div>
          </div>
        </div>
      </div>

      {/* Contact Support */}
      <div className='mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200'>
        <div className='text-center'>
          <h4 className='font-semibold text-green-900 mb-2'>هل لديك أسئلة؟</h4>
          <p className='text-sm text-green-700 mb-3'>فريق الدعم متاح لمساعدتك على مدار الساعة</p>
          <div className='flex flex-col sm:flex-row gap-2 justify-center'>
            <button className='inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors duration-200'>
              <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z'
                />
              </svg>
              اتصل بنا
            </button>
            <button className='inline-flex items-center px-4 py-2 border border-green-600 text-green-600 text-sm font-medium rounded-lg hover:bg-green-50 transition-colors duration-200'>
              <svg className='w-4 h-4 ml-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
                />
              </svg>
              محادثة فورية
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
