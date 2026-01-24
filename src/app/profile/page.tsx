import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth.config';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import ProfileForm from './ProfileForm';
import Link from 'next/link';
import { User } from '@prisma/client';

export default async function ProfilePage() {
  const session = await getServerSession(authConfig);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      wifeName: true,
      fatherName: true,
      motherName: true,
      birthDate: true,
      nationality: true,
      idNumber: true,
      address: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Fetch order statistics
  let totalOrders = 0;
  let pendingOrders = 0;
  let completedOrders = 0;

  try {
    const [total, pending, completed] = await Promise.all([
      prisma.order.count({ where: { userId: session.user.id } }),
      prisma.order.count({
        where: {
          userId: session.user.id,
          status: { in: ['PENDING', 'IN_PROGRESS', 'UNDER_REVIEW'] },
        },
      }),
      prisma.order.count({ where: { userId: session.user.id, status: 'COMPLETED' } }),
    ]);
    totalOrders = total;
    pendingOrders = pending;
    completedOrders = completed;
  } catch (error) {
    // Silent fail
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Hero Header */}
      <div
        className='relative bg-cover bg-center bg-no-repeat'
        style={{ backgroundImage: "url('/images/government-services-bg.jpg')" }}
      >
        {/* Dark overlay */}
        <div className='absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/60 to-slate-800/70'></div>

        <div className='relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16'>
          <div className='flex flex-col sm:flex-row sm:items-center gap-6'>
            {/* Avatar */}
            <div className='w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-xl shadow-emerald-500/25'>
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '؟'}
            </div>

            {/* User Info */}
            <div className='flex-1'>
              <h1 className='text-2xl sm:text-3xl font-bold text-white mb-1'>
                {user?.name || 'المستخدم'}
              </h1>
              <p className='text-slate-400 text-sm sm:text-base mb-3'>{user?.email}</p>
              <div className='flex items-center gap-3'>
                <span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'>
                  {user?.role === 'ADMIN' ? 'مدير' : 'مستخدم'}
                </span>
                <span className='text-slate-500 text-xs'>
                  عضو منذ{' '}
                  {new Date(user?.createdAt as Date).toLocaleDateString('ar-EG', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className='flex gap-3 mt-4 sm:mt-0'>
              <Link
                href='/orders'
                className='flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium transition-all border border-white/10'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1.5}
                    d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                  />
                </svg>
                طلباتي
              </Link>
              <Link
                href='/profile/change-password'
                className='flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-emerald-500/25'
              >
                <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z'
                  />
                </svg>
                تغيير كلمة المرور
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* Statistics Cards */}
        <div className='grid grid-cols-3 gap-4 sm:gap-6 -mt-12 mb-8 relative z-10'>
          <div className='bg-white rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-100 text-center'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
              <svg
                className='w-5 h-5 sm:w-6 sm:h-6 text-blue-600'
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
            <p className='text-2xl sm:text-3xl font-bold text-slate-900'>{totalOrders}</p>
            <p className='text-slate-500 text-xs sm:text-sm mt-1'>إجمالي الطلبات</p>
          </div>

          <div className='bg-white rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-100 text-center'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
              <svg
                className='w-5 h-5 sm:w-6 sm:h-6 text-amber-600'
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
            <p className='text-2xl sm:text-3xl font-bold text-slate-900'>{pendingOrders}</p>
            <p className='text-slate-500 text-xs sm:text-sm mt-1'>قيد المراجعة</p>
          </div>

          <div className='bg-white rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-100 text-center'>
            <div className='w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
              <svg
                className='w-5 h-5 sm:w-6 sm:h-6 text-emerald-600'
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
            <p className='text-2xl sm:text-3xl font-bold text-slate-900'>{completedOrders}</p>
            <p className='text-slate-500 text-xs sm:text-sm mt-1'>مكتملة</p>
          </div>
        </div>

        {/* Profile Form Card */}
        <div className='bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden mb-6'>
          <div className='px-6 py-5 border-b border-slate-100'>
            <h2 className='text-lg font-bold text-slate-900'>المعلومات الشخصية</h2>
            <p className='text-slate-500 text-sm mt-0.5'>قم بتحديث بياناتك الشخصية</p>
          </div>
          <div className='p-6'>
            <ProfileForm user={user as User} />
          </div>
        </div>

        {/* Account Info */}
        <div className='bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden'>
          <div className='px-6 py-5 border-b border-slate-100'>
            <h2 className='text-lg font-bold text-slate-900'>معلومات الحساب</h2>
          </div>
          <div className='p-6'>
            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div className='bg-slate-50 rounded-xl p-4'>
                <p className='text-slate-500 text-sm mb-1'>تاريخ إنشاء الحساب</p>
                <p className='text-slate-900 font-semibold'>
                  {new Date(user?.createdAt as Date).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className='bg-slate-50 rounded-xl p-4'>
                <p className='text-slate-500 text-sm mb-1'>آخر تحديث</p>
                <p className='text-slate-900 font-semibold'>
                  {new Date(user?.updatedAt as Date).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
