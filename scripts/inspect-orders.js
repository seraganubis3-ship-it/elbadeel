const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Simulating API Query (limit 100, desc)...');

  try {
    const orders = await prisma.order.findMany({
      where: {},
      orderBy: { id: 'desc' },
      take: 100,
      select: {
        id: true,
        createdAt: true,
        status: true,
        createdByAdminId: true,
        deliveryType: true,
      },
    });

    const missingIds = ['000117', '000118'];
    const found = orders.filter(o => missingIds.includes(o.id));

    console.log(`Query returned ${orders.length} orders.`);

    if (found.length > 0) {
      console.log('✅ SUCCESS: Found missing orders in the top 100 query!');
      found.forEach(f => console.log(` - ${f.id} (${f.status}) [${f.createdAt.toISOString()}]`));
    } else {
      console.log('❌ FAILURE: Missing orders are NOT in the top 100 query.');
      console.log('Top 5 orders:');
      orders.slice(0, 5).forEach(o => console.log(` - ${o.id} [${o.createdAt.toISOString()}]`));
    }
  } catch (error) {
    console.error('Error executing query:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
