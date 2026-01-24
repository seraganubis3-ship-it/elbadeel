import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

// Next.js v15 expects `params` to be a Promise in App Router
export default async function OrderThankYou({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { service: true, variant: true },
  });
  if (!order) return notFound();

  return (
    <div className='min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 py-12'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
        {/* Success Icon */}
        <div className='mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8'>
          <svg
            className='w-12 h-12 text-green-600'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
          </svg>
        </div>

        {/* Success Message */}
        <h1 className='text-4xl font-bold text-gray-900 mb-4'>تم استلام طلبك بنجاح! 🎉</h1>

        <p className='text-xl text-gray-600 mb-8'>
          شكراً لك على ثقتك بنا. يرجى إتمام عملية الدفع للمتابعة.
        </p>

        {/* Order Details */}
        <div className='bg-white rounded-2xl p-8 shadow-xl border border-green-200 mb-8'>
          <h2 className='text-2xl font-bold text-gray-900 mb-6'>تفاصيل الطلب</h2>

          <div className='space-y-4'>
            <div className='flex items-center justify-between p-4 bg-green-50 rounded-xl'>
              <span className='text-gray-700 font-medium'>رقم الطلب:</span>
              <span className='font-mono font-bold text-green-600 text-lg'>{order.id}</span>
            </div>

            <div className='flex items-center justify-between p-4 bg-blue-50 rounded-xl'>
              <span className='text-gray-700 font-medium'>الخدمة:</span>
              <span className='font-bold text-blue-600'>{order.service.name}</span>
            </div>

            <div className='flex items-center justify-between p-4 bg-purple-50 rounded-xl'>
              <span className='text-gray-700 font-medium'>النوع:</span>
              <span className='font-bold text-purple-600'>{order.variant.name}</span>
            </div>

            <div className='flex items-center justify-between p-4 bg-yellow-50 rounded-xl'>
              <span className='text-gray-700 font-medium'>الإجمالي:</span>
              <span className='font-bold text-yellow-600 text-lg'>
                {(order.totalCents / 100).toFixed(2)} جنيه
              </span>
            </div>

            <div className='flex items-center justify-between p-4 bg-indigo-50 rounded-xl'>
              <span className='text-gray-700 font-medium'>التوصيل:</span>
              <span className='font-bold text-indigo-600'>
                {order.deliveryType === 'OFFICE' ? 'استلام من المكتب' : 'توصيل على العنوان'}
              </span>
            </div>

            {order.deliveryFee && order.deliveryFee > 0 && (
              <div className='flex items-center justify-between p-4 bg-red-50 rounded-xl'>
                <span className='text-gray-700 font-medium'>رسوم التوصيل:</span>
                <span className='font-bold text-red-600'>
                  {(order.deliveryFee / 100).toFixed(2)} جنيه
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Payment Button */}
        <div className='mb-8'>
          <Link
            href={`/order/${order.id}/payment`}
            className='inline-flex items-center justify-center gap-2 px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-medium text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
          >
            <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6'
              />
            </svg>
            إتمام الدفع
          </Link>
        </div>

        {/* Additional Info */}
        <div className='text-center'>
          <p className='text-gray-500 text-sm'>
            بعد إتمام الدفع، سيتم مراجعة طلبك والبدء في التنفيذ في أقرب وقت ممكن.
          </p>
        </div>
      </div>
    </div>
  );
}
