const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Checking for Duplicate Services ---');

  const allServices = await prisma.service.findMany({
    select: { id: true, name: true, slug: true, active: true, categoryId: true },
  });

  console.table(allServices);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
