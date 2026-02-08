import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'البديل للخدمات الحكومية | مكتب البديل | منصة البديل - استخراج الأوراق الرسمية',
  description:
    'البديل للخدمات الحكومية - مكتب البديل - منصة البديل تساعدك في استخراج جميع الأوراق الرسمية بسرعة وبساطة. خبرة أكثر من 24 سنة في الخدمات الحكومية.',
  keywords: [
    'البديل للخدمات الحكومية',
    'مكتب البديل',
    'منصة البديل',
    'البديل',
    'خدمات حكومية',
    'استخراج أوراق رسمية',
    'مستندات حكومية',
    'خدمات مصر',
    'استخراج شهادات',
    'استخراج رخص',
  ],
  openGraph: {
    title: 'البديل للخدمات الحكومية | مكتب البديل | منصة البديل',
    description:
      'البديل للخدمات الحكومية - مكتب البديل - منصة البديل تساعدك في استخراج جميع الأوراق الرسمية بسرعة وبساطة.',
    type: 'website',
    url: 'https://albadel.com.eg',
    siteName: 'البديل للخدمات الحكومية',
    locale: 'ar_EG',
  },
  alternates: {
    canonical: 'https://albadel.com.eg',
  },
};

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch categories and services server-side with optimized selection
  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: 'asc' },
    select: {
      id: true,
      name: true,
      icon: true,
      services: {
        where: { active: true, isHidden: false },
        orderBy: { orderIndex: 'asc' },
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
          description: true,
          orderIndex: true,
          variants: {
            where: { active: true },
            orderBy: { priceCents: 'asc' },
            select: {
              priceCents: true,
              etaDays: true,
            },
          },
        },
      },
    },
  });

  // Fetch system settings
  let settings = await prisma.systemSettings.findFirst();
  if (!settings) {
    settings = await prisma.systemSettings.create({
      data: {
        id: 'main',
        siteName: 'البديل',
      },
    });
  }

  return <HomeClient categories={categories} settings={settings} />;
}
