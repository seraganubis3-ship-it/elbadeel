const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    // فحص الخدمات
    const services = await prisma.service.findMany({
      include: {
        variants: true,
      },
    });

    services.forEach((service, index) => {});

    // فحص الخدمات التي تحتوي على أنواع
    const servicesWithVariants = services.filter(
      service => service.variants && service.variants.length > 0
    );

    if (servicesWithVariants.length === 0) {
      return;
    }

    // فحص المستخدمين
    const users = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
    });

    if (users.length === 0) {
      return;
    }

    // فحص المشرفين
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
      },
    });

    // فحص الطلبات الموجودة
    const existingOrders = await prisma.order.count();

    // ملخص

    if (servicesWithVariants.length > 0 && users.length > 0) {
    } else {
    }
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
