
import { prisma } from '@/lib/prisma';
import CheckoutClient from './CheckoutClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إتمام الطلب - خدمات البديل',
  description: 'أكمل طلبك وأنشئ حسابك في ثوانٍ معدودة',
};

export default async function CheckoutPage() {
  const services = await prisma.service.findMany({
    where: { active: true },
    include: {
      variants: {
        where: { active: true },
        orderBy: { priceCents: 'asc' },
      },
    },
    orderBy: { orderIndex: 'asc' },
  });

  return <CheckoutClient services={services} />;
}
