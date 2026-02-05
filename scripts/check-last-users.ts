
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    take: 5,
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
      name: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });

  console.log('Last 5 Created Users:');
  console.table(users);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
