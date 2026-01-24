'use client';

import { Order } from '../types';

interface OrderNotesProps {
  order: Order;
}

export default function OrderNotes({ order }: OrderNotesProps) {
  if (!order.notes && !order.adminNotes) return null;

  return (
    <div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-right'>
      <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center justify-end'>
        📝 الملاحظات
      </h2>
      {order.notes && (
        <div className='mb-4 p-4 bg-blue-50 rounded-lg'>
          <h3 className='font-medium text-gray-900 mb-2'>ملاحظات العميل:</h3>
          <p className='text-gray-700'>{order.notes}</p>
        </div>
      )}
      {order.adminNotes && (
        <div className='p-4 bg-green-50 rounded-lg'>
          <h3 className='font-medium text-gray-900 mb-2'>ملاحظات الإدارة:</h3>
          <p className='text-gray-700'>{order.adminNotes}</p>
        </div>
      )}
    </div>
  );
}
