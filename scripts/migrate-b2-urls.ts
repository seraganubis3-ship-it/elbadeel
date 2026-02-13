import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateB2ImageUrls() {
  console.log('🔄 Starting B2 image URL migration...\n');

  const bucketName = 'elbadeel';
  const baseUrl = `https://f005.backblazeb2.com/file/${bucketName}`;

  try {
    // Update Services
    console.log('📦 Updating Service images...');
    const services = await prisma.service.findMany({
      where: {
        AND: [
          {
            icon: {
              not: null,
            }
          },
          {
            icon: {
              not: {
                startsWith: 'http'
              }
            }
          }
        ]
      }
    });

    console.log(`Found ${services.length} services with old image paths`);

    for (const service of services) {
      if (service.icon && !service.icon.startsWith('http')) {
        const newUrl = `${baseUrl}/${service.icon}`;
        await prisma.service.update({
          where: { id: service.id },
          data: { icon: newUrl }
        });
        console.log(`✅ Updated service: ${service.name} -> ${newUrl}`);
      }
    }

    // Update Categories
    console.log('\n📁 Updating Category images...');
    const categories = await prisma.category.findMany({
      where: {
        AND: [
          {
            icon: {
              not: null,
            }
          },
          {
            icon: {
              not: {
                startsWith: 'http'
              }
            }
          }
        ]
      }
    });

    console.log(`Found ${categories.length} categories with old image paths`);

    for (const category of categories) {
      if (category.icon && !category.icon.startsWith('http')) {
        const newUrl = `${baseUrl}/${category.icon}`;
        await prisma.category.update({
          where: { id: category.id },
          data: { icon: newUrl }
        });
        console.log(`✅ Updated category: ${category.name} -> ${newUrl}`);
      }
    }

    // Update Delegates
    console.log('\n👤 Updating Delegate images...');
    const delegates = await prisma.delegate.findMany();

    let delegateCount = 0;
    for (const delegate of delegates) {
      const updates: any = {};

      if (delegate.idCardFront && !delegate.idCardFront.startsWith('http')) {
        updates.idCardFront = `${baseUrl}/${delegate.idCardFront}`;
        delegateCount++;
      }
      if (delegate.idCardBack && !delegate.idCardBack.startsWith('http')) {
        updates.idCardBack = `${baseUrl}/${delegate.idCardBack}`;
        delegateCount++;
      }
      if (delegate.unionCardFront && !delegate.unionCardFront.startsWith('http')) {
        updates.unionCardFront = `${baseUrl}/${delegate.unionCardFront}`;
        delegateCount++;
      }
      if (delegate.unionCardBack && !delegate.unionCardBack.startsWith('http')) {
        updates.unionCardBack = `${baseUrl}/${delegate.unionCardBack}`;
        delegateCount++;
      }

      if (Object.keys(updates).length > 0) {
        await prisma.delegate.update({
          where: { id: delegate.id },
          data: updates
        });
        console.log(`✅ Updated delegate: ${delegate.name}`);
      }
    }

    console.log(`\n✨ Migration completed successfully!`);
    console.log(`📊 Summary:`);
    console.log(`   - Services updated: ${services.length}`);
    console.log(`   - Categories updated: ${categories.length}`);
    console.log(`   - Delegate images updated: ${delegateCount}`);

  } catch (error) {
    console.error('❌ Error during migration:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
updateB2ImageUrls()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  });
