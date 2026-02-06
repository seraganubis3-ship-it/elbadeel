import { prisma } from '@/lib/prisma';
import FAQClient from './FAQClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الأسئلة الشائعة - البديل للخدمات الحكومية',
  description: 'إجابات على جميع أسئلتك حول خدمات البديل للخدمات الحكومية - استخراج الأوراق الرسمية، الأسعار، المواعيد، وأكثر.',
  keywords: [
    'أسئلة شائعة',
    'البديل FAQ',
    'خدمات حكومية أسئلة',
    'استخراج أوراق',
    'أسعار الخدمات',
    'مواعيد التسليم'
  ],
  alternates: {
    canonical: 'https://albadel.com.eg/faq',
  },
  openGraph: {
    title: 'الأسئلة الشائعة - البديل للخدمات الحكومية',
    description: 'إجابات على جميع أسئلتك حول خدمات البديل للخدمات الحكومية.',
    url: 'https://albadel.com.eg/faq',
    siteName: 'البديل للخدمات الحكومية',
    locale: 'ar_EG',
    type: 'website',
  },
};

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({
    where: { active: true },
    orderBy: { orderIndex: 'asc' },
  });

  return <FAQClient faqs={faqs} />;
}
