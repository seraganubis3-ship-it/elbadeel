const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PREDEFINED_FINES = [
  {
    id: 'fine_001',
    name: 'حالة اجتماعية',
    description: 'غرامة حالة اجتماعية',
    amountCents: 5000,
    category: 'غرامات',
  },
  {
    id: 'fine_002',
    name: 'مهنة',
    description: 'غرامة مهنة',
    amountCents: 5000,
    category: 'غرامات',
  },
  {
    id: 'fine_003',
    name: 'انتهاء',
    description: 'غرامة انتهاء',
    amountCents: 5000,
    category: 'غرامات',
  },
  {
    id: 'fine_004',
    name: 'محضر فقد',
    description: 'محضر فقد - لا يضيف رسوم إجبارية',
    amountCents: 10000,
    category: 'غرامات',
  },
  {
    id: 'fine_005',
    name: 'عنوان',
    description: 'غرامة عنوان',
    amountCents: 5000,
    category: 'غرامات',
  },
  {
    id: 'fine_006',
    name: 'تالف',
    description: 'غرامة تالف',
    amountCents: 5000,
    category: 'غرامات',
  },
  {
    id: 'fine_007',
    name: 'تأخير',
    description: 'غرامة تأخير',
    amountCents: 5000,
    category: 'غرامات',
  },
  {
    id: 'fine_008',
    name: 'أول مرة',
    description: 'غرامة أول مرة',
    amountCents: 10000,
    category: 'غرامات',
  },
  {
    id: 'service_001',
    name: 'مصاريف غرامة',
    description: 'مصاريف غرامة إضافية - تلقائية',
    amountCents: 0,
    category: 'خدمات اضافية',
  },
  {
    id: 'service_002',
    name: 'مصاريف ادارية',
    description: 'مصاريف ادارية - يدوية',
    amountCents: 0,
    category: 'خدمات اضافية',
  },
  {
    id: 'service_003',
    name: 'مصاريف اضافية',
    description: 'مصاريف اضافية - يدوية',
    amountCents: 0,
    category: 'خدمات اضافية',
  },
  {
    id: 'service_004',
    name: 'خدمات اضافية',
    description: 'خدمات اضافية - يدوية',
    amountCents: 0,
    category: 'خدمات اضافية',
  },
];

async function seed() {
  for (const fine of PREDEFINED_FINES) {
    const existing = await prisma.fine.findFirst({ where: { id: fine.id } });
    if (!existing) {
      await prisma.fine.create({
        data: {
          id: fine.id,
          name: fine.name,
          description: fine.description,
          amountCents: fine.amountCents,
          category: fine.category,
        },
      });
      console.log('Created', fine.name);
    } else {
      console.log('Exists', fine.name);
    }
  }
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
