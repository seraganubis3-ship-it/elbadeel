const { PrismaClient } = require('@prisma/client');

async function addVariant() {
  const prisma = new PrismaClient();
  
  try {
    // Find the service
    const service = await prisma.service.findFirst({
      where: { slug: 'جواز-سفر' }
    });
    
    if (!service) {
      console.log('الخدمة غير موجودة');
      return;
    }
    
    console.log(`تم العثور على الخدمة: ${service.name}`);
    
    // Add a variant
    const variant = await prisma.serviceVariant.create({
      data: {
        name: 'عادي',
        priceCents: 50000, // 500 جنيه
        etaDays: 7,
        serviceId: service.id,
        active: true
      }
    });
    
    console.log(`تم إضافة المتغير: ${variant.name} - ${variant.priceCents/100} جنيه`);
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addVariant();
