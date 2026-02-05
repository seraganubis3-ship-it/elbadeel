const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const services = await prisma.service.findMany({
    select: { name: true, slug: true }
  });
  console.log('Services:', JSON.stringify(services, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
