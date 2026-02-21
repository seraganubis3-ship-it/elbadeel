import { useState } from 'react';

interface Variant {
  id: string;
  name: string;
  priceCents: number;
}

interface DynamicField {
  id: string;
  name: string;
  label: string;
  options: { value: string; label: string }[];
}

interface OrderReviewProps {
  selectedVariant: Variant;
  deliveryType: string;
  deliveryFee: number;
  onApplyPromo: (code: string) => Promise<any>;
  onRemovePromo: () => void;
  appliedPromo: { code: string; discountAmount: number } | null;
  dynamicFields?: DynamicField[];
  dynamicValues?: Record<string, string>;
  isGuest?: boolean;
  password?: string;
  onPasswordChange?: (value: string) => void;
}

export default function OrderReview({
  selectedVariant,
  deliveryType,
  deliveryFee,
  onApplyPromo,
  onRemovePromo,
  appliedPromo,
  dynamicFields = [],
  dynamicValues = {},
  isGuest = false,
  password = '',
  onPasswordChange,
}: OrderReviewProps) {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleApply = async () => {
    if (!promoCode.trim()) return;
    setLoading(true);
    setMessage(null);
    try {
      const result = await onApplyPromo(promoCode);
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (e) {
      setMessage({ type: 'error', text: 'حدث خطأ غير متوقع' });
    } finally {
      setLoading(false);
    }
  };

  const finalDeliveryFee = deliveryType === 'ADDRESS' ? deliveryFee : 0;
  const subTotal = selectedVariant.priceCents;
  const discount = appliedPromo ? appliedPromo.discountAmount : 0;
  const total = subTotal + finalDeliveryFee - discount;

  const LineItem = ({ label, value, isBold = false, isGreen = false, isRed = false }: any) => (
    <div
      className={`flex justify-between items-center ${isBold ? 'font-bold' : 'font-medium'} text-sm`}
    >
      <span className='text-slate-500'>{label}</span>
      <span
        className={`
        ${isGreen ? 'text-emerald-600' : ''} 
        ${isRed ? 'text-rose-500' : ''} 
        ${!isGreen && !isRed ? 'text-slate-900' : ''}
      `}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className='space-y-6'>
      {/* Section Header */}
      <div className='text-center sm:text-right'>
        <h3 className='text-xl sm:text-2xl font-black text-slate-900 mb-2'>تأكيد الطلب</h3>
        <p className='text-slate-500 text-sm'>راجع تفاصيل طلبك قبل إتمام الدفع</p>
      </div>

      {/* Receipt Card */}
      <div className='bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-lg relative'>
        {/* Receipt Header */}
        <div className='bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 text-center'>
          <div className='inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-3'>
            <span className='text-white/80 text-xs font-bold'>فاتورة مبدئية</span>
          </div>
          <h4 className='text-xl font-black text-white'>ملخص الطلب</h4>
        </div>

        <div className='p-6 sm:p-8'>
          {/* Line Items */}
          <div className='space-y-4'>
            <LineItem label='نوع الخدمة' value={selectedVariant.name} isBold />

            {/* Dynamic Fields Summary */}
            {dynamicFields.length > 0 && Object.keys(dynamicValues).length > 0 && (
              <>
                <div className='h-px bg-slate-100' />
                <div className='bg-slate-50 -mx-2 px-4 py-3 rounded-xl space-y-2'>
                  <span className='text-xs font-bold text-slate-400 uppercase'>تفاصيل الطلب</span>
                  {dynamicFields.map(field => {
                    const value = dynamicValues[field.name];
                    if (!value) return null;

                    // Find the label for select/radio options
                    const option = field.options.find(o => o.value === value);
                    const displayValue = option ? option.label : value;

                    return <LineItem key={field.id} label={field.label} value={displayValue} />;
                  })}
                </div>
              </>
            )}

            <div className='h-px bg-slate-100' />

            <LineItem label='قيمة الخدمة' value={`${(subTotal / 100).toFixed(2)} ج.م`} />

            <LineItem
              label='رسوم التوصيل'
              value={
                finalDeliveryFee === 0 ? 'مجاناً ✨' : `${(finalDeliveryFee / 100).toFixed(2)} ج.م`
              }
              isGreen={finalDeliveryFee === 0}
            />

            {appliedPromo && (
              <>
                <div className='h-px bg-emerald-100' />
                <div className='bg-emerald-50 -mx-2 px-2 py-3 rounded-xl'>
                  <LineItem
                    label={`خصم كوبون (${appliedPromo.code})`}
                    value={`-${(discount / 100).toFixed(2)} ج.م`}
                    isGreen
                    isBold
                  />
                </div>
              </>
            )}
          </div>

          {/* Promo Code Input */}
          <div className='mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100'>
            <label className='flex items-center gap-2 text-xs font-bold text-slate-600 mb-3'>
              <span className='w-5 h-5 rounded-md bg-amber-100 text-amber-600 flex items-center justify-center text-[10px]'>
                🎫
              </span>
              لديك كود خصم؟
            </label>
            <div className='flex gap-2'>
              <input
                type='text'
                value={promoCode}
                onChange={e => setPromoCode(e.target.value.toUpperCase())}
                disabled={!!appliedPromo}
                placeholder='أدخل الكود هنا'
                className='flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all uppercase font-mono tracking-wider disabled:bg-slate-100 disabled:text-slate-400'
              />
              {appliedPromo ? (
                <button
                  onClick={() => {
                    onRemovePromo();
                    setPromoCode('');
                    setMessage(null);
                  }}
                  className='px-5 py-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all flex items-center gap-2 border border-rose-100'
                >
                  <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M6 18L18 6M6 6l12 12'
                    />
                  </svg>
                  إزالة
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={loading || !promoCode}
                  className='px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2'
                >
                  {loading ? (
                    <svg className='w-4 h-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
                      ></path>
                    </svg>
                  ) : (
                    <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                  )}
                  تطبيق
                </button>
              )}
            </div>
            {message && (
              <div
                className={`flex items-center gap-2 mt-3 text-sm font-medium ${message.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}
              >
                {message.type === 'success' ? '✅' : '❌'}
                {message.text}
              </div>
            )}
          </div>

          {/* Guest Account Registration */}
          {isGuest && (
            <div className='mt-8 p-6 bg-emerald-50 rounded-2xl border-2 border-emerald-100'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm'>
                  🔐
                </div>
                <div>
                  <h4 className='text-emerald-900 font-black text-sm'>إنشاء حساب تلقائي</h4>
                  <p className='text-emerald-700 text-xs'>سجل كلمة مرور لمتابعة طلبك لاحقاً</p>
                </div>
              </div>

              <div className='space-y-3'>
                <label className='block text-xs font-bold text-emerald-800 pr-1'>
                  كلمة المرور (6 أحرف على الأقل)
                </label>
                <input
                  type='password'
                  value={password}
                  onChange={e => onPasswordChange?.(e.target.value)}
                  placeholder='أدخل كلمة المرور هنا'
                  className='w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all font-sans'
                  dir='ltr'
                />
                <p className='text-[10px] text-emerald-600 font-medium leading-relaxed pr-1'>
                  * سيتم استخدام رقم هاتفك واسمك المسجلين في الخطوة السابقة لإنشاء الحساب.
                </p>
              </div>
            </div>
          )}

          {/* Total Section */}
          <div className='mt-8 pt-6 border-t-2 border-slate-100'>
            <div className='flex justify-between items-center'>
              <div>
                <span className='text-slate-500 font-medium block text-sm'>الإجمالي المستحق</span>
                <span className='text-slate-400 text-xs'>شامل الضرائب</span>
              </div>
              <div className='text-left'>
                <span className='block text-4xl font-black text-emerald-600 leading-none'>
                  {(total / 100).toFixed(0)}
                </span>
                <span className='text-xs text-slate-400 font-bold uppercase tracking-wider'>
                  جنيه مصري
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Jagged Edge Bottom */}
        <div
          className='h-4 w-full bg-slate-50'
          style={{
            backgroundImage:
              'linear-gradient(45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%), linear-gradient(-45deg, transparent 33.333%, #ffffff 33.333%, #ffffff 66.667%, transparent 66.667%)',
            backgroundSize: '16px 32px',
            backgroundPosition: '0 100%',
          }}
        />
      </div>

      {/* Security Note */}
      <div className='flex items-center justify-center gap-2 text-sm text-slate-400'>
        <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
          />
        </svg>
        <span>جميع البيانات محمية ومشفرة بالكامل</span>
      </div>
    </div>
  );
}
