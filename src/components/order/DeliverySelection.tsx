import { motion } from 'framer-motion';

interface DeliverySelectionProps {
  formData: any;
  onChange: (field: string, value: string) => void;
  deliveryFee: number;
}

export default function DeliverySelection({
  formData,
  onChange,
  deliveryFee,
}: DeliverySelectionProps) {
  const options = [
    {
      id: 'OFFICE',
      title: 'استلام من المكتب',
      desc: 'العنوان: فيصل - الهرم',
      price: 0,
      icon: '🏢',
      badge: 'مجاني',
    },
    {
      id: 'ADDRESS',
      title: 'توصيل للمنزل',
      desc: 'يصلك المندوب حتى باب البيت في خلال 24 ساعة من الانتهاء',
      price: deliveryFee,
      icon: '🚚',
      badge: `+${(deliveryFee / 100).toFixed(0)} ج.م`,
    },
  ];

  return (
    <div className='space-y-6'>
      {/* Section Header */}
      <div className='text-center sm:text-right'>
        <h3 className='text-xl sm:text-2xl font-black text-slate-900 mb-2'>طريقة الاستلام</h3>
        <p className='text-slate-500 text-sm'>اختر الطريقة الأنسب لاستلام مستنداتك</p>
      </div>

      {/* Options */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        {options.map(option => {
          const isSelected = formData.deliveryType === option.id;

          return (
            <motion.div
              key={option.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onChange('deliveryType', option.id)}
              className={`
                relative p-5 sm:p-6 rounded-2xl cursor-pointer border-2 transition-all duration-300
                ${
                  isSelected
                    ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 shadow-xl shadow-emerald-100/50'
                    : 'border-slate-100 bg-white hover:border-emerald-200 hover:shadow-lg'
                }
              `}
            >
              {/* Price Badge */}
              <div
                className={`
                absolute -top-3 right-4 px-3 py-1 rounded-full text-xs font-bold shadow-md
                ${
                  option.price === 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-white border border-slate-200 text-slate-700'
                }
              `}
              >
                {option.badge}
              </div>

              <div className='text-center pt-2'>
                {/* Icon */}
                <div
                  className={`
                  w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm transition-all
                  ${isSelected ? 'bg-white shadow-md' : 'bg-slate-50'}
                `}
                >
                  {option.icon}
                </div>

                {/* Title */}
                <h4
                  className={`font-black text-lg mb-2 ${isSelected ? 'text-emerald-900' : 'text-slate-800'}`}
                >
                  {option.title}
                </h4>

                {/* Description */}
                <p className='text-sm text-slate-500 leading-relaxed'>{option.desc}</p>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className='absolute top-4 left-4 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg'>
                  <svg
                    className='w-3.5 h-3.5 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={3}
                      d='M5 13l4 4L19 7'
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Address Input (Conditional) */}
      <motion.div
        initial={false}
        animate={{
          height: formData.deliveryType === 'ADDRESS' ? 'auto' : 0,
          opacity: formData.deliveryType === 'ADDRESS' ? 1 : 0,
          marginTop: formData.deliveryType === 'ADDRESS' ? 8 : 0,
        }}
        className='overflow-hidden'
      >
        <div className='bg-gradient-to-br from-slate-50 to-emerald-50/30 p-5 sm:p-6 rounded-2xl border border-slate-200'>
          <label className='flex items-center gap-2 text-sm font-bold text-slate-700 mb-3'>
            <span className='w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs'>
              📍
            </span>
            عنوان التوصيل بالتفصيل
          </label>
          <textarea
            className='w-full p-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-slate-800 resize-none placeholder-slate-400 text-sm'
            placeholder='اسم الشارع، رقم العمارة، رقم الشقة، علامة مميزة...'
            rows={3}
            value={formData.address}
            onChange={e => onChange('address', e.target.value)}
          />
          <p className='text-xs text-slate-400 mt-2 flex items-center gap-1'>
            <span>💡</span>
            كلما كان العنوان أوضح، كان التوصيل أسرع!
          </p>
        </div>
      </motion.div>
    </div>
  );
}
