const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin2() {
  try {
    // Generate a secure password
    const password = 'Admin456!@#';
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create second admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin2@albadil.com' },
      update: {
        passwordHash: hashedPassword,
        role: 'ADMIN',
        name: 'مدير النظام الثاني',
        phone: '+20 10 1234 5678',
      },
      create: {
        id: 'admin_002',
        name: 'مدير النظام الثاني',
        email: 'admin2@albadil.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        phone: '+20 10 1234 5678',
        emailVerified: new Date(), // Mark as verified
      },
    });
  } catch (error) {
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin2();
