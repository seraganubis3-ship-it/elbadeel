const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function deleteAllServices() {
  console.log('🗑️ Starting to delete all services...\n');

  try {
    // Delete service variants first (child records)
    const deletedVariants = await prisma.serviceVariant.deleteMany();
    console.log(`✅ Deleted ${deletedVariants.count} service variants`);

    // Delete service documents
    const deletedDocuments = await prisma.serviceDocument.deleteMany();
    console.log(`✅ Deleted ${deletedDocuments.count} service documents`);

    // Delete services
    const deletedServices = await prisma.service.deleteMany();
    console.log(`✅ Deleted ${deletedServices.count} services`);

    console.log('\n🎉 Done! All services have been deleted.');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllServices();
