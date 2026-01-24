import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const keepNames = ['عادي', 'سريع', 'فوري'];

  // Delete all form types not in the keep list (cascades will remove links/serials)
  await prisma.formType.deleteMany({
    where: { name: { notIn: keepNames } },
  });

  // Ensure the three exist
  await Promise.all([
    prisma.formType.upsert({
      where: { name: 'عادي' },
      update: { active: true },
      create: { name: 'عادي', description: 'استمارة عادية', active: true },
    }),
    prisma.formType.upsert({
      where: { name: 'سريع' },
      update: { active: true },
      create: { name: 'سريع', description: 'استمارة سريعة', active: true },
    }),
    prisma.formType.upsert({
      where: { name: 'فوري' },
      update: { active: true },
      create: { name: 'فوري', description: 'استمارة فورية', active: true },
    }),
  ]);

  await prisma.formType.findMany({ orderBy: { name: 'asc' } });
}

main()
  .catch(_e => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
