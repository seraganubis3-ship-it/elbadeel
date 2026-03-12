const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all AL_BADEL form types with their variant links
  const badelTypes = await prisma.formType.findMany({
    where: { provider: 'AL_BADEL' },
    include: { variantLinks: true },
  });

  console.log(`Found ${badelTypes.length} AL_BADEL form types`);
  badelTypes.forEach(ft => {
    console.log(`  - ${ft.name} (${ft.id}) with ${ft.variantLinks.length} variant links`);
  });

  // Check if AL_WAFI types already exist
  const existingWafi = await prisma.formType.findMany({
    where: { provider: 'AL_WAFI' },
  });

  if (existingWafi.length > 0) {
    console.log(`\nAL_WAFI types already exist (${existingWafi.length}). No duplication needed.`);
    existingWafi.forEach(ft => console.log(`  - ${ft.name} (${ft.id})`));
    return;
  }

  // Create AL_WAFI copies
  for (const badelType of badelTypes) {
    const wafiType = await prisma.formType.create({
      data: {
        name: badelType.name,
        description: badelType.description,
        active: badelType.active,
        provider: 'AL_WAFI',
      },
    });
    console.log(`\nCreated AL_WAFI type: ${wafiType.name} (${wafiType.id})`);

    // Copy variant links
    if (badelType.variantLinks.length > 0) {
      for (const link of badelType.variantLinks) {
        await prisma.formTypeVariant.create({
          data: {
            formTypeId: wafiType.id,
            serviceVariantId: link.serviceVariantId,
          },
        });
      }
      console.log(`  Copied ${badelType.variantLinks.length} variant links`);
    }
  }

  console.log('\nDone! AL_WAFI form types created successfully.');
}

main()
  .catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
