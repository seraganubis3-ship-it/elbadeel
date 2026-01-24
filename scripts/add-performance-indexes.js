// Script to add performance indexes to the database
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addPerformanceIndexes() {
  try {
    // User table indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_email ON "User"("email");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_created_at ON "User"("createdAt");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_users_verified ON "User"("emailVerified");
    `;

    // Service table indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_services_category_id ON "Service"("categoryId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_services_active ON "Service"("active");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_services_created_at ON "Service"("createdAt");
    `;

    // Order table indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON "Order"("userId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_service_id ON "Order"("serviceId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_status ON "Order"("status");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON "Order"("createdAt");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_updated_at ON "Order"("updatedAt");
    `;

    // Composite indexes for common queries
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_user_status ON "Order"("userId", "status");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_service_status ON "Order"("serviceId", "status");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_orders_created_status ON "Order"("createdAt", "status");
    `;

    // ServiceVariant table indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_service_variants_service_id ON "ServiceVariant"("serviceId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_service_variants_active ON "ServiceVariant"("active");
    `;

    // Category table indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON "Category"("slug");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_categories_active ON "Category"("active");
    `;

    // OrderForm table indexes (if exists)
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_order_forms_order_id ON "OrderForm"("orderId");
      `;
    } catch (error) {}

    // FormType table indexes
    // Note: FormType doesn't have categoryId field

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_form_types_active ON "FormType"("active");
    `;

    // Notification table indexes (if exists)
    try {
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON "Notification"("userId");
      `;
    } catch (error) {}

    // Payment table indexes
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_payments_order_id ON "Payment"("orderId");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_payments_status ON "Payment"("status");
    `;

    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_payments_created_at ON "Payment"("createdAt");
    `;

    // Show index statistics
    const indexStats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
      ORDER BY tablename, indexname;
    `;
  } catch (error) {
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script
if (require.main === module) {
  addPerformanceIndexes()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      process.exit(1);
    });
}

module.exports = { addPerformanceIndexes };
