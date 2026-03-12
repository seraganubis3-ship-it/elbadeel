const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [users, orders, formTypes, serials, services] = await Promise.all([
    prisma.user.count(),
    prisma.order.count(),
    prisma.formType.count(),
    prisma.formSerial.count(),
    prisma.service.count(),
  ]);

  console.log('=== DATABASE STATUS ===');
  console.log(`Users: ${users}`);
  console.log(`Orders: ${orders}`);
  console.log(`FormTypes: ${formTypes}`);
  console.log(`FormSerials: ${serials}`);
  console.log(`Services: ${services}`);
}

main()
  .catch(e => { console.error(e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
