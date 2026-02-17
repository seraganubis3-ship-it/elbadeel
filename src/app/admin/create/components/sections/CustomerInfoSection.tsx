import React, { useRef, useEffect } from 'react';
import { Customer, FormData, Service, ServiceVariant } from '../../types';
import { LastOrderAlert } from '../../../orders/components/LastOrderAlert';

interface CustomerInfoSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;

  // Service Selection Props (Needed for some conditional logic inside? No, mostly moved)
  // We keep selectedService for conditional rendering of specific fields if any left?
  // Checking code: isMarriageDivorce etc use selectedService. So we KEEP selectedService.
  selectedService: Service | null;

  // Customer Search
  customer: Customer | null;
  searching: boolean;
  suggestedUser: Customer | null;
  searchResults: Customer[];
  showSearchDropdown: boolean;
  setShowSearchDropdown: (show: boolean) => void;
  searchCustomer: (term: string) => void;
  selectCustomer: (customer: Customer) => void;
  handleUpdateCustomerName: () => void;
  handleNationalIdChange: (id: string) => void;

  // Dependent Search
  // Dependent Search
  searchingDependent: boolean;
  suggestedDependent: { id: string; name: string } | null;
  dependentSearchResults: { id: string; name: string }[];
  showDependentDropdown: boolean;
  setShowDependentDropdown: (show: boolean) => void;
  searchDependent: (term: string) => void;
  selectDependent: (dependent: { id: string; name: string }) => void;
  saveNewDependent: (name: string) => void;

  // Modal Triggers
  showAddressModal: boolean;
  setShowAddressModal: (show: boolean) => void;

  // Suggestion
  suggestion?: string;
  dependentSuggestion?: string;

  handleKeyDown?: (e: React.KeyboardEvent) => void;
}

export const CustomerInfoSection: React.FC<CustomerInfoSectionProps> = ({
  formData,
  setFormData,
  customer,
  searching,
  suggestedUser,
  searchResults,
  showSearchDropdown,
  setShowSearchDropdown,
  searchCustomer,
  selectCustomer,
  handleUpdateCustomerName,
  handleNationalIdChange,

  // Dependent Props
  searchingDependent,
  suggestedDependent,
  dependentSearchResults,
  showDependentDropdown,
  setShowDependentDropdown,
  searchDependent,
  selectDependent,
  saveNewDependent,

  showAddressModal,
  setShowAddressModal,
  suggestion,
  dependentSuggestion,

  handleKeyDown,
  selectedService,
}) => {
  const isDeathCert = selectedService?.name?.includes('وفاة');
  const isMarriageDivorce =
    selectedService?.name?.includes('زواج') || selectedService?.name?.includes('طلاق');

  const dropdownRef = useRef<HTMLDivElement>(null);

  const calculateAge = (val: string) => {
    if (!val || val.length < 10) return;
    // Handle DD/MM/YYYY
    let year, month, day;
    if (val.includes('/')) {
      [day, month, year] = val.split('/').map(Number);
    } else if (val.includes('-')) {
      [year, month, day] = val.split('-').map(Number);
    }
    if (year && month && day) {
      const today = new Date();
      let age = today.getFullYear() - year;
      const m = today.getMonth() + 1 - month;
      if (m < 0 || (m === 0 && today.getDate() < day)) {
        age--;
      }
      setFormData(prev => ({ ...prev, age: age.toString() }));
    }
  };

  const MandatoryLabel = ({ label, show }: { label: string; show?: boolean | undefined }) => (
    <label className='text-sm font-black text-black block mr-1 flex items-center justify-between'>
      <span>{label}</span>
      {show && <span className='text-[9px] text-rose-500 font-black'>إلزامي لهذة الخدمة</span>}
    </label>
  );

  return (
    <div className='bg-white/60 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-sm overflow-hidden relative group transition-all duration-300 hover:shadow-md'>
      {/* Visual Accent - Top */}
      <div className='absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500/80 via-teal-500/80 to-emerald-600/80 opacity-90'></div>

      <div className='p-6 space-y-6'>
        {/* Header */}
        <div className='flex items-center gap-4 mb-4'>
          <div className='w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-emerald-100 text-emerald-600'></div>
          <div>
            <h2 className='text-xl font-bold text-slate-800'>بيانات الطلب والعميل</h2>
            <p className='text-xs text-slate-500 font-medium'>المعلومات الأساسية</p>
          </div>
        </div>

        <div className='border-t border-slate-100 my-4'></div>

        {/* Search Bar + National ID Row */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-3 items-start'>
          {/* Search Input (Takes 7/12 space) */}
          <div className='lg:col-span-7 relative z-50' ref={dropdownRef}>
            <div
              className={`relative transition-all duration-300 ${searching ? 'scale-[1.02]' : ''}`}
            >
              <div className='absolute right-4 top-1/2 -translate-y-1/2 text-xl lg:text-lg transition-transform duration-300'>
                {searching ? <span className='animate-spin block'>⏳</span> : '🔍'}
              </div>
              <input
                type='text'
                value={formData.customerName}
                onChange={e => {
                  setFormData(prev => ({ ...prev, customerName: e.target.value }));
                  searchCustomer(e.target.value);
                  if (!showSearchDropdown) setShowSearchDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => setShowSearchDropdown(true)}
                placeholder='تسجيل عميل (الاسم، الهاتف)...'
                className={`w-full bg-slate-50 border-2 ${
                  searching
                    ? 'border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                    : 'border-slate-100'
                } rounded-2xl px-12 py-4 lg:py-3 text-lg lg:text-base font-black text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all`}
              />
            </div>

            {/* Dropdown - Compact Item Padding on lg */}
            {showSearchDropdown && (searchResults.length > 0 || suggestedUser) && (
              <div className='absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden z-[100] animate-in slide-in-from-top-2'>
                {/* Suggestion */}
                {suggestedUser && (
                  <div
                    onClick={() => selectCustomer(suggestedUser)}
                    className='p-4 lg:p-3 bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer border-b border-emerald-100 flex items-center justify-between group transition-colors'
                  >
                    <div className='flex items-center gap-4'>
                      <div className='w-10 h-10 lg:w-8 lg:h-8 rounded-full bg-emerald-100 flex items-center justify-center text-lg lg:text-sm'>
                        ✨
                      </div>
                      <div>
                        <div className='flex items-center gap-2'>
                          <span className='font-black text-emerald-900 lg:text-sm'>
                            {suggestedUser.name}
                          </span>
                          <span className='text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold'>
                            مقترح
                          </span>
                        </div>
                        <span className='text-sm lg:text-xs text-emerald-600 font-bold font-mono'>
                          {suggestedUser.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className='max-h-[300px] overflow-y-auto custom-scrollbar p-2'>
                  {searchResults.map(result => (
                    <div
                      key={result.id}
                      onClick={() => selectCustomer(result)}
                      className='p-3 lg:p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-all flex items-center gap-3 group'
                    >
                      <div className='w-10 h-10 lg:w-8 lg:h-8 rounded-full bg-slate-100 flex items-center justify-center text-lg lg:text-base group-hover:bg-white group-hover:shadow-md transition-all'>
                        👤
                      </div>
                      <div className='flex-1'>
                        <div className='font-bold text-slate-700 group-hover:text-emerald-700 transition-colors lg:text-sm'>
                          {result.name}
                        </div>
                        <div className='text-xs text-slate-400 font-mono flex items-center gap-2'>
                          <span>{result.phone}</span>
                          {result.idNumber && (
                            <span className='bg-slate-100 px-1 rounded'>{result.idNumber}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* National ID Input (Takes 5/12 space) */}
          <div className='lg:col-span-5 relative group/nid'>
            <div className='absolute -top-2.5 right-4 bg-white px-2 text-[10px] font-black text-slate-400 z-10'>
              الرقم القومي
            </div>
            <input
              type='text'
              value={formData.idNumber}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 14);
                setFormData(prev => ({ ...prev, idNumber: val }));
                if (val.length === 14) handleNationalIdChange(val);
              }}
              maxLength={14}
              className={`w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 rounded-2xl focus:bg-white transition-all font-bold text-slate-700 text-lg lg:text-base tracking-widest font-mono text-center ${
                formData.idNumber.length === 14
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-100 focus:border-emerald-500'
              }`}
              placeholder='14 رقم للبطاقة'
            />
            <div
              className={`absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold transition-colors ${formData.idNumber.length === 14 ? 'text-emerald-500' : 'text-slate-300'}`}
            >
              {formData.idNumber.length}/14
            </div>
          </div>
        </div>

        {/* Main Inputs Grid - Adjusted Gap/Text for lg */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-3 items-end'>
          <div className='md:col-span-3 space-y-1 group/input relative'>
            <MandatoryLabel label='رقم الهاتف' />
            <input
              type='tel'
              value={formData.customerPhone}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                setFormData(prev => ({ ...prev, customerPhone: val }));
              }}
              dir='ltr'
              maxLength={11}
              className={`w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 rounded-2xl focus:bg-white transition-all font-black text-slate-700 text-right text-lg lg:text-base group-hover/input:bg-slate-50 ${
                formData.customerPhone.length === 11
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : 'border-slate-100 focus:border-emerald-500'
              }`}
              placeholder='01xxxxxxxx'
            />
            <div
              className={`absolute left-4 top-[2.8rem] lg:top-[2.4rem] text-[10px] font-bold transition-colors ${formData.customerPhone.length === 11 ? 'text-emerald-500' : 'text-slate-300'}`}
            >
              {formData.customerPhone.length}/11
            </div>
          </div>

          <div className='md:col-span-3 space-y-1 group/input'>
            <label className='text-sm font-black text-black block mr-1 flex items-center justify-between'>
              <span>رقم هاتف إضافي</span>
              <span className='text-[10px] text-slate-400 font-normal'>(اختياري)</span>
            </label>
            <input
              type='tel'
              value={formData.additionalPhone}
              onChange={e => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                setFormData(prev => ({ ...prev, additionalPhone: val }));
              }}
              dir='ltr'
              maxLength={11}
              className='w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all font-black text-slate-700 text-right text-lg lg:text-base group-hover/input:bg-slate-50'
              placeholder='01xxxxxxxx'
            />
          </div>

          <div className='md:col-span-4 space-y-1'>
            <label className='text-sm font-black text-black block mr-1 flex items-center gap-2'>
              الأم
              {!selectedService?.name?.includes('ميلاد') && (
                <span className='text-[10px] text-slate-400 font-normal'>(اختياري)</span>
              )}
              {selectedService?.name?.includes('ميلاد') && (
                <span className='text-[9px] text-rose-500 font-black'>إلزامي</span>
              )}
            </label>
            <input
              type='text'
              value={formData.motherName}
              onChange={e => setFormData(prev => ({ ...prev, motherName: e.target.value }))}
              className='w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700 lg:text-base'
              placeholder='اسم الأم بالكامل'
            />
          </div>

          <div className='md:col-span-2 space-y-1'>
            <label className='text-sm font-black text-black block mr-1'>النوع</label>
            <div className='relative'>
              <select
                value={formData.gender || ''}
                onChange={e => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className='w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700 lg:text-base appearance-none'
              >
                <option value='' disabled>
                  اختر النوع...
                </option>
                <option value='MALE'>ذكر </option>
                <option value='FEMALE'>أنثى </option>
              </select>
              <div className='absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400'>
                ▼
              </div>
            </div>
          </div>
        </div>

        {/* Date and Age Grid */}
        <div className='grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-3 items-end'>
          <div className='md:col-span-8 space-y-1'>
            <MandatoryLabel label='تاريخ الميلاد' />
            <input
              type='text'
              value={formData.birthDate}
              onChange={e => {
                let v = e.target.value.replace(/\D/g, '');
                if (v.length > 8) v = v.slice(0, 8);
                if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
                else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                setFormData(prev => ({ ...prev, birthDate: v }));
                calculateAge(v);
              }}
              className='w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white transition-all font-bold text-slate-700 text-right lg:text-base text-center tracking-widest'
              placeholder='DD / MM / YYYY'
            />
          </div>

          <div className='md:col-span-4 space-y-1 opacity-80'>
            <div className='relative'>
              <div className='absolute -top-2.5 right-4 bg-white px-2 text-[10px] font-black text-slate-400 z-10'>
                العمر
              </div>
              <input
                type='text'
                value={formData.age ? `${formData.age}` : ''}
                readOnly
                className='w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-100 border-2 border-slate-200 rounded-2xl text-slate-500 font-black cursor-not-allowed lg:text-base text-center'
                placeholder='--'
              />
              <span className='absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400'>
                سنة
              </span>
            </div>
          </div>
        </div>

        {/* Secondary Info */}
        <div className='space-y-8 pt-4'>
          <div className='flex items-center gap-3'>
            <span className='text-[10px] font-black text-slate-400 tracking-widest uppercase'>
              بيانات التوثيق
            </span>
            <div className='h-px flex-1 bg-slate-100' />
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6'>
            <div className='md:col-span-1 space-y-1'>
              <label className='text-sm font-black text-black block mr-1 flex items-center gap-2'>
                تابع
                <span className='text-[10px] text-slate-400 font-normal'>(اختياري)</span>
              </label>
              <div className='relative group'>
                {/* Background Layer */}
                <div className='absolute inset-0 bg-slate-50/50 rounded-2xl' />

                {/* Ghost Text */}
                {dependentSuggestion &&
                  formData.customerFollowUp &&
                  dependentSuggestion
                    .toLowerCase()
                    .startsWith(formData.customerFollowUp.toLowerCase()) && (
                    <div className='absolute inset-0 px-5 py-4 font-bold text-slate-400 pointer-events-none z-0 user-select-none opacity-50 flex'>
                      <span className='opacity-0'>{formData.customerFollowUp}</span>
                      <span>{dependentSuggestion.slice(formData.customerFollowUp.length)}</span>
                    </div>
                  )}

                <input
                  type='text'
                  value={formData.customerFollowUp}
                  onChange={e => {
                    setFormData(prev => ({ ...prev, customerFollowUp: e.target.value }));
                    searchDependent(e.target.value);
                  }}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === 'ArrowRight') && dependentSuggestion) {
                      e.preventDefault();
                      setFormData(prev => ({ ...prev, customerFollowUp: dependentSuggestion }));
                      setShowDependentDropdown(false);
                    }
                  }}
                  className='relative z-10 w-full px-5 py-4 lg:px-4 lg:py-3 bg-transparent border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white/50 transition-all font-bold text-slate-700 placeholder-transparent lg:text-base'
                  placeholder='ابحث بالاسم...'
                />
                <div
                  className={`absolute top-0 right-0 h-full flex items-center pr-5 pointer-events-none transition-opacity duration-200 ${formData.customerFollowUp ? 'opacity-0' : 'opacity-100'}`}
                >
                  <span className='text-slate-400 font-bold'>ابحث بالاسم...</span>
                </div>
                {showDependentDropdown && dependentSearchResults.length > 0 && (
                  <div className='absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-100 rounded-2xl shadow-xl z-50 p-1'>
                    {dependentSearchResults.map(d => (
                      <div
                        key={d.id}
                        onClick={() => selectDependent(d)}
                        className='p-3 hover:bg-slate-50 rounded-xl cursor-pointer text-sm font-bold text-slate-700'
                      >
                        {d.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-black text-black block mr-1'>الوظيفة أو المهنة</label>
              <input
                type='text'
                value={formData.profession}
                onChange={e => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                className='w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 lg:text-base'
                placeholder='اكتب المهنة هنا'
              />
            </div>

            <div className='md:col-span-1 space-y-1'>
              <label className='text-sm font-black text-black block mr-1'>الجهة</label>
              <input
                type='text'
                value={formData.destination || ''}
                onChange={e => setFormData(prev => ({ ...prev, destination: e.target.value }))}
                className='w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 lg:text-base'
                placeholder='اكتب الجهة...'
              />
            </div>

            <div className='md:col-span-1 space-y-1'>
              <label className='text-sm font-black text-black block mr-1'>الصفة</label>
              <input
                type='text'
                value={formData.title || ''}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className='w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 lg:text-base'
                placeholder='اكتب الصفة...'
              />
            </div>

            <div className='md:col-span-2 space-y-1'>
              <label className='text-sm font-black text-black block mr-1'>العنوان</label>
              <div
                onClick={() => setShowAddressModal(true)}
                className='w-full px-5 py-4 lg:px-4 lg:py-3 bg-slate-50/50 border-2 border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100 hover:border-emerald-200 transition-all font-bold text-slate-700 lg:text-base flex items-center justify-between group'
              >
                <span className={formData.address ? 'text-slate-700' : 'text-slate-400'}>
                  {formData.address || 'اضغط لإضافة العنوان...'}
                </span>
                <span className='text-xl group-hover:scale-110 transition-transform'>📍</span>
              </div>
            </div>

            {/* Restored Fields */}
            <div className='space-y-1'>
              <MandatoryLabel label='اسم الزوج/الزوجة' show={isMarriageDivorce} />
              <input
                type='text'
                value={formData.wifeName}
                onChange={e => setFormData(prev => ({ ...prev, wifeName: e.target.value }))}
                className='w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 lg:text-base'
                placeholder='الاسم الرباعي'
              />
            </div>

            <div className='space-y-1'>
              <MandatoryLabel label='تاريخ الوفاة' show={isDeathCert} />
              <input
                type='text'
                value={formData.deathDate}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length > 8) v = v.slice(0, 8);
                  if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
                  else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                  setFormData(prev => ({ ...prev, deathDate: v }));
                }}
                className='w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 lg:text-base text-center tracking-widest'
                placeholder='DD / MM / YYYY'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-black text-black block mr-1'>تاريخ الزواج</label>
              <input
                type='text'
                value={formData.marriageDate}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length > 8) v = v.slice(0, 8);
                  if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
                  else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                  setFormData(prev => ({ ...prev, marriageDate: v }));
                }}
                className='w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 lg:text-base text-center tracking-widest'
                placeholder='DD / MM / YYYY'
              />
            </div>

            <div className='space-y-1'>
              <label className='text-sm font-black text-black block mr-1'>تاريخ الطلاق</label>
              <input
                type='text'
                value={formData.divorceDate}
                onChange={e => {
                  let v = e.target.value.replace(/\D/g, '');
                  if (v.length > 8) v = v.slice(0, 8);
                  if (v.length > 4) v = v.slice(0, 2) + '/' + v.slice(2, 4) + '/' + v.slice(4);
                  else if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2);
                  setFormData(prev => ({ ...prev, divorceDate: v }));
                }}
                className='w-full px-5 py-4 bg-slate-50/50 border-2 border-slate-100 rounded-2xl focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700 lg:text-base text-center tracking-widest'
                placeholder='DD / MM / YYYY'
              />
            </div>
          </div>
        </div>
      </div>
      <LastOrderAlert
        searchTerm={formData.customerPhone || formData.customerName}
        customerId={customer?.id}
      />
    </div>
  );
};
