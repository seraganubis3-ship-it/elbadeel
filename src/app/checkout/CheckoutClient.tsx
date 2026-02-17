'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

interface Service {
  id: string;
  name: string;
  variants: Variant[];
}

interface Variant {
  id: string;
  name: string;
  priceCents: number;
}

export default function CheckoutClient({ services }: { services: Service[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialServiceId = searchParams.get('service');
  const initialVariantId = searchParams.get('variant');

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState(initialServiceId || '');
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariantId || '');

  const [formData, setFormData] = useState({
    // Personal
    customerName: '',
    customerPhone: '',
    idNumber: '', // National ID
    motherName: '',
    birthDate: '',
    gender: 'MALE',

    // Address
    governorate: '',
    city: '',
    address: '',

    // Account
    email: '',
    password: '',
    confirmPassword: '',

    // Order
    notes: '',
    quantity: 1,
    deliveryType: 'OFFICE', // OFFICE or HOME
  });

  const selectedService = services.find(s => s.id === selectedServiceId);
  const selectedVariant = selectedService?.variants.find(v => v.id === selectedVariantId);
  const isNationalId =
    selectedService?.name?.includes('قومي') || selectedService?.name?.includes('بطاقة');

  // Steps:
  // 1: Service Selection (if not selected) & Variant
  // 2: Personal & Order Info
  // 3: Account Creation & Confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedVariant) return;

    if (formData.password !== formData.confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Create Guest Order
      const res = await fetch('/api/checkout/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderData: {
            serviceId: selectedServiceId,
            variantId: selectedVariantId,
            totalPrice: (selectedVariant.priceCents / 100) * formData.quantity,
            customerName: formData.customerName,
            customerPhone: formData.customerPhone,
            address: formData.address,
            governorate: formData.governorate,
            city: formData.city,
            notes: formData.notes,
            deliveryType: formData.deliveryType,
            deliveryFee: formData.deliveryType === 'HOME' ? 50 : 0, // Simplified fee logic
            quantity: formData.quantity,
            idNumber: formData.idNumber,
            motherName: formData.motherName,
            birthDate: formData.birthDate,
            gender: formData.gender,
          },
          userData: {
            email: formData.email,
            password: formData.password,
            name: formData.customerName,
            phone: formData.customerPhone,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إنشاء الطلب');
      }

      // 2. Auto Login
      const loginRes = await signIn('credentials', {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (loginRes?.error) {
        // Should not happen if creation succeeded, but redirect to login just in case
        router.push('/login');
      } else {
        // 3. Redirect to Order Success or Dashboard
        router.push(`/admin/orders/${data.orderId}`); // Or a public "Thank You" page
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && (!selectedServiceId || !selectedVariantId)) {
      setError('يرجى اختيار الخدمة ونوع الطلب');
      return;
    }
    setError('');
    setStep(p => p + 1);
  };

  return (
    <div className='min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8' dir='rtl'>
      <div className='max-w-3xl mx-auto'>
        <div className='text-center mb-10'>
          <h1 className='text-3xl font-black text-slate-900 mb-2'>إتمام الطلب</h1>
          <p className='text-slate-500'>أكمل بياناتك لإنشاء حسابك وطلبك في خطوة واحدة</p>
        </div>

        <div className='bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden'>
          {/* Progress Bar */}
          <div className='flex border-b border-slate-100 bg-slate-50/50'>
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 py-4 text-center text-sm font-bold border-b-2 transition-colors ${step >= s ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-slate-400'}`}
              >
                {s === 1 && 'الخدمة'}
                {s === 2 && 'البيانات'}
                {s === 3 && 'الحساب والدفع'}
              </div>
            ))}
          </div>

          <div className='p-8'>
            {error && (
              <div className='mb-6 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold border border-rose-100'>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* STEP 1: Service Selection */}
              {step === 1 && (
                <div className='space-y-6'>
                  <div className='space-y-2'>
                    <label className='block text-sm font-black text-slate-700'>
                      الخدمة المطلوبة
                    </label>
                    <div className='grid grid-cols-1 gap-3 max-h-60 overflow-y-auto custom-scrollbar p-1'>
                      {services.map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedServiceId(s.id);
                            setSelectedVariantId('');
                          }}
                          className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedServiceId === s.id ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' : 'border-slate-100 hover:border-emerald-200'}`}
                        >
                          <div className='font-bold text-slate-900'>{s.name}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedService && (
                    <div className='space-y-2 animate-in slide-in-from-top-2'>
                      <label className='block text-sm font-black text-slate-700'>نوع الطلب</label>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                        {selectedService.variants.map(v => (
                          <div
                            key={v.id}
                            onClick={() => setSelectedVariantId(v.id)}
                            className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${selectedVariantId === v.id ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500' : 'border-slate-100 hover:border-emerald-200'}`}
                          >
                            <span className='font-bold text-slate-900'>{v.name}</span>
                            <span className='text-emerald-600 font-bold'>
                              {(v.priceCents / 100).toLocaleString()} ج.م
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className='pt-6'>
                    <button
                      type='button'
                      onClick={handleNext}
                      disabled={!selectedServiceId || !selectedVariantId}
                      className='w-full py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-200'
                    >
                      الخطوة التالية
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Personal Info */}
              {step === 2 && (
                <div className='space-y-6 animate-in slide-in-from-right-4'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='space-y-2'>
                      <label className='text-sm font-bold text-slate-700'>الاسم بالكامل</label>
                      <input
                        required
                        type='text'
                        value={formData.customerName}
                        onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                        className='w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all'
                        placeholder='الاسم كما في البطاقة'
                      />
                    </div>
                    <div className='space-y-2'>
                      <label className='text-sm font-bold text-slate-700'>رقم الهاتف</label>
                      <input
                        required
                        type='tel'
                        value={formData.customerPhone}
                        onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                        className='w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all text-left'
                        placeholder='01xxxxxxxxx'
                        dir='ltr'
                      />
                    </div>
                  </div>

                  {/* National ID specific */}
                  {isNationalId && (
                    <div className='space-y-2'>
                      <label className='text-sm font-bold text-slate-700'>
                        الرقم القومي (14 رقم)
                      </label>
                      <input
                        required
                        type='text'
                        maxLength={14}
                        value={formData.idNumber}
                        onChange={e =>
                          setFormData({ ...formData, idNumber: e.target.value.replace(/\D/g, '') })
                        }
                        className='w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all text-center tracking-widest font-mono'
                        placeholder='xxxxxxxxxxxxxx'
                      />
                    </div>
                  )}

                  <div className='space-y-2'>
                    <label className='text-sm font-bold text-slate-700'>العنوان بالتفصيل</label>
                    <input
                      required
                      type='text'
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className='w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all'
                      placeholder='المحافظة، المدينة، الشارع...'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <button
                      type='button'
                      onClick={() => setStep(1)}
                      className='py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all'
                    >
                      رجوع
                    </button>
                    <button
                      type='button'
                      onClick={() => {
                        if (
                          !formData.customerName ||
                          !formData.customerPhone ||
                          !formData.address
                        ) {
                          setError('يرجى ملء جميع البيانات المطلوبة');
                          return;
                        }
                        setStep(3);
                      }}
                      className='py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200'
                    >
                      الخطوة التالية
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Account & Submit */}
              {step === 3 && (
                <div className='space-y-6 animate-in slide-in-from-right-4'>
                  <div className='bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-6'>
                    <h3 className='font-bold text-emerald-800 mb-2'>ملخص الطلب</h3>
                    <div className='flex justify-between text-sm mb-1'>
                      <span className='text-emerald-700'>{selectedService?.name}</span>
                      <span className='font-bold'>
                        {(selectedVariant?.priceCents! / 100).toLocaleString()} ج.م
                      </span>
                    </div>
                    <div className='flex justify-between text-sm'>
                      <span className='text-emerald-700'>النوع: {selectedVariant?.name}</span>
                      <span className='text-emerald-700'>العدد: {formData.quantity}</span>
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <h3 className='font-black text-slate-800'>إنشاء حسابك</h3>
                    <div className='space-y-2'>
                      <label className='text-sm font-bold text-slate-700'>البريد الإلكتروني</label>
                      <input
                        required
                        type='email'
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className='w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all'
                        placeholder='name@example.com'
                        dir='ltr'
                      />
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div className='space-y-2'>
                        <label className='text-sm font-bold text-slate-700'>كلمة المرور</label>
                        <input
                          required
                          type='password'
                          value={formData.password}
                          onChange={e => setFormData({ ...formData, password: e.target.value })}
                          className='w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all'
                          placeholder='******'
                          minLength={6}
                        />
                      </div>
                      <div className='space-y-2'>
                        <label className='text-sm font-bold text-slate-700'>
                          تأكيد كلمة المرور
                        </label>
                        <input
                          required
                          type='password'
                          value={formData.confirmPassword}
                          onChange={e =>
                            setFormData({ ...formData, confirmPassword: e.target.value })
                          }
                          className='w-full px-4 py-3 rounded-xl border-2 border-slate-100 focus:border-emerald-500 outline-none transition-all'
                          placeholder='******'
                        />
                      </div>
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-4 pt-4'>
                    <button
                      type='button'
                      onClick={() => setStep(2)}
                      disabled={loading}
                      className='py-4 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all'
                    >
                      رجوع
                    </button>
                    <button
                      type='submit'
                      disabled={loading}
                      className='py-4 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex justify-center items-center gap-2'
                    >
                      {loading ? 'جاري التنفيذ...' : 'تأكيد الطلب وإنشاء الحساب'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        <div className='text-center mt-6'>
          <Link href='/login' className='text-sm text-slate-500 hover:text-emerald-600 font-bold'>
            لديك حساب بالفعل؟ تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
