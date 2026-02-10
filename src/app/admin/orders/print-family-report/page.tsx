'use client';
/* eslint-disable @next/next/no-img-element */

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

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem('temp_family_report_data');
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
    weekday: 'long',
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
               كشف قيد عائلي ثاني مرة
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
          أقر أنا / {delegate?.name || '................................'} مندوب البديل للخدمات الحكومية بانه تم تفويضي من قبل أصحاب الشأن لاستخراج المصدرات المدون أسمائهم في الكشف وتم أخذ إقرار من صاحب الشأن أمامي وإذا ظهر عكس ذلك أكون مسئول مسئولية كاملة وهذا اقرار مني بذلك / {delegate?.name || '................................'}
        </p>
      </div>

      {/* Table */}
      <div className="mb-4">
        <table className="w-full border-collapse border border-gray-800 text-sm">
          <thead>
            <tr className="bg-gray-300 text-gray-900 border-b border-gray-800">
              <th className="border border-gray-800 p-1 w-10 text-center font-bold">م</th>
              <th className="border border-gray-800 p-1 text-right font-bold h-12">الاسم</th>
              <th className="border border-gray-800 p-1 w-32 text-center font-bold">الرقم القومي</th>
              <th className="border border-gray-800 p-1 w-16 text-center font-bold">العدد</th>
              <th className="border border-gray-800 p-1 w-32 text-center font-bold">الجهة</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-gray-800">
                <td className="border border-gray-800 p-1 text-center font-bold h-10">{index + 1}</td>
                <td className="border border-gray-800 p-1 text-right font-bold">{item.name}</td>
                <td className="border border-gray-800 p-1 text-center font-bold font-mono text-base">{item.idNumber}</td>
                <td className="border border-gray-800 p-1 text-center font-bold">{item.quantity}</td>
                <td className="border border-gray-800 p-1 text-center font-bold bg-gray-50">{item.source}</td>
              </tr>
            ))}
            {/* Fill remaining rows if needed, or leave dynamic */}
             {data.length === 0 && (
                <tr>
                    <td colSpan={5} className="text-center p-4">لا توجد بيانات</td>
                </tr>
             )}
          </tbody>
        </table>
      </div>

      {/* Footer / Generic image or Delegate Card */}
      <div className="mt-4 flex justify-center items-center h-48">
         {delegate?.unionCard ? (
           <img 
             src={delegate.unionCard} 
             alt="Delegate ID" 
             className="max-h-full max-w-full object-contain border border-gray-300 rounded-lg shadow-sm"
           />
         ) : (
             // Fallback image mentioned in prompt "Same picture as translation report" - assuming generic footer or fallback
             <img src="/images/report-footer.png" className="h-32 object-contain" alt="Footer" />
         )}
      </div>

    </div>
  );
}
