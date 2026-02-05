'use client';

import { useState, useEffect } from 'react';
import { Order } from '../types';

interface PhoneReportModalProps {
  isOpen: boolean;
  selectedOrders: string[];
  orders: Order[];
  onClose: () => void;
  onPrint: (ordersWithNotes: { orderId: string; note: string }[]) => void;
}

export function PhoneReportModal({
  isOpen,
  selectedOrders,
  orders,
  onClose,
  onPrint,
}: PhoneReportModalProps) {
  const [notes, setNotes] = useState<{ [key: string]: string }>({});

  // Reset notes when modal opens
  useEffect(() => {
    if (isOpen) {
      setNotes({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const targetOrders = orders.filter((o) => selectedOrders.includes(o.id));

  const handleNoteChange = (orderId: string, value: string) => {
    setNotes((prev) => ({ ...prev, [orderId]: value }));
  };

  const handlePrintParams = () => {
    const reportData = targetOrders.map((order) => ({
      orderId: order.id,
      note: notes[order.id] || '',
    }));
    onPrint(reportData);
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col'>
        <div className='p-6 border-b border-gray-100 flex justify-between items-center'>
          <h2 className='text-2xl font-bold text-gray-800'>كشف أرقام التليفونات</h2>
          <button
            onClick={onClose}
            className='text-gray-400 hover:text-red-500 transition-colors'
          >
            <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
            </svg>
          </button>
        </div>

        <div className='p-6 overflow-y-auto flex-1'>
          <table className='w-full text-right border-separate border-spacing-y-2'>
            <thead>
              <tr className='text-gray-500 text-sm'>
                <th className='px-4 pb-2'>العميل</th>
                <th className='px-4 pb-2'>رقم الهاتف</th>
                <th className='px-4 pb-2'>ملاحظات للكشف (تجديد، أول مرة، إلخ...)</th>
              </tr>
            </thead>
            <tbody>
              {targetOrders.map((order) => (
                <tr key={order.id} className='bg-gray-50 rounded-xl'>
                  <td className='p-4 font-bold text-gray-800 rounded-r-xl'>
                    {order.customerName}
                  </td>
                  <td className='p-4 text-gray-600 font-mono text-left' dir="ltr">
                    {order.customerPhone}
                  </td>
                  <td className='p-4 rounded-l-xl'>
                    <input
                      type='text'
                      placeholder='اكتب ملاحظة...'
                      className='w-full px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all'
                      value={notes[order.id] || ''}
                      onChange={(e) => handleNoteChange(order.id, e.target.value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className='p-6 border-t border-gray-100 flex justify-end gap-3'>
          <button
            onClick={onClose}
            className='px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-colors'
          >
            إلغاء
          </button>
          <button
            onClick={handlePrintParams}
            className='px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2'
          >
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z' />
            </svg>
            طباعة الكشف
          </button>
        </div>
      </div>
    </div>
  );
}
