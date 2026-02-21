'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Order } from '../../orders/types';
import Image from 'next/image';

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

  // Image Loading State
  const [imagesLoaded, setImagesLoaded] = useState(0);
  const [totalImages, setTotalImages] = useState(1); // Start with 1 for header
  const [isReadyToPrint, setIsReadyToPrint] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      // Fetch Order
      const orderRes = await fetch(`/api/admin/orders/${orderId}`);
      const orderData = await orderRes.json();

      // Fetch Delegates (we'll just fetch all and find one, simpler for now)
      const delegateRes = await fetch(`/api/admin/delegates`, { cache: 'no-store' });
      const delegateData = await delegateRes.json();
      const selectedDelegate = delegateData.delegates.find((d: Delegate) => d.id === delegateId);

      // API returns { success: true, order: {...} }, so we need to extract the order
      const actualOrder = orderData.order || orderData;

      // Order data loaded successfully
      setOrder(actualOrder);
      setDelegate(selectedDelegate || null);

      if (selectedDelegate) {
        let count = 1; // Header
        if (selectedDelegate.idCardFront) count++;
        if (selectedDelegate.idCardBack) count++;
        if (selectedDelegate.unionCardFront) count++;
        if (selectedDelegate.unionCardBack) count++;
        setTotalImages(count);
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

  const handleImageLoad = () => {
    setImagesLoaded(prev => prev + 1);
  };

  useEffect(() => {
    if (!loading && order && delegate) {
      // If all images loaded OR 3 seconds passed (fallback)
      if (imagesLoaded >= totalImages) {
        // Small delay to ensure rendering
        setTimeout(() => {
          // window.print(); // Auto-print disabled
        }, 500);
      }
    }
  }, [imagesLoaded, totalImages, loading, order, delegate]);

  // Fallback timeout in case images fail to load
  useEffect(() => {
    if (!loading && order && delegate) {
      const timer = setTimeout(() => {
        // window.print(); // Auto-print disabled
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [loading, order, delegate]);

  if (loading) return <div className='flex justify-center p-12'>جار تحميل البيانات...</div>;
  if (!order || !delegate)
    return (
      <div className='flex justify-center p-12 text-red-500'>
        بيانات غير مكتملة (تأكد من اختيار المندوب والطلب)
      </div>
    );

  return (
    <div className='bg-white text-black' style={{ direction: 'rtl' }}>
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            background: white;
            color: #000;
          }
          .no-print {
            display: none;
          }
          ::-webkit-scrollbar {
            display: none;
          }
        }

        /* Premium Ornate Frame */
        .premium-frame {
          position: fixed;
          top: 0mm;
          bottom: 0mm;
          left: 0mm;
          right: 0mm;
          border: 2px solid #000;
          pointer-events: none;
          z-index: 9999;
        }

        .premium-frame::after {
          content: '';
          position: absolute;
          top: 0mm;
          bottom: 0mm;
          left: 0mm;
          right: 0mm;
          border: 1px dashed #000;
          opacity: 0.5;
        }

        .corner {
          position: absolute;
          width: 50px;
          height: 50px;
          z-index: 10000;
        }

        .corner-tl {
          top: -1px;
          left: -1px;
        }
        .corner-tr {
          top: -1px;
          right: -1px;
          transform: scaleX(-1);
        }
        .corner-bl {
          bottom: -1px;
          left: -1px;
          transform: scaleY(-1);
        }
        .corner-br {
          bottom: -1px;
          right: -1px;
          transform: scale(-1);
        }

        .ornate-svg {
          width: 100%;
          height: 100%;
          fill: #000;
        }
      `}</style>

      {/* Premium Ornate Frame Overlay */}
      <div className='premium-frame'>
        {/* Top Left Corner */}
        <div className='corner corner-tl'>
          <svg className='ornate-svg' viewBox='0 0 100 100'>
            <path d='M0,0 L100,0 C100,55 55,100 0,100 Z' />
            <path d='M10,10 L80,10 C80,45 45,80 10,80 Z' fill='none' stroke='#000' strokeWidth='2' />
            <circle cx='30' cy='30' r='5' fill='#fff' stroke='#000' strokeWidth='2' />
          </svg>
        </div>
        {/* Top Right Corner */}
        <div className='corner corner-tr'>
          <svg className='ornate-svg' viewBox='0 0 100 100'>
            <path d='M0,0 L100,0 C100,55 55,100 0,100 Z' />
            <path d='M10,10 L80,10 C80,45 45,80 10,80 Z' fill='none' stroke='#000' strokeWidth='2' />
            <circle cx='30' cy='30' r='5' fill='#fff' stroke='#000' strokeWidth='2' />
          </svg>
        </div>
        {/* Bottom Left Corner */}
        <div className='corner corner-bl'>
          <svg className='ornate-svg' viewBox='0 0 100 100'>
            <path d='M0,0 L100,0 C100,55 55,100 0,100 Z' />
            <path d='M10,10 L80,10 C80,45 45,80 10,80 Z' fill='none' stroke='#000' strokeWidth='2' />
            <circle cx='30' cy='30' r='5' fill='#fff' stroke='#000' strokeWidth='2' />
          </svg>
        </div>
        {/* Bottom Right Corner */}
        <div className='corner corner-br'>
          <svg className='ornate-svg' viewBox='0 0 100 100'>
            <path d='M0,0 L100,0 C100,55 55,100 0,100 Z' />
            <path d='M10,10 L80,10 C80,45 45,80 10,80 Z' fill='none' stroke='#000' strokeWidth='2' />
            <circle cx='30' cy='30' r='5' fill='#fff' stroke='#000' strokeWidth='2' />
          </svg>
        </div>
      </div>

      <div className='w-[210mm] mx-auto p-[10mm]'>
        <div className='flex justify-start relative -mt-32 -mb-8 h-[180px]'>
          <Image
            src='/images/report-header.png'
            alt='Header Logo'
            width={400}
            height={400}
            className='w-[400px] h-auto object-cover object-left-top'
            onLoad={handleImageLoad}
            onError={handleImageLoad} // Count as loaded even if error to avoid hanging
          />
        </div>

        {/* Content */}
        <div className='mt-8'>
          <h3 className='text-xl flex font-bold text-center mb-6 justify-center'>
            السادة / الإدارة العامة للجوازات والهجرة
          </h3>

          <p className='text-center font-bold mb-6'>تحية طيبة وبعد ،،،</p>

          <div className='leading-loose text-justify text-xl font-bold bg-gray-50 p-6 rounded-xl border border-gray-200 mb-6'>
            أقر أنا /{' '}
            <span className='text-blue-900 mx-1 font-black text-2xl border-b-2 border-dashed border-gray-400 px-2'>
              {delegate.name}
            </span>{' '}
            مفوض البديل للخدمات الحكومية (رقم قومي:{' '}
            <span className='font-black ltr inline-block text-blue-900'>{delegate.idNumber}</span>
            ) وكارنيه وزارة الاتصالات وتكنولوجيا المعلومات، بأنه تم تفويضي من قبل أصحاب الشأن لاستخراج{' '}
            <span className='text-blue-900 font-black text-2xl'>جواز سفر</span> بالنيابة عن المواطنين طالبي الخدمة
            المذكورين أدناه، وهذا إقرار مني بذلك.
          </div>

          {/* Customer Table */}
          <table className='w-full mb-8 border-2 border-black text-center text-lg'>
            <thead>
              <tr className='bg-slate-100 border-b-2 border-black'>
                <th className='border-l-2 border-black py-2 px-4 w-12'>م</th>
                <th className='border-l-2 border-black py-2 px-4'>الاسم</th>
                <th className='py-2 px-4'>الرقم القومي</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className='border-l-2 border-black border-t border-black py-3 font-bold'>١</td>
                <td className='border-l-2 border-black border-t border-black py-3 font-bold'>
                  {order.customerName}
                </td>
                <td className='border-t border-black py-3 font-bold ltr'>
                  {order.idNumber || '---'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Delegate Cards Section */}
        {/* Images compressed to fit single page */}
        <div className='grid grid-cols-2 gap-6 mt-6'>
          <div className='space-y-3'>
            <div className='h-40 flex items-center justify-center'>
             
              {delegate.idCardFront ? (
                <Image
                  src={delegate.idCardFront}
                  alt='ID Card Front'
                  width={400}
                  height={160}
                  unoptimized
                  className='max-h-full max-w-full object-contain'
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              ) : null}
            </div>
            <div className='h-40 flex items-center justify-center'>
             
              {delegate.idCardBack ? (
                <Image
                  src={delegate.idCardBack}
                  alt='ID Card Back'
                  width={400}
                  height={160}
                  unoptimized
                  className='max-h-full max-w-full object-contain'
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              ) : null}
            </div>
          </div>

          <div className='space-y-3'>
            <div className='h-40 flex items-center justify-center'>
             
              {delegate.unionCardFront ? (
                <Image
                  src={delegate.unionCardFront}
                  alt='Union Card Front'
                  width={400}
                  height={160}
                  unoptimized
                  className='max-h-full max-w-full object-contain'
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              ) : null}
            </div>
            <div className='h-40 flex items-center justify-center'>
             
              {delegate.unionCardBack ? (
                <Image
                  src={delegate.unionCardBack}
                  alt='Union Card Back'
                  width={400}
                  height={160}
                  unoptimized
                  className='max-h-full max-w-full object-contain'
                  onLoad={handleImageLoad}
                  onError={handleImageLoad}
                />
              ) : null}
            </div>
          </div>
        </div>

        {/* Action Button (No Print) */}
        <div className='fixed top-4 left-4 no-print flex gap-2'>
          <button
            onClick={() => window.print()}
            className='bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-xl'
          >
            🖨️ طباعة
          </button>
          <button
            onClick={() => window.close()}
            className='bg-slate-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-700 shadow-xl'
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
