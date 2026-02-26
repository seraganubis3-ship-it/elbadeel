'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

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
  idCardImage?: string; // Added for the new Image component src
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
            font-size: 32px !important;
          }
          .declaration-text {
            font-size: 18px !important;
            font-weight: 900 !important;
          }
          .data-table th {
            font-size: 14px !important;
            padding: 2px !important;
          }
          .data-table th.col-index {
            text-align: right;
            padding-right: 4px !important;
          }

          .col-id {
            font-size: 16px !important;
            font-weight: 900 !important;
            letter-spacing: 1px !important;
            font-family: monospace !important;
          }
          .signature-cell {
            height: 25px !important;
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

        .report-content {
          padding: 10mm;
          position: relative;
          z-index: 10;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          width: 100%;
          margin-bottom: 1mm;
        }

        .logo-container {
          position: fixed;
          top: -50px;
          right: -20px;
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
          font-size: 18px;
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
          font-size: 18px !important;
          font-weight: 900 !important;
          line-height: 1.4;
          text-align: justify;
        }
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
          border-top: none; /* Ensure no top table border */
        }
        .data-table th {
          background-color: #f3f4f6;
          border-bottom: 2px solid #000; /* Strong line below header */
          border-left: 1px solid #1f2937; /* Vertical separator */
          padding: 2px;
          text-align: center;
          font-weight: 900;
          font-size: 14px;
        } 
        .data-table th.col-index {
          text-align: right;
          padding-right: 4px !important;
        } 
        .data-table td {
          border-left: 1px solid #1f2937;
          padding: 2px 3px !important;
          vertical-align: middle;
          line-height: 0.9;
          font-weight: 900;
          font-size: 14px !important;
        }
        .data-table td.col-index {
          text-align: right;
          padding-right: 4px !important;
        }
        .data-table tr {
          border-bottom: 1px solid #000;
        }
        .data-table tfoot td {
          border: none !important;
          border-top: none !important;
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
          text-align: center; /* Center to avoid touching any borders */
          padding: 0 5px !important; /* Safe padding on both sides */
          font-size: 12px !important;
          font-weight: 900;
          color: #000;
        }
        .col-name {
          width: 45%;
          min-width: 230px;
          text-align: right;
          font-weight: 900;
          font-size: 15px !important;
          white-space: normal; /* Allow wrapping if absolutely needed */
        }
        .col-id {
          width: 25%;
          min-width: 120px;
          text-align: center;
          font-family: monospace;
          font-size: 16px !important; /* Smaller font for IDs */
          font-weight: 900;
          letter-spacing: 1px;
        }
        .col-type {
          width: 12%;
          min-width: 50px;
          text-align: center;
          font-size: 15px !important;
        }
        .col-signature {
          width: 18%;
          min-width: 80px;
          text-align: center;
        }

        .signature-cell {
          height: 20px;
          min-height: 20px;
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
          width: 250px;
          height: 150px;
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

      <div className='report-content'>
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
          <colgroup>
            <col style={{ width: '3%' }} />
            <col style={{ width: '27%' }} />
            <col style={{ width: '24%' }} />
            <col style={{ width: '11%' }} />
            <col style={{ width: '35%' }} />
          </colgroup>
          <thead>
            {/* Full Header Row - Repeats on every page */}
            <tr>
              <td colSpan={5} className='border-0 p-0 text-right'>
                {/* Header Section */}
                <div className='relative h-16 mb-0.5 flex items-center justify-center'>
                  <div className='flex flex-col items-center flex-1 pt-0'>
                    <h2 className='text-xl font-black bg-white text-black px-4 py-1 border-2 border-black rounded-xl shadow-sm'>
                      كشف توقيعات البطاقة
                    </h2>
                    <div className='mt-1 bg-gray-100 rounded-lg px-4 py-0.5 border border-gray-300 font-bold text-sm'>
                      {reportDate}
                    </div>
                  </div>

                  <div className='logo-container'>
                    <Image
                      src='/images/report-header.png'
                      alt='Header'
                      width={400}
                      height={150}
                      className='logo-img h-auto w-auto object-contain'
                      priority
                    />
                  </div>
                </div>

                {/* Info Section */}
                <div className='mb-0 space-y-1'>
                  <div className='flex justify-between items-center'>
                    <h3 className='text-base font-black underline decoration-2 underline-offset-4'>
                      السيد العميد / مدير مصلحة الأحوال المدنية
                    </h3>
                  </div>
                  <p className='text-center text-lg font-bold'>تحية طيبة وبعد</p>
                  <p className='text-justify font-bold bg-gray-50 p-2 rounded-lg border border-gray-200 declaration-text'>
                    أقر أنا /{' '}
                    <span className='text-blue-900 mx-0.5'>{delegate?.name || '..........'}</span>{' '}
                    مندوب البديل للخدمات الحكومية بانه تم تفويضي من قبل أصحاب الشأن لاستخراج
                    المصدرات المدون أسمائهم في الكشف وتم أخذ إقرار من صاحب الشأن أمامي وإذا ظهر عكس
                    ذلك أكون مسئول مسئولية كاملة وهذا اقرار مني بذلك /{' '}
                    <span className='text-blue-900 mx-0.5'>{delegate?.name || '..........'}</span>
                  </p>
                </div>
              </td>
            </tr>
            {/* Column Headers Row */}
            <tr>
              <th className='col-index'>م</th>
              <th className='col-name text-right px-4'>الاسم</th>
              <th className='col-id'>الرقم القومي</th>
              <th className='col-type'>نوع</th>
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
              <td colSpan={5} className='p-0'>
                <div className='flex justify-between items-center px-8 py-2 bg-white'>
                  {/* Delegate Card */}
                  <div className='flex items-center justify-center p-2'>
                    {delegate?.unionCard && (
                      <Image
                        src={delegate.idCardImage || delegate.unionCard} // Use idCardImage if available, fallback to unionCard
                        alt='ID Card'
                        width={300}
                        height={180}
                        className='delegate-card-img'
                        unoptimized // External image or unknown source size, bypass optimization for print fidelity
                        priority
                      />
                    )}
                  </div>

                  {/* Signature */}
                  <div className='text-center ml-10 p-2'>
                    <div className='text-xl font-black mb-1'>يعتمد</div>
                    <div className='h-16'></div>
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
