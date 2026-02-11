'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

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
    <div className="min-h-screen bg-white p-8 print:p-8" dir="rtl">
      {/* Title */}
      <h1 className="text-3xl font-black text-center mb-8 border-b-2 border-black pb-4 uppercase">
        مواعيد التصوير اليومية 8.30
      </h1>

      {/* Table */}
      <table className="w-full border-collapse border border-gray-400 text-center">
        <thead>
          <tr className="bg-gray-200 print:bg-gray-300">
            <th className="border border-gray-600 px-2 py-1 font-black w-8 text-sm bg-gray-400/50">م</th>
            <th className="border border-gray-600 px-2 py-1 font-black text-lg">الاسم</th>
            <th className="border border-gray-600 px-2 py-1 font-black text-lg">التليفون</th>
            <th className="border border-gray-600 px-2 py-1 font-black text-lg w-1/3">ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className="print:break-inside-avoid h-8">
              <td className="border border-gray-600 px-1 py-1 font-bold bg-gray-100 text-sm">{index + 1}</td>
              <td className="border border-gray-600 px-2 py-1 font-bold text-base text-right leading-tight">{row.name}</td>
              <td className="border border-gray-600 px-2 py-1 font-bold font-mono text-base" dir="ltr">
                {row.phone}
              </td>
              <td className="border border-gray-600 px-2 py-1 font-bold text-base bg-gray-50 leading-tight">
                {row.note}
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={4} className="p-8 text-center text-gray-500">
                لا توجد بيانات
              </td>
            </tr>
          )}
        </tbody>
      </table>

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
          /* Ensure table headers repeat on new pages */
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
