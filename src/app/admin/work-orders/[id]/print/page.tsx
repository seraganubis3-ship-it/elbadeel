import { prisma } from '@/lib/prisma';
import { requireAdminOrStaff } from '@/lib/auth';
import { PrintClient } from './PrintClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PrintWorkOrderPage({ params }: Props) {
  await requireAdminOrStaff();
  const { id } = await params;
  const decodedId = decodeURIComponent(id);

  let orders;
  let title;

  if (decodedId.startsWith('date_')) {
      const dateStr = decodedId.replace('date_', '');
      const targetDate = new Date(dateStr);
      const startOfDay = new Date(dateStr); startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(dateStr); endOfDay.setHours(23,59,59,999);
      
      const OFFICIAL_EXTRACT_SLUGS = [
        'شهادة-الميلاد',
        'death-certificate',
        'marriage-certificate',
        'divorce-certificate',
        'individual-record'
      ];

      orders = await prisma.order.findMany({
        where: {
            createdAt: {
                gte: startOfDay,
                lte: endOfDay
            },
            service: { slug: { in: OFFICIAL_EXTRACT_SLUGS } },
            workOrderNumber: null
        },
        include: {
            service: true,
            variant: true,
        },
        orderBy: {
            createdAt: 'desc',
        },
      });
      title = `مستخرجات رسمية - ${dateStr}`;
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
            createdAt: 'desc',
        },
      });
      title = decodedId;
  }

  return <PrintClient workOrderNumber={title} orders={orders} />;
}
