const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: { service: true },
  });

  console.log('Recent Orders (first 20):');
  orders.forEach(o => {
    console.log(
      `Order ID: ${o.id}, WorkDate: ${o.workDate}, Service: ${o.service.name} (Slug: ${o.service.slug}), WorkOrderNum: ${o.workOrderNumber}`
    );
  });
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
