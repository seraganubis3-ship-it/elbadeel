
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating default orderIndex for services...');
  // Update all services that have orderIndex = 0 to 99
  // This allows the user's manual "1", "2", etc. to come first.
  const result = await prisma.service.updateMany({
    where: {
      orderIndex: 0
    },
    data: {
      orderIndex: 99
    }
  });
  console.log(`Updated ${result.count} services to orderIndex 99.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
