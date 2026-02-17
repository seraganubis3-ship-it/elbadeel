import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const phone = '01113902231';

  const user = await prisma.user.findFirst({
    where: { phone: phone },
  });

  if (!user) {
    console.log(`User with phone ${phone} not found.`);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
  });
  console.log('User upgraded:', user);
}

// Correct implementation using findFirst
async function correctMain() {
  const phone = '01113902231';
  const user = await prisma.user.findFirst({ where: { phone } });

  if (!user) {
    console.log('User not found');
    return;
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role: 'ADMIN' },
  });

  console.log('User upgraded to ADMIN:', updated);
}

correctMain()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
