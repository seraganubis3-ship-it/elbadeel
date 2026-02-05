
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const phone = '01113902232';
  const password = 'admin123';
  const name = 'Admin User';

  // Hash password
  const hashedPassword = await hash(password, 12);

  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: { phone: phone },
  });

  let user;
  if (existingUser) {
    // Update existing user
    user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });
  } else {
    // Create new user
    user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      },
    });
  }

  console.log('Admin user created/updated:', user);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
