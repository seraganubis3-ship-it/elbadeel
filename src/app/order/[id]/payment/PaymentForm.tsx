'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentFormProps {
  orderId: string;
  totalAmount: number;
}

export default function PaymentForm({ orderId, totalAmount }: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'VODAFONE_CASH' | 'INSTA_PAY'>(
    'VODAFONE_CASH'
  );
  const [senderPhone, setSenderPhone] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const PAYMENT_NUMBERS = {
    VODAFONE_CASH: '01021484439',
    INSTA_PAY: '01021484439@instapay',
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone.trim()) {
      setError('يرجى إدخال رقم الهاتف المحول منه');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      let screenshotPath = '';
      if (paymentScreenshot) {
        const formData = new FormData();
        formData.append('file', paymentScreenshot);
        const uploadResponse = await fetch('/api/upload', { method: 'POST', body: formData });
        if (uploadResponse.ok) {
          const uploadResult = await uploadResponse.json();
          screenshotPath = uploadResult.filePath;
        }
      }

      const response = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: paymentMethod,
          senderPhone,
          paymentScreenshot: screenshotPath,
        }),
      });

      const result = await response.json();
      if (response.ok && result.success) {
        router.push(`/order-success?orderId=${orderId}&paymentSubmitted=true`);
      } else {
        setError(result.error || 'حدث خطأ أثناء إرسال بيانات الدفع');
      }
    } catch (error) {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-white relative overflow-hidden'>
      {/* Decorative Background Glow */}
      <div className='absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full'></div>

      <div className='relative z-10'>
        <div className='mb-10'>
          <h2 className='text-3xl font-black text-slate-900 mb-2'>طريقة الدفع</h2>
          <p className='text-slate-500 font-medium'>اختر الوسيلة المفضلة وأكد عملية التحويل</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-8'>
          {/* Method Selector Tabs */}
          <div className='p-1.5 bg-slate-100/80 rounded-2xl flex gap-1.5'>
            <button
              type='button'
              onClick={() => setPaymentMethod('VODAFONE_CASH')}
              className={`flex-1 py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 ${
                paymentMethod === 'VODAFONE_CASH'
                  ? 'bg-white text-rose-600 shadow-md ring-1 ring-rose-100'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${paymentMethod === 'VODAFONE_CASH' ? 'bg-rose-600 animate-pulse' : 'bg-slate-300'}`}
              ></div>
              فودافون كاش
            </button>
            <button
              type='button'
              onClick={() => setPaymentMethod('INSTA_PAY')}
              className={`flex-1 py-4 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-3 ${
                paymentMethod === 'INSTA_PAY'
                  ? 'bg-white text-emerald-600 shadow-md ring-1 ring-emerald-100'
                  : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${paymentMethod === 'INSTA_PAY' ? 'bg-emerald-600 animate-pulse' : 'bg-slate-300'}`}
              ></div>
              انستا باي
            </button>
          </div>

          {/* Dynamic Payment Card */}
          <AnimatePresence mode='wait'>
            <motion.div
              key={paymentMethod}
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.2 }}
              className={`p-8 rounded-[2rem] border-2 border-dashed relative overflow-hidden ${
                paymentMethod === 'VODAFONE_CASH'
                  ? 'border-rose-100 bg-rose-50/30'
                  : 'border-emerald-100 bg-emerald-50/30'
              }`}
            >
              <div className='relative z-10 flex flex-col items-center text-center'>
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm ${
                    paymentMethod === 'VODAFONE_CASH'
                      ? 'bg-rose-100 text-rose-600'
                      : 'bg-emerald-100 text-emerald-600'
                  }`}
                >
                  {paymentMethod === 'VODAFONE_CASH' ? '🔴' : '💎'}
                </div>

                <h4 className='text-slate-500 font-bold text-sm mb-4 uppercase tracking-widest'>
                  حول المبلغ التالي
                </h4>
                <div className='flex items-baseline gap-2 mb-6'>
                  <span className='text-5xl font-black text-slate-900 tracking-tighter'>
                    {(totalAmount / 100).toFixed(2)}
                  </span>
                  <span className='text-lg font-black text-slate-400'>ج.م</span>
                </div>

                <div className='w-full max-w-sm bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-3'>
                  <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest block'>
                    رقم التحويل
                  </span>
                  <div className='flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100'>
                    <code className='text-xl font-black text-slate-800 tracking-wider'>
                      {PAYMENT_NUMBERS[paymentMethod]}
                    </code>
                    <button
                      type='button'
                      onClick={() => copyToClipboard(PAYMENT_NUMBERS[paymentMethod])}
                      className='p-2 hover:bg-slate-200 rounded-lg transition-colors text-slate-400 hover:text-slate-600'
                      title='نسخ الرقم'
                    >
                      {copied ? (
                        <span className='text-xs font-bold text-emerald-600'>تم النسخ!</span>
                      ) : (
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
                            d='M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3'
                          />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className='mt-8 flex gap-4 text-[11px] font-black text-slate-400 uppercase tracking-widest'>
                  <span className='flex items-center gap-1.5'>
                    <div className='w-1.5 h-1.5 rounded-full bg-emerald-500'></div> تحويل فوري
                  </span>
                  <span className='flex items-center gap-1.5'>
                    <div className='w-1.5 h-1.5 rounded-full bg-emerald-500'></div> أمان تام
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Form Fields */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-3'>
              <label className='text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                رقم الهاتف المحول منه
              </label>
              <div className='relative group'>
                <input
                  type='tel'
                  value={senderPhone}
                  onChange={e => setSenderPhone(e.target.value)}
                  required
                  className='w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-slate-300 outline-none transition-all font-bold text-slate-800 group-hover:bg-white'
                  placeholder='01xxxxxxxxx'
                />
                <div className='absolute left-4 top-1/2 -translate-y-1/2 text-slate-300'>📱</div>
              </div>
            </div>

            <div className='space-y-3'>
              <label className='text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1'>
                تأكيد العملية (سكرين شوت)
              </label>
              <div className='relative group'>
                <input
                  type='file'
                  id='screenshot'
                  accept='image/*'
                  onChange={e => setPaymentScreenshot(e.target.files?.[0] || null)}
                  className='hidden'
                />
                <label
                  htmlFor='screenshot'
                  className='flex items-center justify-between w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/20 transition-all group'
                >
                  <span
                    className={`text-sm font-bold truncate max-w-[150px] ${paymentScreenshot ? 'text-emerald-600' : 'text-slate-400'}`}
                  >
                    {paymentScreenshot ? paymentScreenshot.name : 'ارفع السكرين شوت هنا'}
                  </span>
                  <div className='w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors'>
                    📸
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Alerts & Submission */}
          <div className='space-y-6'>
            <div className='p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-start'>
              <span className='text-xl'>⚠️</span>
              <p className='text-[11px] leading-relaxed text-amber-800 font-bold uppercase tracking-tight'>
                يرجى التأكد من إتمام الدفع قبل إرسال البيانات. يتم مراجعة العمليات يدوياً خلال
                دقائق. <br />
                تنبيه: العمليات غير الصحيحة تؤدي لحظر الحساب.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className='p-4 bg-rose-50 rounded-2xl border border-rose-100 flex items-center gap-3 text-rose-600 text-sm font-bold'
              >
                <span>❌</span> {error}
              </motion.div>
            )}

            <button
              type='submit'
              disabled={isSubmitting || !senderPhone.trim()}
              className={`w-full py-5 px-6 rounded-[1.5rem] font-black transition-all transform active:scale-[0.98] shadow-xl flex items-center justify-center gap-4 ${
                isSubmitting || !senderPhone.trim()
                  ? 'bg-slate-100 text-slate-400 shadow-none'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className='w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin'></div>
                  <span>جاري تسجيل الطلب...</span>
                </>
              ) : (
                <>
                  <span>تأكيد إرسال بيانات الدفع</span>
                  <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2.5}
                      d='M14 5l7 7m0 0l-7 7m7-7H3'
                    />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
