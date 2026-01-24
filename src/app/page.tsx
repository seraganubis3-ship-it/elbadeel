import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'منصة البديل | خدمات استخراج الأوراق الرسمية',
  description:
    'منصة البديل تساعدك في استخراج جميع الأوراق الرسمية بسرعة وبساطة مع متابعة دقيقة لحالة الطلبات وخدمة دعم موثوقة.',
  openGraph: {
    title: 'منصة البديل | خدمات استخراج الأوراق الرسمية',
    description:
      'منصة البديل تساعدك في استخراج جميع الأوراق الرسمية بسرعة وبساطة مع متابعة دقيقة لحالة الطلبات وخدمة دعم موثوقة.',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
};

export default async function HomePage() {
  // Fetch categories and services server-side
  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      services: {
        where: { active: true },
        orderBy: { name: 'asc' },
        include: {
          variants: {
            where: { active: true },
            orderBy: { priceCents: 'asc' },
          },
        },
      },
    },
  });

  return <HomeClient categories={categories} />;
}
