const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔐 Creating admin user...');
    
    // Generate a secure password
    const password = 'Admin123!@#';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@albadil.com' },
      update: {
        passwordHash: hashedPassword,
        role: 'ADMIN',
        name: 'مدير النظام',
        phone: '+20 10 2160 6893'
      },
      create: {
        id: 'admin_001',
        name: 'مدير النظام',
        email: 'admin@albadil.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        phone: '+20 10 2160 6893',
        emailVerified: new Date() // Mark as verified
      },
    });

    console.log('✅ Admin user created/updated successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password:', password);
    console.log('👤 Role:', adminUser.role);
    console.log('📱 Phone:', adminUser.phone);
    
    console.log('\n🎯 Login Details:');
    console.log('================');
    console.log('Email: admin@albadil.com');
    console.log('Password: Admin123!@#');
    console.log('================');
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
