const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        services: {
          where: { active: true },
        },
      },
    });

    categories.forEach(cat => {});

    const passportCategory = categories.find(
      cat => cat.name.includes('جواز') || cat.name.includes('سفر') || cat.slug.includes('passport')
    );

    if (passportCategory) {
    } else {
    }
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
