
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Checking database for translation services...');

  const services = await prisma.service.findMany({
    where: {
      OR: [
        { name: { contains: 'ترجم' } },
        { name: { contains: 'translat', mode: 'insensitive' } },
        { name: { contains: 'مترجم' } },
        { slug: { contains: 'translat', mode: 'insensitive' } }
      ]
    },
    select: {
      id: true,
      name: true,
      slug: true,
      variants: {
        select: {
          name: true,
          priceCents: true
        }
      }
    }
  });

  console.log('\n📊 Found Services:');
  if (services.length === 0) {
    console.log('❌ No translation services found.');
  } else {
    services.forEach(s => {
      console.log(`- [${s.name}] (Slug: ${s.slug})`);
      if (s.variants.length > 0) {
        console.log('  Variants:');
        s.variants.forEach(v => console.log(`    • ${v.name} - ${(v.priceCents / 100).toFixed(2)} EGP`));
      } else {
        console.log('  Subject to variants: None');
      }
      console.log('');
    });
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
