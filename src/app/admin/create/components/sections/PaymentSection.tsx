import React from 'react';
import { FormData, ServiceVariant } from '../../types';
import { PREDEFINED_FINES } from '@/constants/fines';

interface PaymentSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  selectedVariant: ServiceVariant | null;
  calculateTotal: () => number;

  // Fines & Additional Services
  selectedFines: string[];
  showFinesDropdown: boolean;
  setShowFinesDropdown: (show: boolean) => void;
  showServicesDropdown: boolean;
  setShowServicesDropdown: (show: boolean) => void;
  finesSearchTerm: string;
  setFinesSearchTerm: (term: string) => void;
  servicesSearchTerm: string;
  setServicesSearchTerm: (term: string) => void;
  manualServices: Record<string, number>;
  handleFineToggle: (fineId: string) => void;
  handleManualServiceChange: (serviceId: string, amount: number) => void;
}

export const PaymentSection: React.FC<PaymentSectionProps> = ({
  formData,
  setFormData,
  selectedVariant,
  calculateTotal,
  selectedFines,
  showFinesDropdown,
  setShowFinesDropdown,
  showServicesDropdown,
  setShowServicesDropdown,
  finesSearchTerm,
  setFinesSearchTerm,
  servicesSearchTerm,
  setServicesSearchTerm,
  manualServices,
  handleFineToggle,
  handleManualServiceChange,
}) => {
  return (
    <div
      id='payment-section'
      className='bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)] border border-white/50 overflow-hidden transition-all duration-500 hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.12)] group'
    >
      <div className='bg-gradient-to-r from-emerald-50/50 to-white/50 border-b border-emerald-100/50 p-8 flex items-center gap-5 relative overflow-hidden'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2'></div>
        <div className='w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-[0_8px_16px_-4px_rgba(16,185,129,0.15)] border border-emerald-100/50 text-3xl relative z-10 group-hover:scale-110 transition-transform duration-500'>
          💳
        </div>
        <div className='relative z-10'>
          <h2 className='text-2xl font-black text-slate-900 leading-none mb-1.5 tracking-tight'>
            الحساب والدفع
          </h2>
          <p className='text-emerald-500 text-xs font-bold uppercase tracking-[0.2em] flex items-center gap-2'>
            <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse'></span>
            التسعير وتفاصيل السداد
          </p>
        </div>
      </div>

      <div className='p-8 space-y-8'>
        {/* Fines & Extra Services Buttons */}
        <div className='grid grid-cols-2 gap-4'>
          <button
            type='button'
            onClick={() => setShowFinesDropdown(!showFinesDropdown)}
            className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all group relative overflow-hidden ${
              showFinesDropdown
                ? 'bg-rose-50 border-rose-200 shadow-inner'
                : 'bg-white border-rose-50 hover:border-rose-200 hover:bg-rose-50/50 hover:shadow-lg hover:shadow-rose-100/50'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 transition-all ${
                showFinesDropdown
                  ? 'bg-rose-200 text-rose-700 rotate-12'
                  : 'bg-rose-100 text-rose-600 group-hover:scale-110'
              }`}
            >
              ⚖️
            </div>
            <span className='text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1'>
              إضافة غرامات
            </span>
            <div className='flex items-center gap-1'>
              <span className='text-lg font-black text-rose-700'>
                {
                  selectedFines.filter(
                    id => PREDEFINED_FINES.find(f => f.id === id)?.category === 'غرامات'
                  ).length
                }
              </span>
              <span className='text-[10px] font-bold text-rose-400'>محددة</span>
            </div>
          </button>

          <button
            type='button'
            onClick={() => setShowServicesDropdown(!showServicesDropdown)}
            className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all group relative overflow-hidden ${
              showServicesDropdown
                ? 'bg-sky-50 border-sky-200 shadow-inner'
                : 'bg-white border-sky-50 hover:border-sky-200 hover:bg-sky-50/50 hover:shadow-lg hover:shadow-sky-100/50'
            }`}
          >
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-3 transition-all ${
                showServicesDropdown
                  ? 'bg-sky-200 text-sky-700 rotate-12'
                  : 'bg-sky-100 text-sky-600 group-hover:scale-110'
              }`}
            >
              ➕
            </div>
            <span className='text-[10px] font-black text-sky-400 uppercase tracking-widest mb-1'>
              خدمات إضافية
            </span>
            <div className='flex items-center gap-1'>
              <span className='text-lg font-black text-sky-700'>
                {
                  selectedFines.filter(
                    id => PREDEFINED_FINES.find(f => f.id === id)?.category === 'خدمات اضافية'
                  ).length
                }
              </span>
              <span className='text-[10px] font-bold text-sky-400'>محددة</span>
            </div>
          </button>
        </div>

        {/* Floating Dropdowns Management */}
        {(showFinesDropdown || showServicesDropdown) && (
          <div
            className='p-5 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-3xl animate-in fade-in slide-in-from-top-4 duration-300 shadow-2xl relative z-20 fines-dropdown-container services-dropdown-container'
            onClick={e => e.stopPropagation()}
          >
            {showFinesDropdown && (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-slate-100'>
                  <span className='text-xs font-black text-rose-500 uppercase tracking-widest'>
                    قائمة الغرامات
                  </span>
                </div>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='ابحث في الغرامات...'
                    value={finesSearchTerm}
                    onChange={e => setFinesSearchTerm(e.target.value)}
                    className='w-full pl-3 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-rose-300 focus:bg-white transition-all outline-none'
                    autoFocus
                  />
                  <span className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
                    🔍
                  </span>
                </div>
                <div className='max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar'>
                  {PREDEFINED_FINES.filter(
                    f => f.category === 'غرامات' && f.name.includes(finesSearchTerm)
                  ).map(f => (
                    <div
                      key={f.id}
                      onClick={() => handleFineToggle(f.id)}
                      className={`p-3 rounded-xl cursor-pointer flex justify-between items-center transition-all group ${
                        selectedFines.includes(f.id)
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 transform scale-[1.02]'
                          : 'bg-white hover:bg-rose-50 hover:border-rose-100 border border-transparent'
                      }`}
                    >
                      <span className='text-xs font-bold'>{f.name}</span>
                      <span
                        className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                          selectedFines.includes(f.id) ? 'bg-white/20' : 'bg-slate-100'
                        }`}
                      >
                        {(f.amountCents / 100).toFixed(0)} ج.م
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {showServicesDropdown && (
              <div className='space-y-4'>
                <div className='flex items-center gap-2 pb-2 border-b border-slate-100'>
                  <span className='text-xs font-black text-sky-500 uppercase tracking-widest'>
                    الخدمات الإضافية
                  </span>
                </div>
                <div className='relative'>
                  <input
                    type='text'
                    placeholder='ابحث في الخدمات...'
                    value={servicesSearchTerm}
                    onChange={e => setServicesSearchTerm(e.target.value)}
                    className='w-full pl-3 pr-10 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-sm font-bold focus:border-sky-300 focus:bg-white transition-all outline-none'
                    autoFocus
                  />
                  <span className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
                    🔍
                  </span>
                </div>
                <div className='max-h-48 overflow-y-auto space-y-2 pr-1'>
                  {PREDEFINED_FINES.filter(
                    f => f.category === 'خدمات اضافية' && f.name.includes(servicesSearchTerm)
                  ).map(s => (
                    <div
                      key={s.id}
                      className={`p-3 border rounded-xl bg-white transition-all ${
                        selectedFines.includes(s.id)
                          ? 'border-sky-500 ring-2 ring-sky-500/10'
                          : 'border-slate-100'
                      }`}
                    >
                      <div
                        className='flex justify-between items-center cursor-pointer'
                        onClick={() => handleFineToggle(s.id)}
                      >
                        <span
                          className={`text-xs font-bold transition-colors ${selectedFines.includes(s.id) ? 'text-sky-700' : 'text-slate-600'}`}
                        >
                          {s.name}
                        </span>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            selectedFines.includes(s.id)
                              ? 'border-sky-500 bg-sky-500'
                              : 'border-slate-200'
                          }`}
                        >
                          {selectedFines.includes(s.id) && (
                            <span className='text-white text-[10px]'>✓</span>
                          )}
                        </div>
                      </div>
                      {selectedFines.includes(s.id) && s.id !== 'service_001' && (
                        <div className='mt-3 animate-in slide-in-from-top-2'>
                          <input
                            type='number'
                            value={manualServices[s.id] || 0}
                            onChange={e =>
                              handleManualServiceChange(s.id, parseFloat(e.target.value) || 0)
                            }
                            className='w-full px-3 py-2 bg-sky-50 border border-sky-100 rounded-lg text-xs font-bold focus:border-sky-500 focus:ring-2 focus:ring-sky-200 outline-none'
                            placeholder='حدد المبلغ...'
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment Methods */}
        <div className='space-y-4 pt-4 border-t border-slate-100'>
          <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2'>
            <span className='w-1.5 h-1.5 bg-emerald-500 rounded-full'></span>
            طريقة الدفع
          </label>
          <div className='grid grid-cols-2 gap-3'>
            {[
              {
                id: 'CASH',
                icon: '💵',
                label: 'كاش',
                color: 'text-emerald-600',
                bg: 'bg-emerald-50',
                border: 'border-emerald-200',
              },
              {
                id: 'BANK_TRANSFER',
                icon: '🏦',
                label: 'تحويل بنكي',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
              },
              {
                id: 'MOBILE_WALLET',
                icon: '📱',
                label: 'محفظة إلكترونية',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-200',
              },
              {
                id: 'CREDIT_CARD',
                icon: '💳',
                label: 'بطاقة ائتمان',
                color: 'text-indigo-600',
                bg: 'bg-indigo-50',
                border: 'border-indigo-200',
              },
            ].map(m => (
              <div
                key={m.id}
                onClick={() => setFormData(p => ({ ...p, paymentMethod: m.id }))}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 relative overflow-hidden group ${
                  formData.paymentMethod === m.id
                    ? `${m.border} ${m.bg} shadow-md scale-[1.02]`
                    : 'border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm'
                }`}
              >
                <div
                  className={`text-2xl transition-transform group-hover:scale-110 ${
                    formData.paymentMethod === m.id
                      ? 'opacity-100'
                      : 'opacity-70 grayscale group-hover:grayscale-0'
                  }`}
                >
                  {m.icon}
                </div>
                <span
                  className={`text-xs font-black transition-colors ${
                    formData.paymentMethod === m.id ? 'text-slate-800' : 'text-slate-500'
                  }`}
                >
                  {m.label}
                </span>

                {formData.paymentMethod === m.id && (
                  <div className='absolute top-2 left-2 w-2 h-2 rounded-full bg-current opacity-50 animate-pulse'></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Amounts Calculation */}
        <div className='grid grid-cols-2 gap-5 pt-2'>
          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              المدفوع كاش
            </label>
            <div className='relative group/paid'>
              <input
                type='number'
                value={formData.paidAmount}
                onChange={e => setFormData(p => ({ ...p, paidAmount: e.target.value }))}
                className='w-full px-5 py-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all font-black text-emerald-700 shadow-sm text-lg outline-none'
              />
              <span className='absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-400'>
                ج.م
              </span>
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest'>
              المبلغ المتبقي
            </label>
            <div className='relative'>
              <div className='w-full px-5 py-4 bg-slate-100/80 border border-slate-200 rounded-2xl font-black text-slate-500 text-center text-lg shadow-inner'>
                {formData.remainingAmount.toFixed(0)}
              </div>
              <span className='absolute left-5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400'>
                ج.م
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Options */}
        <div className='pt-6 border-t border-slate-100'>
          <div className='flex flex-col gap-4'>
            <label className='text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2'>
              <span className='w-1.5 h-1.5 bg-slate-400 rounded-full'></span>
              خيار الاستلام / التوصيل
            </label>

            <div className='flex p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200'>
              <label
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer transition-all ${
                  formData.deliveryType === 'OFFICE'
                    ? 'bg-white shadow-md text-emerald-700 font-bold'
                    : 'text-slate-500 hover:bg-white/50 font-medium'
                }`}
              >
                <input
                  type='radio'
                  checked={formData.deliveryType === 'OFFICE'}
                  onChange={() => setFormData(p => ({ ...p, deliveryType: 'OFFICE' }))}
                  className='hidden'
                />
                <span>🏢 استلام من المكتب</span>
              </label>
              <label
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer transition-all ${
                  formData.deliveryType === 'ADDRESS'
                    ? 'bg-white shadow-md text-emerald-700 font-bold'
                    : 'text-slate-500 hover:bg-white/50 font-medium'
                }`}
              >
                <input
                  type='radio'
                  checked={formData.deliveryType === 'ADDRESS'}
                  onChange={() => setFormData(p => ({ ...p, deliveryType: 'ADDRESS' }))}
                  className='hidden'
                />
                <span>🚚 توصيل للعنوان</span>
              </label>
            </div>

            {formData.deliveryType === 'ADDRESS' && (
              <div className='animate-in slide-in-from-top-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 flex items-center justify-between'>
                <span className='text-xs font-bold text-emerald-800'>رسوم التوصيل:</span>
                <input
                  type='number'
                  value={formData.deliveryFee}
                  onChange={e =>
                    setFormData(p => ({ ...p, deliveryFee: parseFloat(e.target.value) || 0 }))
                  }
                  className='w-24 px-3 py-2 bg-white border border-emerald-200 rounded-xl text-sm font-black text-emerald-700 text-center focus:border-emerald-500 outline-none'
                  placeholder='رسوم'
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
