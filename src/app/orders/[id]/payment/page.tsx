'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

type OrderPaymentGate = {
  id: string;
  status: string;
};

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  const [order, setOrder] = useState<OrderPaymentGate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      }
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (order?.status === 'waiting_payment') {
      router.replace(`/order/${orderId}/payment`);
    }
  }, [order?.status, orderId, router]);

  if (loading || order?.status === 'waiting_payment') {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50' dir='rtl'>
        <div className='text-center space-y-3'>
          <div className='w-12 h-12 mx-auto border-4 border-blue-600 rounded-full animate-spin border-t-transparent' />
          <p className='font-bold text-slate-700'>جاري فتح صفحة الدفع...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-slate-50 px-4' dir='rtl'>
        <div className='bg-white rounded-2xl border border-slate-100 shadow-xl p-8 text-center'>
          <h1 className='text-2xl font-black text-slate-900 mb-3'>الطلب غير موجود</h1>
          <Link href='/orders' className='text-blue-600 font-bold hover:text-blue-700'>
            العودة لطلباتي
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50 flex items-center justify-center px-4' dir='rtl'>
      <div className='max-w-md w-full bg-white rounded-2xl shadow-xl border border-amber-100 p-8 text-center'>
        <div className='w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center'>
          <svg className='w-7 h-7' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' />
          </svg>
        </div>
        <h1 className='text-2xl font-black text-slate-900 mb-3'>الدفع غير متاح الآن</h1>
        <p className='text-slate-600 leading-7 mb-6'>
          طلبك قيد مراجعة الإدارة. سيظهر زر الدفع بعد تأكيد الطلب وتحديد المستحقات المطلوبة.
        </p>
        <Link
          href={`/orders/${order.id}`}
          className='inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors'
        >
          متابعة حالة الطلب
        </Link>
      </div>
    </div>
  );
}