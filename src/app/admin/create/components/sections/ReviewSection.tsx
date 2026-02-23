import React from 'react';
import { calculateFineExpenses, Fine } from '@/constants/fines';
import { Customer, FormData, Service, ServiceVariant } from '../../types';
import { ActionsSection } from './ActionsSection';

interface ReviewSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  customer: Customer | null;
  selectedService: Service | null;
  selectedVariant: ServiceVariant | null;
  finesList: Fine[];
  selectedFines: string[];
  manualServices: Record<string, number>;
  calculateTotal: () => number;
  submitting: boolean;
  handleReset: () => void;
  setActiveTab: (tab: string) => void;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({
  formData,
  setFormData,
  customer,
  selectedService,
  selectedVariant,
  finesList,
  selectedFines,
  manualServices,
  calculateTotal,
  submitting,
  handleReset,
  setActiveTab,
}) => {
  // Helper to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
      useGrouping: false,
    }).format(amount);
  };

  return (
    <div className='bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden relative group'>
      {/* Visual Accent */}
      <div className='absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-600'></div>

      <div className='p-8 space-y-8'>
        {/* Header */}
        <div className='flex items-center justify-between border-b border-slate-100 pb-6'>
          <div>
            <h2 className='text-3xl font-black text-slate-800 tracking-tight'>
              مراجعة وتأكيد الطلب
            </h2>
            <p className='text-slate-500 font-bold mt-2 text-lg'>الخطوة الأخيرة قبل الحفظ</p>
          </div>
          <div className='flex items-center gap-3 bg-emerald-50 px-5 py-2.5 rounded-2xl border border-emerald-100 shadow-sm'>
            <div className='relative'>
              <div className='w-3 h-3 bg-emerald-500 rounded-full animate-ping absolute top-0 left-0 opacity-75'></div>
              <div className='w-3 h-3 bg-emerald-500 rounded-full relative'></div>
            </div>
            <span className='text-sm font-black text-emerald-700 uppercase tracking-widest'>
              جاهز للتسجيل
            </span>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* Right Column: Customer & Service Details */}
          <div className='space-y-6'>
            {/* 1. Customer Card */}
            <div className='bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group/card'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover/card:bg-blue-500/10 transition-all'></div>

              <div className='flex justify-between items-start mb-6 relative z-10'>
                <h3 className='text-xl font-black text-slate-800 flex items-center gap-3'>
                  <span className='p-2 bg-blue-100/50 rounded-xl text-blue-600'>👤</span>
                  بيانات العميل
                </h3>
                <button
                  onClick={() => setActiveTab('customer')}
                  className='text-xs bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors'
                >
                  تعديل
                </button>
              </div>

              {customer || formData.customerName ? (
                <div className='space-y-4 relative z-10'>
                  <div className='flex items-center gap-4'>
                    <div className='w-14 h-14 rounded-2xl bg-white shadow-sm border border-slate-100 text-blue-600 flex items-center justify-center font-black text-2xl'>
                      {(formData.customerName || customer?.name || '؟').charAt(0)}
                    </div>
                    <div>
                      <div className='font-black text-slate-900 text-lg'>
                        {formData.customerName || customer?.name}
                      </div>
                      <div className='text-slate-500 font-bold flex items-center gap-2'>
                        <span className='text-slate-400'>📞</span>
                        {formData.customerPhone || customer?.phone}
                      </div>
                    </div>
                  </div>
                  <div className='grid grid-cols-2 gap-3 pt-2'>
                    <div className='bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm'>
                      <span className='block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider'>
                        الرقم القومي
                      </span>
                      <span className='font-bold text-slate-700 text-sm'>
                        {formData.customerIdNumber || customer?.idNumber || '---'}
                      </span>
                    </div>
                    <div className='bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm'>
                      <span className='block text-[10px] text-slate-400 font-bold mb-1 uppercase tracking-wider'>
                        المحافظة
                      </span>
                      <span className='font-bold text-slate-700 text-sm'>
                        {formData.governorate || customer?.governorate || '---'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <div className='text-slate-400 text-4xl mb-2'>👤</div>
                  <div className='text-slate-500 font-bold'>لم يتم تحديد عميل</div>
                </div>
              )}
            </div>

            {/* 2. Service Card */}
            <div className='bg-gradient-to-br from-white to-slate-50 rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group/card'>
              <div className='absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-8 -mt-8 pointer-events-none group-hover/card:bg-purple-500/10 transition-all'></div>

              <div className='flex justify-between items-start mb-6 relative z-10'>
                <h3 className='text-xl font-black text-slate-800 flex items-center gap-3'>
                  <span className='p-2 bg-purple-100/50 rounded-xl text-purple-600'>⚡</span>
                  تفاصيل الخدمة
                </h3>
                <button
                  onClick={() => setActiveTab('service')}
                  className='text-xs bg-purple-50 text-purple-600 px-3 py-1.5 rounded-lg font-bold hover:bg-purple-100 transition-colors'
                >
                  تعديل
                </button>
              </div>

              {selectedService ? (
                <div className='space-y-5 relative z-10'>
                  <div className='bg-white p-5 rounded-2xl border border-slate-100 shadow-sm'>
                    <div className='font-black text-slate-900 text-xl mb-3'>
                      {selectedService.name}
                    </div>
                    <div className='flex flex-wrap gap-2'>
                      <span className='bg-purple-50 text-purple-700 px-3 py-1.5 rounded-xl text-sm font-bold border border-purple-100 flex items-center gap-2'>
                        <span className='w-2 h-2 rounded-full bg-purple-500'></span>
                        {selectedVariant?.name || '---'}
                      </span>
                      <span className='bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl text-sm font-bold border border-slate-200'>
                        العدد: {formData.quantity}
                      </span>
                    </div>
                  </div>

                  {/* Dynamic Answers Summary if exists */}
                  {formData.dynamicAnswers && Object.keys(formData.dynamicAnswers).length > 0 && (
                    <div className='space-y-3'>
                      <div className='text-[10px] font-black text-slate-400 uppercase tracking-widest px-1'>
                        بيانات إضافية
                      </div>
                      <div className='grid grid-cols-2 gap-3'>
                        {Object.entries(formData.dynamicAnswers).map(([key, value]) => (
                          <div
                            key={key}
                            className='bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm'
                          >
                            <span className='font-bold text-slate-700 text-sm break-words'>
                              {value as string}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Dates */}
                  <div className='flex items-center gap-6 pt-2 px-2'>
                    <div className='flex-1'>
                      <div className='text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider'>
                        تاريخ الطلب
                      </div>
                      <div className='font-bold text-slate-800'>
                        {new Date().toLocaleDateString('ar-EG')}
                      </div>
                    </div>
                    <div className='w-px h-10 bg-slate-200'></div>
                    <div className='flex-1'>
                      <div className='text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider'>
                        الاستلام المتوقع
                      </div>
                      <div className='font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg inline-block text-center min-w-[80px]'>
                        {formData.deliveryDate || '---'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className='text-center py-8 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-200'>
                  <div className='text-slate-400 text-4xl mb-2'>⚡</div>
                  <div className='text-slate-500 font-bold'>لم يتم اختيار خدمة</div>
                </div>
              )}
            </div>
          </div>

          {/* Left Column: Financials & Actions */}
          <div className='space-y-6'>
            {/* 3. Financial Receipt */}
            <div className='bg-blue-50 text-slate-800 rounded-3xl p-6 shadow-md relative overflow-hidden ring-1 ring-blue-100 border border-blue-200'>
              <div className='absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none'></div>

              <div className='flex justify-between items-start mb-6 relative z-10'>
                <h3 className='text-2xl font-black flex items-center gap-3 text-slate-900'>
                  <span className='p-2 bg-blue-100 rounded-xl text-blue-600'>💰</span> ملخص الحساب
                </h3>
                <button
                  onClick={() => setActiveTab('financials')}
                  className='text-sm bg-white border border-blue-200 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded-lg font-bold transition-colors shadow-sm'
                >
                  تعديل الأسعار
                </button>
              </div>

              <div className='space-y-4 relative z-10 text-lg'>
                <div className='flex justify-between items-center py-3 border-b border-slate-200 group hover:bg-white/50 px-2 rounded-lg transition-colors -mx-2'>
                  <span className='text-slate-600 font-bold'>
                    سعر الخدمة ({selectedVariant?.name})
                  </span>
                  <span className='font-black text-slate-800'>
                    {formatCurrency(((selectedVariant?.priceCents || 0) / 100) * formData.quantity)}
                  </span>
                </div>

                {/* Fines */}
                {selectedFines.length > 0 && (
                  <div className='flex justify-between items-center py-3 border-b border-slate-200 group hover:bg-white/50 px-2 rounded-lg transition-colors -mx-2'>
                    <span className='text-slate-600 font-bold'>إضافات وغرامات</span>
                    <span className='font-black text-rose-600'>
                      +{' '}
                      {formatCurrency(
                        selectedFines.reduce((acc: number, id: string) => {
                          const f = finesList.find(p => p.id === id);
                          if (f?.id === 'service_001') {
                            return acc + calculateFineExpenses(selectedFines, finesList);
                          }
                          return acc + (manualServices[id] || f?.amountCents || 0);
                        }, 0) / 100
                      )}
                    </span>
                  </div>
                )}

                {/* Delivery */}
                {formData.deliveryFee > 0 && (
                  <div className='flex justify-between items-center py-3 border-b border-slate-200 group hover:bg-white/50 px-2 rounded-lg transition-colors -mx-2'>
                    <span className='text-slate-600 font-bold'>رسوم التوصيل</span>
                    <span className='font-black text-blue-600'>
                      + {formatCurrency(formData.deliveryFee)}
                    </span>
                  </div>
                )}

                {/* Passport extra fee */}
                {selectedService &&
                  selectedVariant &&
                  (selectedService.slug.toLowerCase().includes('passport') ||
                    selectedService.name.toLowerCase().includes('passport') ||
                    selectedService.name.includes('جواز')) &&
                  (selectedVariant.name.includes('عادي') ||
                    selectedVariant.name.includes('سريع')) &&
                  ['العجوزة', 'الشيخ زايد', '6 أكتوبر'].includes(formData.policeStation) && (
                    <div className='flex justify-between items-center py-3 border-b border-slate-200 group hover:bg-white/50 px-2 rounded-lg transition-colors -mx-2'>
                      <span className='text-slate-600 font-bold'>رسوم منطقة جوازات</span>
                      <span className='text-emerald-600 font-black'>+ {formatCurrency(200)}</span>
                    </div>
                  )}

                {/* Discount */}
                {Number(formData.discount) > 0 && (
                  <div className='flex justify-between items-center py-3 border-b border-slate-200 group hover:bg-white/50 px-2 rounded-lg transition-colors -mx-2'>
                    <span className='text-slate-600 font-bold'>خصم خاص</span>
                    <span className='font-black text-emerald-600'>
                      - {formatCurrency(Number(formData.discount))}
                    </span>
                  </div>
                )}

                {/* Total */}
                <div className='pt-6 mt-4 flex justify-between items-end border-t-2 border-slate-300'>
                  <span className='text-slate-800 font-bold text-lg uppercase tracking-wider'>
                    الإجمالي النهائي
                  </span>
                  <span className='text-4xl font-black text-emerald-700 bg-emerald-100 px-4 py-2 rounded-xl'>
                    {formatCurrency(calculateTotal() / 100)}
                  </span>
                </div>

                {/* Paid Info */}
                <div className='bg-white rounded-2xl p-5 flex justify-between items-center mt-6 border border-slate-200 shadow-sm'>
                  <div className='text-center flex-1 border-l border-slate-200'>
                    <div className='text-sm text-slate-500 font-bold mb-1 uppercase tracking-widest'>
                      المدفوع
                    </div>
                    <div className='text-2xl font-black text-emerald-600'>
                      {formatCurrency(Number(formData.paidAmount))}
                    </div>
                  </div>
                  <div className='text-center flex-1'>
                    <div className='text-sm text-slate-500 font-bold mb-1 uppercase tracking-widest'>
                      المتبقي
                    </div>
                    <div
                      className={`text-2xl font-black ${formData.remainingAmount > 0 ? 'text-rose-600' : 'text-slate-600'}`}
                    >
                      {formatCurrency(formData.remainingAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Action Buttons */}
            <div className='bg-white pt-2'>
              <ActionsSection
                formData={formData}
                setFormData={setFormData}
                customer={customer}
                submitting={submitting}
                handleReset={handleReset}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
