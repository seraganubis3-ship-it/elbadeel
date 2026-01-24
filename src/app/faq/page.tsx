import { prisma } from '@/lib/prisma';
import FAQClient from './FAQClient';

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({
    where: { active: true },
    orderBy: { orderIndex: 'asc' },
  });

  return <FAQClient faqs={faqs} />;
}
