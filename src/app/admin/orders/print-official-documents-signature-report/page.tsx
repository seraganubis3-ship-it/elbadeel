'use client';
  /* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';

// Report Data Interface
interface OfficialDocsSignatureReportData {
  name: string;
  idNumber: string;
  source: string;
  quantity: number;
  relation: string;
}

interface DelegateData {
  name: string;
  idNumber: string;
  unionCard: string;
}

export default function PrintOfficialDocumentsSignatureReport() {
  const [data, setData] = useState<OfficialDocsSignatureReportData[]>([]);
  const [delegate, setDelegate] = useState<DelegateData | null>(null);
  const [reportDate, setReportDate] = useState('');

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem('temp_official_docs_signature_report_data');
    let customDate = '';
    
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setData(parsed.orders || []);
      setDelegate(parsed.delegate || null);
      customDate = parsed.reportDate;
    }

    // Date Logic
    if (customDate) {
       setReportDate(customDate);
    } else {
      const workDate = localStorage.getItem('adminWorkDate');
      let dateObj = new Date();
      if (workDate) {
         const parts = workDate.split('/');
         if (parts.length === 3) {
            dateObj = new Date(parseInt(parts[2] || '0'), parseInt(parts[1] || '0') - 1, parseInt(parts[0] || '0'));
         }
      }
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' };
      const formatted = dateObj.toLocaleDateString('ar-EG', options).replace(/،/g, ' -');
      setReportDate(formatted);
    }
  }, []);

  return (
    <div className="bg-white min-h-screen p-0 w-full" dir="rtl">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        
        @media print {
          @page {
            size: A4;
            margin: 10mm !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            font-family: 'Tajawal', sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
        }

        body {
          font-family: 'Tajawal', sans-serif;
          margin: 0;
          padding: 0;
          background: white;
          color: #000;
        }

        .report-wrapper {
          position: relative;
          width: 100%;
          padding: 0;
          margin: 0;
          box-sizing: border-box;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          margin-bottom: 2mm;
        }

        .logo-container {
          position: absolute;
          top: 0;
          right: 0;
          width: 320px;
          z-index: 100;
        }

        .logo-img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        .header-titles {
          width: 100%;
          text-align: center;
          padding-top: 15mm;
          margin-bottom: 8mm;
        }

        .report-title {
          font-size: 32px;
          font-weight: 900;
          margin-bottom: 3mm;
          color: #000;
        }

        .date-badge {
          display: inline-block;
          border: 3px solid #000;
          padding: 6px 25px;
          font-size: 19px;
          font-weight: 900;
          background: #fff;
        }

        .recipient-section {
          margin-bottom: 5mm;
          padding-right: 2mm;
        }

        .recipient-title {
          font-size: 20px;
          font-weight: 900;
          text-decoration: underline;
          text-underline-offset: 5px;
          margin-bottom: 3mm;
        }

        .greeting {
          font-size: 26px;
          font-weight: 900;
          text-align: center;
          font-style: italic;
          margin-bottom: 4mm;
        }

        .declaration-box {
          border: 4px solid #000;
          padding: 12px 15px;
          background-color: #f9fafb;
          margin-bottom: 6mm;
          border-radius: 4px;
        }

        .declaration-text {
          font-size: 19px;
          line-height: 1.5;
          text-align: justify;
          font-weight: 800;
          color: #000;
        }

        .delegate-highlight {
          color: #1e3a8a;
          border-bottom: 2px solid #000;
          padding: 0 5px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          border: 3px solid #000;
        }

        .data-table thead {
          display: table-header-group;
        }

        .data-table th {
          background-color: #f3f4f6 !important;
          border: 2px solid #000;
          padding: 8px 1px;
          font-weight: 900;
          font-size: 14px;
          text-align: center;
        }
        
        .data-table td {
          border: 2px solid #000;
          padding: 6px 4px;
          font-weight: 800;
          font-size: 15px;
          word-wrap: break-word;
          overflow: hidden;
          vertical-align: middle;
        }

        .col-index { width: 30px; }
        .col-name { width: auto; }
        .col-id { width: 160px; }
        .col-source { width: 75px; }
        .col-qty { width: 40px; }
        .col-role { width: 80px; }
        .col-signature { width: 130px; }

        .signature-cell {
           height: 60px;
        }

        .nowrap {
          white-space: nowrap;
        }

        .delegate-card-container {
          margin-top: 15mm;
          display: flex;
          justify-content: center;
          page-break-inside: avoid;
        }

        .delegate-card-frame {
          border: 5px solid #000;
          padding: 8px;
          background: #fff;
          width: 450px;
          height: 280px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .delegate-card-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
      `}</style>

      <div className="report-wrapper">
        <div className="logo-container">
          <img src="/images/report-header.png" alt="Header" className="logo-img" />
        </div>

        <div className="header-titles">
          <h1 className="report-title">كشف توقيعات المستخرجات</h1>
          <div className="date-badge">
            {reportDate}
          </div>
        </div>

        <section className="recipient-section">
          <h2 className="recipient-title">السيد العميد / مدير مصلحة الأحوال المدنية بالجيزة</h2>
          <p className="greeting">تحية طيبة وبعد ،،،</p>
        </section>

        <section className="declaration-box">
          <p className="declaration-text">
            أقر أنا / <span className="delegate-highlight">{delegate?.name || '................................'}</span> مندوب البديل للخدمات الحكومية بأنه تم تفويضي من قبل أصحاب الشأن المدون اسمائهم في الكشف وتم أخذ اقرار من صاحب الشأن أمامي وإذا ظهر عكس ذلك أكون مسئول مسئولية كاملة وهذا اقرار مني بذلك / <span className="delegate-highlight">{delegate?.name || '................................'}</span>
          </p>
        </section>

        <table className="data-table">
          <thead>
            <tr>
              <th className="col-index">م</th>
              <th className="col-name text-right px-4">الاسم</th>
              <th className="col-id">الرقم القومي</th>
              <th className="col-source">المصدر</th>
              <th className="col-qty">العدد</th>
              <th className="col-role">الصفة</th>
              <th className="col-signature">توقيع صاحب الشأن</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className="text-center font-black">{index + 1}</td>
                <td className="text-right font-black px-4 nowrap">{item.name}</td>
                <td className="text-center font-mono tracking-tighter font-black nowrap">{item.idNumber}</td>
                <td className="text-center">{item.source}</td>
                <td className="text-center">{item.quantity}</td>
                <td className="text-center">{item.relation}</td>
                <td className="signature-cell"></td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="delegate-card-container">
          <div className="delegate-card-frame">
            {delegate?.unionCard ? (
              <img src={delegate.unionCard} alt="Delegate ID" className="delegate-card-img" />
            ) : (
              <div className="text-xl font-black text-gray-400">لا يوجد كارت مسجل</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
