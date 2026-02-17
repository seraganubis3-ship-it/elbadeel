import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAdminOrStaff } from '@/lib/auth';
import { getStatusText } from '@/app/admin/orders/types';
import { WorkOrderDetailsClient } from './WorkOrderDetailsClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkOrderDetailPage({ params }: Props) {
  await requireAdminOrStaff();
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  let orders;
  let title;

  if (decodedId.startsWith('date_')) {
    const dateStr = decodedId.replace('date_', '');
    const targetDate = new Date(dateStr);
    // Create UTC boundaries for the day (assuming stored dates are correct)
    const startOfDay = new Date(dateStr);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateStr);
    endOfDay.setHours(23, 59, 59, 999);

    const OFFICIAL_EXTRACT_SLUGS = ['birth-certificate'];

    orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        service: { slug: { in: OFFICIAL_EXTRACT_SLUGS } },
        workOrderNumber: null,
      },
      include: {
        service: true,
        variant: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    title = `شهادات ميلاد كمبيوتر - ${dateStr}`;
  } else {
    orders = await prisma.order.findMany({
      where: {
        workOrderNumber: parseInt(decodedId, 10),
      },
      include: {
        service: true,
        variant: true,
      },
      orderBy: {
        createdAt: 'desc', // or any logical order
      },
    });
    title = `أمر شغل رقم ${decodedId}`;
  }

  if (!orders || orders.length === 0) {
    return (
      <div className='p-8 text-center'>
        <h1 className='text-2xl font-bold mb-4'>أمر الشغل غير موجود أو فارغ</h1>
        <Link href='/admin/work-orders' className='text-blue-600 underline'>
          العودة للقائمة
        </Link>
      </div>
    );
  }

  // Calculate status summary
  const statuses = orders.reduce(
    (acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return <WorkOrderDetailsClient initialOrders={orders} title={title} decodedId={decodedId} />;
}
