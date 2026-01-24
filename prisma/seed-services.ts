import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding additional demo services...');

  // Ensure "General" category exists or find a suitable one
  let category = await prisma.category.findFirst({
    where: { name: 'خدمات عامة' },
  });

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: 'خدمات عامة',
        slug: 'general-services',
        icon: '🏛️',
      },
    });
  }

  const demoServices = [
    {
      name: 'استخراج جواز سفر',
      slug: 'passport',
      icon: '🛂',
      description: 'استخراج وتجديد جواز السفر المصري',
    },
    {
      name: 'قيد عائلي',
      slug: 'family-record',
      icon: '👪',
      description: 'استخراج القيد العائلي المميكن',
    },
    {
      name: 'وثيقة طلاق',
      slug: 'divorce-paper',
      icon: '📄',
      description: 'استخراج مستخرج رسمي من وثيقة الطلاق',
    },
    {
      name: 'شهادة وفاة',
      slug: 'death-cert',
      icon: '⚰️',
      description: 'استخراج شهادة الوفاة المميكنة',
    },
    {
      name: 'بطاقة الرقم القومي',
      slug: 'national-id',
      icon: '🪪',
      description: 'تجديد واستخراج بدل فاقد البطاقة الشخصية',
    },
    {
      name: 'شهادة ميلاد',
      slug: 'birth-cert',
      icon: '👶',
      description: 'استخراج شهادة الميلاد الكمبيوتر',
    },
    {
      name: 'رخصة قيادة',
      slug: 'driving-license',
      icon: '🚗',
      description: 'تجديد رخصة القيادة الخاصة',
    },
    {
      name: 'توكيل عام قضايا',
      slug: 'power-attorney',
      icon: '⚖️',
      description: 'خدمات التوثيق والشهر العقاري',
    },
    {
      name: 'فيش وتشبيه',
      slug: 'criminal-record',
      icon: '🚓',
      description: 'استخراج صحيفة الحالة الجنائية',
    },
    {
      name: 'تصريح سفر',
      slug: 'travel-permit',
      icon: '✈️',
      description: 'استخراج تصاريح السفر الأمنية',
    },
  ];

  for (const service of demoServices) {
    const existing = await prisma.service.findUnique({
      where: { slug: service.slug },
    });

    if (!existing) {
      await prisma.service.create({
        data: {
          name: service.name,
          slug: service.slug,
          icon: service.icon,
          description: service.description,
          categoryId: category.id,
          active: true,
        },
      });
      console.log(`Created service: ${service.name}`);
    } else {
      console.log(`Service already exists: ${service.name}`);
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
