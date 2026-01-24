import React from 'react';
import { FormData, Service, ServiceVariant } from '../../types';

interface ServiceSelectionSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;

  serviceSearchTerm: string;
  setServiceSearchTerm: (term: string) => void;
  showServiceDropdown: boolean;
  setShowServiceDropdown: (show: boolean) => void;
  filteredServices: Service[];
  selectedService: Service | null;
  selectedVariant: ServiceVariant | null;
  handleVariantChange: (variantId: string) => void;
  formSerialNumber: string;
  serialValid: { ok: boolean; msg: string } | null;
  validateSerialLive: (serial: string) => void;
  selectService: (service: Service) => void;
  calculateTotal: () => number;
}

export const ServiceSelectionSection: React.FC<ServiceSelectionSectionProps> = ({
  formData,
  setFormData,
  serviceSearchTerm,
  setServiceSearchTerm,
  showServiceDropdown,
  setShowServiceDropdown,
  filteredServices,
  selectedService,
  selectedVariant,
  handleVariantChange,
  formSerialNumber,
  serialValid,
  validateSerialLive,
  selectService,
  calculateTotal,
}) => {
  return (
    <div
      id='service-selection'
      className='bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] group'
    >
      <div className='bg-gradient-to-r from-indigo-50/50 to-white/50 border-b border-indigo-100/50 p-8 flex items-center gap-5 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2'></div>
        <div className='w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(99,102,241,0.15)] border border-indigo-100/50 text-3xl relative z-10 group-hover:scale-110 transition-transform duration-500'>
          🔧
        </div>
        <div className='relative z-10'>
          <h2 className='text-2xl font-black text-slate-900 leading-none mb-1.5 tracking-tight'>
            تخصيص الخدمة
          </h2>
          <p className='text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2'>
            <span className='w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse'></span>
            تحديد الفئة والمواصفات
          </p>
        </div>
      </div>

      <div className='p-8 space-y-8'>
        {/* Service Search */}
        <div className='space-y-3 relative z-10'>
          <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2'>
            <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
            اختر نوع الخدمة الرئيسية
          </label>

          <div
            className='relative service-selection-dropdown-container group/search'
            onClick={e => e.stopPropagation()}
          >
            <div className='absolute inset-0 bg-indigo-500/5 rounded-2xl blur-xl transition-opacity duration-500 opacity-0 group-hover/search:opacity-100'></div>
            <input
              type='text'
              value={serviceSearchTerm}
              onChange={e => {
                setServiceSearchTerm(e.target.value);
                setShowServiceDropdown(true);
              }}
              onFocus={() => setShowServiceDropdown(true)}
              className='relative w-full px-5 py-5 bg-white border-2 border-indigo-50 rounded-2xl focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-lg text-slate-800 placeholder:text-slate-300 placeholder:font-normal shadow-sm group-hover/search:border-indigo-100'
              placeholder='مثال: بطاقة، جواز سفر، شهادة...'
            />
            {selectedService && (
              <div className='absolute left-5 top-1/2 -translate-y-1/2 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs animate-in zoom-in shadow-lg shadow-emerald-500/20'>
                ✓
              </div>
            )}

            {showServiceDropdown && (
              <div className='absolute top-full left-0 right-0 mt-4 bg-white/90 backdrop-blur-xl border border-indigo-50 rounded-[1.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2'>
                <div className='max-h-[250px] overflow-y-auto p-2'>
                  {filteredServices.length > 0 ? (
                    filteredServices.map(s => (
                      <div
                        key={s.id}
                        onClick={() => selectService(s)}
                        className='p-4 hover:bg-indigo-50/50 rounded-xl cursor-pointer border border-transparent hover:border-indigo-100 transition-all hover:scale-[0.99] font-bold text-slate-700 flex items-center gap-3'
                      >
                        <span className='w-2 h-2 rounded-full bg-indigo-400/20'></span>
                        {s.name}
                      </div>
                    ))
                  ) : (
                    <div className='p-8 text-center text-slate-400 text-sm flex flex-col items-center gap-2'>
                      <span className='text-2xl opacity-50'>🔍</span>
                      {serviceSearchTerm ? 'لا توجد خدمات مطابقة للبحث' : 'جاري تحميل الخدمات...'}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions */}
          {!serviceSearchTerm && filteredServices.length > 0 && (
            <div className='flex flex-wrap gap-2 pt-2'>
              {filteredServices.slice(0, 4).map(s => (
                <button
                  key={s.id}
                  type='button'
                  onClick={() => selectService(s)}
                  className='px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-bold text-slate-500 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all shadow-sm hover:shadow-md active:scale-95'
                >
                  {s.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Variant Selection */}
        <div className='space-y-4'>
          <div className='flex items-center gap-3 pb-2 border-b border-slate-100'>
            <span className='text-xs font-black text-slate-400 uppercase tracking-widest'>
              نوع الخدمة
            </span>
            <div className='h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent'></div>
          </div>

          <div className='grid grid-cols-1 gap-3'>
            {selectedService ? (
              selectedService.variants.map(v => (
                <div
                  key={v.id}
                  onClick={() => handleVariantChange(v.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between group relative overflow-hidden ${
                    selectedVariant?.id === v.id
                      ? 'border-indigo-500 bg-indigo-50/50 ring-4 ring-indigo-500/10 shadow-lg shadow-indigo-500/10'
                      : 'border-slate-100 hover:border-indigo-200 bg-white hover:shadow-md'
                  }`}
                >
                  {selectedVariant?.id === v.id && (
                    <div className='absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-indigo-500/10 to-transparent rounded-bl-full'></div>
                  )}

                  <div className='flex items-center gap-4 relative z-10'>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedVariant?.id === v.id
                          ? 'border-indigo-500 bg-indigo-500 scale-110'
                          : 'border-slate-300'
                      }`}
                    >
                      {selectedVariant?.id === v.id && (
                        <div className='w-2.5 h-2.5 bg-white rounded-full shadow-sm'></div>
                      )}
                    </div>
                    <span
                      className={`font-bold text-sm transition-colors ${selectedVariant?.id === v.id ? 'text-indigo-900' : 'text-slate-700'}`}
                    >
                      {v.name}
                    </span>
                  </div>
                  <span className='font-black text-indigo-600 text-lg'>
                    {(v.priceCents / 100).toFixed(0)}{' '}
                    <span className='text-[10px] font-bold opacity-60'>ج.م</span>
                  </span>
                </div>
              ))
            ) : (
              <div className='p-10 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200'>
                <div className='w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl opacity-50'>
                  👆
                </div>
                <p className='text-slate-400 font-bold text-sm'>
                  يرجى اختيار الخدمة أولاً لعرض الفئات المتاحة
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Details Grid */}
        <div className='space-y-6 pt-2'>
          <div className='flex items-center gap-3 pb-2 border-b border-slate-100'>
            <span className='text-xs font-black text-slate-400 uppercase tracking-widest'>
              معلومات إضافية
            </span>
            <div className='h-[1px] flex-1 bg-gradient-to-r from-slate-100 to-transparent'></div>
          </div>

          <div className='grid grid-cols-2 gap-5'>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                رقم الاستمارة
              </label>
              <input
                type='text'
                value={formSerialNumber}
                onChange={e => validateSerialLive(e.target.value)}
                disabled={!selectedService?.name?.includes('بطاقة')}
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold placeholder:font-normal text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed'
                placeholder='رقم الاستمارة'
              />
            </div>
            <div className='space-y-1.5'>
              <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
                العدد المطلوب
              </label>
              <input
                type='number'
                min='1'
                value={formData.quantity}
                onChange={e =>
                  setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))
                }
                className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-700'
              />
            </div>
          </div>

          {/* Passport Specific Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
            {/* Police Station */}
            <div className='space-y-1.5'>
              <label className='flex items-center text-[10px] font-bold text-slate-500 mr-2 opacity-80 uppercase tracking-widest'>
                <svg
                  className='w-3 h-3 text-sky-500 mr-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                  />
                </svg>
                قسم الشرطة
              </label>
              <select
                value={formData.policeStation}
                onChange={e => {
                  if (
                    selectedService?.slug === 'passports' ||
                    (selectedService?.name || '').includes('جواز')
                  ) {
                    setFormData(prev => ({ ...prev, policeStation: e.target.value }));
                  }
                }}
                disabled={
                  !(
                    selectedService?.slug === 'passports' ||
                    (selectedService?.name || '').includes('جواز')
                  )
                }
                className={`w-full px-5 py-4 border rounded-2xl focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-sm ${
                  !(
                    selectedService?.slug === 'passports' ||
                    (selectedService?.name || '').includes('جواز')
                  )
                    ? 'bg-gray-100 cursor-not-allowed text-gray-400 border-slate-100'
                    : 'bg-white border-slate-200 text-slate-700 focus:border-indigo-500 focus:bg-white'
                }`}
              >
                <option value=''>اختر قسم الشرطة</option>
                <option value='FIRST_POLICE_STATION'>قسم أول</option>
                <option value='SECOND_POLICE_STATION'>قسم ثاني</option>
                <option value='THIRD_POLICE_STATION'>قسم ثالث</option>
              </select>
            </div>

            {/* Pickup Location */}
            <div className='space-y-1.5'>
              <label className='flex items-center text-[10px] font-bold text-slate-500 mr-2 opacity-80 uppercase tracking-widest'>
                <svg
                  className='w-3 h-3 text-sky-500 mr-1'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z'
                  />
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 11a3 3 0 11-6 0 3 3 0 016 0z'
                  />
                </svg>
                مكان الاستلام
              </label>
              <input
                type='text'
                value={formData.pickupLocation}
                onChange={e => {
                  if (
                    selectedService?.slug === 'passports' ||
                    (selectedService?.name || '').includes('جواز')
                  ) {
                    setFormData(prev => ({ ...prev, pickupLocation: e.target.value }));
                  }
                }}
                disabled={
                  !(
                    selectedService?.slug === 'passports' ||
                    (selectedService?.name || '').includes('جواز')
                  )
                }
                placeholder={
                  selectedService?.slug === 'passports' ||
                  (selectedService?.name || '').includes('جواز')
                    ? 'أدخل مكان الاستلام...'
                    : 'متاح للجوازات فقط'
                }
                className={`w-full px-5 py-4 border rounded-2xl focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-sm ${
                  !(
                    selectedService?.slug === 'passports' ||
                    (selectedService?.name || '').includes('جواز')
                  )
                    ? 'bg-gray-100 cursor-not-allowed text-gray-400 border-slate-100'
                    : 'bg-white border-slate-200 text-slate-700 focus:border-indigo-500 focus:bg-white'
                }`}
              />
            </div>
          </div>

          <div className='space-y-1.5'>
            <label className='text-[10px] font-bold text-slate-500 mr-2 opacity-80'>
              ملاحظات إضافية للطلب
            </label>
            <textarea
              value={formData.serviceDetails}
              onChange={e => setFormData(prev => ({ ...prev, serviceDetails: e.target.value }))}
              rows={3}
              className='w-full px-5 py-4 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-700 resize-none'
              placeholder='اكتب أي ملاحظات أو تفاصيل إضافية هنا...'
            />
          </div>
        </div>
      </div>
    </div>
  );
};
