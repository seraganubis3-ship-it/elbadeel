import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import HomeClient from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'البديل للخدمات الحكومية | استخراج بطاقة رقم قومي وخدمات الحكومية في مصر',
  description:
    "مكتب البديل للخدمات الحكومية في مصر لاستخراج بطاقة رقم قومي، جواز سفر، فيش جنائي، قيد عائلي وتصديق المستندات بسرعة وأمان. أنجز أوراقك الرسمية بدون زحام مع فريق متخصص وأسعار تنافسية وخدمة موثوقة.",
  keywords: [
    'البديل للخدمات الحكومية',
    'مكتب البديل للخدمات الحكومية',
    'استخراج بطاقة رقم قومي',
    'استخراج جواز سفر',
    'استخراج فيش جنائي',
    'تصديق مستندات',
    'مكتب خدمات حكومية',
    'خدمات حكومية في الجيزة',
    'خدمات حكومية في فيصل',
    'استخراج أوراق رسمية بسرعة',
    'مكتب تخليص معاملات حكومية',
    'سعر استخراج بطاقة رقم قومي',
    'استخراج جواز سفر مستعجل',
  ],
  openGraph: {
    title: 'البديل للخدمات الحكومية | استخراج بطاقة رقم قومي وخدمات الحكومية في مصر',
    description:
      "مكتب البديل للخدمات الحكومية في مصر لاستخراج بطاقة رقم قومي، جواز سفر، فيش جنائي، قيد عائلي وتصديق المستندات بسرعة وأمان. أنجز أوراقك الرسمية بدون زحام مع فريق متخصص وأسعار تنافسية وخدمة موثوقة.",
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
