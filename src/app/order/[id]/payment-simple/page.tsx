'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default function SimplePaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        const data = await response.json();
        if (data.success) {
          setOrder(data.order);
        }
      } catch (error) {
        //
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-lg'>جاري التحميل...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-lg text-red-600'>الطلب غير موجود</div>
      </div>
    );
  }

  const handlePayment = () => {
    alert('تم محاكاة الدفع بنجاح!');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-2xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <h1 className='text-2xl font-bold text-gray-900 mb-6'>صفحة الدفع</h1>

          <div className='space-y-4'>
            <div className='border-b pb-4'>
              <h2 className='text-lg font-semibold text-gray-900'>تفاصيل الطلب</h2>
              <p className='text-gray-600'>الخدمة: {order.service.name}</p>
              <p className='text-gray-600'>النوع: {order.variant.name}</p>
              <p className='text-gray-600'>
                السعر: {(order.variant.priceCents / 100).toFixed(2)} جنيه
              </p>
              <p className='text-gray-600'>المجموع: {(order.totalCents / 100).toFixed(2)} جنيه</p>
            </div>

            <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
              <p className='text-yellow-800'>
                <strong>ملاحظة:</strong> هذه صفحة دفع تجريبية. في الإنتاج، ستكون هنا بوابة دفع
                حقيقية.
              </p>
            </div>

            <div className='flex gap-4'>
              <button
                className='bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700'
                onClick={handlePayment}
              >
                دفع الآن
              </button>
              <button
                className='bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400'
                onClick={handleCancel}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
