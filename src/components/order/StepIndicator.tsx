import { motion } from 'framer-motion';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  steps: string[];
}

export default function StepIndicator({ currentStep, totalSteps, steps }: StepIndicatorProps) {
  return (
    <div>
      {/* Desktop: Full Step Indicators */}
      <div className='hidden sm:flex items-center justify-between'>
        {steps.map((step, index) => {
          const stepNum = index + 1;
          const isActive = stepNum === currentStep;
          const isCompleted = stepNum < currentStep;

          return (
            <div key={index} className='flex items-center flex-1 last:flex-none'>
              {/* Step Circle */}
              <div className='flex flex-col items-center'>
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1,
                    backgroundColor: isCompleted ? '#10b981' : isActive ? '#10b981' : '#f1f5f9',
                  }}
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
                    border-2 transition-colors
                    ${isCompleted ? 'border-emerald-500 text-white' : isActive ? 'border-emerald-500 text-white' : 'border-slate-200 text-slate-400'}
                  `}
                >
                  {isCompleted ? (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={3}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  ) : (
                    stepNum
                  )}
                </motion.div>
                <span
                  className={`mt-2 text-xs font-medium text-center max-w-[80px] ${isActive ? 'text-emerald-600 font-bold' : isCompleted ? 'text-slate-600' : 'text-slate-400'}`}
                >
                  {step}
                </span>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className='flex-1 h-0.5 mx-2 bg-slate-100 rounded-full overflow-hidden'>
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: stepNum < currentStep ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className='h-full bg-emerald-500 rounded-full'
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: Compact Progress */}
      <div className='sm:hidden'>
        <div className='flex items-center gap-3 mb-3'>
          <h3 className='text-lg font-black text-slate-800 flex-1'>{steps[currentStep - 1]}</h3>
          <span className='text-2xl font-black text-emerald-500/30'>
            {String(currentStep).padStart(2, '0')}
          </span>
        </div>

        {/* Mobile Step Dots */}
        <div className='flex items-center gap-2'>
          {steps.map((_, index) => {
            const stepNum = index + 1;
            const isActive = stepNum === currentStep;
            const isCompleted = stepNum < currentStep;

            return (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  width: isActive ? 24 : 8,
                  backgroundColor: isCompleted || isActive ? '#10b981' : '#e2e8f0',
                }}
                className='h-2 rounded-full'
                transition={{ duration: 0.3 }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
