/* eslint-disable @next/next/no-img-element */
'use client';
/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';

// Report Data Interface
interface IdCardSignatureReportData {
  name: string;
  idNumber: string;
  cardType: string; // e.g., 'عادية', 'مستعجلة', 'VIP'
}

interface DelegateData {
  name: string;
  idNumber: string;
  unionCard: string;
}

export default function PrintIdCardSignaturesReport() {
  const [data, setData] = useState<IdCardSignatureReportData[]>([]);
  const [delegate, setDelegate] = useState<DelegateData | null>(null);
  const [reportDate, setReportDate] = useState('');

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem('temp_id_card_signatures_report_data');
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
          dateObj = new Date(
            parseInt(parts[2] || '0'),
            parseInt(parts[1] || '0') - 1,
            parseInt(parts[0] || '0')
          );
        }
      }
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      };
      const formatted = dateObj.toLocaleDateString('ar-EG', options).replace(/،/g, ' -');
      setReportDate(formatted);
    }
  }, []);

  return (
    <div className='bg-white p-0 w-full' dir='rtl'>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Arial:wght@400;700;900&display=swap');

        @media print {
          @page {
            size: A4;
            margin: 0mm !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            font-family: 'Arial', sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-size: 12px !important;
          }
          .no-print {
            display: none !important;
          }
          .report-title {
            font-size: 24px !important;
          }
          .date-badge {
            font-size: 16px !important;
            padding: 4px 20px !important;
          }
          .recipient-title {
            font-size: 18px !important;
          }
          .greeting {
            font-size: 20px !important;
          }
          .declaration-text {
            font-size: 16px !important;
          }
          .data-table th {
            font-size: 14px !important;
            padding: 3px !important;
          }

          .col-id {
            font-size: 16px !important;
            font-weight: 900 !important;
            letter-spacing: 1px !important;
            font-family: monospace !important;
          }
          .signature-cell {
            height: 50px !important;
          }
          tfoot {
            display: table-footer-group;
          }
          thead {
            display: table-header-group;
          }
        }

        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 0;
          background: white;
          color: #000;
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

        .report-wrapper {
          position: relative;
          width: 100%;
          padding: 10mm;
          margin: 0;
          box-sizing: border-box;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          margin-bottom: 1mm;
        }

        .logo-container {
          position: absolute;
          top: -100px;
          right: -20px;
          width: 450px;
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
          padding-top: 5mm;
          margin-bottom: 3mm;
        }

        .report-title {
          font-size: 20px;
          font-weight: 900;
          margin-bottom: 1mm;
          color: #000;
        }

        .date-badge {
          display: inline-block;
          padding: 4px 20px;
          font-size: 14px;
          font-weight: 900;
          background: #fff;
        }

        .recipient-section {
          margin-bottom: 2mm;
          padding-right: 2mm;
        }

        .recipient-title {
          font-size: 15px;
          font-weight: 900;
          text-decoration: underline;
          text-underline-offset: 4px;
          margin-bottom: 1mm;
        }

        .greeting {
          font-size: 16px;
          font-weight: 900;
          text-align: center;
          font-style: italic;
          margin-bottom: 2mm;
        }

        .declaration-box {
          padding: 8px 0;
          margin-bottom: 3mm;
        }

        .declaration-text {
          font-size: 14px;
          line-height: 1.4;
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
          font-size: 13px;
          margin-bottom: 10px;
          page-break-inside: auto;
        }
        .data-table th {
          background-color: #d1d5db;
          border: 1px solid #000;
          padding: 3px;
          text-align: center;
          font-weight: 900;
          font-size: 14px;
        }
        .data-table td {
          border: 1px solid #000;
          padding: 0px 4px !important;
          vertical-align: middle;
          line-height: 1;
          font-weight: 900;
          font-size: 16px !important;
        }
        .data-table tr {
          page-break-inside: avoid;
          page-break-after: auto;
        }
        .data-table tr:nth-child(even) {
          background-color: #f3f4f6 !important;
          -webkit-print-color-adjust: exact;
        }

        .col-index {
          width: 25px;
          min-width: 25px;
          text-align: center;
        }
        .col-name {
          width: 35%;
          min-width: 200px;
          text-align: right;
          font-weight: bold;
        }
        .col-id {
          width: 25%;
          min-width: 140px;
          text-align: center;
          font-family: monospace;
          font-size: 16px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .col-type {
          width: 15%;
          min-width: 80px;
          text-align: center;
        }
        .col-signature {
          width: 25%;
          min-width: 120px;
          text-align: center;
        }

        .signature-cell {
          height: 18px;
          min-height: 18px;
        }

        .nowrap {
          white-space: nowrap;
        }

        .delegate-card-container {
          margin-top: 1mm;
          display: flex;
          justify-content: center;
          page-break-inside: avoid;
        }

        .delegate-card-frame {
          background: #fff;
          width: 300px;
          height: 180px;
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

      <div className='report-wrapper'>
        {/* Premium Frame */}
        <div className='premium-frame'>
          <div className='corner corner-tl'>
            <svg className='ornate-svg' viewBox='0 0 100 100'>
              <path
                d='M0,0 L100,0 L100,5 L20,5 Q10,5 10,15 L10,100 L5,100 L5,20 Q5,10 0,10 Z'
                fill='black'
              />
              <path d='M15,15 L50,15 L50,18 L20,18 Q18,18 18,20 L18,50 L15,50 Z' fill='black' />
            </svg>
          </div>
          <div className='corner corner-tr'>
            <svg className='ornate-svg' viewBox='0 0 100 100'>
              <path
                d='M0,0 L100,0 L100,5 L20,5 Q10,5 10,15 L10,100 L5,100 L5,20 Q5,10 0,10 Z'
                fill='black'
              />
              <path d='M15,15 L50,15 L50,18 L20,18 Q18,18 18,20 L18,50 L15,50 Z' fill='black' />
            </svg>
          </div>
          <div className='corner corner-bl'>
            <svg className='ornate-svg' viewBox='0 0 100 100'>
              <path
                d='M0,0 L100,0 L100,5 L20,5 Q10,5 10,15 L10,100 L5,100 L5,20 Q5,10 0,10 Z'
                fill='black'
              />
              <path d='M15,15 L50,15 L50,18 L20,18 Q18,18 18,20 L18,50 L15,50 Z' fill='black' />
            </svg>
          </div>
          <div className='corner corner-br'>
            <svg className='ornate-svg' viewBox='0 0 100 100'>
              <path
                d='M0,0 L100,0 L100,5 L20,5 Q10,5 10,15 L10,100 L5,100 L5,20 Q5,10 0,10 Z'
                fill='black'
              />
              <path d='M15,15 L50,15 L50,18 L20,18 Q18,18 18,20 L18,50 L15,50 Z' fill='black' />
            </svg>
          </div>
        </div>

        <table className='data-table'>
          <thead>
            {/* Full Header Row - Repeats on every page */}
            <tr>
              <td colSpan={5} className='border-0 p-0 text-right'>
                <div className='logo-container'>
                  <img src='/images/report-header.png' alt='Header' className='logo-img' />
                </div>

                <div className='header-titles'>
                  <h1 className='report-title'>كشف توقيعات البطاقة</h1>
                  <div className='date-badge'>{reportDate}</div>
                </div>

                <section className='recipient-section'>
                  <h2 className='recipient-title'>
                    السيد العميد / مدير مصلحة الأحوال المدنية بالجيزة
                  </h2>
                  <p className='greeting'>تحية طيبة وبعد ،،،</p>
                </section>

                <section className='declaration-box'>
                  <p className='declaration-text'>
                    أقر أنا /{' '}
                    <span className='delegate-highlight'>
                      {delegate?.name || '................................'}
                    </span>{' '}
                    مندوب البديل للخدمات الحكومية بأنه تم تفويضي من قبل أصحاب الشأن المدون اسمائهم
                    في الكشف لاستخراج واستلام بطاقات الرقم القومي واذ ظهر عكس ذلك أكون مسئول مسئولية
                    كاملة وهذا اقرار مني بذلك /{' '}
                    <span className='delegate-highlight'>
                      {delegate?.name || '................................'}
                    </span>
                  </p>
                </section>
              </td>
            </tr>
            {/* Column Headers Row */}
            <tr>
              <th className='col-index'>م</th>
              <th className='col-name'>الاسم</th>
              <th className='col-id'>الرقم القومي</th>
              <th className='col-type'>نوع البطاقة</th>
              <th className='col-signature'>توقيع صاحب الشأن</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td className='col-index'>{index + 1}</td>
                <td className='col-name'>{item.name}</td>
                <td className='col-id'>{item.idNumber}</td>
                <td className='col-type'>{item.cardType}</td>
                <td className='signature-cell'></td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5} className='p-0 border-t-2 border-black'>
                <div className='flex justify-between items-center px-8 py-2 bg-white'>
                  {/* Delegate Card */}
                  <div className='delegate-card-frame'>
                    {delegate?.unionCard ? (
                      <img
                        src={delegate.unionCard}
                        alt='Delegate ID'
                        className='delegate-card-img'
                      />
                    ) : (
                      <div className='text-sm font-black text-gray-400'>لا يوجد كارت مسجل</div>
                    )}
                  </div>

                  {/* Signature */}
                  <div className='text-center ml-10'>
                    <div className='text-2xl font-black mb-1'>يعتمد</div>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
