'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Print styles for A4 landscape orientation
const printStyles = `
  @media print {
    @page {
      size: A4 landscape;
      margin: 0.2in;
    }
    
    body {
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
    
    .print-landscape {
      width: 100%;
      max-width: none;
    }
    
    /* Remove colors for print */
    .print-no-colors {
      background: white !important;
      color: black !important;
    }
    
    .print-no-bg {
      background: transparent !important;
    }
    
    /* Print table styling for better contrast */
    .print-table-header {
      background: #f5f5f5 !important;
      color: black !important;
      font-weight: bold !important;
    }
    
    .print-table-cell {
      background: white !important;
      color: black !important;
      border: 1px solid #333 !important;
    }
    
    .print-total-section {
      background: #e5e5e5 !important;
      color: black !important;
      font-weight: bold !important;
    }
    
    /* Force all colors to black for print */
    * {
      color: black !important;
    }
    
    /* Override specific colored elements */
    .bg-blue-100, .bg-green-100, .bg-red-100, .bg-yellow-100, .bg-purple-100, .bg-orange-100, .bg-indigo-100, .bg-teal-100 {
      background: #f5f5f5 !important;
    }
    
    .bg-blue-200, .bg-green-200, .bg-red-200, .bg-yellow-200, .bg-purple-200, .bg-orange-200, .bg-indigo-200, .bg-teal-200 {
      background: #e5e5e5 !important;
    }
    
    .bg-blue-500, .bg-yellow-500 {
      background: #d0d0d0 !important;
    }
  }
`;

interface Order {
  id: string;
  serviceName: string;
  variantName: string;
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

  // Dynamic scaling based on number of orders

  const getPaddingClass = (orderCount: number) => {
    if (orderCount <= 2) return 'p-1';
    if (orderCount <= 3) return 'p-1';
    if (orderCount <= 4) return 'p-1';
    if (orderCount <= 5) return 'p-0.5';
    if (orderCount <= 6) return 'p-0.5';
    if (orderCount <= 7) return 'p-0.5';
    if (orderCount <= 8) return 'p-0.5';
    return 'p-0.5';
  };

  const getMarginClass = (orderCount: number) => {
    if (orderCount <= 2) return 'mt-0';
    if (orderCount <= 3) return 'mt-0';
    if (orderCount <= 4) return 'mt-0';
    if (orderCount <= 5) return 'mt-0';
    if (orderCount <= 6) return 'mt-0';
    if (orderCount <= 7) return 'mt-0';
    if (orderCount <= 8) return 'mt-0';
    return 'mt-0';
  };

  useEffect(() => {
    const customerId = searchParams.get('customerId');
    const date = searchParams.get('date');

    if (customerId && date) {
      // Decode and clean the customer ID
      const cleanCustomerId = decodeURIComponent(customerId).trim();

      fetchCollectiveReceipt(cleanCustomerId, date);
    } else {
      setError('معرف العميل والتاريخ مطلوبان');
      setLoading(false);
    }
  }, [searchParams]);

  const fetchCollectiveReceipt = async (customerId: string, date: string) => {
    try {
      const url = `/api/admin/collective-receipt?customerId=${customerId}&date=${date}`;

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG');
  };

  const formatDeliveryDuration = (duration: string | null) => {
    if (!duration) return 'غير محدد';

    // If it's a number, assume it's days
    if (!isNaN(Number(duration))) {
      return `${duration} يوم`;
    }

    // If it contains common duration keywords, format them
    if (duration.toLowerCase().includes('day') || duration.toLowerCase().includes('يوم')) {
      return duration;
    }

    return duration;
  };

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto'></div>
          <p className='mt-4 text-gray-600'>جاري تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='text-center'>
          <div className='text-red-600 text-6xl mb-4'>⚠️</div>
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>خطأ</h1>
          <p className='text-gray-600 mb-4'>{error}</p>
          {error.includes('غير مصرح') && (
            <a
              href='/login'
              className='inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors'
            >
              تسجيل الدخول
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Print Styles */}
      <style dangerouslySetInnerHTML={{ __html: printStyles }} />

      {/* Receipt Content */}
      <div
        className={`print-landscape max-w-6xl mx-auto bg-white shadow-lg print-no-colors ${getPaddingClass(orders.length)}`}
      >
        {/* Top Header with logos and receipt number */}
        <div className='bg-gradient-to-r from-blue-600 to-blue-800 text-white p-1 print:bg-white print:text-black print:p-0 print-no-colors'>
          <div className='flex items-center justify-between'>
            {/* Left side - Al-Badil logo with text */}
            <div className='flex items-center space-x-2 space-x-reverse'>
              <Image
                src='/logo.jpg'
                alt='البديل'
                width={100}
                height={48}
                className='h-12 w-auto print:h-6'
              />
              <div className='text-xs leading-4'>
                <div className='font-bold text-sm text-black print:text-xs'>
                  البديل للخدمات الحكومية
                </div>
                <div className='text-black text-xs print:text-xs'>
                  بديلك لإنجاز أعمالك وخدماتك الحكومية
                </div>
              </div>
            </div>

            {/* Right side - egyptnisr logo with text below */}
            <div className='flex flex-col items-center'>
              <Image
                src='/images/egyptnisr.png'
                alt='شعار'
                width={100}
                height={32}
                className='h-8 w-auto mb-1 print:h-6'
              />
              <div className='text-xs leading-3 text-center max-w-xs'>
                <div className='font-bold text-xs text-black'>طبقا لقرار رئيس مجلس الوزاراء</div>
                <div className='text-black text-xs'>
                  رقم ١٥٥١ لسنة ٢٠٠٨ بتصريح وترخيص من وزارة الدولة للتنمية الادارية
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-yellow-50 border-b-2 border-yellow-400 p-1 print:bg-white print:border-gray-300 print:p-0 print-no-colors'>
          <div className='flex items-center justify-between'>
            <div className='text-xs font-bold text-gray-700 print:text-black'>نسخة العميل أصل</div>
            <div className='bg-yellow-400 text-black px-2 py-1 rounded font-bold tracking-widest text-xs print:bg-gray-200 print:text-black'>
              إيصال مجمع
            </div>
            <div className='text-xs font-bold text-gray-800 print:text-black'>
              إيصال خدمة حكومية
            </div>
          </div>
        </div>

        <div className='text-center py-2 border-b border-gray-300'>
          <h1 className='text-xl font-bold text-gray-800 print:text-lg'>إيصال مجمع للعميل</h1>
          <div className='text-sm text-gray-600 print:text-xs'>
            تاريخ: {summary && formatDate(summary.date)}
          </div>
        </div>

        {/* Customer Info */}
        <div className='mb-4'>
          <div className='grid grid-cols-12 text-xs'>
            <div className='col-span-2 bg-blue-100 border-l border-b border-gray-300 p-1 font-bold text-blue-800 print-table-header'>
              الاسم
            </div>
            <div className='col-span-4 border-b border-gray-300 p-1 font-bold text-blue-700 print-table-cell'>
              {customer?.name}
            </div>
            <div className='col-span-2 bg-green-100 border-l border-b border-gray-300 p-1 font-bold text-green-800 print-table-header'>
              الهاتف
            </div>
            <div className='col-span-4 border-b border-gray-300 p-1 font-bold text-green-700 print-table-cell'>
              {customer?.phone}
            </div>
          </div>
          <div className='grid grid-cols-12 text-xs'>
            <div className='col-span-2 bg-orange-100 border-l border-b border-gray-300 p-1 font-bold text-orange-800 print-table-header'>
              الرقم القومي
            </div>
            <div className='col-span-4 border-b border-gray-300 p-1 font-bold text-orange-700 print-table-cell'>
              {customer?.idNumber}
            </div>
            <div className='col-span-2 bg-purple-100 border-l border-b border-gray-300 p-1 font-bold text-purple-800 print-table-header'>
              العنوان
            </div>
            <div className='col-span-4 border-b border-gray-300 p-1 font-bold text-purple-700 print-table-cell'>
              {customer?.address}
            </div>
          </div>
        </div>

        {/* Orders List - Compact Design */}
        <div className={`${getMarginClass(orders.length)}`}>
          {/* Orders Table Header */}
          <div className='border border-gray-300 rounded overflow-hidden'>
            <div className='bg-gray-100 border-b border-gray-300'>
              <div className={`grid grid-cols-12 font-bold text-xs`}>
                <div className='col-span-1 p-0.5 text-center text-xs'>#</div>
                <div className='col-span-2 p-0.5 text-xs'>الخدمة</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>العدد</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>السعر</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>التوصيل</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>مدة التسليم</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>الغرامات</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>مصاريف أخرى</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>الخصم</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>المدفوع</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>المتبقي</div>
                <div className='col-span-1 p-0.5 text-center text-xs'>المرفقات</div>
              </div>
            </div>

            {/* Orders Rows */}
            <div className='bg-white'>
              {orders.map((order, index) => {
                // Parse fines and services details
                const finesDetails = order.finesDetails ? JSON.parse(order.finesDetails) : [];
                const servicesDetails = order.servicesDetails
                  ? JSON.parse(order.servicesDetails)
                  : {};

                // Calculate fines amount
                const totalFinesAmount = finesDetails.reduce(
                  (sum: number, fine: any) => sum + (fine.amount || 0),
                  0
                );

                // Calculate other fees (including 10 EGP for each fine)
                const fineFees =
                  finesDetails.filter(
                    (fine: any) =>
                      !fine.name?.toLowerCase().includes('محضر') &&
                      !fine.name?.toLowerCase().includes('فقد')
                  ).length * 1000; // 10 EGP in cents

                const lostReportAmount =
                  finesDetails.find(
                    (fine: any) =>
                      fine.name?.toLowerCase().includes('محضر') ||
                      fine.name?.toLowerCase().includes('فقد')
                  )?.amount || 0;

                const totalOtherFees = (order.otherFees || 0) + fineFees + lostReportAmount;

                // Check if passport service
                const isPassport =
                  order.serviceName.toLowerCase().includes('جواز') ||
                  order.serviceName.toLowerCase().includes('passport');

                // Check if there are any service details to show
                const hasServiceDetails =
                  finesDetails.length > 0 ||
                  (servicesDetails.fineExpenses && servicesDetails.fineExpenses.amount > 0) ||
                  (servicesDetails.manualServices && servicesDetails.manualServices.length > 0) ||
                  (servicesDetails.otherFees && servicesDetails.otherFees > 0);

                return (
                  <div key={order.id} className='border-b border-gray-200 last:border-b-0'>
                    <div className={`grid grid-cols-12 text-xs`}>
                      <div className='col-span-1 p-0.5 text-center font-bold text-blue-800 text-xs'>
                        {index + 1}
                      </div>
                      <div className='col-span-2 p-0.5'>
                        <div className='flex items-center gap-1'>
                          <div className='font-bold text-blue-700 text-xs'>{order.serviceName}</div>
                          {hasServiceDetails && (
                            <div className='flex flex-wrap gap-0.5'>
                              {finesDetails.map((fine: any, fineIndex: number) => (
                                <span
                                  key={fineIndex}
                                  className='text-xs font-medium text-purple-700 bg-purple-100 px-0.5 py-0.5 rounded'
                                >
                                  {fine.name?.includes('محضر') || fine.name?.includes('فقد')
                                    ? 'فقد'
                                    : fine.name}
                                </span>
                              ))}
                              {servicesDetails.fineExpenses &&
                                servicesDetails.fineExpenses.amount > 0 && (
                                  <span className='text-xs font-medium text-purple-700 bg-purple-100 px-0.5 py-0.5 rounded'>
                                    مصاريف الغرامات: {format(servicesDetails.fineExpenses.amount)}
                                  </span>
                                )}
                              {servicesDetails.manualServices &&
                                servicesDetails.manualServices.length > 0 && (
                                  <>
                                    {servicesDetails.manualServices.map(
                                      (service: any, serviceIndex: number) => (
                                        <span
                                          key={serviceIndex}
                                          className='text-xs font-medium text-purple-700 bg-purple-100 px-0.5 py-0.5 rounded'
                                        >
                                          {service.name}: {format(service.amount)}
                                        </span>
                                      )
                                    )}
                                  </>
                                )}
                              {servicesDetails.otherFees && servicesDetails.otherFees > 0 && (
                                <span className='text-xs font-medium text-purple-700 bg-purple-100 px-0.5 py-0.5 rounded'>
                                  مصاريف إضافية: {format(servicesDetails.otherFees)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {order.variantName && (
                          <div className='text-xs text-gray-600'>{order.variantName}</div>
                        )}
                        {isPassport && order.policeStation && (
                          <div className='text-xs text-gray-600'>قسم: {order.policeStation}</div>
                        )}
                        {isPassport && order.pickupLocation && (
                          <div className='text-xs text-gray-600'>
                            استلام: {order.pickupLocation}
                          </div>
                        )}
                      </div>
                      <div className='col-span-1 p-0.5 text-center font-bold text-yellow-700 text-xs'>
                        {order.quantity}
                      </div>
                      <div className='col-span-1 p-0.5 text-center font-bold text-orange-700 text-xs'>
                        {format(order.totalCents)}
                      </div>
                      <div className='col-span-1 p-0.5 text-center font-bold text-purple-700 text-xs'>
                        {format(order.deliveryFee)}
                      </div>
                      <div className='col-span-1 p-0.5 text-center font-bold text-teal-700 text-xs'>
                        {formatDeliveryDuration(order.deliveryDuration)}
                      </div>
                      <div className='col-span-1 p-0.5 text-center font-bold text-red-700 text-xs'>
                        {format(totalFinesAmount)}
                      </div>
                      <div className='col-span-1 p-0.5 text-center font-bold text-red-700 text-xs'>
                        {format(totalOtherFees)}
                      </div>
                      <div className='col-span-1 p-0.5 text-center font-bold text-yellow-700 text-xs'>
                        {format(order.discount)}
                      </div>
                      <div className='col-span-1 p-0.5 text-center font-bold text-green-700 text-xs'>
                        {format(order.paidAmount)}
                      </div>
                      <div className='col-span-1 p-0.5 text-center font-bold text-indigo-700 text-xs'>
                        {format(order.remainingAmount)}
                      </div>
                      <div className='col-span-1 p-0.5 text-center text-xs'>
                        {order.hasAttachments ? (
                          <div>
                            <span className='text-green-600 font-bold'>✓</span>
                            {order.attachedDocuments && order.attachedDocuments.length > 0 && (
                              <div className='mt-1 text-xs text-gray-700'>
                                {order.attachedDocuments.map((doc: string, docIndex: number) => (
                                  <div
                                    key={docIndex}
                                    className='text-xs text-blue-800 bg-blue-100 px-1 py-0.5 rounded mb-0.5'
                                  >
                                    {doc}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className='text-gray-400'>لا</span>
                        )}
                      </div>
                    </div>

                    {/* ملاحظات */}
                    {order.notes && (
                      <div className='bg-yellow-50 border-t border-gray-200'>
                        <div className='p-0.5'>
                          <div className='text-xs font-bold text-gray-700'>
                            ملاحظات: {order.notes}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className={`border-t-2 border-gray-300 ${getMarginClass(orders.length)}`}>
            <h2
              className={`font-bold text-gray-800 print:text-sm ${getMarginClass(orders.length)} text-xs`}
            >
              الملخص المالي
            </h2>
            <div className={`grid grid-cols-12 text-xs`}>
              <div className='col-span-2 bg-blue-100 border-l border-b border-gray-300 p-1 font-bold text-blue-800 print-table-header'>
                عدد الطلبات
              </div>
              <div className='col-span-4 border-b border-gray-300 p-1 font-bold text-blue-700 print-table-cell'>
                {summary.totalOrders}
              </div>
              <div className='col-span-2 bg-green-100 border-l border-b border-gray-300 p-1 font-bold text-green-800 print-table-header'>
                إجمالي المبلغ
              </div>
              <div className='col-span-4 border-b border-gray-300 p-1 font-bold text-green-700 print-table-cell'>
                {format(summary.totalAmount)} جنيه
              </div>
            </div>
            <div className={`grid grid-cols-12 text-xs`}>
              <div className='col-span-2 bg-orange-100 border-l border-b border-gray-300 p-1 font-bold text-orange-800 print-table-header'>
                إجمالي المدفوع
              </div>
              <div className='col-span-4 border-b border-gray-300 p-1 font-bold text-orange-700 print-table-cell'>
                {format(summary.totalPaid)} جنيه
              </div>
              <div className='col-span-2 bg-red-100 border-l border-b border-gray-300 p-1 font-bold text-red-800 print-table-header'>
                إجمالي المتبقي
              </div>
              <div className='col-span-4 border-b border-gray-300 p-1 font-bold text-red-700 print-table-cell'>
                {format(summary.totalRemaining)} جنيه
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div
          className={`${getMarginClass(orders.length)} ${getPaddingClass(orders.length)} bg-gray-50 border border-gray-300 print:bg-white print:border-gray-300 print-no-colors`}
        >
          <div className={`flex justify-between items-center ${getMarginClass(orders.length)}`}>
            <h3 className={`font-bold text-gray-800 print:text-xs text-xs`}>ملاحظات هامة:</h3>
            <div className='text-xs font-bold text-gray-800 print:text-xs'>
              <div className='font-bold text-gray-800 mb-1'>العنوان:</div>
              <div className='text-xs text-gray-700 leading-relaxed'>
                15 شارع صالح قناوي - تقاطع وليم ناشد - مدكور - فيصل
                <br />
                امام كلية التربية الرياضية - نصر الثورة
              </div>
            </div>
          </div>
          <ul className={`text-gray-700 space-y-0.5 print:text-xs text-xs`}>
            <li>١- فى حالة فقد الايصال لا يحق لك استلام الخدمة اى استلام المبالغ المدفوعة.</li>
            <li>٢- المبلغ المطلوب يشمل تكلفة اصدار الخدمة بالجهة الحكومية ومقابل اداء الخدمة</li>
            <li>٣- مواعيد استلام الخدمة المحددة لا يحتسب فيها الاجازات والعطلات الرسمية.</li>
          </ul>

          {/* أمين الخزينة */}
          <div className={`${getMarginClass(orders.length)}`}>
            <div className='text-right'>
              <div className={`text-gray-600 text-xs`}>
                أمين الخزينة:{' '}
                <span className='font-bold text-gray-800'>{orders[0]?.createdByAdmin || '—'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className='fixed bottom-4 right-4 print:hidden'>
        <button
          onClick={() => window.print()}
          className='bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-colors'
        >
          طباعة الإيصال
        </button>
      </div>
    </div>
  );
}
