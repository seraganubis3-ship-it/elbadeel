'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { FormData, Service, ServiceVariant } from '../../types';
import { LANGUAGES } from '@/constants/languages';

interface ServiceSelectionSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;

  // Service Selection Props
  serviceSearchTerm: string;
  setServiceSearchTerm: (term: string) => void;
  showServiceDropdown: boolean;
  setShowServiceDropdown: (show: boolean) => void;
  filteredServices: Service[];
  selectedService: Service | null;
  selectedVariant: ServiceVariant | null;
  handleVariantChange: (variantId: string) => void;
  selectService: (service: Service) => void;

  // Serial & Dates
  formSerialNumber: string;
  formSerialProvider: 'AL_BADEL' | 'AL_WAFI';
  setFormSerialProvider: (p: 'AL_BADEL' | 'AL_WAFI') => void;
  serialValid: { ok: boolean; msg: string } | null;
  validateSerialLive: (serial: string) => void;
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
  selectService,
  formSerialNumber,
  formSerialProvider,
  setFormSerialProvider,
  serialValid,
  validateSerialLive,
}) => {
  const serviceDropdownRef = useRef<HTMLDivElement>(null);
  const [languageSearch, setLanguageSearch] = React.useState('');
  const [showLanguageDropdown, setShowLanguageDropdown] = React.useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  const isNationalId =
    (selectedService?.name?.includes('قومي') || selectedService?.name?.includes('بطاقة')) &&
    !selectedService?.name?.includes('مترجم') &&
    !selectedService?.name?.includes('تصحيح');

  // Local state for photography date masking
  const [localPhotographyDate, setLocalPhotographyDate] = React.useState('');

  // Sync from formData on mount or external change
  useEffect(() => {
    if (formData.photographyDate) {
      const d = new Date(formData.photographyDate);
      if (!isNaN(d.getTime())) {
        // Check if it's the default "1970-01-01" or empty
        setLocalPhotographyDate(d.toLocaleDateString('en-GB')); // dd/mm/yyyy
      }
    } else {
      setLocalPhotographyDate('');
    }
  }, [formData.photographyDate]);

  const handlePhotographyDateChange = (val: string) => {
    // 1. Remove non-digits
    let cleaned = val.replace(/\D/g, '');

    // 2. Limit to 8 digits (ddmmyyyy)
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);

    // 3. Add slashes for display
    let formatted = cleaned;
    if (cleaned.length >= 5) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4)}`;
    } else if (cleaned.length >= 3) {
      formatted = `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
    }

    setLocalPhotographyDate(formatted);

    // 4. Parse if complete (8 digits)
    if (cleaned.length === 8) {
      const day = parseInt(cleaned.slice(0, 2), 10);
      const month = parseInt(cleaned.slice(2, 4), 10);
      const year = parseInt(cleaned.slice(4), 10);

      // Basic validation
      if (day > 0 && day <= 31 && month > 0 && month <= 12 && year > 1900) {
        const date = new Date(year, month - 1, day);
        date.setHours(12, 0, 0, 0); // Noon to avoid timezone shifts
        if (!isNaN(date.getTime())) {
          setFormData(p => ({ ...p, photographyDate: date.toISOString() }));
        }
      }
    } else if (cleaned === '') {
      setFormData(p => ({ ...p, photographyDate: '' }));
    }
  };

  // Close service dropdown logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        serviceDropdownRef.current &&
        !serviceDropdownRef.current.contains(event.target as Node)
      ) {
        setShowServiceDropdown(false);
      }
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setShowLanguageDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowServiceDropdown]);

  // Language helpers
  const currentLanguages = React.useMemo(() => {
    if (!formData.translationLanguage) return [];
    // Support both comma types just in case
    return formData.translationLanguage
      .split(/,|،/)
      .map(s => s.trim())
      .filter(Boolean);
  }, [formData.translationLanguage]);

  const addLanguage = (lang: string) => {
    if (!lang.trim()) return;
    const cleanLang = lang.trim();
    if (!currentLanguages.includes(cleanLang)) {
      const newLangs = [...currentLanguages, cleanLang];
      setFormData(prev => ({ ...prev, translationLanguage: newLangs.join('، ') }));
    }
    setLanguageSearch('');
    setShowLanguageDropdown(false);
  };

  const removeLanguage = (lang: string) => {
    const newLangs = currentLanguages.filter(l => l !== lang);
    setFormData(prev => ({ ...prev, translationLanguage: newLangs.join('، ') }));
  };

  const filteredLanguages = React.useMemo(() => {
    return LANGUAGES.filter(
      l => l.toLowerCase().includes(languageSearch.toLowerCase()) && !currentLanguages.includes(l)
    );
  }, [languageSearch, currentLanguages]);

  const isMultiSelectField = (field: { name: string; label: string; type: string }) => {
    const label = field.label || '';
    const name = field.name || '';
    return (
      field.type === 'multiselect' ||
      label.includes('نوع الطلب') ||
      name.toLowerCase().includes('order_type')
    );
  };

  const getMultiFieldValues = (fieldName: string) => {
    const value = formData.dynamicAnswers?.[fieldName] || '';
    return value
      .split(/,|،/)
      .map(item => item.trim())
      .filter(Boolean);
  };

  const toggleMultiFieldValue = (fieldName: string, optionValue: string) => {
    const selectedValues = getMultiFieldValues(fieldName);
    const nextValues = selectedValues.includes(optionValue)
      ? selectedValues.filter(value => value !== optionValue)
      : [...selectedValues, optionValue];

    setFormData(prev => ({
      ...prev,
      dynamicAnswers: {
        ...prev.dynamicAnswers,
        [fieldName]: nextValues.join('، '),
      },
    }));
  };

  // Calculate delivery date based on work days (Fri/Sat off)
  const calculateWorkDays = (days: number) => {
    const date = new Date();
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 5 && day !== 6) {
        // 5=Fri, 6=Sat
        added++;
      }
    }
    return date;
  };

  const deliveryDate = selectedVariant?.etaDays ? calculateWorkDays(selectedVariant.etaDays) : null;

  // Update formData when date changes
  useEffect(() => {
    if (deliveryDate) {
      const formatted = deliveryDate.toISOString().split('T')[0];
      if (formData.deliveryDate !== formatted) {
        setFormData(prev => ({ ...prev, deliveryDate: formatted ?? '' }));
      }
    }
  }, [deliveryDate, setFormData, formData.deliveryDate]);

  return (
    <div className='relative overflow-visible rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/70 transition-all duration-300 hover:shadow-md'>
      {/* Visual Accent - Top */}
      <div className='absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-cyan-500 to-sky-500 rounded-t-2xl'></div>

      <div className='p-4 space-y-5 sm:p-6'>
        {/* Header */}
        <div className='flex items-center gap-4 border-b border-slate-100 pb-5'>
          <div className='w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-emerald-100 text-emerald-600'>
            <span>⚡</span>
          </div>
          <div>
            <h2 className='text-2xl font-black text-black'>اختيار الخدمة</h2>
            <p className='text-sm text-slate-600 font-bold'>نوع الخدمة ومتغيراتها</p>
          </div>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-slate-50/80 p-4 space-y-6 sm:p-6'>
          {/* Service Search */}
          <div className='relative space-y-3' ref={serviceDropdownRef}>
            <label className='text-sm font-black text-slate-800 uppercase tracking-widest mr-1'>
              اختيار الخدمة
            </label>
            <div className='relative z-50'>
              <input
                type='text'
                value={serviceSearchTerm}
                onChange={e => {
                  setServiceSearchTerm(e.target.value);
                  if (!showServiceDropdown) setShowServiceDropdown(true);
                }}
                onFocus={() => setShowServiceDropdown(true)}
                placeholder='ابحث عن الخدمة...'
                className='w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 pr-12 text-black font-black focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all outline-none text-lg placeholder:text-slate-400 shadow-sm'
              />
              <div className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-500'>▼</div>
            </div>

            {/* Dropdown */}
            {showServiceDropdown && (
              <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 overflow-hidden max-h-72 overflow-y-auto z-[100] custom-scrollbar'>
                {filteredServices.length > 0 ? (
                  filteredServices.slice(0, 50).map(service => (
                    <div
                      key={service.id}
                      onMouseDown={e => {
                        e.preventDefault();
                        selectService(service);
                        setShowServiceDropdown(false);
                      }}
                      className='p-4 hover:bg-emerald-50 cursor-pointer border-b border-slate-100 last:border-0 transition-colors flex items-center justify-between gap-3 group'
                    >
                      <span className='text-base font-black text-slate-900 group-hover:text-emerald-800'>
                        {service.name}
                      </span>
                      <span className='text-sm text-slate-500 group-hover:text-emerald-700 bg-slate-100 group-hover:bg-emerald-100 px-3 py-1.5 rounded-lg font-bold'>
                        اختيار
                      </span>
                    </div>
                  ))
                ) : (
                  <div className='p-4 text-center text-slate-500 text-sm font-bold'>
                    لا توجد خدمات مطابقة
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Variants Grid */}
          {selectedService && selectedService.variants.length > 0 && (
            <div className='space-y-3 animate-in slide-in-from-top-4 duration-300'>
              <div className='flex items-center justify-between'>
                <label className='text-sm font-black text-slate-800 uppercase tracking-widest mr-1'>
                  نوع الطلب
                </label>
                <span className='text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200'>
                  {selectedService.variants.length} خيارات
                </span>
              </div>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3'>
                {selectedService.variants.map(variant => {
                  const isSelected = selectedVariant?.id === variant.id;
                  return (
                    <div
                      key={variant.id}
                      onClick={() => handleVariantChange(variant.id)}
                      className={`relative min-h-[112px] p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group overflow-hidden shadow-sm ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                          : 'bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 hover:-translate-y-0.5'
                      }`}
                    >
                      <div className='relative z-10 flex flex-col h-full justify-between gap-3'>
                        <div className='flex justify-between items-start'>
                          <span
                            className={`text-lg font-black ${isSelected ? 'text-white' : 'text-slate-900'}`}
                          >
                            {variant.name}
                          </span>
                          {isSelected && (
                            <span className='text-sm bg-white/20 px-2 py-1 rounded-full font-bold'>
                              ✓
                            </span>
                          )}
                        </div>
                        <div className='text-xl font-black tracking-tight'>
                          {(variant.priceCents / 100).toLocaleString('en-US')}{' '}
                          <span
                            className={`text-sm ${isSelected ? 'opacity-90' : 'text-slate-500'}`}
                          >
                            ج.م
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Photography Date - Placed next to Order Type (Variants) */}
          {selectedService && isNationalId && (
            <div className='space-y-2 animate-in slide-in-from-top-2 pt-2'>
              <label className='text-xs font-black text-slate-700 uppercase tracking-widest mr-1'>
                ميعاد التصوير (يوم/شهر/سنة)
              </label>
              <input
                type='text'
                value={localPhotographyDate}
                onChange={e => handlePhotographyDateChange(e.target.value)}
                placeholder='dd/mm/yyyy'
                maxLength={10}
                className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-right text-sm shadow-sm'
              />
            </div>
          )}

          {/* Secondary Inputs within Service Area (Quantity, Etc) */}
          {selectedService && (
            <div className='grid grid-cols-1 gap-4 pt-4 border-t border-slate-200 sm:grid-cols-2'>
              {/* Quantity */}
              <div className='space-y-2'>
                <label className='text-xs font-black text-slate-600 uppercase tracking-widest mr-1'>
                  العدد
                </label>
                <div className='relative'>
                  <input
                    type='number'
                    min='1'
                    value={formData.quantity}
                    onChange={e =>
                      setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))
                    }
                    className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black font-black focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-center text-lg shadow-sm'
                  />
                </div>
              </div>

              {/* Calculated Delivery Date */}
              <div className='space-y-2'>
                <label className='text-xs font-black text-slate-600 uppercase tracking-widest mr-1'>
                  الاستلام المتوقع
                </label>
                <div className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center justify-center h-[54px] shadow-sm'>
                  {selectedVariant ? (
                    <span className='text-lg font-black text-emerald-800'>
                      {deliveryDate?.toLocaleDateString('ar-EG', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  ) : (
                    <span className='text-sm text-slate-400 font-bold'>--</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Passport Specific Fields */}
          {/* Passport Specific Fields */}
          {(selectedService?.slug?.toLowerCase().includes('passport') ||
            selectedService?.name?.toLowerCase().includes('passport') ||
            selectedService?.name?.includes('جواز')) && (
            <div className='grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2'>
              <div className='space-y-1'>
                <label
                  htmlFor='policeStation'
                  className='text-xs font-black text-slate-700 uppercase tracking-widest mr-1'
                >
                  قسم الجوازات
                </label>
                <div className='relative'>
                  <select
                    id='policeStation'
                    value={formData.policeStation}
                    onChange={e => setFormData(p => ({ ...p, policeStation: e.target.value }))}
                    className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-right text-base appearance-none shadow-sm'
                  >
                    <option value=''>اختر القسم...</option>
                    <option value='الجيزة'>الجيزة</option>
                    <option value='بولاق الدكرور'>بولاق الدكرور</option>
                    <option value='6 أكتوبر'>6 أكتوبر</option>
                    <option value='الشيخ زايد'>الشيخ زايد</option>
                    <option value='العباسية'>العباسية</option>
                    <option value='العجوزة'>العجوزة</option>
                  </select>
                  <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm'>
                    ▼
                  </div>
                </div>
              </div>
              <div className='space-y-1'>
                <label
                  htmlFor='pickupLocation'
                  className='text-xs font-black text-slate-700 uppercase tracking-widest mr-1'
                >
                  مكان الاستلام
                </label>
                <div className='relative'>
                  <input
                    id='pickupLocation'
                    type='text'
                    value={formData.pickupLocation}
                    onChange={e => setFormData(p => ({ ...p, pickupLocation: e.target.value }))}
                    className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-right text-base shadow-sm'
                    placeholder='اكتب مكان الاستلام...'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Translation Specific Fields */}
          {(selectedService?.slug?.toLowerCase().includes('translat') ||
            selectedService?.name?.toLowerCase().includes('translat') ||
            selectedService?.name?.includes('ترجم') ||
            selectedService?.name?.includes('مترجم')) && (
            <div
              className='pt-2 animate-in slide-in-from-top-2 z-20 relative'
              ref={languageDropdownRef}
            >
              <div className='space-y-1'>
                <label className='text-xs font-black text-slate-700 uppercase tracking-widest mr-1'>
                  لغة الترجمة
                </label>

                <div
                  className='w-full bg-white border border-slate-200 rounded-xl px-3 py-2 flex flex-wrap gap-2 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/10 transition-all min-h-[48px] shadow-sm'
                  onClick={() => {
                    setShowLanguageDropdown(true);
                  }}
                >
                  {/* Selected Tags */}
                  {currentLanguages.map(lang => (
                    <span
                      key={lang}
                      className='bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-emerald-100'
                    >
                      {lang}
                      <button
                        type='button'
                        onClick={e => {
                          e.stopPropagation();
                          removeLanguage(lang);
                        }}
                        className='hover:text-red-500 w-4 h-4 flex items-center justify-center rounded-full hover:bg-cyan-100 transition-colors'
                      >
                        ×
                      </button>
                    </span>
                  ))}

                  {/* Input */}
                  <input
                    type='text'
                    value={languageSearch}
                    onChange={e => {
                      setLanguageSearch(e.target.value);
                      setShowLanguageDropdown(true);
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (languageSearch.trim()) {
                          addLanguage(languageSearch);
                        }
                      } else if (
                        e.key === 'Backspace' &&
                        !languageSearch &&
                        currentLanguages.length > 0
                      ) {
                        const lastLang = currentLanguages[currentLanguages.length - 1];
                        if (lastLang) removeLanguage(lastLang);
                      }
                    }}
                    onFocus={() => setShowLanguageDropdown(true)}
                    className='flex-1 bg-transparent border-none outline-none text-right text-xs h-6 min-w-[80px]'
                    placeholder={
                      currentLanguages.length === 0
                        ? 'اختر اللغة أو اكتب لغة جديدة...'
                        : 'أضف لغة أخرى...'
                    }
                  />
                </div>

                {/* Dropdown */}
                {showLanguageDropdown && (
                  <div className='absolute top-full left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto z-[100] custom-scrollbar'>
                    {filteredLanguages.map(lang => (
                      <div
                        key={lang}
                        onMouseDown={e => {
                          e.preventDefault();
                          addLanguage(lang);
                        }}
                  className='px-3 py-2 hover:bg-emerald-50 cursor-pointer text-xs font-bold text-slate-700 flex justify-between'
                      >
                        {lang}
                      </div>
                    ))}

                    {languageSearch && !filteredLanguages.some(l => l === languageSearch) && (
                      <div
                        onMouseDown={e => {
                          e.preventDefault();
                          addLanguage(languageSearch);
                        }}
                        className='px-3 py-2 hover:bg-emerald-50 cursor-pointer text-xs font-bold text-emerald-600 border-t border-slate-50'
                      >
                        إضافة &quot;
                        {languageSearch}
                        &quot;
                      </div>
                    )}

                    {filteredLanguages.length === 0 && !languageSearch && (
                      <div className='p-2 text-center text-slate-400 text-[10px]'>
                        لا توجد خيارات أخرى
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form Serial Number - Show Only for National ID - MOVED ABOVE بيانات إضافية */}
          {isNationalId && (
            <div className='space-y-3 animate-in slide-in-from-top-2 pt-4 border-t border-slate-200'>
              {/* Provider Toggle */}
              <div className='flex gap-2 p-1.5 bg-white border border-slate-200 rounded-2xl w-fit shadow-sm'>
                <button
                  type='button'
                  onClick={() => {
                    setFormSerialProvider('AL_BADEL');
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                    formSerialProvider === 'AL_BADEL'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  البديل
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setFormSerialProvider('AL_WAFI');
                  }}
                  className={`px-6 py-2.5 rounded-xl text-sm font-black transition-all ${
                    formSerialProvider === 'AL_WAFI'
                      ? 'bg-white text-emerald-600 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  الوافي
                </button>
              </div>

              {/* Form Serial */}
              <div className='space-y-2'>
                <label className='text-sm font-black text-slate-800 uppercase tracking-widest mr-1 flex items-center gap-2'>
                  رقم الاستمارة
                  {serialValid?.ok && (
                    <span className='text-xs text-emerald-600 bg-emerald-50 px-2 rounded-full border border-emerald-200'>
                      ✅ متاح
                    </span>
                  )}
                  {serialValid?.ok === false && (
                    <span className='text-xs text-rose-600 bg-rose-50 px-2 rounded-full border border-rose-200'>
                      ❌ غير صالح
                    </span>
                  )}
                </label>
                <div className='relative'>
                  <input
                    type='text'
                    value={formSerialNumber}
                    onChange={e => validateSerialLive(e.target.value)}
                    className={`w-full bg-white border-2 rounded-xl px-5 py-4 text-black font-black outline-none transition-all text-lg ${
                      serialValid?.ok
                        ? 'border-emerald-400 focus:ring-4 focus:ring-emerald-400/10'
                        : serialValid?.ok === false
                          ? 'border-rose-400 focus:ring-4 focus:ring-rose-400/10'
                          : 'border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                    }`}
                    placeholder='أدخل رقم الاستمارة المربوطة...'
                  />
                  <div className='absolute left-4 top-1/2 -translate-y-1/2 text-xl'>
                    {serialValid?.ok ? '✅' : serialValid?.ok === false ? '❌' : '#️⃣'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Service Fields (Questions) */}
          {selectedService?.fields && selectedService.fields.length > 0 && (
            <div className='space-y-4 pt-6 border-t border-slate-200 animate-in slide-in-from-top-2'>
              <label className='text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2'>
                <span className='w-2 h-2 rounded-full bg-emerald-600'></span>
                بيانات إضافية مطلوبة
              </label>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {selectedService.fields
                  .slice() // Create a copy to sort
                  .sort((a, b) => a.orderIndex - b.orderIndex)
                  .map(field => (
                    <div key={field.id} className='space-y-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
                      <label className='text-sm font-black text-slate-900 uppercase tracking-widest'>
                        {field.label} {field.required && <span className='text-red-600'>*</span>}
                      </label>
                      {field.options && field.options.length > 0 && isMultiSelectField(field) ? (
                        <div className='bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2'>
                          <div className='flex items-center justify-between text-xs font-black text-slate-500 px-1'>
                            <span>اختر أكثر من نوع</span>
                            <span className='bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg border border-emerald-100'>
                              {getMultiFieldValues(field.name).length} محدد
                            </span>
                          </div>
                          <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                            {field.options.map(opt => {
                              const selectedValues = getMultiFieldValues(field.name);
                              const isChecked = selectedValues.includes(opt.value);

                              return (
                                <label
                                  key={opt.id}
                                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                                    isChecked
                                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                      : 'bg-white border-slate-200 text-slate-800 hover:border-emerald-200'
                                  }`}
                                >
                                  <input
                                    type='checkbox'
                                    checked={isChecked}
                                    onChange={() => toggleMultiFieldValue(field.name, opt.value)}
                                    className='w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500'
                                  />
                                  <span className='font-bold text-sm'>{opt.label}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ) : field.type === 'select' || (field.options && field.options.length > 0) ? (
                        <div className='relative'>
                          <select
                            value={formData.dynamicAnswers?.[field.name] || ''}
                            onChange={e =>
                              setFormData(prev => ({
                                ...prev,
                                dynamicAnswers: {
                                  ...prev.dynamicAnswers,
                                  [field.name]: e.target.value,
                                },
                              }))
                            }
                            className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-right text-base appearance-none'
                          >
                            <option value=''>اختر...</option>
                            {field.options.map(opt => (
                              <option key={opt.id} value={opt.value}>
                                {opt.label}
                              </option>
                            ))}
                          </select>
                          <div className='absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 text-sm'>
                            ▼
                          </div>
                        </div>
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={formData.dynamicAnswers?.[field.name] || ''}
                          onChange={e =>
                            setFormData(prev => ({
                              ...prev,
                              dynamicAnswers: {
                                ...prev.dynamicAnswers,
                                [field.name]: e.target.value,
                              },
                            }))
                          }
                          placeholder={field.placeholder || ''}
                          className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-right text-base'
                        />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Service Details Textarea */}
          {selectedService && (
            <div className='space-y-2 pt-2 animate-in slide-in-from-top-2'>
              <label className='text-xs font-black text-slate-600 uppercase tracking-widest mr-1'>
                تفاصيل الخدمة
              </label>
              <textarea
                value={formData.serviceDetails}
                onChange={e => setFormData(p => ({ ...p, serviceDetails: e.target.value }))}
                className='w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-black font-bold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-right text-sm min-h-[96px] resize-none shadow-sm'
                placeholder='اكتب أي تفاصيل إضافية عن الخدمة...'
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
