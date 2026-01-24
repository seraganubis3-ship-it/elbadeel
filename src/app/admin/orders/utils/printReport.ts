import { Order, OrderFilters } from '../types';

interface PrintReportOptions {
  orders: Order[];
  selectedOrders: string[];
  filters: OrderFilters;
}

export function printOrdersReport({ orders, selectedOrders, filters }: PrintReportOptions) {
  // Determine which orders to print
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

  const currentDate = new Date().toLocaleDateString('ar-EG');
  const currentTime = new Date().toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Shared CSS Styles
  const reportStyles = `
    <style>
      @page { size: A4; margin: 0; }
      html, body { height: 100%; margin: 0; padding: 0; background: white; color: #000; direction: rtl; }
      
      .report-outer-container { width: 100%; height: 100%; border-collapse: collapse; table-layout: fixed; }
      .header-space, .footer-space { height: 160px; }
      .header-container { position: fixed; top: 0; width: 100%; height: 160px; background: white; z-index: 1000; }
      .footer-container { position: fixed; bottom: 0; width: 100%; height: 140px; background: white; z-index: 1000; }

      /* Header Layout */
      .top-header { position: relative; height: 160px; border-bottom: 2px solid #ccc; margin: 0 15mm; }
      .logo-area { position: absolute; right: -20px; top: -50px; text-align: right; }
      .logo-img { height: 200px; } 
      .report-center { position: absolute; left: 0; right: 0; top: 60px; text-align: center; }
      .report-center .main-title { font-size: 18px; font-weight: 900; margin-bottom: 5px; background: white; display: block; width: fit-content; margin: 0 auto 5px auto; padding: 5px 15px; border: 2px solid #000; border-radius: 8px; }
      .report-center .date-range { font-size: 13px; font-weight: bold; background: white; display: block; width: fit-content; margin: 0 auto; }
      .meta-info { position: absolute; left: 0; top: 20px; text-align: left; font-size: 11px; font-weight: bold; line-height: 1.5; border: 1px solid #000; padding: 5px; border-radius: 4px; }
      
      /* Main Content Area */
      .main-content-cell { vertical-align: top; padding: 0; }
      .main-content-wrapper { display: flex; flex-direction: column; min-height: calc(100vh - 320px); padding: 5px 15mm 20px 15mm; box-sizing: border-box; }
      .content-body { flex: 1; }

      /* Groups */
      .group-section { margin-bottom: 15px; page-break-inside: avoid; }
      .group-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 5px; padding-bottom: 2px; }
      .header-title { font-size: 16px; font-weight: 900; text-decoration: underline; }
      .header-order-num-container { display: flex; align-items: flex-end; gap: 10px; width: 300px; }
      .order-label { font-size: 13px; font-weight: 900; white-space: nowrap; }
      .order-line { flex: 1; border-bottom: 2px dashed #000; margin-bottom: 4px; height: 1px; }

      /* Table Styling */
      .data-table { width: 100%; border-collapse: collapse; font-size: 11px; border: 2px solid #000; margin-bottom: 15px; }
      .data-table th { background-color: #d1d5db; border: 1px solid #000; padding: 4px; text-align: center; font-weight: 900; }
      .data-table td { border: 1px solid #000; padding: 3px 4px; vertical-align: middle; }
      .data-table tr:nth-child(even) { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; } 
      .count-row td { background-color: #fff !important; border-top: 2px solid #000; padding: 8px; }

      /* Summary Table - Positioned at bottom of last page */
      .summary-section { margin-top: auto; padding-top: 20px; page-break-inside: avoid; }
      .footer-table { width: 100%; border-collapse: collapse; text-align: center; font-weight: bold; border: 2px solid #000; }
      .footer-table td { border: 1px solid #000; padding: 8px; background: #fff; font-size: 11px; }
      .footer-table tr:first-child td { background-color: #e5e7eb; } 
      .footer-table .val { font-size: 14px; font-weight: 900; }
      
      .footer-contacts { position: absolute; bottom: 0; right: 15mm; left: 15mm; text-align: right; }
      .footer-img { height: 160px; width: 100%; object-fit: contain; display: block; }
      
      @media print {
        thead { display: table-header-group; }
        tfoot { display: table-footer-group; }
        .main-content-wrapper { min-height: calc(100vh - 320px); }
        button { display: none; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    </style>
  `;

  const headerHtml = `
    <div class="top-header">
       <div class="logo-area"><img src="/images/report-header.png" class="logo-img" alt="البديل" /></div>
       <div class="report-center">
         <div class="main-title">${ordersToPrint.length === 0 ? 'كشف مستخرجات رسمية' : ordersToPrint.length === 1 ? ordersToPrint[0]?.service?.name || 'كشف مستخرجات رسمية' : 'كشف مستخرجات رسمية'}</div>
         <div class="date-range">عن الفترة من ${currentDate} حتى تاريخ ${currentDate}</div>
       </div>
       <div class="meta-info">
         <div>${currentDate}</div>
         <div>${currentTime}</div>
       </div>
    </div>
  `;

  // Classification logic (same as before)
  const classifyOrder = (
    o: Order
  ): 'NATIONAL_ID' | 'BIRTH_CERT' | 'DEATH_CERT' | 'PASSPORT' | 'MARRIAGE_CERT' | 'GENERAL' => {
    if (!o.service) return 'GENERAL';
    const name = o.service.name.toLowerCase();
    const slug = (o.service.slug || '').toLowerCase();
    if (name.includes('بطاقة') || slug === 'national-id') return 'NATIONAL_ID';
    if (name.includes('جواز') || slug === 'passports') return 'PASSPORT';
    if (name.includes('وفاة') || slug.includes('death')) return 'DEATH_CERT';
    if (name.includes('ميلاد') || slug.includes('birth')) return 'BIRTH_CERT';
    if (name.includes('زواج') || slug.includes('marriage')) return 'MARRIAGE_CERT';
    return 'GENERAL';
  };

  const partitionedOrders: Record<
    'NATIONAL_ID' | 'BIRTH_CERT' | 'DEATH_CERT' | 'PASSPORT' | 'MARRIAGE_CERT' | 'GENERAL',
    Order[]
  > = {
    NATIONAL_ID: [],
    BIRTH_CERT: [],
    DEATH_CERT: [],
    PASSPORT: [],
    MARRIAGE_CERT: [],
    GENERAL: [],
  };

  ordersToPrint.forEach(o => {
    partitionedOrders[classifyOrder(o)].push(o);
  });

  let contentHtml = '';
  let globalTotalOrders = 0;
  let globalTotalFines = 0;

  // Render sections (logic same as before, but wrapped for the new layout)
  // 1. National ID
  if (partitionedOrders.NATIONAL_ID.length > 0) {
    const grouped = groupByVariant(partitionedOrders.NATIONAL_ID);
    Object.entries(grouped).forEach(([variantName, groupOrders]) => {
      const rows = groupOrders
        .map((order, idx) => {
          globalTotalOrders++;
          const finesDetails = order.finesDetails ? JSON.parse(order.finesDetails) : [];
          const otherFines = finesDetails.filter(
            (f: any) =>
              !f.name ||
              (!f.name.toLowerCase().includes('محضر') && !f.name.toLowerCase().includes('فقد'))
          );
          const totalFines = otherFines.reduce((sum: number, f: any) => sum + (f.amount || 0), 0);
          globalTotalFines += totalFines / 100;
          const isSettlement = order.status === 'settlement' || order.status === 'pending_payment';
          const cellStyle = isSettlement
            ? 'style="text-align: center; background-color: #fca5a5 !important; -webkit-print-color-adjust: exact;"'
            : 'style="text-align: center;"';
          const fineNames = finesDetails.map((f: any) => f.name).join(' - ');
          const details = [fineNames, order.serviceDetails].filter(Boolean).join(' / ');
          const idStyle =
            'text-align: center; font-family: monospace; font-size: 14px; letter-spacing: 1px;';
          return `<tr><td ${cellStyle}>${idx + 1}</td><td style="text-align: right; font-weight: bold;">${order.customerName}</td><td style="${idStyle}">${order.idNumber || '---'}</td><td style="text-align: center;">${(totalFines / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td><td style="text-align: right; font-size: 11px;">${details}</td></tr>`;
        })
        .join('');
      contentHtml += `<div class="group-section"><div class="group-header"><div class="header-title">بطاقات الرقم القومي - ${variantName}</div><div class="header-order-num-container"><span class="order-label">رقم امر شغل :</span><span class="order-line"></span></div></div><table class="data-table"><thead><tr><th width="5%">م</th><th width="32%">اسم العميل</th><th width="18%">رقم البطاقة القومي</th><th width="15%">غرامات</th><th width="30%">تفاصيل الخدمة</th></tr></thead><tbody>${rows}<tr class="count-row"><td colspan="2" style="text-align: left; padding-left: 20px; font-weight: bold;">العدد المطلوب : </td><td colspan="3" style="text-align: right; padding-right: 20px; font-weight: bold;">${groupOrders.length}</td></tr></tbody></table></div>`;
    });
  }

  // 2. Birth Cert
  if (partitionedOrders.BIRTH_CERT.length > 0) {
    const grouped = groupByVariant(partitionedOrders.BIRTH_CERT);
    Object.entries(grouped).forEach(([variantName, groupOrders]) => {
      const rows = groupOrders
        .map((order, idx) => {
          globalTotalOrders++;
          const isSupply = order.status === 'supply';
          const cellStyle = `style="text-align: center; ${isSupply ? 'background-color: #bfdbfe !important; -webkit-print-color-adjust: exact;' : ''}"`;
          const mono = 'text-align: center; font-family: monospace; font-size: 13px;';

          const formatDate = (date: any) => {
            if (!date) return '---';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '---';
            if (d.getFullYear() < 1920) return '---'; // Prevent epoch 0 or bad years
            return d.toLocaleDateString('ar-EG');
          };

          const bDate = formatDate(order.birthDate);
          return `<tr><td ${cellStyle}>${idx + 1}</td><td style="text-align: right; font-weight: bold;">${order.customerName}</td><td style="${mono}">${bDate}</td><td style="text-align: right;">${order.motherName || '---'}</td><td style="text-align: center;">${order.quantity || 1}</td><td style="${mono}">${order.idNumber || '---'}</td></tr>`;
        })
        .join('');
      contentHtml += `<div class="group-section"><div class="group-header"><div class="header-title">شهادات الميلاد - ${variantName}</div></div><table class="data-table"><thead><tr><th width="5%">م</th><th width="20%">اسم العميل</th><th width="15%">تاريخ الميلاد</th><th width="25%">اسم الوالدة</th><th width="10%">العدد</th><th width="20%">الرقم القومي</th></tr></thead><tbody>${rows}<tr class="count-row"><td colspan="2" style="text-align: left; padding-left: 20px; font-weight: bold;">العدد المطلوب : </td><td colspan="4" style="text-align: right; padding-right: 20px; font-weight: bold;">${groupOrders.length}</td></tr></tbody></table></div>`;
    });
  }

  // 3. Death Cert
  if (partitionedOrders.DEATH_CERT.length > 0) {
    const grouped = groupByVariant(partitionedOrders.DEATH_CERT);
    Object.entries(grouped).forEach(([variantName, groupOrders]) => {
      const rows = groupOrders
        .map((order, idx) => {
          globalTotalOrders++;
          const isSupply = order.status === 'supply';
          const cellStyle = `style="text-align: center; ${isSupply ? 'background-color: #bfdbfe !important; -webkit-print-color-adjust: exact;' : ''}"`;
          const mono = 'text-align: center; font-family: monospace; font-size: 13px;';

          const formatDate = (date: any) => {
            if (!date) return '---';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '---';
            if (d.getFullYear() < 1920) return '---';
            return d.toLocaleDateString('ar-EG');
          };

          const dDate = formatDate(order.birthDate); // Reuse birthDate field for event date
          return `<tr><td ${cellStyle}>${idx + 1}</td><td style="text-align: right; font-weight: bold;">${order.customerName}</td><td style="${mono}">${dDate}</td><td style="text-align: right;">${order.motherName || '---'}</td><td style="text-align: center;">${order.quantity || 1}</td></tr>`;
        })
        .join('');
      contentHtml += `<div class="group-section"><div class="group-header"><div class="header-title">شهادات الوفاة - ${variantName}</div></div><table class="data-table"><thead><tr><th width="5%">م</th><th width="35%">اسم العميل</th><th width="20%">تاريخ الوفاة</th><th width="30%">اسم الوالدة</th><th width="10%">العدد</th></tr></thead><tbody>${rows}<tr class="count-row"><td colspan="2" style="text-align: left; padding-left: 20px; font-weight: bold;">العدد المطلوب : </td><td colspan="3" style="text-align: right; padding-right: 20px; font-weight: bold;">${groupOrders.length}</td></tr></tbody></table></div>`;
    });
  }

  // 4. Passport
  if (partitionedOrders.PASSPORT.length > 0) {
    const grouped = groupByVariant(partitionedOrders.PASSPORT);
    const stationMap: Record<string, string> = {
      FIRST_POLICE_STATION: 'قسم أول',
      SECOND_POLICE_STATION: 'قسم ثاني',
      THIRD_POLICE_STATION: 'قسم ثالث',
    };
    Object.entries(grouped).forEach(([variantName, groupOrders]) => {
      const rows = groupOrders
        .map((order, idx) => {
          globalTotalOrders++;
          const isSettlement = order.status === 'settlement' || order.status === 'pending_payment';
          const cellStyle = isSettlement
            ? 'style="text-align: center; background-color: #fca5a5 !important; -webkit-print-color-adjust: exact;"'
            : 'style="text-align: center;"';
          const mono = 'text-align: center; font-family: monospace; font-size: 13px;';
          const station = stationMap[order.policeStation || ''] || order.policeStation || '---';
          return `<tr><td ${cellStyle}>${idx + 1}</td><td style="text-align: right; font-weight: bold;">${order.customerName}</td><td style="${mono}">${order.idNumber || '---'}</td><td style="text-align: center;">${station}</td><td style="text-align: right;">${order.pickupLocation || '---'}</td></tr>`;
        })
        .join('');
      contentHtml += `<div class="group-section"><div class="group-header"><div class="header-title">جوازات سفر - ${variantName}</div></div><table class="data-table"><thead><tr><th width="5%">م</th><th width="30%">اسم العميل</th><th width="20%">الرقم القومي</th><th width="20%">قسم الشرطة</th><th width="25%">جوازات</th></tr></thead><tbody>${rows}<tr class="count-row"><td colspan="2" style="text-align: left; padding-left: 20px; font-weight: bold;">العدد المطلوب : </td><td colspan="3" style="text-align: right; padding-right: 20px; font-weight: bold;">${groupOrders.length}</td></tr></tbody></table></div>`;
    });
  }

  // 5. Marriage Cert
  if (partitionedOrders.MARRIAGE_CERT.length > 0) {
    const grouped = groupByVariant(partitionedOrders.MARRIAGE_CERT);
    Object.entries(grouped).forEach(([variantName, groupOrders]) => {
      const rows = groupOrders
        .map((order, idx) => {
          globalTotalOrders++;
          const isSupply = order.status === 'supply';
          const cellStyle = `style="text-align: center; ${isSupply ? 'background-color: #bfdbfe !important;' : ''}"`;
          const mono = 'text-align: center; font-family: monospace; font-size: 13px;';

          const formatDate = (date: any) => {
            if (!date) return '---';
            const d = new Date(date);
            if (isNaN(d.getTime())) return '---';
            if (d.getFullYear() < 1920) return '---';
            return d.toLocaleDateString('ar-EG');
          };

          const mDate = formatDate(order.marriageDate);

          return `
          <tr>
            <td ${cellStyle}>${idx + 1}</td>
            <td style="text-align: right; font-weight: bold;">${order.customerName}</td>
            <td style="text-align: right;">${order.motherName || '---'}</td>
            <td style="text-align: right; font-weight: bold;">${order.wifeName || '---'}</td>
            <td style="text-align: right;">${order.wifeMotherName || '---'}</td>
            <td style="${mono}">${mDate}</td>
            <td style="text-align: center;">${order.quantity || 1}</td>
          </tr>`;
        })
        .join('');

      contentHtml += `
        <div class="group-section">
          <div class="group-header"><div class="header-title">قسيمة زواج - ${variantName}</div></div>
          <table class="data-table">
            <thead>
              <tr>
                <th width="5%">م</th>
                <th width="20%">اسم الزوج / الزوجة</th>
                <th width="15%">الوالدة</th>
                <th width="20%">اسم الزوجة / الزوج</th>
                <th width="15%">الوالدة</th>
                <th width="15%">تاريخ الزواج</th>
                <th width="10%">العدد</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
              <tr class="count-row">
                <td colspan="2" style="text-align: left; padding-left: 20px; font-weight: bold;">العدد المطلوب : </td>
                <td colspan="5" style="text-align: right; padding-right: 20px; font-weight: bold;">${groupOrders.length}</td>
              </tr>
            </tbody>
          </table>
        </div>`;
    });
  }

  // 5. General
  if (partitionedOrders.GENERAL.length > 0) {
    const grouped = groupByServiceVariant(partitionedOrders.GENERAL);
    Object.values(grouped).forEach(group => {
      const rows = group.orders
        .map((order, idx) => {
          globalTotalOrders++;
          const fees = order.otherFees || 0;
          globalTotalFines += fees;
          const isSettlement = order.status === 'settlement' || order.status === 'pending_payment';
          const isSupply = order.status === 'supply';
          let color = '';
          if (isSettlement) color = 'background-color: #fca5a5';
          else if (isSupply) color = 'background-color: #bfdbfe';
          const cellStyle = `style="text-align: center; ${color ? color + ' !important; -webkit-print-color-adjust: exact;' : ''}"`;
          return `<tr><td ${cellStyle}>${idx + 1}</td><td style="text-align: right; font-weight: bold;">${order.customerName}</td><td style="text-align: center;">${order.idNumber || '---'}</td><td style="text-align: center;">${fees > 0 ? fees.toLocaleString('ar-EG') + ' ج.م' : '---'}</td><td style="text-align: right; font-size: 11px;">${order.serviceDetails || '---'}</td></tr>`;
        })
        .join('');
      contentHtml += `<div class="group-section"><div class="group-header"><div class="header-title">${group.serviceName} - ${group.variantName}</div></div><table class="data-table"><thead><tr><th width="5%">#</th><th width="30%">اسم العميل</th><th width="20%">رقم القومي</th><th width="15%">الغرامات</th><th width="30%">تفاصيل الخدمة</th></tr></thead><tbody>${rows}<tr class="count-row"><td colspan="2" style="text-align: left; padding-left: 20px; font-weight: bold;">العدد المطلوب : </td><td colspan="3" style="text-align: right; padding-right: 20px; font-weight: bold;">${group.orders.length}</td></tr></tbody></table></div>`;
    });
  }

  const summaryHtml = `
    <div class="summary-section">
      <table class="footer-table">
         <tr><td>اجمالي العدد المطلوب</td><td>اجمالي قيمة الغرامات</td></tr>
         <tr><td class="val">${globalTotalOrders}</td><td class="val">${globalTotalFines.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td></tr>
      </table>
    </div>
  `;

  const fullHtml = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <title>طباعة الكشف</title>
      ${reportStyles}
    </head>
    <body>
      <div class="header-container">${headerHtml}</div>
      <div class="footer-container">
        <div class="footer-contacts"><img src="/images/report-footer.png" class="footer-img" alt="Footer" /></div>
      </div>

      <table class="report-outer-container">
        <thead>
          <tr><td><div class="header-space">&nbsp;</div></td></tr>
        </thead>
        <tbody>
          <tr>
            <td class="main-content-cell">
              <div class="main-content-wrapper">
                <div class="content-body">
                  ${contentHtml}
                </div>
                ${summaryHtml}
              </div>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr><td><div class="footer-space">&nbsp;</div></td></tr>
        </tfoot>
      </table>
    </body>
    </html>
  `;

  printWindow.document.write(fullHtml);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
}

// Helpers
function groupByVariant(orders: Order[]) {
  const grouped: { [key: string]: Order[] } = {};
  orders.forEach(o => {
    const v = o.variant?.name || 'غير محدد';
    if (!grouped[v]) grouped[v] = [];
    grouped[v]!.push(o);
  });
  return grouped;
}

function groupByServiceVariant(orders: Order[]) {
  const grouped: { [key: string]: { serviceName: string; variantName: string; orders: Order[] } } =
    {};
  orders.forEach(o => {
    const sName = o.service?.name || 'غير محدد';
    const vName = o.variant?.name || 'غير محدد';
    const key = `${sName}-${vName}`;
    if (!grouped[key]) grouped[key] = { serviceName: sName, variantName: vName, orders: [] };
    grouped[key]!.orders.push(o);
  });
  return grouped;
}
