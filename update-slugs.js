
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update Birth Certificate Slug
  const birthCert = await prisma.service.findFirst({
    where: { name: 'شهادة الميلاد' }
  });
  
  if (birthCert) {
    await prisma.service.update({
      where: { id: birthCert.id },
      data: { slug: 'birth-certificate' }
    });
    console.log('Updated "شهادة الميلاد" slug to "birth-certificate"');
  }

  // Update National ID Slug
  const nationalId = await prisma.service.findFirst({
    where: { name: 'بطاقة الرقم القومي' }
  });
  
  if (nationalId) {
    await prisma.service.update({
      where: { id: nationalId.id },
      data: { slug: 'national-id' }
    });
    console.log('Updated "بطاقة الرقم القومي" slug to "national-id"');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
