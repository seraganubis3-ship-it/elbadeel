import { motion, AnimatePresence } from 'framer-motion';

interface PersonalDataFormProps {
  formData: any;
  onChange: (field: string, value: string) => void;
  serviceSlug: string;
  serviceName: string;
}

const InputGroup = ({
  label,
  id,
  type = 'text',
  value,
  placeholder,
  required = false,
  dir = 'rtl',
  onChange,
}: any) => (
  <div className='relative'>
    <label htmlFor={id} className='block text-sm font-bold text-slate-700 mb-2'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={e => onChange(id, e.target.value)}
      placeholder={placeholder}
      dir={dir}
      className='
        w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl
        text-slate-900 font-medium transition-all duration-200
        focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10
        placeholder:text-slate-400
      '
    />
  </div>
);

export default function PersonalDataForm({
  formData,
  onChange,
  serviceSlug,
  serviceName,
}: PersonalDataFormProps) {
  const slug = (serviceSlug || '').toLowerCase();
  const name = (serviceName || '').toLowerCase();

  const isBirth = slug.includes('birth') || name.includes('ميلاد');
  const isDeath = slug.includes('death') || name.includes('وفاة');
  const isMarriage = slug.includes('marriage') || name.includes('زواج');

  return (
    <div className='space-y-8'>
      {/* Basic Contact Info */}
      <section>
        <h3 className='text-lg font-black text-slate-900 mb-4 flex items-center gap-2'>
          <span className='w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600'>
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
          </span>
          بيانات التواصل
        </h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <InputGroup
            label='اسم مقدم الطلب'
            id='customerName'
            value={formData.customerName}
            onChange={onChange}
            placeholder='اسمك بالكامل'
            required
          />
          <InputGroup
            label='رقم الهاتف'
            id='customerPhone'
            type='tel'
            value={formData.customerPhone}
            onChange={onChange}
            placeholder='01xxxxxxxxx'
            required
            dir='ltr'
          />
        </div>
      </section>

      <div className='h-px bg-slate-100' />

      {/* Official Documents Info */}
      <section>
        <h3 className='text-lg font-black text-slate-900 mb-4 flex items-center gap-2'>
          <span className='w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600'>
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
          </span>
          بيانات الوثيقة المطلوب استخراجها
        </h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          {/* Universal Field: ID Number */}
          {!isMarriage && !isDeath && (
            <InputGroup
              label='رقم الهوية / الرقم القومي'
              id='idNumber'
              value={formData.idNumber}
              onChange={onChange}
              placeholder='14 رقم'
            />
          )}

          {/* Conditional Fields: Birth Certificate */}
          {isBirth && (
            <>
              <InputGroup
                label='اسم الأم كاملًا'
                id='motherName'
                value={formData.motherName}
                onChange={onChange}
                placeholder='اسم والدة صاحب الشهادة'
                required
              />
              <InputGroup
                label='تاريخ الميلاد'
                id='birthDate'
                type='date'
                value={formData.birthDate}
                onChange={onChange}
                required
              />
            </>
          )}

          {/* Conditional Fields: Death Certificate */}
          {isDeath && (
            <>
              <InputGroup
                label='اسم المتوفى'
                id='deceasedName'
                value={formData.deceasedName}
                onChange={onChange}
                placeholder='اسم المتوفى'
                required
              />

              <InputGroup
                label='تاريخ الوفاة'
                id='birthDate'
                type='date'
                value={formData.birthDate}
                onChange={onChange}
                required
              />
            </>
          )}

          {/* Conditional Fields: Marriage Certificate */}
          {isMarriage && (
            <>
              <InputGroup
                label='اسم الزوج'
                id='husbandName'
                value={formData.husbandName}
                onChange={onChange}
                placeholder='الاسم بالكامل'
                required
              />
              <InputGroup
                label='اسم والدة الزوج'
                id='motherName'
                value={formData.motherName}
                onChange={onChange}
                placeholder='اسم والدة الزوج كاملًا'
                required
              />
              <InputGroup
                label='اسم الزوجة'
                id='wifeName'
                value={formData.wifeName}
                onChange={onChange}
                placeholder='الاسم بالكامل'
                required
              />
              <InputGroup
                label='اسم والدة الزوجة'
                id='wifeMotherName'
                value={formData.wifeMotherName}
                onChange={onChange}
                placeholder='اسم والدة الزوجة كاملًا'
                required
              />
              <InputGroup
                label='تاريخ الزواج'
                id='marriageDate'
                type='date'
                value={formData.marriageDate}
                onChange={onChange}
                required
              />
            </>
          )}

          {/* General Fields for other services */}
          {!isBirth && !isDeath && !isMarriage && (
            <>
              <InputGroup
                label='تاريخ الميلاد'
                id='birthDate'
                type='date'
                value={formData.birthDate}
                onChange={onChange}
              />
              <InputGroup
                label='الجنسية'
                id='nationality'
                value={formData.nationality}
                onChange={onChange}
                placeholder='مصري'
              />
              <InputGroup
                label='اسم الأم (ثلاثي)'
                id='motherName'
                value={formData.motherName}
                onChange={onChange}
                placeholder='للتأكد من القيد العائلي'
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
