/* eslint-disable @next/next/no-img-element */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';


// Print styles for A5 landscape orientation
const printStyles = `
  @media print {
    @page {
      size: A4 portrait;
      margin: 0;
    }

    /* Target specific browser header/footer elements if possible usually margin 0 handles it */ 
    @page { margin: 0; }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    
    /* Hide specific Layout elements - Sidebar and Header */
    /* Sidebar has classes like 'fixed top-0 right-0 h-full ...' */
    header, 
    div.fixed.h-full.w-72, 
    div.fixed.h-full.w-80, 
    div.fixed.h-full.w-96,
    nav {
      display: none !important;
    }
    
    /* Reset Main Layout wrappers to be transparent and compact */
    .admin-panel, main {
      margin: 0 !important;
      padding: 0 !important;
      background: none !important;
      border: none !important;
      width: auto !important;
      height: auto !important;
      overflow: visible !important;
    }

    /* Fallback: Visibility hidden for everything else */
    body * {
      visibility: hidden;
    }
    
    /* Show only the print container and its children */
    .print-landscape,
    .print-landscape * {
      visibility: visible;
      display: block;
    }
    
    .print-landscape {
      position: absolute !important;
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
      z-index: 99999 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Strict Black & White Grid */
    .bg-gray-100 { background-color: #f3f4f6 !important; }
    .bg-gray-200 { background-color: #e5e7eb !important; }
    .bg-gray-50 { background-color: #f9fafb !important; }
    
    .border-black { border-color: black !important; }
    .border-b, .border-l, .border-t, .border-r, .border { border-width: 0.5pt !important; border-color: black !important; }
    
    * { color: black !important; }
    
    /* Hide scrollbars in print */
    ::-webkit-scrollbar { display: none; }

    /* Force hide elements */
    .no-print { display: none !important; }
  }
`;

interface Order {
  id: string;
  serviceName: string;
  variantName: string;
  priceCents: number;
  totalCents: number;
  paidAmount: number;
  remainingAmount: number;
  createdAt: string;
  status: string;
  notes: string;
  adminNotes: string;
  createdByAdmin: string | null;
  // البيانات المضافة
  quantity: number;
  deliveryDuration: string | null;
  discount: number;
  deliveryFee: number;
  otherFees: number;
  hasAttachments: boolean;
  attachedDocuments: string[];
  policeStation: string | null;
  pickupLocation: string | null;
  selectedFines: string | null;
  finesDetails: string | null;
  servicesDetails: string | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  idNumber: string;
  address: string;
}

interface Summary {
  totalOrders: number;
  totalAmount: number;
  totalPaid: number;
  totalRemaining: number;
  date: string;
}

export default function CollectiveReceiptPage() {
  const searchParams = useSearchParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const customerId = searchParams.get('customerId');
    const date = searchParams.get('date');
    const orderIds = searchParams.get('orderIds');

    if (customerId && date) {
      const cleanCustomerId = decodeURIComponent(customerId).trim();
      fetchCollectiveReceipt(cleanCustomerId, date, orderIds);
    } else {
      setError('معرف العميل والتاريخ مطلوبان');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchCollectiveReceipt = async (customerId: string, date: string, orderIds: string | null) => {
    try {
      let url = `/api/admin/collective-receipt?customerId=${customerId}&date=${date}`;
      if (orderIds) {
        url += `&orderIds=${orderIds}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setCustomer(data.customer);
        setOrders(data.orders);
        setSummary(data.summary);
      } else {
        if (response.status === 401) {
          setError('غير مصرح - يرجى تسجيل الدخول أولاً');
        } else {
          setError(data.error || 'خطأ في جلب البيانات');
        }
      }
    } catch (error) {
      setError('خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const format = (cents: number) => {
    return (cents / 100).toFixed(2);
  };
  
  const formatDeliveryDuration = (duration: string | null) => {
     if (!duration) return '—';
     if (!isNaN(Number(duration))) return `${duration} يوم`;
     return duration;
  };

  if (loading) return <div className='p-6 text-center'>جار التحميل...</div>;
  if (error) return <div className='p-6 text-center text-red-600 font-bold'>{error}</div>;

  // Determine special service types present in the orders
  const hasPassport = orders.some(o => o.serviceName.includes('جواز') || o.serviceName.toLowerCase().includes('passport'));
  const hasNationalId = orders.some(o => o.serviceName.includes('بطاقة') || o.serviceName.toLowerCase().includes('national') || o.serviceName.includes('قومي'));
  const onlyNationalId = orders.length > 0 && orders.every(o => o.serviceName.includes('بطاقة') || o.serviceName.toLowerCase().includes('national') || o.serviceName.includes('قومي'));

  // Calculate total fees across all orders for summary
  const totalFineFees = orders.reduce((sum, order) => {
    const fines = order.finesDetails ? JSON.parse(order.finesDetails) : [];
    const fineFees = fines.filter((f: any) => !f.name?.includes('محضر') && !f.name?.includes('فقد')).length * 1000;
    return sum + fineFees;
  }, 0);

  const finalTotalAmount = (summary?.totalAmount || 0) + totalFineFees;
  const finalRemaining = (summary?.totalRemaining || 0) + totalFineFees;

  // --- Dynamic Sizing Logic ---
  // If orders <= 5, use "Loose" mode (Bigger fonts, more padding)
  // If orders > 5, use "Compact" mode (Smaller fonts, tighter padding)
  const isCompact = orders.length > 5;

  const fontSizes = {
    headerTitle: isCompact ? 'text-sm' : 'text-lg',
    headerSub: isCompact ? 'text-[9px]' : 'text-xs',
    tableHeader: isCompact ? 'text-[8px]' : 'text-[10px]',
    tableRow: isCompact ? 'text-[8px]' : 'text-[10px]',
    summary: isCompact ? 'text-[9px]' : 'text-[11px]',
    footerNotes: isCompact ? 'text-[8px]' : 'text-[10px]',
    footerAddress: isCompact ? 'text-[7px]' : 'text-[9px]',
  };

  const spacing = {
    headerPad: isCompact ? 'p-1 mb-0.5' : 'p-2 mb-2',
    tablePad: isCompact ? 'p-0.5' : 'p-1.5',
    rowPad: isCompact ? 'p-0.5' : 'p-1.5',
    sectionGap: isCompact ? 'mb-0.5' : 'mb-2',
  };

  return (
    <div className='min-h-screen bg-gray-50 flex justify-center p-8 print:p-0 print:bg-white' dir='rtl'>
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />
      
      <div className={`w-[198mm] bg-white shadow-xl print:shadow-none print-landscape border border-black flex flex-col`}>
          
          {/* Header */}
          <div className={`border-b border-black ${spacing.headerPad} flex items-center justify-between`}>
              <div className='flex items-center space-x-2 space-x-reverse'>
                <img src='/logo.jpg' alt='البديل' style={{ height: 'auto' }} className={`grayscale ${isCompact ? 'w-10' : 'w-14'}`} />
                <div className='leading-tight'>
                  <div className={`font-black text-black ${isCompact ? 'text-xs' : 'text-sm'}`}>البديل للخدمات الحكومية</div>
                  <div className={`text-black font-bold opacity-70 ${isCompact ? 'text-[8px]' : 'text-[10px]'}`}>بديلك لإنجاز أعمالك وخدماتك الحكومية</div>
                </div>
              </div>
              
              <div className="text-center">
                 <h1 className={`font-black border-2 border-black px-3 py-0.5 ${fontSizes.headerTitle}`}>إيصال مجمع</h1>
                 <div className={`font-bold mt-0.5 ${fontSizes.headerSub}`}>تاريخ: {summary?.date ? new Date(summary.date).toLocaleDateString('ar-EG') : ''}</div>
              </div>

              <div className='flex flex-col items-center'>
                <img src='/images/egyptnisr.png' alt='شعار' style={{ height: 'auto' }} className={`mb-0.5 grayscale ${isCompact ? 'w-6' : 'w-8'}`} />
                <div className={`leading-3 text-center max-w-[120px] font-bold ${isCompact ? 'text-[7px]' : 'text-[9px]'}`}>
طبقا لقرار رئيس مجلس الوزاراء
رقم ١٥٥١ لستة ٢٠٠٨ بتصريح و ترخيص من وزارة الدولة للتنمية الادارية                </div>
              </div>
          </div>

          {/* Customer Info Grid */}
          <div className={`border border-black ${spacing.sectionGap} ${fontSizes.tableRow}`}>
             <div className='grid grid-cols-12 border-b border-black'>
                <div className={`col-span-2 bg-gray-100 border-l border-black font-black flex items-center ${spacing.tablePad}`}>الاسم</div>
                <div className={`col-span-4 border-l border-black font-bold ${spacing.tablePad}`}>{customer?.name}</div>
                <div className={`col-span-2 bg-gray-100 border-l border-black font-black flex items-center ${spacing.tablePad}`}>الهاتف</div>
                <div className={`col-span-4 font-bold ${spacing.tablePad}`}>{customer?.phone}</div>
             </div>
             <div className='grid grid-cols-12'>
                <div className={`col-span-2 bg-gray-100 border-l border-black font-black flex items-center ${spacing.tablePad}`}>الرقم القومي</div>
                <div className={`col-span-4 border-l border-black font-bold ${spacing.tablePad}`}>{customer?.idNumber}</div>
                <div className={`col-span-2 bg-gray-100 border-l border-black font-black flex items-center ${spacing.tablePad}`}>عدد الخدمات</div>
                <div className={`col-span-4 font-bold ${spacing.tablePad}`}>{summary?.totalOrders}</div>
             </div>
          </div>

          {/* Orders Table */}
          <div className='border border-black overflow-hidden flex flex-col'>
             {/* Table Header */}
             <div className={`grid grid-cols-12 bg-gray-100 border-b border-black font-black text-center ${fontSizes.tableHeader}`}>
                <div className='col-span-1 p-0.5 border-l border-black flex items-center justify-center'>#</div>
                <div className='col-span-2 p-0.5 border-l border-black flex items-center justify-center'>الخدمة</div>
                <div className='col-span-1 p-0.5 border-l border-black flex items-center justify-center'>العدد</div>
                <div className='col-span-1 p-0.5 border-l border-black flex items-center justify-center'>مدة</div>
                <div className='col-span-1 p-0.5 border-l border-black flex items-center justify-center'>سعر</div>
                <div className='col-span-1 p-0.5 border-l border-black flex items-center justify-center'>توصيل</div>
                <div className='col-span-1 p-0.5 border-l border-black flex items-center justify-center'>غرامات</div>
                <div className='col-span-1 p-0.5 border-l border-black flex items-center justify-center'>أخرى</div>
                <div className='col-span-1 p-0.5 border-l border-black flex items-center justify-center'>الخصم</div>
                <div className='col-span-1 p-0.5 border-l border-black flex items-center justify-center'>مدفوع</div>
                <div className='col-span-1 p-0.5 flex items-center justify-center'>متبقي</div>
             </div>

             {/* Table Body */}
             <div className='flex-1 overflow-auto bg-white'>
                {orders.map((order, idx) => {
                   const fines = order.finesDetails ? JSON.parse(order.finesDetails) : [];
                   const servicesDetails = order.servicesDetails ? JSON.parse(order.servicesDetails) : {};
                   
                   const lostReport = fines.find((f: any) => f.name?.includes('محضر') || f.name?.includes('فقد'));
                   const otherFines = fines.filter((f: any) => !f.name?.includes('محضر') && !f.name?.includes('فقد'));

                   const totalFinesAmount = otherFines.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
                   const fineFees = otherFines.length * 1000;
                   const lostReportAmount = lostReport ? lostReport.amount || 0 : 0;
                   
                   const totalOtherFees = (order.otherFees || 0) + fineFees + lostReportAmount;
                   const finalRemaining = order.remainingAmount + fineFees;

                   return (
                      <div key={order.id} className={`grid grid-cols-12 border-b border-black last:border-b-0 ${fontSizes.tableRow}`}>
                         <div className={`col-span-1 border-l border-black text-center font-bold flex items-center justify-center bg-gray-50 ${spacing.rowPad}`}>{idx + 1}</div>
                         <div className={`col-span-2 border-l border-black font-bold flex flex-col justify-center ${spacing.rowPad}`}>
                            <span>{order.serviceName}</span>
                            {order.variantName && <span className={`font-normal opacity-80 ${isCompact ? 'text-[7px]' : 'text-[9px]'}`}>{order.variantName}</span>}
                            {fines.length > 0 && (
                               <div className="flex flex-wrap gap-1 mt-0.5">
                                 {fines.map((f: any, i: number) => (
                                    <span key={i} className={`border border-black rounded-[2px] px-0.5 ${isCompact ? 'text-[6px]' : 'text-[8px]'}`}>{f.name}</span>
                                 ))}
                               </div>
                            )}
                         </div>
                         <div className={`col-span-1 border-l border-black text-center font-bold flex items-center justify-center ${spacing.rowPad}`}>{order.quantity}</div>
                         <div className={`col-span-1 border-l border-black text-center font-bold flex items-center justify-center ${spacing.rowPad}`}>{formatDeliveryDuration(order.deliveryDuration)}</div>
                         <div className={`col-span-1 border-l border-black text-center font-bold flex items-center justify-center ${spacing.rowPad}`}>{format(order.priceCents || order.totalCents)}</div>
                         <div className={`col-span-1 border-l border-black text-center font-bold flex items-center justify-center ${spacing.rowPad}`}>{format(order.deliveryFee)}</div>
                         <div className={`col-span-1 border-l border-black text-center font-bold flex items-center justify-center text-red-600 ${spacing.rowPad}`}>{format(totalFinesAmount)}</div>
                         <div className={`col-span-1 border-l border-black text-center font-bold flex items-center justify-center ${spacing.rowPad}`}>{format(totalOtherFees)}</div>
                         <div className={`col-span-1 border-l border-black text-center font-bold flex items-center justify-center ${spacing.rowPad}`}>{format(order.discount)}</div>
                         <div className={`col-span-1 border-l border-black text-center font-bold flex items-center justify-center ${spacing.rowPad}`}>{format(order.paidAmount)}</div>
                         <div className={`col-span-1 text-center font-black flex items-center justify-center bg-gray-50 ${spacing.rowPad}`}>{format(finalRemaining)}</div>
                      </div>
                   );
                })}
             </div>
             
             {/* Total Row */}
             <div className={`grid grid-cols-12 bg-gray-200 border-t border-black font-black ${fontSizes.summary}`}>
                <div className={`col-span-8 border-l border-black text-left pl-4 ${spacing.tablePad}`}>الإجمالي الكلي</div>
                <div className={`col-span-1 border-l border-black text-center ${spacing.tablePad}`}>{format(finalTotalAmount)}</div>
                <div className={`col-span-1 border-l border-black text-center ${spacing.tablePad}`}>—</div>
                <div className={`col-span-1 border-l border-black text-center ${spacing.tablePad}`}>{format(summary?.totalPaid || 0)}</div>
                <div className={`col-span-1 text-center ${spacing.tablePad}`}>{format(finalRemaining)}</div>
             </div>
          </div>

          {/* Footer Notes */}
          <div className={`flex border-t border-black pt-1 ${isCompact ? 'mt-0.5' : 'mt-2'}`}>
             <div className='flex-1 pr-2'>
                <div className={`font-black underline ${fontSizes.footerNotes} ${isCompact ? 'mb-0' : 'mb-1'}`}>ملاحظات هامة:</div>
                <ol className={`list-decimal pr-4 font-bold ${fontSizes.footerNotes} ${isCompact ? 'space-y-0' : 'space-y-0.5'}`}>
                   {hasNationalId && (
                      <li className="font-black">
                         تفاصيل التصوير: التصوير 9 صباحا فقط - سجل الهرم الدور الرابع (الدخول من اخر باب) في الشارع الجانبى للسجل - دفع ١٥ج عند التصوير. واوقت الانتظار (ساعه) لفحص ومراجعه الاستمارة من وقت وصولك للمندوب.
                      </li>
                   )}
                   <li>التعامل في استلام الخدمة بهذا الإيصال الأصلي فقط.</li>
                   {!onlyNationalId && (
                      <li>المبلغ يشمل الرسوم الحكومية ومقابل أداء الخدمة.</li>
                   )}
                   <li>لا تحتسب الإجازات الرسمية ضمن مدة الاستلام.</li>
                   <li>في حالة فقد الإيصال لا يحق للعميل استرداد أي مبالغ مدفوعة.</li>
                   {hasPassport && (
                      <li>
                        (جوازات السفر) يسلم الإيصال للعميل في اليوم التالي من تاريخ الإيصال على أن يقوم العميل بالتوجه إلى إدارة الجوازات التابعة للعنوان المذكور ببطاقة الرقم القومي لاستلام جواز السفر بشخصه.
                      </li>
                   )}
                </ol>
             </div>
             <div className='w-1/3 text-center border-r border-black font-bold flex flex-col justify-center py-1'>
                 <div className={fontSizes.footerAddress}>١٥ شارع صالح قناوي - تقاطع وليم ناشد - مدكور - فيصل</div>
                 <div className={`${fontSizes.footerAddress} font-black mt-0.5`}>٠١٠٢٢٠١١٨٧٧ / ٠١١٤٩٩٩٢٨٣٠</div>
                 <div className={`mt-1 font-black bg-gray-100 border border-black px-2 ${fontSizes.footerAddress} ${isCompact ? 'py-0' : 'py-1'}`}>
                    أمين الخزينة: {orders[0]?.createdByAdmin || '—'}
                 </div>
             </div>
          </div>

          {/* Print Button */}
          <div className='mt-2 text-center print:hidden no-print pb-2'>
             <button
               onClick={() => window.print()}
               className='px-8 py-2 border-2 border-black font-black text-xs hover:bg-black hover:text-white transition-all transform hover:scale-105 shadow-lg'
             >
               طباعة الإيصال
             </button>
          </div>
      </div>
    </div>
  );
}
