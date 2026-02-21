'use client';

import { useEffect, useState } from 'react';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Print styles for landscape orientation
const printStyles = `
  @media print {
    @page {
      size: A5 landscape;
      margin: 0;
    }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      height: 148mm !important;
      overflow: hidden !important;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    
    /* Isolation technique: Hide everything by default */
    body * {
      visibility: hidden;
    }
    
    /* Show only the print container and its children */
    .print-landscape,
    .print-landscape * {
      visibility: visible;
    }
    
    .print-landscape {
      position: absolute;
      left: 6mm !important;
      top: 6mm !important;
      width: 198mm !important;
      height: 136mm !important;
      max-height: 136mm !important;
      margin: 0 !important;
      padding: 3mm !important;
      box-sizing: border-box !important;
      overflow: hidden !important;
      display: flex !important;
      flex-direction: column !important;
      background: white !important;
      border: 1px solid black !important;
    }

    /* Reset min-height for print */
    .min-h-screen {
      min-height: auto !important;
    }

    /* Aggressive spacing reduction */
    .mt-1, .mt-2, .mt-3, .mt-4, .mt-5, .mt-6, .mt-7, .mt-8 { margin-top: 1mm !important; }
    .mb-1, .mb-2, .mb-3, .mb-4 { margin-bottom: 0.5mm !important; }
    .pt-1, .pt-2, .pt-3, .pb-1, .pb-2, .pb-3 { padding-top: 1mm !important; padding-bottom: 1mm !important; }
    .p-1, .p-2, .p-3, .p-4, .p-6 { padding: 1mm !important; }
    
    .space-y-4 > * + * { margin-top: 1mm !important; }
    .space-y-1 > * + * { margin-top: 0.5mm !important; }
    
    /* Text size reduction for A5 */
    .text-xs { font-size: 8pt !important; }
    .text-sm { font-size: 9pt !important; }
    .text-base { font-size: 10pt !important; }
    .text-lg { font-size: 11pt !important; }
    .text-xl { font-size: 12pt !important; }
    
    h1, h2, h3 { font-size: 12pt !important; line-height: 1.1 !important; }
    
    /* Remove all non-essential backgrounds if not forced */
    .print-no-colors { background: white !important; }
    
    /* Table optimizations */
    .grid { gap: 0 !important; }
    .border { border-width: 0.5pt !important; }
    
    * {
      color: black !important;
    }
  }
`;

interface Order {
  id: string;
  service: { name: string; slug: string };
  variant: { name: string; priceCents: number } | null;
  customerName: string;
  customerPhone: string;
  address?: string;
  policeStation?: string | null;
  pickupLocation?: string | null;
  createdAt: string;
  totalCents: number;
  discount?: number | null;
  otherFees?: number | null;
  deliveryFee?: number | null;
  hasAttachments?: boolean | null;
  attachedDocuments?: string[];
  selectedFines?: string | null;
  finesDetails?: string | null;
  servicesDetails?: string | null;
  serviceDetails?: string | null;
  // New fields
  quantity?: number | null;
  deliveryDuration?: string | null;
  paidAmount?: number | null;
  remainingAmount?: number | null;
  createdByAdmin?: { name: string } | null;
}

export default function ReceiptPage() {
  const { id } = useParams() as { id: string };
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders/${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
          setTimeout(() => window.print(), 400);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return <div className='p-6'>جار التحميل…</div>;
  if (!order) return <div className='p-6'>لم يتم العثور على الطلب</div>;

  const isPassport =
    order.service?.slug === 'passports' || (order.service?.name || '').includes('جواز');

  const isNationalId =
    order.service?.slug === 'national-id' || (order.service?.name || '').includes('بطاقة');

  const format = (cents?: number | null) => ((cents || 0) / 100).toFixed(2);

  // Parse fines and services details
  const finesDetails = order.finesDetails ? JSON.parse(order.finesDetails) : [];
  const servicesDetails = order.servicesDetails ? JSON.parse(order.servicesDetails) : null;

  // Separate lost report from other fines
  const lostReport = finesDetails.find(
    (fine: any) =>
      fine.name &&
      (fine.name.toLowerCase().includes('محضر') || fine.name.toLowerCase().includes('فقد'))
  );

  const otherFines = finesDetails.filter(
    (fine: any) =>
      !fine.name ||
      (!fine.name.toLowerCase().includes('محضر') && !fine.name.toLowerCase().includes('فقد'))
  );

  // Calculate total fines amount (excluding lost report)
  const totalFinesAmount = otherFines.reduce((total: number, fine: any) => {
    return total + (fine.amount || 0);
  }, 0);

  // Calculate lost report amount
  const lostReportAmount = lostReport ? lostReport.amount || 0 : 0;

  // Calculate additional fees for fines (10 EGP per fine, excluding lost report)
  const calculateFineFees = () => {
    if (!finesDetails || finesDetails.length === 0) return 0;

    let fineFees = 0;
    finesDetails.forEach((fine: any) => {
      // Add 10 EGP for each fine that is not a lost report
      if (
        fine.name &&
        !fine.name.toLowerCase().includes('محضر') &&
        !fine.name.toLowerCase().includes('فقد')
      ) {
        fineFees += 1000; // 10 EGP in cents
      }
    });
    return fineFees;
  };

  const fineFees = calculateFineFees();

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      <div className='min-h-screen bg-neutral-200 p-6 print:p-0 print:bg-white' dir='rtl'>
        <div className='max-w-5xl mx-auto bg-white text-black shadow-lg print:shadow-none print-landscape border border-black'>
          {/* Top Header with logos - Minimalist B&W */}
          <div className='border-b border-black p-2 print:border-b-2'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-2 space-x-reverse'>
                <Image
                  src='/logo.jpg'
                  alt='البديل'
                  width={60}
                  height={40}
                  className='max-h-10 h-10 w-auto grayscale'
                />
                <div className='text-xs leading-4'>
                  <div className='font-black text-sm text-black'>البديل للخدمات الحكومية</div>
                  <div className='text-black text-[10px] font-bold opacity-70'>
                    بديلك لإنجاز أعمالك وخدماتك الحكومية
                  </div>
                </div>
              </div>

              <div className='flex flex-col items-center'>
                <Image
                  src='/images/egyptnisr.png'
                  alt='شعار'
                  width={40}
                  height={32}
                  className='mb-1 h-8 w-auto grayscale'
                />
                <div className='text-[9px] leading-3 text-center max-w-xs font-bold'>
                  طبقا لقرار رئيس مجلس الوزاراء رقم ١٥٥١ لستة ٢٠٠٨ بتصريح و ترخيص من وزارة الاتصالات
                  و تكنولوجيا المعلومات{' '}
                </div>
              </div>
            </div>
          </div>

          <div className='bg-gray-100 border-b border-black p-1 print:bg-gray-100'>
            <div className='flex items-center justify-between px-4'>
              <div className='text-[10px] font-black'>نسخة العميل أصل</div>
              <div className='border-2 border-black text-black px-3 py-0.5 font-black tracking-widest text-xs'>
                {order.id}
              </div>
              <div className='text-[10px] font-black'>إيصال خدمة حكومية</div>
            </div>
          </div>

          {/* Main Receipt Table - Forced B&W */}
          <div className='mt-1 border-x border-black overflow-hidden'>
            {/* Customer Information Section */}
            <div className='border-b border-black'>
              <div className='grid grid-cols-12 text-xs'>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  الاسم
                </div>
                <div className='col-span-4 border-l border-black p-1.5 font-bold'>
                  {order.customerName}
                </div>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  الخدمة
                </div>
                <div className='col-span-4 p-1.5 font-bold'>
                  {order.service?.name}
                  {order.variant?.name && ` (${order.variant.name})`}
                </div>
              </div>
              <div className='grid grid-cols-12 text-xs border-t border-black'>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  الهاتف
                </div>
                <div className='col-span-4 border-l border-black p-1.5 font-bold'>
                  {order.customerPhone}
                </div>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  التاريخ
                </div>
                <div className='col-span-4 p-1.5 font-bold'>
                  {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                </div>
              </div>
              {isPassport && (
                <div className='grid grid-cols-12 text-xs border-t border-black'>
                  <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                    القسم
                  </div>
                  <div className='col-span-4 border-l border-black p-1.5 font-bold'>
                    {order.policeStation || '—'}
                  </div>
                  <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                    الاستلام
                  </div>
                  <div className='col-span-4 p-1.5 font-bold'>{order.pickupLocation || '—'}</div>
                </div>
              )}
            </div>

            {/* Financial Information Section */}
            <div className='border-b border-black'>
              <div className='grid grid-cols-12 text-xs'>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  سعر الخدمة
                </div>
                <div className='col-span-4 border-l border-black p-1.5 font-black'>
                  {format(order.variant?.priceCents)} ج.م
                </div>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  رسوم التوصيل
                </div>
                <div className='col-span-4 p-1.5 font-black'>{format(order.deliveryFee)} ج.م</div>
              </div>
              <div className='grid grid-cols-12 text-xs border-t border-black'>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  غرامات
                </div>
                <div className='col-span-4 border-l border-black p-1.5 font-black'>
                  {format(totalFinesAmount)} ج.م
                </div>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  مصاريف أخرى
                </div>
                <div className='col-span-4 p-1.5 font-black'>
                  {format((order.otherFees || 0) + lostReportAmount)} ج.م
                </div>
              </div>
              {/* خانة الخصم - تظهر فقط لو كان هناك خصم */}
              {(order.discount || 0) > 0 && (
                <div className='grid grid-cols-12 text-xs border-t border-black bg-gray-50'>
                  <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                    خصم
                  </div>
                  <div className='col-span-4 border-l border-black p-1.5 font-black'>
                    - {format(order.discount)} ج.م
                  </div>
                  <div className='col-span-6 p-1.5 font-bold text-[9px] text-gray-600'>
                    تم تطبيق خصم على هذا الطلب
                  </div>
                </div>
              )}
              <div className='grid grid-cols-12 text-xs border-t border-black'>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  مدفوع
                </div>
                <div className='col-span-4 border-l border-black p-1.5 font-black'>
                  {format(order.paidAmount || 0)} ج.م
                </div>
                <div className='col-span-2 bg-gray-200 border-l border-black p-1.5 font-black'>
                  المتبقي
                </div>
                <div className='col-span-4 p-1.5 font-black'>
                  {format(order.remainingAmount || 0)} ج.م
                </div>
              </div>
              <div className='grid grid-cols-12 text-xs border-t border-black'>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  العدد
                </div>
                <div className='col-span-4 border-l border-black p-1.5 font-bold'>
                  {order.quantity || 1}
                </div>
                <div className='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  مدة التسليم
                </div>
                <div className='col-span-4 p-1.5 font-bold'>{order.deliveryDuration || '—'}</div>
              </div>
            </div>

            {/* Details Section */}
            <div className='border-b border-black p-2 bg-white'>
              <div className='text-[10px] font-black mb-1'>تفاصيل إضافية وإضافات:</div>
              <div className='flex flex-wrap gap-2 mb-2'>
                {finesDetails.map((f: any, i: number) => (
                  <span
                    key={i}
                    className='text-[10px] font-bold border border-black px-1.5 py-0.5 rounded'
                  >
                    {f.name}
                  </span>
                ))}
                {order.hasAttachments && (
                  <span className='text-[10px] font-black border-2 border-black px-1.5 py-0.5 rounded'>
                    ✓ تشمل مرفقات
                  </span>
                )}
              </div>
              {order.serviceDetails && (
                <div className='text-[9px] font-bold whitespace-pre-wrap border-t border-dotted border-black pt-1 leading-relaxed'>
                  {order.serviceDetails}
                </div>
              )}
            </div>

            {/* Total Section */}
            <div className='bg-gray-200 border-b border-black'>
              <div className='grid grid-cols-12 text-sm'>
                <div className='col-span-2 border-l border-black p-2 font-black'>الإجمالي</div>
                <div className='col-span-10 p-2 font-black text-lg text-left'>
                  {format((order.paidAmount || 0) + (order.remainingAmount || 0))} ج.م
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notes & Address */}
          <div className='mt-2 grid grid-cols-2 gap-4 px-4 text-[9px] leading-tight'>
            <div className='space-y-1'>
              <div className='font-black underline mb-1'>ملاحظات هامة:</div>
              <ol className='list-decimal pr-4 space-y-0.5 font-bold'>
                {isNationalId && (
                  <li className='font-black text-[10px]'>
                    تفاصيل التصوير: التصوير 9 صباحا فقط - سجل الهرم الدور الرابع (الدخول من اخر باب)
                    في الشارع الجانبى للسجل - دفع ١٥ج عند التصوير. واوقت الانتظار (ساعه) لفحص
                    ومراجعه الاستمارة من وقت وصولك للمندوب.
                  </li>
                )}
                <li>التعامل في استلام الخدمة بهذا الإيصال الأصلي فقط.</li>
                {!isNationalId && <li>المبلغ يشمل الرسوم الحكومية ومقابل أداء الخدمة.</li>}
                <li>لا تحتسب الإجازات الرسمية ضمن مدة الاستلام.</li>
                {isPassport && (
                  <li>
                    (جوازات السفر) يسلم الإيصال للعميل في اليوم التالي من تاريخ الإيصال على أن يقوم
                    العميل بالتوجه إلى إدارة الجوازات التابعة للعنوان المذكور ببطاقة الرقم القومي
                    لاستلام جواز السفر بشخصه.
                  </li>
                )}
              </ol>
            </div>
            <div className='text-center flex flex-col justify-center gap-1 border-r border-black font-bold'>
              <div>١٥ شارع صالح قناوي - تقاطع وليم ناشد - مدكور - فيصل</div>
              <div className='text-[10px] font-black mt-1'>٠١٠٢٢٠١١٨٧٧ / ٠١١٤٩٩٩٢٨٣٠</div>
              <div className='mt-1.5 border-t border-dashed border-gray-400 pt-1'>
                <div className='text-[9px] text-gray-600 font-bold'>زوروا موقعنا الإلكتروني</div>
                <div className='text-[10px] font-black tracking-tight'>🌐 albadel.com.eg</div>
              </div>
              <div className='mt-2 text-xs font-black pt-1'>
                أمين الخزينة: {order.createdByAdmin?.name || '—'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className='mt-4 text-center print:hidden'>
            <div className='flex justify-center space-x-4 space-x-reverse'>
              <Link
                href={`/admin/orders/${id}`}
                className='px-6 py-2 bg-black text-white rounded text-xs font-bold'
              >
                العودة للطلب
              </Link>
              <button
                onClick={() => window.print()}
                className='px-6 py-2 border-2 border-black font-black text-xs hover:bg-black hover:text-white transition-all'
              >
                طباعة الإيصال
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
