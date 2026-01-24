import { motion } from 'framer-motion';

interface Variant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
}

interface VariantSelectionProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onSelect: (variant: Variant) => void;
}

export default function VariantSelection({
  variants,
  selectedVariant,
  onSelect,
}: VariantSelectionProps) {
  // Determine which variant to highlight as "recommended" (usually middle or best value)
  const recommendedIndex = variants.length > 1 ? 1 : 0;

  return (
    <div className='space-y-6'>
      {/* Section Header */}
      <div className='text-center sm:text-right'>
        <h3 className='text-xl sm:text-2xl font-black text-slate-900 mb-2'>اختر نوع الخدمة</h3>
        <p className='text-slate-500 text-sm'>حدد السرعة المناسبة لك حسب احتياجاتك</p>
      </div>

      {/* Variants Grid */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
        {variants.map((variant, index) => {
          const isSelected = selectedVariant?.id === variant.id;
          const isRecommended = index === recommendedIndex && variants.length > 1;

          // Speed indicators
          const speedEmoji = variant.etaDays <= 1 ? '⚡' : variant.etaDays <= 3 ? '🚀' : '📦';
          const speedLabel = variant.etaDays <= 1 ? 'فوري' : variant.etaDays <= 3 ? 'سريع' : 'عادي';

          return (
            <motion.div
              key={variant.id}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(variant)}
              className={`
                relative p-5 sm:p-6 rounded-2xl cursor-pointer border-2 transition-all duration-300
                ${
                  isSelected
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl shadow-emerald-100/50'
                    : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg'
                }
              `}
            >
              {/* Recommended Badge */}
              {isRecommended && (
                <div className='absolute -top-3 right-4 px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg'>
                  ⭐ الأكثر طلباً
                </div>
              )}

              {/* Speed Badge */}
              <div
                className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-4
                ${isSelected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}
              `}
              >
                <span>{speedEmoji}</span>
                <span>{speedLabel}</span>
              </div>

              {/* Variant Name */}
              <h3
                className={`font-black text-lg sm:text-xl mb-2 ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}
              >
                {variant.name}
              </h3>

              {/* ETA */}
              <div className='flex items-center gap-2 text-sm text-slate-500 mb-4'>
                <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
                <span>
                  {variant.etaDays === 1 ? 'يوم عمل واحد' : `${variant.etaDays} أيام عمل`}
                </span>
              </div>

              {/* Price */}
              <div className='flex items-end justify-between pt-4 border-t border-slate-100'>
                <div>
                  <span
                    className={`text-3xl font-black ${isSelected ? 'text-emerald-600' : 'text-slate-800'}`}
                  >
                    {(variant.priceCents / 100).toFixed(0)}
                  </span>
                  <span className='text-sm font-medium text-slate-400 mr-1'>ج.م</span>
                </div>

                {/* Selection Indicator */}
                <div
                  className={`
                  w-8 h-8 rounded-full flex items-center justify-center transition-all
                  ${isSelected ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}
                `}
                >
                  {isSelected ? (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={3}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  ) : (
                    <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M12 4v16m8-8H4'
                      />
                    </svg>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
