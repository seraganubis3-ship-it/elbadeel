'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

// Report Data Interface matching the Family Record structure
interface FamilyRecordReportData {
  name: string;
  idNumber: string;
  source: string; // Used for "Authority" (الجهة) - currently requested to be empty but keeping structure
  quantity: number;
}

interface DelegateData {
  name: string;
  idNumber: string;
  unionCard: string;
}

export default function PrintFamilyRecordReport() {
  const [data, setData] = useState<FamilyRecordReportData[]>([]);
  const [delegate, setDelegate] = useState<DelegateData | null>(null);
  const [reportDate, setReportDate] = useState('');

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem('temp_family_report_data');
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
    <div className='bg-white' dir='rtl'>
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
          ::-webkit-scrollbar {
            display: none;
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

        .logo-img {
          top: -180px;
          right: -20px;
          width: 350px;
          z-index: 100;
        }

        .data-table th {
          background-color: #d1d5db !important;
          color: #000 !important;
          font-weight: 900 !important;
          font-size: 13px;
          padding: 3px !important;
        }

        .data-table td {
          font-weight: 900;
          font-size: 12px;
          padding: 3px !important;
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
        <div className='relative h-40 mb-6 flex justify-between items-start border-b-2 border-gray-200'>
          <div className='flex flex-col items-center flex-1 pt-12'>
            <h2 className='text-2xl font-black bg-white text-black px-6 py-2 border-2 border-black rounded-xl shadow-sm'>
              كشف قيد عائلي ثاني مرة
            </h2>
            <div className='mt-2 bg-gray-100 rounded-lg px-6 py-1 border border-gray-300 font-extrabold text-lg'>
              {reportDate}
            </div>
          </div>

          <div className='absolute -right-5 -top-24'>
            <Image
              src='/images/report-header.png'
              alt='Header'
              width={200}
              height={100}
              className='logo-img h-auto w-auto object-contain'
            />
          </div>
        </div>

        {/* Info Section */}
        <div className='mb-6 space-y-3'>
          <div className='flex justify-between items-center'>
            <h3 className='text-lg font-black underline decoration-2 underline-offset-4'>
              السيد العميد / مدير مصلحة الأحوال المدنية بالجيزة
            </h3>
          </div>
          <p className='text-center text-xl font-bold'>تحية طيبة وبعد</p>
          <p className='text-justify text-sm leading-relaxed font-bold bg-gray-50 p-4 rounded-xl border border-gray-200'>
            أقر أنا /{' '}
            <span className='text-blue-900 mx-1'>
              {delegate?.name || '................................'}
            </span>{' '}
            مندوب البديل للخدمات الحكومية بانه تم تفويضي من قبل أصحاب الشأن لاستخراج المصدرات المدون
            أسمائهم في الكشف وتم أخذ إقرار من صاحب الشأن أمامي وإذا ظهر عكس ذلك أكون مسئول مسئولية
            كاملة وهذا اقرار مني بذلك /{' '}
            <span className='text-blue-900 mx-1'>
              {delegate?.name || '................................'}
            </span>
          </p>
        </div>

        {/* Table Section */}
        <div className='mb-8'>
          <table className='w-full border-collapse border-2 border-black data-table'>
            <thead>
              <tr className='bg-gray-200'>
                <th className='border-2 border-black p-2 w-10 text-center font-black'>م</th>
                <th className='border-2 border-black p-2 text-right font-black'>الاسم</th>
                <th className='border-2 border-black p-2 w-44 text-center font-black'>
                  الرقم القومي
                </th>
                <th className='border-2 border-black p-2 w-16 text-center font-black'>العدد</th>
                <th className='border-2 border-black p-2 text-center font-black'>الجهة</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className='border border-black p-2 text-center font-black'>{index + 1}</td>
                  <td className='border border-black p-2 text-right font-black'>{item.name}</td>
                  <td className='border border-black p-2 text-center font-black font-mono tracking-tighter'>
                    {item.idNumber}
                  </td>
                  <td className='border border-black p-2 text-center font-black'>
                    {item.quantity}
                  </td>
                  <td className='border border-black p-2 text-center font-black bg-gray-100'>
                    {item.source}
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className='text-center p-8 text-gray-400 font-bold'>
                    لا توجد بيانات متاحة حالياً
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Section Section */}
        <div className='flex flex-col items-center pt-4'>
          <div className='h-44 w-full flex justify-center'>
            {delegate?.unionCard ? (
              <Image
                src={delegate.unionCard}
                alt='Delegate ID'
                width={300}
                height={176}
                unoptimized
                className='max-h-full max-w-sm object-contain border-2 border-black rounded-xl shadow-lg p-1 bg-white'
              />
            ) : (
              <Image
                src='/images/report-footer.png'
                alt='Footer'
                width={200}
                height={128}
                className='h-32 w-auto object-contain grayscale opacity-50'
              />
            )}
          </div>
        </div>

        {/* Signature */}
        <div className='mt-8 flex justify-end pl-10'>
          <div className='text-center'>
            <div className='text-xl font-black'>يعتمد</div>
          </div>
        </div>
      </div>
    </div>
  );
}
