const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Migration script to convert existing order IDs to sequential numbers
 * Format: NNNNNN (6-digit sequential number starting from 000001)
 */
async function migrateOrderNumbers() {
  try {
    // Get all orders sorted by creation date
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    if (orders.length === 0) {
      return;
    }

    // Create a mapping of old IDs to new sequential IDs
    const idMapping = {};

    orders.forEach((order, index) => {
      const newId = (index + 1).toString().padStart(6, '0');
      idMapping[order.id] = newId;
    });

    Object.entries(idMapping).forEach(([oldId, newId]) => {});

    // Update orders in batches
    const batchSize = 50;
    const orderIds = Object.keys(idMapping);

    for (let i = 0; i < orderIds.length; i += batchSize) {
      const batch = orderIds.slice(i, i + batchSize);

      // Update each order in the batch
      for (const oldId of batch) {
        const newId = idMapping[oldId];

        try {
          // First, update the order ID
          await prisma.$executeRaw`
            UPDATE "Order" 
            SET id = ${newId} 
            WHERE id = ${oldId}
          `;

          // Update related tables that reference the order ID
          await prisma.$executeRaw`
            UPDATE "Payment" 
            SET "orderId" = ${newId} 
            WHERE "orderId" = ${oldId}
          `;

          await prisma.$executeRaw`
            UPDATE "OrderDocument" 
            SET "orderId" = ${newId} 
            WHERE "orderId" = ${oldId}
          `;

          await prisma.$executeRaw`
            UPDATE "FormSerial" 
            SET "orderId" = ${newId} 
            WHERE "orderId" = ${oldId}
          `;
        } catch (error) {}
      }
    }

    // Verify the migration
    const sampleOrders = await prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: 'asc',
      },
    });

    sampleOrders.forEach(order => {});
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
if (require.main === module) {
  migrateOrderNumbers()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      process.exit(1);
    });
}

module.exports = { migrateOrderNumbers };
