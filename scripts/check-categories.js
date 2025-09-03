const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        services: {
          where: { active: true }
        }
      }
    });
    
    console.log('📋 Available Categories:');
    categories.forEach(cat => {
      console.log(`- ${cat.name} (slug: ${cat.slug}) - ${cat.services.length} services`);
    });
    
    console.log('\n🔍 Looking for "جواز السفر" category...');
    const passportCategory = categories.find(cat => 
      cat.name.includes('جواز') || cat.name.includes('سفر') || cat.slug.includes('passport')
    );
    
    if (passportCategory) {
      console.log('✅ Found passport category:', passportCategory);
    } else {
      console.log('❌ No passport category found');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCategories();
