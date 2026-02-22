import { Order, OrderFilters } from '../types';

interface PrintCollectionReportOptions {
  orders: Order[];
  selectedOrders: string[];
  filters: OrderFilters;
  collectorName?: string;
  branchName?: string;
  reportDate?: string | undefined;
}

export function printCollectionReport({
  orders,
  selectedOrders,
  filters,
  collectorName = 'مصلحة الأحوال المدنية',
  branchName = 'بديل',
  reportDate,
}: PrintCollectionReportOptions) {
  const ordersToPrint =
    selectedOrders.length > 0 ? orders.filter(order => selectedOrders.includes(order.id)) : orders;

  if (ordersToPrint.length === 0) {
    alert('لا توجد طلبات للطباعة');
    return;
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('يرجى السماح بفتح نوافذ منبثقة لطباعة التقرير');
    return;
  }

  // Date Logic
  let dateText = '';
  if (reportDate) {
    dateText = `بتاريخ: ${reportDate}`;
  } else if (filters.dateFrom && filters.dateTo) {
    const d1 = filters.dateFrom.split('-').reverse().join('/');
    const d2 = filters.dateTo.split('-').reverse().join('/');
    dateText = d1 === d2 ? `بتاريخ: ${d1}` : `بتاريخ من ${d1} إلى ${d2}`;
  } else {
    dateText = 'عن جميع الطلبات المختارة';
  }

  const now = new Date();
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const currentDay = days[now.getDay()];
  const currentFormattedDate = now.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const currentFormattedTime = now.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const transactionDate = now.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  const totalAmount = ordersToPrint.reduce((sum, o) => {
      // Use priceCents or totalCents? Image shows price. 
      // Image has "قيمة الإيصال". Let's use order.totalCents or quantity * price.
      // Usually totalCents is the price the customer paid.
      return sum + (o.totalCents || 0);
  }, 0) / 100;

  const reportStyles = `
    <style>
      @page { size: A4; margin: 5mm; }
      html, body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; direction: rtl; }
      .container { padding: 10px; }
      
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; position: relative; }
      .header-left { text-align: left; font-size: 12px; line-height: 1.6; font-weight: bold; width: 200px; }
      .header-center { text-align: center; flex: 1; }
      .header-right { text-align: right; width: 200px; }
      .logo { position: absolute; top: -50px; right: -10px; height: 160px; object-fit: contain; }

      .main-title { font-size: 18px; font-weight: 900; margin-bottom: 5px; }
      .subtitle { font-size: 13px; font-weight: bold; }

      .metadata-row { border: 2px solid #000; display: flex; justify-content: space-between; padding: 8px; margin-bottom: 5px; font-weight: bold; font-size: 14px; border-radius: 4px; }
      .metadata-item { white-space: nowrap; }
      .transaction-date { border: 2px solid #000; padding: 4px 12px; width: fit-content; font-weight: bold; margin-bottom: 10px; border-radius: 4px; background: #f3f4f6; font-size: 13px; }

      .data-table { width: 100%; border-collapse: collapse; border: 2px solid #000; }
      .data-table th { border: 1px solid #000; background: #e5e7eb; padding: 6px; text-align: center; font-weight: 900; font-size: 13px; }
      .data-table td { border: 1px solid #000; padding: 4px 6px; text-align: center; vertical-align: middle; font-weight: bold; font-size: 12px; }
      .data-table .text-right { text-align: right; padding-right: 10px; }
      
      .footer-row td { background: #f9fafb !important; padding: 8px; font-size: 15px; font-weight: 900; border-top: 2px solid #000; }

      @media print {
        button { display: none; }
        body { -webkit-print-color-adjust: exact; }
      }
    </style>
  `;

  const rowsHtml = ordersToPrint.map((order, idx) => {
    const time = new Date(order.createdAt).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Africa/Cairo',
    });
    
    // In image: الخدمة المقدمة
    // Example: بطاقة رقم قومي عادية بالاستمارة
    // User wants to add time here
    const serviceDisplay = `${order.service.name} ${order.variant?.name ? '- ' + order.variant.name : ''} (${time})`;
    
    const priceCents = order.totalCents || 0;
    
    return `
      <tr>
        <td width="5%">${idx + 1}</td>
        <td width="15%">${order.id.slice(-6).toUpperCase()}</td>
        <td width="35%" class="text-right">${order.customerName}</td>
        <td width="35%" class="text-right">${serviceDisplay}</td>
        <td width="10%">${(priceCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  const fullHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>كشف التحصيل</title>
      ${reportStyles}
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="header-right" style="text-align: right;">
            <img src="/api/proxy-image?url=/images/report-header.png" class="logo" alt="البديل" onerror="this.src='/images/report-header2.png'" />
          </div>
          <div class="header-center">
            <div class="subtitle">${branchName}</div>
            <h1 class="main-title">كشف التحصيل اليومي - تفصيلي</h1>
            <div class="subtitle">${dateText}</div>
          </div>
          <div class="header-left">
            <div>التاريخ: ${currentFormattedDate}</div>
            <div>الساعة: ${currentFormattedTime}</div>
            <div>صفحة 1 / 1</div>
          </div>
        </div>

        <div class="metadata-row">
          <div class="metadata-item">اسم المحصل : ${collectorName}</div>
          <div class="metadata-item">${branchName}</div>
          <div class="metadata-item">الاجمالي : ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
        </div>

        <div class="transaction-date">تاريخ التحصيل : ${transactionDate}</div>

        <table class="data-table">
          <thead>
            <tr>
              <th>م</th>
              <th>رقم الإيصال</th>
              <th>اسم العميل</th>
              <th>الخدمة المقدمة</th>
              <th>قيمة الإيصال</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="footer-row">
              <td colspan="4" style="text-align: left; padding-left: 50px;">اجمالي المتحصلات :</td>
              <td>${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `;

  printWindow.document.write(fullHtml);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
}
