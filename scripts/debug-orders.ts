import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Latest 10 Orders ---');
  const orders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      createdByAdmin: { select: { name: true } },
    },
  });

  const mapped = orders.map(o => ({
    id: o.id,
    customer: o.customerName,
    admin: o.createdByAdmin?.name || 'NULL',
    adminId: o.createdByAdminId,
    created: o.createdAt.toISOString(),
    status: o.status,
  }));

  console.table(mapped);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
