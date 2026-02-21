'use client';

import { getStatusText } from '@/app/admin/orders/types';
import { useEffect } from 'react';
import { Order, Service, ServiceVariant } from '@prisma/client';
import Image from 'next/image';

// Define a minimal type for the order data we're passing
// We can use the Prisma types or simpler ones
interface Props {
  workOrderNumber: string;
  orders: (Order & { service: Service; variant: ServiceVariant | null })[];
}

export function PrintClient({ workOrderNumber, orders }: Props) {
  // Auto print effect
  useEffect(() => {
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='min-h-screen bg-white p-8 print:p-4' dir='rtl'>
      {/* Header with Logo */}
      <div className='flex items-center justify-between border-b-2 border-black pb-4 mb-2'>
        <div className='flex items-center gap-4'>
          <div className='relative w-64 h-32'>
            <Image
              src='/images/report-header.png'
              alt='Logo'
              width={256}
              height={128}
              className='object-contain w-full h-full object-right'
            />
          </div>
        </div>

        <div className='text-left'>
          <h2 className='text-lg font-bold text-gray-800'>أمر شغل رقم</h2>
          <div className='text-xl font-black font-mono text-gray-900' dir='ltr'>
            {workOrderNumber}
          </div>
        </div>
      </div>

      {/* Group orders by Service Name */}
      {Object.entries(
        orders.reduce(
          (acc, order) => {
            const serviceName = order.service.name;
            if (!acc[serviceName]) acc[serviceName] = [];
            acc[serviceName]!.push(order);
            return acc;
          },
          {} as Record<string, typeof orders>
        )
      ).map(([serviceName, serviceOrders]) => (
        <div key={serviceName} className='mb-8 keep-together'>
          <h3 className='text-lg font-bold text-gray-800 mb-2 border-b-2 border-gray-400 pb-1'>
            {serviceName} ({serviceOrders.length})
          </h3>
          <table className='w-full border-collapse border border-gray-400 text-center text-sm mb-4'>
            <thead>
              <tr className='bg-gray-200 print:bg-gray-300'>
                <th className='border border-gray-600 px-1 py-1 font-black w-10 bg-gray-400/50'>
                  م
                </th>
                <th className='border border-gray-600 px-2 py-1 font-black'>اسم العميل</th>
                <th className='border border-gray-600 px-2 py-1 font-black'>النوع/ملاحظات</th>
                <th className='border border-gray-600 px-2 py-1 font-black'>حالة الطلب</th>
              </tr>
            </thead>
            <tbody>
              {serviceOrders.map((order, index) => (
                <tr key={order.id} className='print:break-inside-avoid'>
                  <td className='border border-gray-600 px-1 py-1 font-bold bg-gray-100'>
                    {index + 1}
                  </td>
                  <td className='border border-gray-600 px-2 py-1 font-bold text-right'>
                    {order.customerName}
                  </td>
                  <td className='border border-gray-600 px-2 py-1 font-bold text-sm'>
                    {order.variant?.name || '-'}
                  </td>
                  <td className='border border-gray-600 px-2 py-1 font-bold bg-gray-50'>
                    {getStatusText(order.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {orders.length === 0 && (
        <div className='p-8 text-center text-gray-500 border border-gray-300 rounded'>
          لا توجد طلبات في أمر الشغل هذا
        </div>
      )}

      <style jsx global>{`
        @media print {
          @page {
            size: A5 landscape;
            margin: 0;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            background: white !important;
          }
          thead {
            display: table-header-group;
          }
          tr {
            page-break-inside: avoid;
          }
          .keep-together {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
