import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 14);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@albadil.com' },
    update: {},
    create: {
      id: 'admin_001',
      name: 'مدير النظام',
      email: 'admin@albadil.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      phone: '+20 10 2160 6893',
    },
  });

  // Create categories
  await Promise.all([
    prisma.category.upsert({
      where: { slug: 'certificates' },
      update: {},
      create: {
        id: 'cat_001',
        name: 'شهادات',
        slug: 'certificates',
        orderIndex: 1,
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'licenses' },
      update: {},
      create: {
        id: 'cat_002',
        name: 'رخص',
        slug: 'licenses',
        orderIndex: 2,
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'government-documents' },
      update: {},
      create: {
        id: 'cat_003',
        name: 'مستندات حكومية',
        slug: 'government-documents',
        orderIndex: 3,
        active: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'official-papers' },
      update: {},
      create: {
        id: 'cat_004',
        name: 'أوراق رسمية',
        slug: 'official-papers',
        orderIndex: 4,
        active: true,
      },
    }),
  ]);

  // Create services
  await Promise.all([
    prisma.service.upsert({
      where: { slug: 'birth-certificate' },
      update: {},
      create: {
        id: 'svc_001',
        name: 'شهادة الميلاد',
        slug: 'birth-certificate',
        description: 'استخراج شهادة الميلاد الرسمية من مكتب السجل المدني',
        icon: '📄',
        active: true,
        categoryId: 'cat_001',
      },
    }),
    prisma.service.upsert({
      where: { slug: 'death-certificate' },
      update: {},
      create: {
        id: 'svc_002',
        name: 'شهادة الوفاة',
        slug: 'death-certificate',
        description: 'استخراج شهادة الوفاة الرسمية',
        icon: '📄',
        active: true,
        categoryId: 'cat_001',
      },
    }),
    prisma.service.upsert({
      where: { slug: 'driving-license' },
      update: {},
      create: {
        id: 'svc_003',
        name: 'رخصة قيادة',
        slug: 'driving-license',
        description: 'استخراج رخصة القيادة من إدارة المرور',
        icon: '🚗',
        active: true,
        categoryId: 'cat_002',
      },
    }),
    prisma.service.upsert({
      where: { slug: 'passport' },
      update: {},
      create: {
        id: 'svc_004',
        name: 'جواز سفر',
        slug: 'passport',
        description: 'استخراج جواز السفر من وزارة الداخلية',
        icon: '📘',
        active: true,
        categoryId: 'cat_003',
      },
    }),
    prisma.service.upsert({
      where: { slug: 'national-id' },
      update: {},
      create: {
        id: 'svc_005',
        name: 'بطاقة هوية',
        slug: 'national-id',
        description: 'استخراج أو تجديد بطاقة الهوية الوطنية',
        icon: '🆔',
        active: true,
        categoryId: 'cat_003',
      },
    }),
    prisma.service.upsert({
      where: { slug: 'marriage-contract' },
      update: {},
      create: {
        id: 'svc_006',
        name: 'عقد زواج',
        slug: 'marriage-contract',
        description: 'إجراء عقد الزواج الرسمي',
        icon: '💒',
        active: true,
        categoryId: 'cat_004',
      },
    }),
  ]);

  // Create required documents for services
  await Promise.all([
    // Birth Certificate documents
    prisma.serviceDocument.upsert({
      where: { id: 'sdoc_001' },
      update: {},
      create: {
        id: 'sdoc_001',
        serviceId: 'svc_001', // Birth Certificate service
        title: 'صورة بطاقة ولي الأمر',
        description: 'صورة واضحة لبطاقة الهوية الوطنية لولي الأمر',
        required: true,
        orderIndex: 1,
        active: true,
      },
    }),
    prisma.serviceDocument.upsert({
      where: { id: 'sdoc_002' },
      update: {},
      create: {
        id: 'sdoc_002',
        serviceId: 'svc_001', // Birth Certificate service
        title: 'شهادة تبليغ',
        description: 'شهادة تبليغ المولود من المستشفى أو القابلة',
        required: true,
        orderIndex: 2,
        active: true,
      },
    }),
  ]);

  // Create service variants
  await Promise.all([
    // Birth Certificate variants
    prisma.serviceVariant.upsert({
      where: { id: 'var_001' },
      update: {},
      create: {
        id: 'var_001',
        name: 'عادي',
        priceCents: 5000, // 50 جنيه
        etaDays: 7,
        serviceId: 'svc_001',
        active: true,
      },
    }),
    prisma.serviceVariant.upsert({
      where: { id: 'var_002' },
      update: {},
      create: {
        id: 'var_002',
        name: 'سريع',
        priceCents: 8000, // 80 جنيه
        etaDays: 3,
        serviceId: 'svc_001',
        active: true,
      },
    }),
    prisma.serviceVariant.upsert({
      where: { id: 'var_003' },
      update: {},
      create: {
        id: 'var_003',
        name: 'عاجل',
        priceCents: 12000, // 120 جنيه
        etaDays: 1,
        serviceId: 'svc_001',
        active: true,
      },
    }),

    // Driving License variants
    prisma.serviceVariant.upsert({
      where: { id: 'var_004' },
      update: {},
      create: {
        id: 'var_004',
        name: 'عادي',
        priceCents: 15000, // 150 جنيه
        etaDays: 14,
        serviceId: 'svc_003',
        active: true,
      },
    }),
    prisma.serviceVariant.upsert({
      where: { id: 'var_005' },
      update: {},
      create: {
        id: 'var_005',
        name: 'سريع',
        priceCents: 25000, // 250 جنيه
        etaDays: 7,
        serviceId: 'svc_003',
        active: true,
      },
    }),

    // Passport variants
    prisma.serviceVariant.upsert({
      where: { id: 'var_006' },
      update: {},
      create: {
        id: 'var_006',
        name: 'عادي',
        priceCents: 30000, // 300 جنيه
        etaDays: 21,
        serviceId: 'svc_004',
        active: true,
      },
    }),
    prisma.serviceVariant.upsert({
      where: { id: 'var_007' },
      update: {},
      create: {
        id: 'var_007',
        name: 'سريع',
        priceCents: 50000, // 500 جنيه
        etaDays: 10,
        serviceId: 'svc_004',
        active: true,
      },
    }),
  ]);

  // Create system settings
  await prisma.systemSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      siteName: 'البديل',
      siteDescription: 'منصة موثوقة وسريعة لاستخراج جميع أنواع الأوراق الرسمية',
      contactEmail: 'info@albadil.com',
      contactPhone: '+20 10 2160 6893',
      address: 'فيصل - جيزة، مصر',
      workingHours: 'الأحد - الخميس: 9:00 ص - 6:00 م',
      socialLinks: JSON.stringify({
        whatsapp: 'https://wa.me/201021606893',
        facebook: '',
        twitter: '',
        instagram: '',
      }),
      seoSettings: JSON.stringify({
        title: 'خدمات استخراج الأوراق الرسمية',
        description: 'منصة البديل لاستخراج جميع أنواع الأوراق الرسمية',
        keywords: 'استخراج أوراق, خدمات حكومية, مصر, البديل',
      }),
    },
  });

  // Create FAQ data
  await Promise.all([
    prisma.fAQ.upsert({
      where: { question: 'ما هي المستندات المطلوبة؟' },
      update: {},
      create: {
        question: 'ما هي المستندات المطلوبة؟',
        answer: 'تختلف حسب الخدمة، وستظهر في صفحة الخدمة.',
        orderIndex: 1,
        active: true,
      },
    }),
    prisma.fAQ.upsert({
      where: { question: 'كم يستغرق وقت تنفيذ الخدمة؟' },
      update: {},
      create: {
        question: 'كم يستغرق وقت تنفيذ الخدمة؟',
        answer: 'يعتمد على نوع الخدمة (عادي/سريع/عاجل).',
        orderIndex: 2,
        active: true,
      },
    }),
  ]);

  // Create sample orders for testing
  await Promise.all([
    prisma.order.create({
      data: {
        userId: adminUser.id,
        serviceId: 'svc_001',
        variantId: 'var_001',
        status: 'COMPLETED',
        totalPrice: 5000,
        totalCents: 5000,
        customerName: 'Admin User',
        customerPhone: '+201021606893',
        customerEmail: 'admin@albadil.com',
        notes: 'طلب تجريبي للاختبار',
        adminNotes: 'تم إنجاز الطلب بنجاح',
        completedAt: new Date(),
      },
    }),
    prisma.order.create({
      data: {
        userId: adminUser.id,
        serviceId: 'svc_003',
        variantId: 'var_004',
        status: 'IN_PROGRESS',
        totalPrice: 15000,
        totalCents: 15000,
        customerName: 'Admin User',
        customerPhone: '+201021606893',
        customerEmail: 'admin@albadil.com',
        notes: 'طلب تجريبي آخر',
        adminNotes: 'قيد المعالجة',
      },
    }),
  ]);

  // Seed initial form types (inventory)
  await Promise.all([
    prisma.formType.upsert({
      where: { name: 'عادي' },
      update: {},
      create: { name: 'عادي', description: 'استمارة عادية' },
    }),
    prisma.formType.upsert({
      where: { name: 'سريع' },
      update: {},
      create: { name: 'سريع', description: 'استمارة سريعة' },
    }),
    prisma.formType.upsert({
      where: { name: 'فوري' },
      update: {},
      create: { name: 'فوري', description: 'استمارة فورية' },
    }),
  ]);
}

main()
  .catch(() => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
