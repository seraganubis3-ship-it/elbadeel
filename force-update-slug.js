const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Force update Birth Certificate by ID
  const id = 'cmkmqy8tj0019ux1dyksanwh4';
  await prisma.service.update({
    where: { id },
    data: { slug: 'birth-certificate' },
  });
  console.log('Force updated Birth Certificate slug to "birth-certificate"');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
