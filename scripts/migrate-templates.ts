import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const MANUAL_TEMPLATES = [
  {
    title: 'ترحيب واستلام الطلب',
    body: 'أهلاً بك أستاذ <customer_name>، تم استلام طلبك الخاص بخدمة <service_name> بنجاح وجاري العمل عليه.',
  },
  {
    title: 'تحديث: قيد التنفيذ',
    body: 'أهلاً بك أستاذ <customer_name>، بخصوص طلبك (<service_name>)، تم البدء في التنفيذ وسنقوم بإبلاغك بمجرد الانتهاء.',
  },
  {
    title: 'نقص في المستندات',
    body: 'أهلاً بك أستاذ <customer_name>، بخصوص طلبك (<service_name>)، يوجد نقص في بعض المستندات المطلوبة. يرجى مراجعة الموقع أو التواصل معنا لاستكمالها.',
  },
  {
    title: 'اكتمال الطلب',
    body: 'أهلاً بك أستاذ <customer_name>، يسعدنا إبلاغك بأن طلبك الخاص بخدمة <service_name> قد اكتمل وهو جاهز الآن.',
  },
];

async function main() {
  console.log('Starting migration...');

  for (const t of MANUAL_TEMPLATES) {
    const existing = await prisma.whatsAppTemplate.findFirst({
      where: { title: t.title, category: 'MANUAL' },
    });

    if (!existing) {
      await prisma.whatsAppTemplate.create({
        data: {
          title: t.title,
          body: t.body,
          category: 'MANUAL',
          active: true,
        },
      });
      console.log(`Created: ${t.title}`);
    } else {
      console.log(`Skipped (already exists): ${t.title}`);
    }
  }

  console.log('Migration finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
