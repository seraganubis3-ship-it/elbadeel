'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { evaluateLogic } from '@/lib/logicEvaluator';

interface FieldOption {
  id: string;
  value: string;
  label: string;
}

interface DynamicField {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required: boolean;
  showIf?: string;
  options: FieldOption[];
}

interface DynamicFieldsProps {
  fields: DynamicField[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export default function DynamicFields({ fields, values, onChange }: DynamicFieldsProps) {
  // Check if a field should be visible based on conditional logic
  const isFieldVisible = (field: DynamicField): boolean => {
    return evaluateLogic(field.showIf, values);
  };

  const visibleFields = fields.filter(isFieldVisible);

  if (visibleFields.length === 0) return null;

  return (
    <div className='space-y-5'>
      {/* Section Header */}
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-10 h-10 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center'>
          <span className='text-purple-600 text-lg'>📝</span>
        </div>
        <div>
          <h3 className='font-bold text-slate-900 text-lg'>تفاصيل الخدمة</h3>
          <p className='text-slate-500 text-sm'>اختر التفاصيل المناسبة لطلبك</p>
        </div>
      </div>

      <AnimatePresence mode='sync'>
        {visibleFields.map(field => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className='mb-4'>
              <label className='block text-sm font-bold text-slate-700 mb-2'>
                {field.label}
                {field.required && <span className='text-red-500 mr-1'>*</span>}
              </label>

              {/* Select Field */}
              {field.type === 'select' && (
                <div className='relative'>
                  <select
                    value={values[field.name] || ''}
                    onChange={e => onChange(field.name, e.target.value)}
                    className='w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all appearance-none cursor-pointer text-slate-900'
                  >
                    <option value=''>اختر...</option>
                    {field.options.map(option => (
                      <option key={option.id} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className='absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none'>
                    <svg
                      className='w-5 h-5 text-slate-400'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M19 9l-7 7-7-7'
                      />
                    </svg>
                  </div>
                </div>
              )}

              {/* Radio Field */}
              {field.type === 'radio' && (
                <div className='grid grid-cols-2 sm:grid-cols-3 gap-3'>
                  {field.options.map(option => (
                    <label
                      key={option.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        values[field.name] === option.value
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <input
                        type='radio'
                        name={field.name}
                        value={option.value}
                        checked={values[field.name] === option.value}
                        onChange={e => onChange(field.name, e.target.value)}
                        className='sr-only'
                      />
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          values[field.name] === option.value
                            ? 'border-emerald-500'
                            : 'border-slate-300'
                        }`}
                      >
                        {values[field.name] === option.value && (
                          <div className='w-2.5 h-2.5 bg-emerald-500 rounded-full' />
                        )}
                      </div>
                      <span className='font-medium text-slate-700'>{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Text Field */}
              {field.type === 'text' && (
                <input
                  type='text'
                  value={values[field.name] || ''}
                  onChange={e => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  className='w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400'
                />
              )}

              {/* Textarea Field */}
              {field.type === 'textarea' && (
                <textarea
                  value={values[field.name] || ''}
                  onChange={e => onChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  rows={3}
                  className='w-full px-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500 focus:bg-white transition-all text-slate-900 placeholder-slate-400 resize-none'
                />
              )}

              {/* Checkbox Field */}
              {field.type === 'checkbox' && (
                <label className='flex items-center gap-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={values[field.name] === 'true'}
                    onChange={e => onChange(field.name, e.target.checked ? 'true' : 'false')}
                    className='w-5 h-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-emerald-500'
                  />
                  <span className='text-slate-700'>{field.placeholder || field.label}</span>
                </label>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
