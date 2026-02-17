import { Suspense } from 'react';
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

  return (
    <Suspense fallback={<div className='flex justify-center p-12'>جار التحميل...</div>}>
      <CheckoutClient services={services} />
    </Suspense>
  );
}
