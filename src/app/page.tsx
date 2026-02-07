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

export default async function HomePage() {
  // Fetch categories and services server-side
  const categories = await prisma.category.findMany({
    orderBy: { orderIndex: 'asc' },
    include: {
      services: {
        where: { active: true, isHidden: false },
        orderBy: { orderIndex: 'asc' },
        include: {
          variants: {
            where: { active: true },
            orderBy: { priceCents: 'asc' },
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
