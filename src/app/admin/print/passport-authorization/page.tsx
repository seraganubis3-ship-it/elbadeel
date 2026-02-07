'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Order } from '../../orders/types';

interface Delegate {
  id: string;
  name: string;
  idNumber: string;
  licenseNumber: string;
  idCardFront: string;
  idCardBack: string;
  unionCardFront: string;
  unionCardBack: string;
}

export default function PassportAuthorizationPrintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const delegateId = searchParams.get('delegateId');

  const [order, setOrder] = useState<Order | null>(null);
  const [delegate, setDelegate] = useState<Delegate | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Fetch Order
      const orderRes = await fetch(`/api/admin/orders/${orderId}`);
      const orderData = await orderRes.json();

      // Fetch Delegates (we'll just fetch all and find one, simpler for now)
      const delegateRes = await fetch(`/api/admin/delegates`);
      const delegateData = await delegateRes.json();
      const selectedDelegate = delegateData.delegates.find((d: Delegate) => d.id === delegateId);

      // API returns { success: true, order: {...} }, so we need to extract the order
      const actualOrder = orderData.order || orderData;
      
      // Order data loaded successfully

      setOrder(actualOrder);
      setDelegate(selectedDelegate || null);

      // Auto print after data load (small delay to ensure rendering)
      if (actualOrder && selectedDelegate) {
          setTimeout(() => {
              window.print();
          }, 1000);
      }
    } catch (error) {
      // Error fetching data
    } finally {
      setLoading(false);
    }
  }, [orderId, delegateId]);

  useEffect(() => {
    if (orderId && delegateId) {
      fetchData();
    }
  }, [orderId, delegateId, fetchData]);

  if (loading) return <div className="flex justify-center p-12">جار تحميل البيانات...</div>;
  if (!order || !delegate) return <div className="flex justify-center p-12 text-red-500">بيانات غير مكتملة (تأكد من اختيار المندوب والطلب)</div>;

  return (
    <div className="bg-white min-h-screen text-black" style={{ direction: 'rtl' }}>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      `}</style>
      
      <div className="w-[210mm] mx-auto p-[10mm]">
        {/* Header - Logo Only (Top Right) */}
        <div className="flex justify-start mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/report-header.png" alt="Header Logo" className="h-44 object-contain" />
        </div>

        {/* Content */}
        <div>
            <h3 className="text-xl font-bold text-center mb-6">السادة / الإدارة العامة للجوازات والهجرة</h3>
            
            <p className="text-center font-bold mb-6">تحية طيبة وبعد ،،،</p>

            <div className="leading-loose text-justify font-medium text-lg mb-6">
                فوضنا نحن <span className="font-bold">البديل للخدمات الحكومية</span> / 
                <span className="font-bold mx-2 border-b border-black">{delegate.name}</span>
                مندوب البديل للخدمات الحكومية ويحمل رقم قومي 
                <span className="font-bold mx-2 ltr inline-block">({delegate.idNumber})</span>
                وكارنيه وزارة الاتصالات وتكنولوجيا المعلومات لـ <span className="font-bold">استخراج جواز سفر</span> بالنيابة عن المواطنين طالبي الخدمة المذكورين أدناه:
            </div>

            {/* Customer Table */}
            <table className="w-full mb-8 border-2 border-black text-center text-lg">
                <thead>
                    <tr className="bg-slate-100 border-b-2 border-black">
                        <th className="border-l-2 border-black py-2 px-4 w-12">م</th>
                        <th className="border-l-2 border-black py-2 px-4">الاسم</th>
                        <th className="py-2 px-4">الرقم القومي</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border-l-2 border-black border-t border-black py-3 font-bold">١</td>
                        <td className="border-l-2 border-black border-t border-black py-3 font-bold">{order.customerName}</td>
                        <td className="border-t border-black py-3 font-bold ltr">{order.idNumber || '---'}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        {/* Delegate Cards Section */}
        {/* Images compressed to fit single page */}
        <div className="grid grid-cols-2 gap-6 mt-6">
            <div className="space-y-3">
                 <div className="h-40 flex items-center justify-center">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     {delegate.idCardFront ? <img src={delegate.idCardFront} alt="ID Card Front" className="max-h-full max-w-full object-contain" /> : null}
                 </div>
                 <div className="h-40 flex items-center justify-center">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     {delegate.idCardBack ? <img src={delegate.idCardBack} alt="ID Card Back" className="max-h-full max-w-full object-contain" /> : null}
                 </div>
            </div>

            <div className="space-y-3">
                <div className="h-40 flex items-center justify-center">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     {delegate.unionCardFront ? <img src={delegate.unionCardFront} alt="Union Card Front" className="max-h-full max-w-full object-contain" /> : null}
                </div>
                 <div className="h-40 flex items-center justify-center">
                     {/* eslint-disable-next-line @next/next/no-img-element */}
                     {delegate.unionCardBack ? <img src={delegate.unionCardBack} alt="Union Card Back" className="max-h-full max-w-full object-contain" /> : null}
                </div>
            </div>
        </div>

        {/* Action Button (No Print) */}
        <div className="fixed top-4 left-4 no-print flex gap-2">
            <button onClick={() => window.print()} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-xl">
                🖨️ طباعة
            </button>
            <button onClick={() => window.close()} className="bg-slate-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 shadow-xl">
                إغلاق
            </button>
        </div>
      </div>
    </div>
  );
}
