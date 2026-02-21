'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

export default function PrintPhoneReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data from localStorage to avoid URL limit issues with many orders
    try {
      const stored = localStorage.getItem('temp_phone_report_data');
      if (stored) {
        setData(JSON.parse(stored));
      }
    } catch {
      // Failed to load report data
    } finally {
      setLoading(false);
      // Auto print after a short delay
      // setTimeout(() => window.print(), 500); // Auto-print disabled
    }
  }, []);

  if (loading) return <div>جاري التحميل...</div>;

  return (
    <div className='bg-white' dir='rtl'>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');

        @media print {
          @page {
            size: A4;
            margin: 0mm !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            font-family: 'Tajawal', sans-serif !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            font-size: 12px !important;
          }
          .no-print {
            display: none !important;
          }
          ::-webkit-scrollbar {
            display: none;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
          }
        }

        body {
          font-family: 'Tajawal', sans-serif;
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

        .logo-img {
          position: fixed;
          top: -79px;
          right: -27px;
          width: 400px;
        }

        .data-table th {
          background-color: #d1d5db !important;
          color: #000 !important;
          font-weight: 900 !important;
          font-size: 16px;
          border-width: 2px !important;
        }

        .data-table td {
          font-weight: 900;
          font-size: 13px;
          border-width: 2px !important;
        }

        .duplicate-row {
          background-color: #e5e7eb !important;
          -webkit-print-color-adjust: exact;
        }

        .no-print {
          display: none !important;
        }

        .print-only {
          display: none !important;
        }

        .screen-only {
          display: none !important;
        }
      `}</style>

      <div className='premium-frame'>
        {['tl', 'tr', 'bl', 'br'].map(pos => (
          <div key={pos} className={`corner corner-${pos}`}>
            <svg className='ornate-svg' viewBox='0 0 100 100'>
              <path
                d='M0,0 L100,0 L100,5 L20,5 Q10,5 10,15 L10,100 L5,100 L5,20 Q5,10 0,10 Z'
                fill='black'
              />
              <path d='M15,15 L50,15 L50,18 L20,18 Q18,18 18,20 L18,50 L15,50 Z' fill='black' />
            </svg>
          </div>
        ))}
      </div>

      <div className='report-content'>
        {/* Header Section */}
        <div className='relative h-28 mb-4 flex justify-between items-start border-b-2 border-black pb-2'>
          <div className='flex flex-col items-center flex-1 pt-6'>
            <h1 className='text-xl font-black bg-white text-black px-6 py-1.5 border-2 border-black rounded-xl shadow-sm uppercase tracking-tight'>
              مواعيد التصوير اليومية 8.30
            </h1>
          </div>

          <div className='absolute -right-12 -top-16'>
            <Image
              src='/images/report-header.png'
              alt='Header'
              width={200}
              height={100}
              className='logo-img h-auto w-auto object-contain'
            />
          </div>
        </div>

        {/* Table Section */}
        <div className='mb-6'>
          <table className='w-full border-collapse border-2 border-black data-table text-center'>
            <thead>
              <tr className='bg-gray-200'>
                <th className='border-2 border-black p-1 w-10 text-center font-black text-[13px]'>
                  م
                </th>
                <th className='border-2 border-black p-1 text-right font-black text-[13px]'>
                  الاسم
                </th>
                <th className='border-2 border-black p-1 w-40 text-center font-black text-[13px]'>
                  التليفون
                </th>
                <th className='border-2 border-black p-1 w-1/3 text-center font-black text-[13px]'>
                  ملاحظات
                </th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const phoneGroups = new Map<string, number[]>();
                data.forEach((row, index) => {
                  const phone = row.phone || '';
                  if (!phoneGroups.has(phone)) phoneGroups.set(phone, []);
                  phoneGroups.get(phone)!.push(index);
                });

                const duplicatePhones = new Set<string>();
                phoneGroups.forEach((indices, phone) => {
                  if (indices.length > 1 && phone) duplicatePhones.add(phone);
                });

                return data.map((row, index) => {
                  const isDuplicate = duplicatePhones.has(row.phone || '');
                  return (
                    <tr
                      key={index}
                      className={`h-8 ${isDuplicate ? 'duplicate-row' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                    >
                      <td className='border-1 border-black p-1 text-center font-black bg-gray-100 text-[13px]'>
                        {index + 1}
                      </td>
                      <td className='border-1 border-black p-1 text-right font-black text-[13px]'>
                        {row.name}
                      </td>
                      <td
                        className='border-1 border-black p-1 text-center font-black font-mono text-[13px]'
                        dir='ltr'
                      >
                        {row.phone}
                      </td>
                      <td className='border-1 border-black p-1 text-center font-black text-[12px] bg-gray-50/30'>
                        {row.note}
                      </td>
                    </tr>
                  );
                });
              })()}
              {data.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className='p-8 text-center text-gray-400 font-bold text-lg italic'
                  >
                    لا توجد بيانات متاحة للعرض
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Accent */}
        <div className='mt-12 flex justify-center'>
          <div className='w-64 border-t-4 border-black pt-2 text-center font-black text-sm text-gray-500 uppercase tracking-widest'>
            البديل للخدمات الحكومية
          </div>
        </div>

        {/* Signature */}
        <div className='mt-8 flex justify-center'>
          <div className='text-center'>
            <div className='text-xl font-black'>يعتمد</div>
          </div>
        </div>
      </div>
    </div>
  );
}
