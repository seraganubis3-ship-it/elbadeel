import Link from 'next/link';
import { requireAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';

export default async function AdminPage() {
  const session = await requireAuth();

  // Check if user is admin
  if (session.user.role !== 'ADMIN') {
    redirect('/');
  }

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Fetch today's orders (from website only, not admin created)
  const todayOrders = await prisma.order.findMany({
    where: {
      createdAt: {
        gte: today,
        lt: tomorrow,
      },
      createdByAdminId: null, // Only orders from website
    },
    include: {
      service: true,
      variant: true,
      user: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  // Fetch orders due for delivery today
  const deliveryDueToday = await prisma.order
    .findMany({
      where: {
        status: {
          not: 'completed',
        },
        createdAt: {
          lte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Orders older than 1 day
        },
      },
      include: {
        service: true,
        variant: true,
        user: true,
      },
    })
    .then(orders =>
      orders.filter(order => {
        if (!order.variant?.etaDays) return false;
        const expectedDelivery = new Date(order.createdAt);
        expectedDelivery.setDate(expectedDelivery.getDate() + order.variant.etaDays);
        return expectedDelivery.toDateString() === today.toDateString();
      })
    );

  // Get pending orders count
  const pendingOrdersCount = await prisma.order.count({
    where: {
      status: {
        in: ['pending', 'payment_pending', 'reviewing', 'processing'],
      },
    },
  });

  // Get total orders count
  const totalOrdersCount = await prisma.order.count();

  // Get completed orders count
  const completedOrdersCount = await prisma.order.count({
    where: {
      status: 'completed',
    },
  });

  return (
    <div
      className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100'
      dir='rtl'
    >
      {/* Header */}
      <div className='bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200/50 sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4 space-x-reverse'>
              <div className='w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-8 h-8 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                  />
                </svg>
              </div>
              <div>
                <h1 className='text-3xl sm:text-4xl font-bold text-gray-900'>لوحة الإدارة</h1>
                <p className='text-gray-600 mt-1 text-base sm:text-lg'>
                  مرحباً بك في نظام إدارة الطلبات
                </p>
              </div>
            </div>
            <Link
              href='/'
              className='inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-sm sm:text-base'
            >
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 ml-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
                />
              </svg>
              <span className='hidden sm:inline'>العودة للرئيسية</span>
              <span className='sm:hidden'>الرئيسية</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Dashboard */}
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Quick Stats */}
        <div className='mb-8'>
          <h2 className='text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center'>
            نظرة عامة على النظام
          </h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
            <div className='bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg p-6 sm:p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-3xl sm:text-4xl font-bold'>{totalOrdersCount}</div>
                  <div className='text-blue-100 mt-2 text-sm sm:text-base'>إجمالي الطلبات</div>
                </div>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 sm:w-8 sm:h-8'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-3xl sm:text-4xl font-bold'>{pendingOrdersCount}</div>
                  <div className='text-amber-100 mt-2 text-sm sm:text-base'>طلبات معلقة</div>
                </div>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 sm:w-8 sm:h-8'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-green-600 to-green-700 rounded-2xl shadow-lg p-6 sm:p-8 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-2 lg:col-span-1'>
              <div className='flex items-center justify-between'>
                <div>
                  <div className='text-3xl sm:text-4xl font-bold'>{completedOrdersCount}</div>
                  <div className='text-green-100 mt-2 text-sm sm:text-base'>طلبات مكتملة</div>
                </div>
                <div className='w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-6 h-6 sm:w-8 sm:h-8'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Orders Section */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
            <div className='flex items-center space-x-4 space-x-reverse'>
              <div className='w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-blue-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <div>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>طلبات اليوم</h2>
                <p className='text-gray-600 text-sm sm:text-base'>
                  الطلبات الجديدة من الموقع اليوم
                </p>
              </div>
            </div>
            <Link
              href='/admin/orders'
              className='inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center'
            >
              <svg
                className='w-4 h-4 sm:w-5 sm:h-5 ml-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 5l7 7-7 7'
                />
              </svg>
              عرض جميع الطلبات
            </Link>
          </div>

          {todayOrders.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center'>
              <div className='text-4xl sm:text-6xl mb-4'>📭</div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>
                لا توجد طلبات جديدة اليوم
              </h3>
              <p className='text-gray-600 text-sm sm:text-base'>
                لم يتم إنشاء أي طلبات من الموقع اليوم
              </p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {todayOrders.slice(0, 6).map(order => (
                <div
                  key={order.id}
                  className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center space-x-3 space-x-reverse'>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                        <span className='text-blue-600 font-bold text-xs sm:text-sm'>
                          #{order.id.slice(-4)}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-gray-900 text-sm sm:text-base truncate'>
                          {order.service?.name || 'خدمة غير محددة'}
                        </h3>
                        <p className='text-xs sm:text-sm text-gray-600 truncate'>
                          {order.variant?.name || 'نوع غير محدد'}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                        order.status === 'waiting_confirmation'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'waiting_payment'
                            ? 'bg-orange-100 text-orange-800'
                            : order.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'settlement'
                                ? 'bg-blue-100 text-blue-800'
                                : order.status === 'fulfillment'
                                  ? 'bg-purple-100 text-purple-800'
                                  : order.status === 'supply'
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : order.status === 'delivery'
                                      ? 'bg-teal-100 text-teal-800'
                                      : order.status === 'returned'
                                        ? 'bg-red-100 text-red-800'
                                        : order.status === 'cancelled'
                                          ? 'bg-gray-100 text-gray-800'
                                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {order.status === 'waiting_confirmation'
                        ? 'انتظار التاكيد'
                        : order.status === 'waiting_payment'
                          ? 'انتظار الدفع'
                          : order.status === 'paid'
                            ? 'تم تدفع'
                            : order.status === 'settlement'
                              ? 'تسديد'
                              : order.status === 'fulfillment'
                                ? 'استيفاء'
                                : order.status === 'supply'
                                  ? 'توريد'
                                  : order.status === 'delivery'
                                    ? 'تسليم'
                                    : order.status === 'returned'
                                      ? 'مرتجع'
                                      : order.status === 'cancelled'
                                        ? 'الغاء'
                                        : order.status}
                    </span>
                  </div>

                  <div className='space-y-2 mb-4'>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <span className='text-gray-600'>العميل:</span>
                      <span className='font-medium text-gray-900 truncate'>
                        {order.customerName}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <span className='text-gray-600'>الهاتف:</span>
                      <span className='font-medium text-gray-900 truncate'>
                        {order.customerPhone && order.customerPhone !== 'unknown'
                          ? order.customerPhone
                          : order.user?.phone && order.user.phone !== 'unknown'
                            ? order.user.phone
                            : 'غير محدد'}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <span className='text-gray-600'>المبلغ:</span>
                      <span className='font-bold text-green-600'>
                        {(order.totalCents / 100).toFixed(2)} جنيه
                      </span>
                    </div>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <span className='text-gray-600'>الوقت:</span>
                      <span className='font-medium text-gray-900'>
                        {new Date(order.createdAt).toLocaleTimeString('ar-EG', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className='w-full block text-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-xs sm:text-sm font-medium'
                  >
                    عرض التفاصيل
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Delivery Due Today Section */}
        <div className='mb-8'>
          <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4'>
            <div className='flex items-center space-x-4 space-x-reverse'>
              <div className='w-12 h-12 bg-red-100 rounded-full flex items-center justify-center'>
                <svg
                  className='w-6 h-6 text-red-600'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                  />
                </svg>
              </div>
              <div>
                <h2 className='text-xl sm:text-2xl font-bold text-gray-900'>
                  طلبات مفترض تسليمها اليوم
                </h2>
                <p className='text-gray-600 text-sm sm:text-base'>الطلبات المستحقة للتسليم اليوم</p>
              </div>
            </div>
            <span
              className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${
                deliveryDueToday.length > 0
                  ? 'bg-red-100 text-red-800 border border-red-200'
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}
            >
              {deliveryDueToday.length} طلب
            </span>
          </div>

          {deliveryDueToday.length === 0 ? (
            <div className='bg-white rounded-2xl shadow-lg p-6 sm:p-8 text-center'>
              <div className='text-4xl sm:text-6xl mb-4'>✅</div>
              <h3 className='text-lg sm:text-xl font-bold text-gray-900 mb-2'>
                لا توجد طلبات مستحقة اليوم
              </h3>
              <p className='text-gray-600 text-sm sm:text-base'>جميع الطلبات في مواعيدها المحددة</p>
            </div>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'>
              {deliveryDueToday.slice(0, 6).map(order => (
                <div
                  key={order.id}
                  className='bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow duration-300 border-l-4 border-red-500'
                >
                  <div className='flex items-center justify-between mb-4'>
                    <div className='flex items-center space-x-3 space-x-reverse'>
                      <div className='w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center'>
                        <span className='text-red-600 font-bold text-xs sm:text-sm'>
                          #{order.id.slice(-4)}
                        </span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <h3 className='font-bold text-gray-900 text-sm sm:text-base truncate'>
                          {order.service?.name || 'خدمة غير محددة'}
                        </h3>
                        <p className='text-xs sm:text-sm text-gray-600 truncate'>
                          {order.variant?.name || 'نوع غير محدد'}
                        </p>
                      </div>
                    </div>
                    <span className='px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium whitespace-nowrap'>
                      مستحق اليوم
                    </span>
                  </div>

                  <div className='space-y-2 mb-4'>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <span className='text-gray-600'>العميل:</span>
                      <span className='font-medium text-gray-900 truncate'>
                        {order.customerName}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <span className='text-gray-600'>الهاتف:</span>
                      <span className='font-medium text-gray-900 truncate'>
                        {order.customerPhone && order.customerPhone !== 'unknown'
                          ? order.customerPhone
                          : order.user?.phone && order.user.phone !== 'unknown'
                            ? order.user.phone
                            : 'غير محدد'}
                      </span>
                    </div>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <span className='text-gray-600'>المدة المتوقعة:</span>
                      <span className='font-medium text-gray-900'>
                        {order.variant?.etaDays || 'غير محدد'} يوم
                      </span>
                    </div>
                    <div className='flex justify-between text-xs sm:text-sm'>
                      <span className='text-gray-600'>تاريخ الطلب:</span>
                      <span className='font-medium text-gray-900'>
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/orders/${order.id}`}
                    className='w-full block text-center px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium'
                  >
                    متابعة الطلب
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
