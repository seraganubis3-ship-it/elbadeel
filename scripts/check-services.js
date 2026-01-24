const { PrismaClient } = require('@prisma/client');

async function checkServices() {
  const prisma = new PrismaClient();

  try {
    const services = await prisma.service.findMany({
      include: {
        category: true,
        variants: true,
      },
    });

    services.forEach(service => {});
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();
