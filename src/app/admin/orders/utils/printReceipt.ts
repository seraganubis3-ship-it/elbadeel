interface Order {
  id: string;
  service: { name: string; slug: string };
  variant: { name: string; priceCents: number } | null;
  customerName: string;
  customerPhone: string;
  address?: string;
  policeStation?: string | null;
  pickupLocation?: string | null;
  createdAt: string | Date; // Allow Date or string
  totalCents: number;
  discount?: number | null;
  otherFees?: number | null;
  deliveryFee?: number | null;
  hasAttachments?: boolean | null;
  attachedDocuments?: string[] | string; // Allow string (JSON) or array
  selectedFines?: string | null;
  finesDetails?: string | null; // JSON string
  servicesDetails?: string | null; // JSON string
  serviceDetails?: string | null;
  // New fields
  quantity?: number | null;
  deliveryDuration?: string | null;
  paidAmount?: number | null;
  remainingAmount?: number | null;
  createdByAdmin?: { name: string } | null;
}

export const printReceipt = (order: Order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const width = 800;
  const height = 600;
  const left = (window.screen.width - width) / 2;
  const top = (window.screen.height - height) / 2;
  
  // Resize and position the window
  printWindow.resizeTo(width, height);
  printWindow.moveTo(left, top);

  const isPassport =
    order.service?.slug === 'passports' || (order.service?.name || '').includes('جواز');
  
  const isNationalId = 
    order.service?.slug === 'national-id' || (order.service?.name || '').includes('بطاقة');

  // Format helper
  const format = (cents?: number | null) => ((cents || 0) / 100).toFixed(2);

  // Parse fines and services details
  const finesDetails = order.finesDetails ? (typeof order.finesDetails === "string" ? JSON.parse(order.finesDetails) : order.finesDetails) : [];
  
  // Separate lost report from other fines
  const lostReport = Array.isArray(finesDetails) ? finesDetails.find(
    (fine: any) =>
      fine.name &&
      (fine.name.toLowerCase().includes('محضر') || fine.name.toLowerCase().includes('فقد'))
  ) : null;

  const otherFines = Array.isArray(finesDetails) ? finesDetails.filter(
    (fine: any) =>
      !fine.name ||
      (!fine.name.toLowerCase().includes('محضر') && !fine.name.toLowerCase().includes('فقد'))
  ) : [];

  // Calculate total fines amount (excluding lost report)
  const totalFinesAmount = otherFines.reduce((total: number, fine: any) => {
    return total + (fine.amount || 0);
  }, 0);

  // Calculate lost report amount
  const lostReportAmount = lostReport ? lostReport.amount || 0 : 0;

  // Note: Fine expenses (10 EGP per fine) are already included in order.totalCents
  // from the backend calculation, so we don't need to add them again here
  // Calculate total from paidAmount + remainingAmount for accuracy
  const totalAmount = (order.paidAmount || 0) + (order.remainingAmount || 0);

  const printStyles = `
    @media print {
      @page {
        size: A4 portrait;
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
    
    /* Screen styles to make it look decent before printing */
    body {
      font-family: sans-serif;
      direction: rtl;
    }
    .print-landscape {
      max-width: 210mm;
      margin: 20px auto;
      border: 1px solid #ccc;
      padding: 10px;
    }
    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .flex-col { flex-direction: column; }
    .items-end { align-items: flex-end; }
    .space-x-2 > * + * { margin-left: 0.5rem; }
    .space-x-reverse > * + * { margin-left: 0; margin-right: 0.5rem; }
    .gap-1 { gap: 0.25rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .grid { display: grid; }
    .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
    .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .col-span-2 { grid-column: span 2 / span 2; }
    .col-span-4 { grid-column: span 4 / span 4; }
    .col-span-10 { grid-column: span 10 / span 10; }
    .border-b { border-bottom-width: 1px; border-bottom-style: solid; border-color: black; }
    .border-x { border-left-width: 1px; border-right-width: 1px; border-style: solid; border-color: black; }
    .border-l { border-left-width: 1px; border-left-style: solid; border-color: black; }
    .border-t { border-top-width: 1px; border-top-style: solid; border-color: black; }
    .border-r { border-right-width: 1px; border-right-style: solid; border-color: black; }
    .border { border-width: 1px; border-style: solid; border-color: black; }
    .border-2 { border-width: 2px; }
    .p-2 { padding: 0.5rem; }
    .p-1 { padding: 0.25rem; }
    .p-1\\.5 { padding: 0.375rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .py-0\\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
    .px-1\\.5 { padding-left: 0.375rem; padding-right: 0.375rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-2 { margin-bottom: 0.5rem; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mr-auto { margin-right: auto; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-\\[10px\\] { font-size: 10px; }
    .text-\\[9px\\] { font-size: 9px; }
    .font-black { font-weight: 900; }
    .font-bold { font-weight: 700; }
    .tracking-widest { letter-spacing: 0.1em; }
    .bg-gray-100 { background-color: #f3f4f6; }
    .bg-gray-200 { background-color: #e5e7eb; }
    .bg-white { background-color: #ffffff; }
    .text-black { color: #000000; }
    .grayscale { filter: grayscale(100%); }
    .underline { text-decoration: underline; }
    .list-decimal { list-style-type: decimal; }
    .pr-4 { padding-right: 1rem; }
    .leading-tight { line-height: 1.25; }
    .leading-3 { line-height: .75rem; }
    .leading-4 { line-height: 1rem; }
    .text-center { text-align: center; }
    .text-left { text-align: left; }
    .rounded { border-radius: 0.25rem; }
    .overflow-hidden { overflow: hidden; }
    .whitespace-nowrap { white-space: nowrap; }
    .justify-center { justify-content: center; }
    
    /* CSS Reset */
    * { box-sizing: border-box; }
  `;

  const printContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>إيصال استلام - ${order.id}</title>
      <style>${printStyles}</style>
    </head>
    <body onload="window.print()">
      <div className='min-h-screen bg-white' dir='rtl'>
        <div class='print-landscape'>
          <!-- Top Header with logos - Minimalist B&W -->
          <div class='border-b border-black p-2'>
            <div class='flex items-center justify-between'>
              <div class='flex items-center space-x-2 space-x-reverse'>
                <img
                  src='/logo.jpg'
                  alt='البديل'
                  style='height: 40px; width: auto;'
                  class='grayscale'
                />
                <div class='text-xs leading-4'>
                  <div class='font-black text-sm text-black'>البديل للخدمات الحكومية</div>
                  <div class='text-black text-[10px] font-bold opacity-70'>
                    بديلك لإنجاز أعمالك وخدماتك الحكومية
                  </div>
                </div>
              </div>

              <div class='flex flex-col items-center'>
                <img
                  src='/images/egyptnisr.png'
                  alt='شعار'
                  style='height: 32px; width: auto;'
                  class='mb-1 grayscale'
                />
                <div class='text-[9px] leading-3 text-center font-bold'>
                  طبقا لقرار رئيس مجلس الوزاراء<br/>
                  رقم ١٥٥١ لستة ٢٠٠٨ بتصريح و ترخيص من وزارة الاتصالات و تكنولوجيا المعلومات 
                </div>
              </div>
            </div>
          </div>

          <div class='bg-gray-100 border-b border-black p-1'>
            <div class='flex items-center justify-between px-4'>
              <div class='text-[10px] font-black'>نسخة العميل أصل</div>
              <div class='border-2 border-black text-black px-3 py-0.5 font-black tracking-widest text-xs'>
                ${order.id}
              </div>
              <div class='text-[10px] font-black'>إيصال خدمة حكومية</div>
            </div>
          </div>

          <!-- Main Receipt Table - Forced B&W -->
          <div class='mt-1 border-x border-black overflow-hidden'>
            <!-- Customer Information Section -->
            <div class='border-b border-black'>
              <div class='grid grid-cols-12 text-xs'>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  الاسم
                </div>
                <div class='col-span-4 border-l border-black p-1.5 font-bold'>
                  ${order.customerName}
                </div>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  الخدمة
                </div>
                <div class='col-span-4 p-1.5 font-bold'>${order.service?.name}</div>
              </div>
              <div class='grid grid-cols-12 text-xs border-t border-black'>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  الهاتف
                </div>
                <div class='col-span-4 border-l border-black p-1.5 font-bold'>
                  ${order.customerPhone}
                </div>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  التاريخ
                </div>
                <div class='col-span-4 p-1.5 font-bold'>
                  ${new Date(order.createdAt).toLocaleDateString('ar-EG')}
                </div>
              </div>
              ${isPassport ? `
                <div class='grid grid-cols-12 text-xs border-t border-black'>
                  <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                    القسم
                  </div>
                  <div class='col-span-4 border-l border-black p-1.5 font-bold'>
                    ${order.policeStation || '—'}
                  </div>
                  <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                    الاستلام
                  </div>
                  <div class='col-span-4 p-1.5 font-bold'>${order.pickupLocation || '—'}</div>
                </div>
              ` : ''}
            </div>

            <!-- Financial Information Section -->
            <div class='border-b border-black'>
              <div class='grid grid-cols-12 text-xs'>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  سعر الخدمة
                </div>
                <div class='col-span-4 border-l border-black p-1.5 font-black'>
                  ${format(order.variant?.priceCents)} ج.م
                </div>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  رسوم التوصيل
                </div>
                <div class='col-span-4 p-1.5 font-black'>${format(order.deliveryFee)} ج.م</div>
              </div>
              <div class='grid grid-cols-12 text-xs border-t border-black'>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  غرامات
                </div>
                <div class='col-span-4 border-l border-black p-1.5 font-black'>
                  ${format(totalFinesAmount)} ج.م
                </div>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  مصاريف أخرى
                </div>
                <div class='col-span-4 p-1.5 font-black'>
                  ${format((order.otherFees || 0) + lostReportAmount)} ج.م
                </div>
              </div>
              <div class='grid grid-cols-12 text-xs border-t border-black'>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  مدفوع
                </div>
                <div class='col-span-4 border-l border-black p-1.5 font-black'>
                  ${format(order.paidAmount || 0)} ج.م
                </div>
                <div class='col-span-2 bg-gray-200 border-l border-black p-1.5 font-black'>
                  المتبقي
                </div>
                <div class='col-span-4 p-1.5 font-black'>
                  ${format(order.remainingAmount || 0)} ج.م
                </div>
              </div>
              <div class='grid grid-cols-12 text-xs border-t border-black'>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  العدد
                </div>
                <div class='col-span-4 border-l border-black p-1.5 font-bold'>
                  ${order.quantity || 1}
                </div>
                <div class='col-span-2 bg-gray-100 border-l border-black p-1.5 font-black'>
                  مدة التسليم
                </div>
                <div class='col-span-4 p-1.5 font-bold'>${order.deliveryDuration || '—'}</div>
              </div>
            </div>

            <!-- Details Section -->
            <div class='border-b border-black p-2 bg-white'>
              <div class='text-[10px] font-black mb-1'>تفاصيل إضافية وإضافات:</div>
              <div class='flex flex-wrap gap-2 mb-2'>
                ${Array.isArray(finesDetails) ? finesDetails.map((f: any) => 
                  `<span class='text-[10px] font-bold border border-black px-1.5 py-0.5 rounded'>${f.name}</span>`
                ).join('') : ''}
                ${order.hasAttachments ? 
                  `<span class='text-[10px] font-black border-2 border-black px-1.5 py-0.5 rounded'>✓ تشمل مرفقات</span>` 
                : ''}
              </div>
              ${order.serviceDetails ? 
                `<div class='text-[9px] font-bold whitespace-pre-wrap border-t border-dotted border-black pt-1 leading-relaxed'>
                  ${order.serviceDetails}
                </div>` 
              : ''}
            </div>

            <!-- Total Section -->
            <div class='bg-gray-200 border-b border-black'>
              <div class='grid grid-cols-12 text-sm'>
                <div class='col-span-2 border-l border-black p-2 font-black'>الإجمالي</div>
                <div class='col-span-10 p-2 font-black text-lg text-left'>
                  ${format(totalAmount)} ج.م
                </div>
              </div>
            </div>
          </div>

          <!-- Footer Notes & Address -->
          <div class='mt-2 grid grid-cols-2 gap-4 px-4 text-[9px] leading-tight'>
            <div class='space-y-1'>
              <div class='font-black underline mb-1'>ملاحظات هامة:</div>
              <ol class='list-decimal pr-4 space-y-0.5 font-bold'>
                ${isNationalId ? 
                   `<li class="font-black text-[12px]">
                     تفاصيل التصوير: التصوير 9 صباحا فقط - سجل الهرم الدور الرابع (الدخول من اخر باب) في الشارع الجانبى للسجل - دفع ١٥ج عند التصوير. واوقت الانتظار (ساعه) لفحص ومراجعه الاستمارة من وقت وصولك للمندوب.
                   </li>` 
                : ''}
                <li>التعامل في استلام الخدمة بهذا الإيصال الأصلي فقط.</li>
                ${!isNationalId ? `<li>المبلغ يشمل الرسوم الحكومية ومقابل أداء الخدمة.</li>` : ''}
                <li>لا تحتسب الإجازات الرسمية ضمن مدة الاستلام.</li>
                ${isPassport ? 
                  `<li>
                    (جوازات السفر) يسلم الإيصال للعميل في اليوم التالي من تاريخ الإيصال على أن يقوم
                    العميل بالتوجه إلى إدارة الجوازات التابعة للعنوان المذكور ببطاقة الرقم القومي
                    لاستلام جواز السفر بشخصه.
                  </li>` 
                : ''}
              </ol>
            </div>
            <div class='text-center flex flex-col justify-center gap-1 border-r border-black font-bold'>
              <div>١٥ شارع صالح قناوي - تقاطع وليم ناشد - مدكور - فيصل</div>
              <div class='text-[10px] font-black mt-1'>
                 ٠١٠٢٢٠١١٨٧٧ / ٠١١٤٩٩٩٢٨٣٠
              </div>
              <div class='mt-2 text-xs font-black pt-1'>
                أمين الخزينة: ${order.createdByAdmin?.name || '—'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(printContent);
  printWindow.document.close();
  printWindow.focus();
  // Allow images to load before printing is triggered by body onload
};
