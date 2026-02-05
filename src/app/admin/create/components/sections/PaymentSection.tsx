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
      className='bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden'
    >
      <div className='bg-slate-50 border-b border-slate-100 p-6 lg:p-4 flex items-center gap-4'>
        <div className='w-12 h-12 lg:w-10 lg:h-10 bg-emerald-500 rounded-2xl lg:rounded-xl flex items-center justify-center text-2xl lg:text-xl text-white shadow-lg shadow-emerald-200'>
          💳
        </div>
        <div>
          <h2 className='text-lg lg:text-base font-black text-slate-900'>الحساب والدفع</h2>
          <p className='text-slate-500 text-[10px] font-bold uppercase tracking-widest'>التفاصيل المالية</p>
        </div>
      </div>

      <div className='p-6 lg:p-4 space-y-6 lg:space-y-4'>
        {/* Buttons Grid */}
        <div className='grid grid-cols-2 gap-3 lg:gap-2'>
          <button
            type='button'
            onClick={() => setShowFinesDropdown(!showFinesDropdown)}
            className={`flex flex-col items-center justify-center p-4 lg:p-3 border rounded-xl transition-all ${
              showFinesDropdown
                ? 'bg-rose-50 border-rose-200 text-rose-700'
                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className='text-xl lg:text-lg mb-1'>⚖️</span>
            <span className='text-[10px] lg:text-[9px] font-black uppercase tracking-widest'>غرامات</span>
            <span className='text-xs lg:text-[10px] font-bold mt-1 text-rose-500'>
              {selectedFines.filter(id => PREDEFINED_FINES.find(f => f.id === id)?.category === 'غرامات').length} محدد
            </span>
          </button>

          <button
            type='button'
            onClick={() => setShowServicesDropdown(!showServicesDropdown)}
            className={`flex flex-col items-center justify-center p-4 lg:p-3 border rounded-xl transition-all ${
              showServicesDropdown
                ? 'bg-sky-50 border-sky-200 text-sky-700'
                : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className='text-xl lg:text-lg mb-1'>➕</span>
            <span className='text-[10px] lg:text-[9px] font-black uppercase tracking-widest'>خدمات إضافية</span>
            <span className='text-xs lg:text-[10px] font-bold mt-1 text-sky-500'>
              {selectedFines.filter(id => PREDEFINED_FINES.find(f => f.id === id)?.category === 'خدمات اضافية').length} محدد
            </span>
          </button>
        </div>

        {/* Dropdowns logic remains the same, just simplified container */}
        {(showFinesDropdown || showServicesDropdown) && (
          <div className='p-4 bg-slate-50 border border-slate-200 rounded-2xl animate-in slide-in-from-top-2'>
            {showFinesDropdown && (
              <div className='space-y-3 fines-dropdown-container'>
                <input
                  type='text'
                  placeholder='ابحث في الغرامات...'
                  value={finesSearchTerm}
                  onChange={e => setFinesSearchTerm(e.target.value)}
                  className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-rose-400 outline-none'
                  autoFocus
                />
                <div className='max-h-40 overflow-y-auto space-y-1 custom-scrollbar'>
                  {PREDEFINED_FINES.filter(
                    f => f.category === 'غرامات' && f.name.includes(finesSearchTerm)
                  ).slice(0, 50).map(f => (
                    <div
                      key={f.id}
                      onMouseDown={(e) => {
                         e.preventDefault();
                         handleFineToggle(f.id);
                      }}
                      className={`p-2 rounded-lg cursor-pointer flex justify-between items-center transition-all ${
                        selectedFines.includes(f.id)
                          ? 'bg-rose-500 text-white'
                          : 'bg-white hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className='text-[11px] font-bold'>{f.name}</span>
                      <span className='text-[10px] font-black bg-black/10 px-1.5 py-0.5 rounded'>
                        {(f.amountCents / 100).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
             {showServicesDropdown && (
              <div className='space-y-3 services-dropdown-container'>
                <input
                  type='text'
                  placeholder='ابحث في الخدمات...'
                  value={servicesSearchTerm}
                  onChange={e => setServicesSearchTerm(e.target.value)}
                  className='w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-sky-400 outline-none'
                  autoFocus
                />
                <div className='max-h-40 overflow-y-auto space-y-1 custom-scrollbar'>
                  {PREDEFINED_FINES.filter(
                    s => s.category === 'خدمات اضافية' && s.name.includes(servicesSearchTerm)
                  ).slice(0, 50).map(s => (
                    <div key={s.id} className="bg-white rounded-lg overflow-hidden border border-slate-100">
                       <div
                         onMouseDown={(e) => {
                            e.preventDefault();
                            handleFineToggle(s.id);
                         }}
                         className={`p-2 cursor-pointer flex justify-between items-center transition-all ${
                           selectedFines.includes(s.id) ? 'bg-sky-50 text-sky-700' : 'hover:bg-slate-50 text-slate-700'
                         }`}
                       >
                          <span className='text-[11px] font-bold'>{s.name}</span>
                          {selectedFines.includes(s.id) && <span className='text-xs'>✓</span>}
                       </div>
                       {selectedFines.includes(s.id) && s.id !== 'service_001' && (
                          <div className="p-2 bg-slate-50 border-t border-slate-100">
                             <input
                               type='number'
                               value={manualServices[s.id] || 0}
                               onChange={e => handleManualServiceChange(s.id, parseFloat(e.target.value) || 0)}
                               className='w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold outline-none focus:border-sky-400'
                               placeholder='القيمة...'
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
                id: 'INSTAPAY',
                icon: '📲',
                label: 'انستا باي',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                border: 'border-purple-200',
              },
              {
                id: 'MOBILE_WALLET',
                icon: '📱',
                label: 'محفظة',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                border: 'border-blue-200',
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
