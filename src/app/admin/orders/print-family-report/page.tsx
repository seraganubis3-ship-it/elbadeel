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
  const [reportDate, setReportDate] = useState('');

  useEffect(() => {
    // Load data from localStorage
    const storedData = localStorage.getItem('temp_family_report_data');
    if (storedData) {
      const parsed = JSON.parse(storedData);
      setData(parsed.orders || []);
      setDelegate(parsed.delegate || null);
      
      // Auto print after a short delay
      setTimeout(() => {
        // window.print(); // Auto-print disabled
      }, 500);
    }

    // Date Logic
    const workDate = localStorage.getItem('adminWorkDate');
    let dateObj = new Date();
    let dateStr = dateObj.toLocaleDateString('en-GB');

    if (workDate) {
       const parts = workDate.split('/');
       if (parts.length === 3) {
          dateObj = new Date(parseInt(parts[2] || '0'), parseInt(parts[1] || '0') - 1, parseInt(parts[0] || '0'));
          dateStr = workDate;
       }
    }
    
    const dayName = dateObj.toLocaleDateString('ar-EG', { weekday: 'long' });
    setReportDate(`${dayName} - ${dateStr}`);
  }, []);

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

      {/* Header Container - Compacted */}
      <div className="flex justify-between items-start mb-2 pb-1 border-b-2 border-gray-800">
        {/* Right Side (First in RTL): Report Header Image */}
        <div className="w-1/3 text-right">
           <img 
             src="/images/report-header.png" 
             alt="Header" 
             className="h-32 object-contain object-top"
           />
        </div>

        {/* Center: Title */}
        <div className="w-1/3 flex flex-col items-center pt-2">
            <h2 className="text-lg font-bold bg-white text-black px-4 py-1 border border-black rounded-lg">
               كشف قيد عائلي ثاني مرة
            </h2>
             <div className="mt-1 bg-gray-200 rounded-md px-4 py-0.5 border border-gray-400 font-bold text-base">
             {reportDate}
           </div>
        </div>

        {/* Left Side (Last in RTL): Empty */}
        <div className="w-1/3 text-left">
        </div>
      </div>

      {/* Sub Header - Compacted */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
           <h3 className="text-sm font-bold">السيد العميد / مدير مصلحة الأحوال المدنية بالجيزة</h3>
        </div>
        <p className="text-center text-base font-bold mb-1">تحية طيبة وبعد</p>
        <p className="text-justify text-xs leading-snug mb-2 font-medium">
          أقر أنا / {delegate?.name || '................................'} مندوب البديل للخدمات الحكومية بانه تم تفويضي من قبل أصحاب الشأن لاستخراج المصدرات المدون أسمائهم في الكشف وتم أخذ إقرار من صاحب الشأن أمامي وإذا ظهر عكس ذلك أكون مسئول مسئولية كاملة وهذا اقرار مني بذلك / {delegate?.name || '................................'}
        </p>
      </div>

      {/* Table - Compacted */}
      <div className="mb-2">
        <table className="w-full border-collapse border border-gray-800 text-xs">
          <thead>
            <tr className="bg-gray-300 text-gray-900 border-b border-gray-800">
              <th className="border border-gray-800 p-0.5 w-8 text-center font-bold">م</th>
              <th className="border border-gray-800 p-0.5 text-right font-bold w-[35%]">الاسم</th>
              <th className="border border-gray-800 p-0.5 w-28 text-center font-bold">الرقم القومي</th>
              <th className="border border-gray-800 p-0.5 w-12 text-center font-bold">العدد</th>
              <th className="border border-gray-800 p-0.5 w-32 text-center font-bold">الجهة</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index} className="border-b border-gray-800 h-8">
                <td className="border border-gray-800 p-0.5 text-center font-bold">{index + 1}</td>
                <td className="border border-gray-800 p-0.5 text-right font-bold truncate max-w-[200px]">{item.name}</td>
                <td className="border border-gray-800 p-0.5 text-center font-bold font-mono tracking-wider">{item.idNumber}</td>
                <td className="border border-gray-800 p-0.5 text-center font-bold">{item.quantity}</td>
                <td className="border border-gray-800 p-0.5 text-center font-bold bg-gray-50">{item.source}</td>
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
