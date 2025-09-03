const { PrismaClient } = require('@prisma/client');

async function checkServices() {
  const prisma = new PrismaClient();
  
  try {
    const services = await prisma.service.findMany({
      include: {
        category: true,
        variants: true
      }
    });
    
    console.log('الخدمات الموجودة في قاعدة البيانات:');
    console.log('=====================================');
    
    services.forEach(service => {
      console.log(`\nاسم الخدمة: ${service.name}`);
      console.log(`Slug: ${service.slug}`);
      console.log(`الفئة: ${service.category.name}`);
      console.log(`نشطة: ${service.active ? 'نعم' : 'لا'}`);
      console.log(`عدد المتغيرات: ${service.variants.length}`);
      console.log('---');
    });
    
    console.log(`\nإجمالي الخدمات: ${services.length}`);
    
  } catch (error) {
    console.error('خطأ:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkServices();
