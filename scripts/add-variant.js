const { PrismaClient } = require('@prisma/client');

async function addVariant() {
  const prisma = new PrismaClient();

  try {
    // Find the service
    const service = await prisma.service.findFirst({
      where: { slug: 'جواز-سفر' },
    });

    if (!service) {
      return;
    }

    // Add a variant
    const variant = await prisma.serviceVariant.create({
      data: {
        name: 'عادي',
        priceCents: 50000, // 500 جنيه
        etaDays: 7,
        serviceId: service.id,
        active: true,
      },
    });
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

addVariant();
