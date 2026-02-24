import { useState, useEffect } from 'react';
import { Order } from '../types';
import {
  PREDEFINED_FINES,
  Fine,
  calculateActualFineAmounts,
  calculateFineExpenses,
  calculateLostReportForServices,
} from '@/constants/fines';

interface OrderSummaryProps {
  order: Order;
  isEditing?: boolean;
  onToggleEdit?: () => void;
  onSave?: (fields: Partial<Order>) => Promise<void>;
  updating?: boolean;
}

export default function OrderSummary({
  order,
  isEditing,
  onToggleEdit,
  onSave,
  updating,
}: OrderSummaryProps) {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState('');

  // Fines & Services State
  const [selectedFines, setSelectedFines] = useState<string[]>([]);
  const [manualServices, setManualServices] = useState<Record<string, number>>({});
  const [showFinesDropdown, setShowFinesDropdown] = useState(false);
  const [showServicesDropdown, setShowServicesDropdown] = useState(false);
  const [finesSearchTerm, setFinesSearchTerm] = useState('');
  const [servicesSearchTerm, setServicesSearchTerm] = useState('');

  // Initialize from order
  useEffect(() => {
    if (order.selectedFines) {
      try {
        const fines = JSON.parse(order.selectedFines);
        if (Array.isArray(fines)) setSelectedFines(fines);
      } catch (e) {}
    }
    if (order.servicesDetails) {
      try {
        const services = JSON.parse(order.servicesDetails);
        if (Array.isArray(services)) {
          const manual: Record<string, number> = {};
          services.forEach((s: any) => {
            if (s.id && s.id !== 'service_001') {
              manual[s.id] = s.amount / 100;
            }
          });
          setManualServices(manual);
        }
      } catch (e) {}
    }
  }, [order.selectedFines, order.servicesDetails]);

  const handleFineToggle = (id: string) => {
    setSelectedFines(prev => (prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]));
  };

  const handleManualServiceChange = (id: string, amount: number) => {
    setManualServices(prev => ({ ...prev, [id]: amount }));
  };

  const handleStartEdit = (field: string, value: string) => {
    setEditingField(field);
    setTempValue(value);
  };

  const calculateNewTotal = (overrides?: Partial<Order>) => {
    const dFee =
      overrides?.deliveryFee !== undefined ? overrides.deliveryFee : order.deliveryFee || 0;
    const oFees = overrides?.otherFees !== undefined ? overrides.otherFees : order.otherFees || 0;
    const disc = overrides?.discount !== undefined ? overrides.discount : order.discount || 0;

    let total = (order.variant?.priceCents || 0) * (order.quantity || 1);

    // Add photography fee
    const pFee =
      order.photographyLocation === 'dandy_mall'
        ? 20000
        : order.photographyLocation === 'civil_registry_haram'
          ? 5000
          : order.photographyLocation === 'home_photography'
            ? 20000
            : 0;
    total += pFee;

    // Add delivery & other fees
    total += dFee;
    total += oFees;

    // Deduct discount
    total -= disc;

    // Calculate fines & services from state
    const finesTotal = calculateActualFineAmounts(selectedFines);
    const finesExpenses = calculateFineExpenses(selectedFines);
    const lostReportExpenses = calculateLostReportForServices(selectedFines);
    const manualTotal = Object.values(manualServices).reduce(
      (acc, curr) => acc + Math.round(curr * 100),
      0
    );

    return total + finesTotal + finesExpenses + lostReportExpenses + manualTotal;
  };

  const handleSaveField = async () => {
    if (!editingField || !onSave) return;
    try {
      const payload: Partial<Order> = {};

      if (editingField === 'fines') {
        const finesDetails = selectedFines
          .filter(id => {
            const f = PREDEFINED_FINES.find(fine => fine.id === id);
            return f?.category === 'غرامات' || id === 'fine_004';
          })
          .map(id => {
            const f = PREDEFINED_FINES.find(fine => fine.id === id);
            return { name: f?.name, amount: f?.amountCents };
          });

        const sDetails = selectedFines
          .filter(id => {
            const f = PREDEFINED_FINES.find(fine => fine.id === id);
            return f?.category === 'خدمات اضافية' && id !== 'fine_004';
          })
          .map(id => {
            const f = PREDEFINED_FINES.find(fine => fine.id === id);
            return {
              id,
              name: f?.name,
              amount: Math.round((manualServices[id] || 0) * 100),
            };
          });

        // Add automatic fine expenses (service_001)
        const autoExpenses = calculateFineExpenses(selectedFines);
        if (autoExpenses > 0) {
          sDetails.push({
            id: 'service_001',
            name: 'مصاريف غرامة',
            amount: autoExpenses,
          });
        }

        payload.selectedFines = JSON.stringify(selectedFines);
        payload.finesDetails = JSON.stringify(finesDetails);
        payload.servicesDetails = JSON.stringify(sDetails);
        payload.totalCents = calculateNewTotal();
      } else {
        let value: number = 0;
        if (tempValue.trim() !== '') {
          value = parseFloat(tempValue);
          if (isNaN(value)) value = 0;
        }

        const cents = Math.round(value * 100);
        if (editingField === 'deliveryFee') {
          payload.deliveryFee = cents;
          payload.totalCents = calculateNewTotal({ deliveryFee: cents });
        } else if (editingField === 'otherFees') {
          payload.otherFees = cents;
          payload.totalCents = calculateNewTotal({ otherFees: cents });
        } else if (editingField === 'discount') {
          payload.discount = cents;
          payload.totalCents = calculateNewTotal({ discount: cents });
        }
      }

      await onSave(payload);
      setEditingField(null);
    } catch (e) {
      console.error(e);
    }
  };

  const photographyFee =
    order.photographyLocation === 'dandy_mall'
      ? 200
      : order.photographyLocation === 'civil_registry_haram'
        ? 50
        : order.photographyLocation === 'home_photography'
          ? 200
          : 0;

  const totalCents = order.totalCents;

  return (
    <div className='bg-white rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] border border-slate-100 overflow-hidden'>
      <div className='bg-slate-50/50 px-4 sm:px-8 py-4 sm:py-6 border-b border-slate-100'>
        <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
          <div className='flex items-center gap-3 sm:gap-4 w-full sm:w-auto'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 bg-indigo-100 text-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0'>
              <svg
                className='w-5 h-5 sm:w-6 sm:h-6'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z'
                />
              </svg>
            </div>
            <div>
              <h2 className='text-lg sm:text-2xl font-black text-slate-800 tracking-tight'>
                ملخص التكاليف
              </h2>
              <p className='text-slate-500 font-bold text-sm sm:text-lg'>
                التفاصيل المالية والرسوم
              </p>
            </div>
          </div>
          {onToggleEdit && (
            <button
              onClick={() => {
                if (isEditing) setEditingField(null);
                onToggleEdit();
              }}
              disabled={updating}
              className={`w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-base ${
                isEditing
                  ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 hover:scale-105'
              }`}
            >
              {isEditing ? (
                <>
                  <svg
                    className='w-4 h-4 sm:w-5 sm:h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                  إغلاق التعديل
                </>
              ) : (
                <>
                  <svg
                    className='w-4 h-4 sm:w-5 sm:h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z'
                    />
                  </svg>
                  تعديل الأسعار
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <div className='p-4 sm:p-8 space-y-6 sm:space-y-8'>
        {/* Service Price */}
        <div className='flex justify-between items-center'>
          <span className='text-slate-500 font-bold text-lg sm:text-xl'>سعر الخدمة الأساسي</span>
          <span className='text-slate-900 font-black text-xl sm:text-2xl tracking-tight'>
            {order.variant?.priceCents
              ? ((order.variant.priceCents * (order.quantity || 1)) / 100).toFixed(2)
              : '0.00'}{' '}
            <span className='text-xs sm:text-base text-slate-400 font-bold mr-1'>جنيه</span>
          </span>
        </div>

        {/* Photography Fee */}
        {photographyFee > 0 && (
          <div className='flex justify-between items-center'>
            <span className='text-slate-500 font-bold text-lg sm:text-xl'>رسوم التصوير</span>
            <span className='text-slate-900 font-black text-xl sm:text-2xl tracking-tight'>
              +{photographyFee.toFixed(2)}{' '}
              <span className='text-xs sm:text-base text-slate-400 font-bold mr-1'>جنيه</span>
            </span>
          </div>
        )}

        {/* Delivery Fee */}
        {(isEditing || order.deliveryFee > 0) && (
          <div
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all relative ${isEditing ? 'bg-indigo-50/30 border-indigo-100' : 'border-transparent'}`}
          >
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2'>
              <div className='flex items-center gap-2'>
                <span className='text-slate-500 font-bold text-base sm:text-xl font-arabic'>
                  مصاريف الشحن والتوصيل
                </span>
                {isEditing && !editingField && (
                  <button
                    onClick={() =>
                      handleStartEdit('deliveryFee', ((order.deliveryFee || 0) / 100).toString())
                    }
                    className='text-indigo-600 bg-indigo-100/50 hover:bg-indigo-200 px-2 py-0.5 sm:px-3 sm:py-1 rounded-lg text-xs sm:text-sm font-bold transition-all'
                  >
                    ✎
                  </button>
                )}
              </div>

              {editingField === 'deliveryFee' ? (
                <div className='flex items-center gap-2 w-full sm:w-auto'>
                  <input
                    type='number'
                    autoFocus
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                    className='flex-1 sm:w-32 bg-white border-2 border-indigo-200 rounded-xl px-4 py-2 text-lg sm:text-xl font-bold text-slate-900 text-center focus:ring-2 focus:ring-indigo-500'
                    placeholder='0'
                  />
                  <button
                    onClick={handleSaveField}
                    disabled={updating}
                    className='bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-all'
                  >
                    <svg
                      className='w-5 h-5 sm:w-6 sm:h-6'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <span className='text-slate-900 font-black text-xl sm:text-2xl tracking-tight'>
                  +{(order.deliveryFee / 100).toFixed(2)}{' '}
                  <span className='text-xs sm:text-base text-slate-400 font-bold mr-1'>جنيه</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Other Fees */}
        {(isEditing || (order.otherFees && order.otherFees > 0)) && (
          <div
            className={`p-4 rounded-2xl border transition-all relative ${isEditing ? 'bg-indigo-50/30 border-indigo-100' : 'border-transparent'}`}
          >
            <div className='flex justify-between items-center'>
              <div className='flex items-center gap-2'>
                <span className='text-slate-500 font-bold text-xl'>رسوم أخرى</span>
                {isEditing && !editingField && (
                  <button
                    onClick={() =>
                      handleStartEdit('otherFees', ((order.otherFees || 0) / 100).toString())
                    }
                    className='text-indigo-600 bg-indigo-100/50 hover:bg-indigo-200 px-3 py-1 rounded-lg text-sm font-bold transition-all'
                  >
                    تعديل ✎
                  </button>
                )}
              </div>

              {editingField === 'otherFees' ? (
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    autoFocus
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                    className='w-32 bg-white border-2 border-indigo-200 rounded-xl px-4 py-2 text-xl font-bold text-slate-900 text-center focus:ring-2 focus:ring-indigo-500'
                    placeholder='0'
                  />
                  <button
                    onClick={handleSaveField}
                    disabled={updating}
                    className='bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-xl transition-all'
                  >
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    disabled={updating}
                    className='bg-slate-200 hover:bg-slate-300 text-slate-700 p-2 rounded-xl transition-all'
                  >
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <span className='text-slate-900 font-black text-2xl tracking-tight'>
                  +{((order.otherFees || 0) / 100).toFixed(2)}{' '}
                  <span className='text-base text-slate-400 font-bold mr-1'>جنيه</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Fines Management UI */}
        {isEditing && (
          <div className='bg-slate-50 p-6 rounded-[2rem] border border-slate-200 space-y-6'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-xl font-black text-slate-800 tracking-tight'>
                إدارة الغرامات والخدمات
              </h3>
              {editingField === 'fines' && (
                <div className='flex gap-2'>
                  <button
                    onClick={handleSaveField}
                    disabled={updating}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-lg shadow-emerald-100 flex items-center gap-2'
                  >
                    <span>حفظ التعديلات</span>
                    <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => {
                      setEditingField(null);
                      setShowFinesDropdown(false);
                      setShowServicesDropdown(false);
                    }}
                    className='bg-white text-slate-600 border border-slate-200 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all'
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <button
                type='button'
                onClick={() => {
                  setEditingField('fines');
                  setShowFinesDropdown(!showFinesDropdown);
                  setShowServicesDropdown(false);
                }}
                className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                  showFinesDropdown
                    ? 'bg-rose-50 border-rose-300 text-rose-800 shadow-inner'
                    : 'bg-white border-slate-100 text-slate-700 hover:border-rose-200 hover:bg-rose-50/30'
                }`}
              >
                <span className='text-4xl mb-3'>⚖️</span>
                <span className='text-lg font-black uppercase tracking-widest'>غرامات</span>
                <span className='text-sm font-bold mt-2 text-rose-600 bg-rose-100 px-3 py-1 rounded-full text-center'>
                  {
                    selectedFines.filter(
                      id => PREDEFINED_FINES.find(f => f.id === id)?.category === 'غرامات'
                    ).length
                  }{' '}
                  محدد
                </span>
              </button>

              <button
                type='button'
                onClick={() => {
                  setEditingField('fines');
                  setShowServicesDropdown(!showServicesDropdown);
                  setShowFinesDropdown(false);
                }}
                className={`flex flex-col items-center justify-center p-6 border-2 rounded-2xl transition-all ${
                  showServicesDropdown
                    ? 'bg-sky-50 border-sky-300 text-sky-800 shadow-inner'
                    : 'bg-white border-slate-100 text-slate-700 hover:border-sky-200 hover:bg-sky-50/30'
                }`}
              >
                <span className='text-4xl mb-3'>➕</span>
                <span className='text-lg font-black uppercase tracking-widest'>إضافات</span>
                <span className='text-sm font-bold mt-2 text-sky-600 bg-sky-100 px-3 py-1 rounded-full text-center'>
                  {
                    selectedFines.filter(
                      id =>
                        PREDEFINED_FINES.find(f => f.id === id)?.category === 'خدمات اضافية' &&
                        id !== 'service_001'
                    ).length
                  }{' '}
                  محدد
                </span>
              </button>
            </div>

            {/* Selection Dropdowns */}
            {(showFinesDropdown || showServicesDropdown) && (
              <div className='p-6 bg-white border border-slate-200 rounded-3xl shadow-xl animate-in slide-in-from-top-4 duration-300 overflow-hidden'>
                {showFinesDropdown && (
                  <div className='space-y-4 flex flex-col'>
                    <div className='relative'>
                      <span className='absolute inset-y-0 right-4 flex items-center text-slate-400'>
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                          />
                        </svg>
                      </span>
                      <input
                        type='text'
                        placeholder='ابحث في قائمة الغرامات...'
                        value={finesSearchTerm}
                        onChange={e => setFinesSearchTerm(e.target.value)}
                        className='w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-medium focus:border-rose-400 focus:bg-white outline-none transition-all'
                        autoFocus
                      />
                    </div>
                    <div className='max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar'>
                      {PREDEFINED_FINES.filter(
                        f => f.category === 'غرامات' && f.name.includes(finesSearchTerm)
                      ).map(f => (
                        <div
                          key={f.id}
                          onClick={() => handleFineToggle(f.id)}
                          className={`p-4 rounded-2xl cursor-pointer flex justify-between items-center transition-all border-2 ${
                            selectedFines.includes(f.id)
                              ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-200'
                              : 'bg-white border-slate-50 hover:border-rose-100 hover:bg-rose-50/50 text-slate-700'
                          }`}
                        >
                          <div className='flex items-center gap-3'>
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedFines.includes(f.id) ? 'border-white bg-white/20' : 'border-slate-200'}`}
                            >
                              {selectedFines.includes(f.id) && (
                                <svg
                                  className='w-4 h-4'
                                  fill='none'
                                  stroke='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                    strokeWidth={3}
                                    d='M5 13l4 4L19 7'
                                  />
                                </svg>
                              )}
                            </div>
                            <span className='text-lg font-bold'>{f.name}</span>
                          </div>
                          <span
                            className={`text-base font-black px-3 py-1 rounded-xl ${
                              selectedFines.includes(f.id)
                                ? 'bg-black/20'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {(f.amountCents / 100).toFixed(0)}{' '}
                            <span className='text-xs font-bold opacity-80'>ج.م</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showServicesDropdown && (
                  <div className='space-y-4 flex flex-col'>
                    <div className='relative'>
                      <span className='absolute inset-y-0 right-4 flex items-center text-slate-400'>
                        <svg
                          className='w-5 h-5'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
                          />
                        </svg>
                      </span>
                      <input
                        type='text'
                        placeholder='ابحث في الخدمات الإضافية...'
                        value={servicesSearchTerm}
                        onChange={e => setServicesSearchTerm(e.target.value)}
                        className='w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-lg font-medium focus:border-sky-400 focus:bg-white outline-none transition-all'
                        autoFocus
                      />
                    </div>
                    <div className='max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar'>
                      {PREDEFINED_FINES.filter(
                        s =>
                          s.category === 'خدمات اضافية' &&
                          s.id !== 'service_001' &&
                          s.name.includes(servicesSearchTerm)
                      ).map(s => (
                        <div
                          key={s.id}
                          className={`rounded-2xl border-2 transition-all ${
                            selectedFines.includes(s.id)
                              ? 'bg-sky-50 border-sky-300'
                              : 'bg-white border-slate-50 hover:border-sky-100'
                          }`}
                        >
                          <div
                            onClick={() => handleFineToggle(s.id)}
                            className={`p-4 cursor-pointer flex justify-between items-center transition-all`}
                          >
                            <div className='flex items-center gap-3'>
                              <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center border-2 ${selectedFines.includes(s.id) ? 'border-sky-500 bg-sky-500 text-white' : 'border-slate-200'}`}
                              >
                                {selectedFines.includes(s.id) && (
                                  <svg
                                    className='w-4 h-4'
                                    fill='none'
                                    stroke='currentColor'
                                    viewBox='0 0 24 24'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={3}
                                      d='M5 13l4 4L19 7'
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className='text-lg font-bold text-slate-800'>{s.name}</span>
                            </div>
                            {!selectedFines.includes(s.id) && s.amountCents > 0 && (
                              <span className='text-base font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-xl'>
                                {(s.amountCents / 100).toFixed(0)}{' '}
                                <span className='text-xs'>ج.م</span>
                              </span>
                            )}
                          </div>
                          {selectedFines.includes(s.id) && (
                            <div className='p-4 bg-white/80 border-t border-sky-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-1'>
                              <label className='text-sm font-black text-sky-800 shrink-0'>
                                أدخل القيمة:
                              </label>
                              <div className='relative grow'>
                                <input
                                  type='number'
                                  value={manualServices[s.id] || ''}
                                  onChange={e =>
                                    handleManualServiceChange(s.id, parseFloat(e.target.value) || 0)
                                  }
                                  className='w-full pr-4 pl-12 py-3 bg-sky-50 border-2 border-sky-200 rounded-xl text-lg font-black text-sky-900 focus:ring-4 focus:ring-sky-500/10 focus:bg-white outline-none transition-all'
                                  placeholder='0'
                                  onClick={e => e.stopPropagation()}
                                />
                                <span className='absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-sky-500'>
                                  ج.م
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Restore Fines Section (Display) */}
        {!isEditing && order.finesDetails && (
          <div className='p-6 bg-red-50/50 rounded-3xl border border-red-100'>
            <div className='flex items-center gap-3 mb-6'>
              <div className='w-8 h-8 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-200'>
                <svg
                  className='w-5 h-5 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
                  />
                </svg>
              </div>
              <h3 className='text-xl font-black text-red-900'>الغرامات المطبقة</h3>
            </div>
            <div className='space-y-3'>
              {(() => {
                try {
                  const fines = JSON.parse(order.finesDetails as string);
                  return fines.map(
                    (fine: any, index: number) =>
                      fine.amount > 0 && (
                        <div
                          key={index}
                          className='flex justify-between items-center p-4 bg-white/70 rounded-2xl border border-red-50 text-xl font-black text-red-700 shadow-sm'
                        >
                          <span>{fine.name}</span>
                          <span className='tracking-tight'>
                            +{((fine.amount || 0) / 100).toFixed(2)} جنيه
                          </span>
                        </div>
                      )
                  );
                } catch {
                  return null;
                }
              })()}
            </div>
          </div>
        )}

        {/* Dynamic Services */}
        {order.servicesDetails &&
          (() => {
            try {
              const services = JSON.parse(order.servicesDetails as string);
              return services.map((service: any, index: number) => (
                <div
                  key={index}
                  className='flex justify-between items-center p-4 bg-indigo-50/30 rounded-2xl border border-indigo-50'
                >
                  <span className='font-bold text-xl text-indigo-900'>{service.name}</span>
                  <span className='font-black text-2xl text-indigo-950 tracking-tight'>
                    +{(service.amount / 100).toFixed(2)}{' '}
                    <span className='text-base font-bold text-indigo-400 mr-1'>جنيه</span>
                  </span>
                </div>
              ));
            } catch {
              return null;
            }
          })()}

        {/* Discount */}
        {(isEditing || (order.discount && order.discount > 0)) && (
          <div
            className={`p-4 rounded-2xl border transition-all relative ${isEditing ? 'bg-emerald-50/50 border-emerald-100' : 'bg-emerald-50/50 border-emerald-100'}`}
          >
            <div className='flex justify-between items-center text-emerald-700 font-black text-xl'>
              <div className='flex items-center gap-2'>
                <span className='font-bold'>الخصم المطبق</span>
                {isEditing && !editingField && (
                  <button
                    onClick={() =>
                      handleStartEdit('discount', ((order.discount || 0) / 100).toString())
                    }
                    className='text-emerald-700 bg-emerald-200/50 hover:bg-emerald-200 px-3 py-1 rounded-lg text-sm font-bold transition-all'
                  >
                    تعديل ✎
                  </button>
                )}
              </div>

              {editingField === 'discount' ? (
                <div className='flex items-center gap-2'>
                  <input
                    type='number'
                    autoFocus
                    value={tempValue}
                    onChange={e => setTempValue(e.target.value)}
                    className='w-32 bg-white border-2 border-emerald-300 rounded-xl px-4 py-2 text-xl font-bold text-emerald-900 text-center focus:ring-2 focus:ring-emerald-500'
                    placeholder='0'
                  />
                  <button
                    onClick={handleSaveField}
                    disabled={updating}
                    className='bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-xl transition-all'
                  >
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    disabled={updating}
                    className='bg-emerald-200 hover:bg-emerald-300 text-emerald-800 p-2 rounded-xl transition-all'
                  >
                    <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M6 18L18 6M6 6l12 12'
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <span className='tracking-tight'>
                  -{((order.discount || 0) / 100).toFixed(2)}{' '}
                  <span className='text-base font-bold mr-1'>جنيه</span>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Total Divider */}
        <div className='pt-6 sm:pt-8 border-t border-slate-100 mt-6 sm:mt-8'>
          <div className='flex flex-col sm:flex-row justify-between items-center gap-4 text-center sm:text-right'>
            <div className='w-full sm:w-auto'>
              <p className='text-[10px] sm:text-sm font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2 px-1'>
                الإجمالي النهائي
              </p>
              <h3 className='text-xl sm:text-3xl font-black text-slate-900 tracking-tight'>
                المبلغ المطلوب
              </h3>
            </div>
            <div className='w-full sm:w-auto'>
              <div className='text-4xl sm:text-6xl font-black text-slate-950 tracking-tighter leading-none mb-1 sm:mb-2'>
                {(isEditing ? calculateNewTotal() : order.totalCents) / 100}
              </div>
              <div className='text-xs sm:text-base text-slate-500 font-black uppercase tracking-widest'>
                جنيه مصري
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
