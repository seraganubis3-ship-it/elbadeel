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

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem('temp_id_card_signatures_report_data');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setData(parsed.orders || []);
      setDelegate(parsed.delegate || null);
      
      // Auto print after a short delay
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, []);

  const currentDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  return (
    <div className="bg-white font-sans" dir="rtl">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          ::-webkit-scrollbar {
            display: none;
          }
        }
      `}</style>

      {/* Header Container */}
      <div className="flex justify-between items-start mb-4 pb-2 border-b-2 border-gray-800">
        {/* Right Side (First in RTL): Report Header Image */}
        <div className="w-1/3 text-right -mt-6">
           <img 
             src="/images/report-header.png" 
             alt="Header" 
             className="h-56 object-contain object-top"
           />
        </div>

        {/* Center: Title */}
        <div className="w-1/3 flex flex-col items-center pt-4">
            <h2 className="text-xl font-bold bg-white text-black px-6 py-2 border border-black rounded-xl">
               كشف توقيعات البطاقة
            </h2>
             <div className="mt-2 bg-gray-200 rounded-lg px-4 py-1 border border-gray-400 font-bold text-lg">
             {currentDate}
           </div>
        </div>

        {/* Left Side (Last in RTL): Empty */}
        <div className="w-1/3 text-left">
        </div>
      </div>

      {/* Sub Header */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
           <h3 className="text-base font-bold">السيد العميد / مدير مصلحة الأحوال المدنية بالجيزة</h3>
        </div>
        <p className="text-center text-lg font-bold mb-2">تحية طيبة وبعد</p>
        <p className="text-justify text-base leading-relaxed mb-4 font-medium">
          أقر أنا / {delegate?.name || '................................'} مندوب البديل للخدمات الحكومية بأنه تم تفويضي من قبل أصحاب الشأن المدون اسمائهم في الكشف لاستخراج واستلام بطاقات الرقم القومي واذ ظهر عكس ذلك أكون مسئول مسئولية كاملة وهذا اقرار مني بذلك / {delegate?.name || '................................'}
        </p>
      </div>

      {/* Table */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-gray-800 text-sm">
          <thead>
            <tr className="bg-gray-300 text-gray-900 border-b border-gray-800">
              <th className="border border-gray-800 p-1 w-10 text-center font-bold">م</th>
              <th className="border border-gray-800 p-1 text-right font-bold w-[35%]">الاسم</th>
              <th className="border border-gray-800 p-1 w-32 text-center font-bold">الرقم القومي</th>
              <th className="border border-gray-800 p-1 w-24 text-center font-bold">نوع البطاقة</th>
              <th className="border border-gray-800 p-1 text-center font-bold">توقيع صاحب الشأن</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-gray-800 h-10">
                <td className="border border-gray-800 p-1 text-center font-bold">{index + 1}</td>
                <td className="border border-gray-800 p-1 text-right font-bold">{item.name}</td>
                <td className="border border-gray-800 p-1 text-center font-bold font-mono tracking-wider text-base">{item.idNumber}</td>
                <td className="border border-gray-800 p-1 text-center font-bold">{item.cardType}</td>
                <td className="border border-gray-800 p-1 text-center font-bold"></td>
              </tr>
            ))}
            {/* Add empty rows if needed to fill the page? For now, just data rows */}
          </tbody>
        </table>
      </div>

      {/* Footer / Dynamic ID Card Image */}
      <div className="mt-4 flex justify-center items-center h-48 no-break-inside">
         {delegate?.unionCard ? (
           <img 
             src={delegate.unionCard} 
             alt="Delegate ID" 
             className="max-h-full max-w-full object-contain border border-gray-300 rounded-lg shadow-sm"
           />
         ) : (
            <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 text-center text-gray-400 w-64 h-32 flex items-center justify-center">
               لا توجد صورة للمندوب
            </div>
         )}
      </div>

    </div>
  );
}
