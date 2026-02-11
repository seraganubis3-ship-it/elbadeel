'use client';

import React, { useRef, useEffect } from 'react';
import { FormData, Service, ServiceVariant } from '../../types';

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
  serialValid: { ok: boolean; msg: string; } | null;
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
  serialValid,
  validateSerialLive,
}) => {
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  const isNationalId = selectedService?.name?.includes('قومي') || selectedService?.name?.includes('بطاقة');

  // Close service dropdown logic
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setShowServiceDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowServiceDropdown]);

  // Calculate delivery date based on work days (Fri/Sat off)
  const calculateWorkDays = (days: number) => {
    let date = new Date();
    let added = 0;
    while (added < days) {
      date.setDate(date.getDate() + 1);
      const day = date.getDay();
      if (day !== 5 && day !== 6) { // 5=Fri, 6=Sat
        added++;
      }
    }
    return date;
  };

  const deliveryDate = selectedVariant?.etaDays 
    ? calculateWorkDays(selectedVariant.etaDays)
    : null;

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
    <div className='bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 overflow-visible relative group transition-all duration-300'>
       {/* Visual Accent */}
       <div className='absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 opacity-0 transition-opacity duration-500 rounded-t-[2.5rem]'></div>

       <div className='p-6 lg:p-4 space-y-6 lg:space-y-4'>
         {/* Header */}
         <div className='flex items-center gap-4 mb-2'>
           <div className='w-14 h-14 lg:w-10 lg:h-10 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-[1.5rem] lg:rounded-xl flex items-center justify-center text-3xl lg:text-xl shadow-sm border border-cyan-100/50 relative overflow-hidden transition-transform duration-500'>
              <div className="absolute inset-0 bg-cyan-200/20 blur-xl"></div>
              <span className="relative z-10">🛠️</span>
           </div>
           <div>
             <h2 className='text-2xl lg:text-lg font-black text-slate-900 tracking-tight'>تفاصيل الخدمة</h2>
             <p className='text-sm lg:text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2'>
               <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
               نوع الخدمة والتوقيت
             </p>
           </div>
         </div>

         <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-4">
            {/* Service Search */}
            <div className='relative space-y-2' ref={serviceDropdownRef}>
               <label className='text-sm lg:text-xs font-black text-black uppercase tracking-widest mr-1'>اختيار الخدمة</label>
               <div className="relative z-50">
                  <input
                    type='text'
                    value={serviceSearchTerm}
                    onChange={e => {
                       setServiceSearchTerm(e.target.value);
                       if (!showServiceDropdown) setShowServiceDropdown(true);
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    placeholder='ابحث عن الخدمة...'
                    className='w-full bg-white border-2 border-slate-100 rounded-xl px-4 py-3 lg:py-2 text-black font-bold focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all outline-none text-lg lg:text-sm'
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">▼</div>
               </div>

               {/* Dropdown */}
               {showServiceDropdown && (
                  <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto z-[100] custom-scrollbar'>
                     {filteredServices.length > 0 ? (
                        filteredServices.slice(0, 50).map(service => (
                           <div
                             key={service.id}
                             onMouseDown={(e) => {
                                e.preventDefault();
                                selectService(service);
                                setShowServiceDropdown(false);
                             }}
                             className='p-3 hover:bg-cyan-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors flex items-center justify-between group'
                           >
                              <span className="text-sm font-bold text-slate-800 group-hover:text-cyan-700">{service.name}</span>
                              <span className="text-xs text-slate-400 group-hover:text-cyan-600 bg-slate-50 group-hover:bg-cyan-100 px-2 py-1 rounded-lg">اختيار</span>
                           </div>
                        ))
                     ) : (
                        <div className='p-4 text-center text-slate-400 text-sm font-bold'>
                           لا توجد خدمات مطابقة
                        </div>
                     )}
                  </div>
               )}
            </div>

            {/* Variants Grid */}
            {selectedService && selectedService.variants.length > 0 && (
               <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between">
                     <label className='text-xs font-black text-black uppercase tracking-widest mr-1'>نوع الطلب</label>
                     <span className="text-[10px] text-cyan-600 font-bold bg-cyan-50 px-2 py-1 rounded-lg border border-cyan-100">
                        {selectedService.variants.length} خيارات
                     </span>
                  </div>
                  <div className='grid grid-cols-2 gap-3'>
                     {selectedService.variants.map(variant => {
                        const isSelected = selectedVariant?.id === variant.id;
                        return (
                           <div
                             key={variant.id}
                             onClick={() => handleVariantChange(variant.id)}
                             className={`relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 group overflow-hidden ${
                                isSelected 
                                   ? 'bg-cyan-500 border-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
                                   : 'bg-white border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/30'
                             }`}
                           >
                              <div className="relative z-10 flex flex-col h-full justify-between gap-2">
                                 <div className="flex justify-between items-start">
                                    <span className={`text-base font-black ${isSelected ? 'text-white' : 'text-slate-700'}`}>
                                       {variant.name}
                                    </span>
                                    {isSelected && <span className="text-xs bg-white/20 px-2 py-1 rounded-full font-bold">✓</span>}
                                 </div>
                                 <div className="text-base font-black tracking-tight">
                                    {(variant.priceCents / 100).toLocaleString('en-US')} <span className={`text-xs ${isSelected ? 'opacity-80' : 'text-slate-400'}`}>ج.م</span>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>
            )}

            {/* Secondary Inputs within Service Area (Quantity, Etc) */}
            {selectedService && (
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200/50">
                {/* Quantity */}
                <div className='space-y-1'>
                   <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1'>العدد</label>
                   <div className="relative">
                      <input
                        type='number'
                        min='1'
                        value={formData.quantity}
                        onChange={e => setFormData(p => ({ ...p, quantity: parseInt(e.target.value) || 1 }))}
                        className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-black font-black focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all outline-none text-center text-sm'
                      />
                   </div>
                </div>

                 {/* Calculated Delivery Date */}
                 <div className='space-y-1'>
                    <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1'>الاستلام المتوقع</label>
                    <div className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-center h-[38px]'>
                       {selectedVariant ? (
                          <span className="text-xs font-black text-cyan-700">
                             {deliveryDate?.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' })}
                          </span>
                       ) : (
                          <span className="text-[10px] text-slate-300">--</span>
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
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className='space-y-1'>
                    <label htmlFor="policeStation" className='text-xs font-black text-black uppercase tracking-widest mr-1'>قسم الجوازات</label>
                    <div className="relative">
                      <select
                        id="policeStation"
                        value={formData.policeStation}
                        onChange={e => setFormData(p => ({ ...p, policeStation: e.target.value }))}
                        className='w-full bg-white border border-slate-200 rounded-lg px-3 py-3 text-black font-bold focus:border-cyan-500 transition-all outline-none text-right text-base appearance-none'
                      >
                        <option value="">اختر القسم...</option>
                        <option value="الجيزة">الجيزة</option>
                        <option value="بولاق الدكرور">بولاق الدكرور</option>
                        <option value="6 أكتوبر">6 أكتوبر</option>
                        <option value="الشيخ زايد">الشيخ زايد</option>
                        <option value="العباسية">العباسية</option>
                        <option value="العجوزة">العجوزة</option>
                      </select>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-sm">▼</div>
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <label htmlFor="pickupLocation" className='text-xs font-black text-black uppercase tracking-widest mr-1'>مكان الاستلام</label>
                    <div className="relative">
                      <input
                        id="pickupLocation"
                        type="text"
                        value={formData.pickupLocation}
                        onChange={e => setFormData(p => ({ ...p, pickupLocation: e.target.value }))}
                        className='w-full bg-white border border-slate-200 rounded-lg px-3 py-3 text-black font-bold focus:border-cyan-500 transition-all outline-none text-right text-base'
                        placeholder="اكتب مكان الاستلام..."
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
                <div className="pt-2 animate-in slide-in-from-top-2">
                   <div className='space-y-1'>
                     <label htmlFor="translationLanguage" className='text-[10px] font-black text-black uppercase tracking-widest mr-1'>لغة الترجمة</label>
                     <div className="relative">
                       <input
                         id="translationLanguage"
                         type="text"
                         value={formData.translationLanguage || ''}
                         onChange={e => setFormData(p => ({ ...p, translationLanguage: e.target.value }))}
                         className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-black font-bold focus:border-cyan-500 transition-all outline-none text-right text-xs'
                         placeholder="اكتب اللغة المطلوبة (مثال: إنجليزي، فرنسي)..."
                       />
                     </div>
                   </div>
                </div>
             )}

             {/* Service Details Textarea */}
             {selectedService && (
                <div className="space-y-1 pt-2 animate-in slide-in-from-top-2">
                   <label className='text-[10px] font-black text-slate-500 uppercase tracking-widest mr-1'>تفاصيل الخدمة</label>
                   <textarea
                     value={formData.serviceDetails}
                     onChange={e => setFormData(p => ({ ...p, serviceDetails: e.target.value }))}
                     className='w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-black font-bold focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all outline-none text-right text-sm min-h-[80px] resize-none'
                     placeholder='اكتب أي تفاصيل إضافية عن الخدمة...'
                   />
                </div>
             )}

            {/* Form Serial Number - Show Only for National ID */}
            {isNationalId && (
              <div className='space-y-1 animate-in slide-in-from-top-2 pt-2'>
                 <label className='text-[10px] font-black text-black uppercase tracking-widest mr-1 flex items-center gap-2'>
                    رقم الاستمارة
                    {serialValid?.ok && <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1.5 rounded-full">متاح</span>}
                    {serialValid?.ok === false && <span className="text-[9px] text-rose-600 bg-rose-50 px-1.5 rounded-full">غير صالح</span>}
                 </label>
                 <div className="relative">
                    <input
                      type='text'
                      value={formSerialNumber}
                      onChange={e => validateSerialLive(e.target.value)}
                      className={`w-full bg-white border rounded-lg px-3 py-2 text-black font-black outline-none transition-all text-sm ${
                         serialValid?.ok ? 'border-emerald-400 focus:ring-2 focus:ring-emerald-400/10' : 
                         serialValid?.ok === false ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/10' : 
                         'border-slate-200 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10'
                      }`}
                      placeholder='أدخل رقم الاستمارة المربوطة...'
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sm">
                       {serialValid?.ok ? '✅' : serialValid?.ok === false ? '❌' : '#️⃣'}
                    </div>
                 </div>
              </div>
            )}
         </div>
       </div>
    </div>
  );
};


