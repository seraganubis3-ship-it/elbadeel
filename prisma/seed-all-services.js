const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function upsertService(serviceData) {
  const { slug, variants, documents, fields, ...basicData } = serviceData;

  // 1. Find or Create the Service
  const existingService = await prisma.service.findUnique({
    where: { slug },
    include: { variants: true },
  });

  let service;
  if (existingService) {
    // Update basic data
    service = await prisma.service.update({
      where: { id: existingService.id },
      data: basicData,
    });
    console.log(`🔄 Updated Service: ${service.name}`);
  } else {
    service = await prisma.service.create({
      data: { ...basicData, slug },
    });
    console.log(`✅ Created Service: ${service.name}`);
  }

  // 2. Sync Variants (ONLY create if missing, NEVER update existing to respect "Types NO")
  if (variants?.create) {
    for (const v of variants.create) {
      const existingVariant = existingService?.variants.find(ev => ev.name === v.name);
      if (!existingVariant) {
        await prisma.serviceVariant.create({
          data: { ...v, serviceId: service.id },
        });
        console.log(`   + New Variant: ${v.name}`);
      } else {
        console.log(`   = Kept Variant: ${v.name} (exists)`);
      }
    }
  }

  // 3. Sync Documents (Clean and Recreate for simple sync)
  if (documents?.create) {
    await prisma.serviceDocument.deleteMany({ where: { serviceId: service.id } });
    await prisma.serviceDocument.createMany({
      data: documents.create.map(d => ({ ...d, serviceId: service.id })),
    });
  }

  // 4. Sync Fields (Handle with Options)
  if (fields?.create) {
    // Delete existing fields to start fresh (safest for complex nested structures)
    await prisma.serviceField.deleteMany({ where: { serviceId: service.id } });

    for (const f of fields.create) {
      const { options, ...fieldData } = f;
      const field = await prisma.serviceField.create({
        data: { ...fieldData, serviceId: service.id },
      });

      if (options?.create) {
        await prisma.serviceFieldOption.createMany({
          data: options.create.map(o => ({ ...o, fieldId: field.id })),
        });
      }
    }
  }

  return service;
}

async function seedServices() {
  console.log('🚀 Starting to seed services (Safe Mode)...\n');

  // ============ CATEGORIES ============
  const categories = [
    { name: 'المستندات الشخصية', slug: 'personal-docs', icon: '🪪', orderIndex: 1 },
    { name: 'شهادات الأحوال المدنية', slug: 'civil-status', icon: '📜', orderIndex: 2 },
    { name: 'جوازات السفر', slug: 'passports', icon: '🛂', orderIndex: 3 },
    { name: 'السجلات والقيود', slug: 'records', icon: '📋', orderIndex: 4 },
    { name: 'الترجمة والتصديق', slug: 'translation', icon: '✍️', orderIndex: 5 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, orderIndex: cat.orderIndex },
      create: cat,
    });
    console.log(`✅ Category: ${cat.name}`);
  }

  // Get category IDs
  const personalDocs = await prisma.category.findUnique({ where: { slug: 'personal-docs' } });
  const civilStatus = await prisma.category.findUnique({ where: { slug: 'civil-status' } });
  const passports = await prisma.category.findUnique({ where: { slug: 'passports' } });
  const records = await prisma.category.findUnique({ where: { slug: 'records' } });
  const translation = await prisma.category.findUnique({ where: { slug: 'translation' } });

  // ============ SERVICES ============

  // 1. بطاقة الرقم القومي
  await upsertService({
    name: 'بطاقة الرقم القومي',
    slug: 'national-id',
    description: 'استخراج وتجديد بطاقة الرقم القومي بجميع أنواعها',
    icon: '🪪',
    categoryId: personalDocs.id,
    variants: {
      create: [
        { name: 'عادي (7 أيام)', priceCents: 15000, etaDays: 7 },
        { name: 'سريع (3 أيام)', priceCents: 25000, etaDays: 3 },
        { name: 'فوري (24 ساعة)', priceCents: 40000, etaDays: 1 },
      ],
    },
    documents: {
      create: [
        {
          title: 'صورة شهادة الميلاد',
          description: 'مطلوبة للاستخراج أول مرة',
          required: true,
          orderIndex: 1,
          showIf: JSON.stringify([{ field: 'request_type', op: 'eq', value: 'first_time' }]),
        },
        {
          title: 'صورة بطاقة قريب درجة أولى',
          description: 'الأب أو الأم أو الأخ (مطلوب لأول مرة)',
          required: false,
          orderIndex: 2,
          showIf: JSON.stringify([{ field: 'request_type', op: 'eq', value: 'first_time' }]),
        },
        {
          title: 'صورة البطاقة الحالية (أو منتهية)',
          description: 'للقيام بالتجديد أو التعديل',
          required: true,
          orderIndex: 3,
          showIf: JSON.stringify([
            { field: 'request_type', op: 'neq', value: 'first_time' },
            { field: 'request_type', op: 'neq', value: 'lost' },
          ]),
        },
        {
          title: 'صورة البطاقة (وجه وشهر)',
          description: 'في حالة التجديد فقط',
          required: true,
          orderIndex: 3,
          showIf: JSON.stringify([{ field: 'request_type', op: 'eq', value: 'renewal' }]),
        },
        {
          title: 'صورة عقد الزواج',
          description: 'لتغيير الحالة الاجتماعية للمتزوج',
          required: true,
          orderIndex: 4,
          showIf: JSON.stringify([
            { field: 'request_type', op: 'eq', value: 'renewal_status' },
            { field: 'new_status', op: 'eq', value: 'married' },
          ]),
        },
        {
          title: 'صورة بطاقة الزوج/الزوجة',
          description: 'لتغيير الحالة الاجتماعية',
          required: true,
          orderIndex: 5,
          showIf: JSON.stringify([
            { field: 'request_type', op: 'eq', value: 'renewal_status' },
            { field: 'new_status', op: 'eq', value: 'married' },
          ]),
        },
        {
          title: 'صورة عقد الطلاق',
          description: 'لتغيير الحالة للمطلق/ة',
          required: true,
          orderIndex: 6,
          showIf: JSON.stringify([
            { field: 'request_type', op: 'eq', value: 'renewal_status' },
            { field: 'new_status', op: 'eq', value: 'divorced' },
          ]),
        },
        {
          title: 'شهادة الوفاة',
          description: 'لتغيير الحالة للأرمل/ة',
          required: true,
          orderIndex: 6,
          showIf: JSON.stringify([
            { field: 'request_type', op: 'eq', value: 'renewal_status' },
            { field: 'new_status', op: 'eq', value: 'widowed' },
          ]),
        },
        {
          title: 'فاتورة مرافق (كهرباء/غاز)',
          description: 'لإثبات العنوان الجديد',
          required: true,
          orderIndex: 7,
          showIf: JSON.stringify([
            { field: 'request_type', op: 'eq', value: 'renewal_address' },
            { field: 'address_proof_type', op: 'eq', value: 'utility_bill' },
          ]),
        },
        {
          title: 'مستند إثبات المهنة',
          description: 'خطاب من جهة العمل أو النقابة',
          required: true,
          orderIndex: 8,
          showIf: JSON.stringify([{ field: 'request_type', op: 'eq', value: 'renewal_job' }]),
        },
        {
          title: 'محضر الشرطة (صورة)',
          description: 'في حالة فقدان البطاقة',
          required: true,
          orderIndex: 9,
          showIf: JSON.stringify([{ field: 'request_type', op: 'eq', value: 'lost' }]),
        },
      ],
    },
    fields: {
      create: [
        {
          name: 'request_type',
          label: 'نوع الطلب',
          type: 'select',
          required: true,
          orderIndex: 1,
          options: {
            create: [
              { value: 'first_time', label: 'أول مرة', orderIndex: 1 },
              { value: 'renewal', label: 'تجديد بدون تغيير', orderIndex: 2 },
              {
                value: 'renewal_status',
                label: 'تجديد + تغيير الحالة الاجتماعية',
                orderIndex: 3,
              },
              { value: 'renewal_address', label: 'تجديد + تغيير العنوان', orderIndex: 4 },
              { value: 'renewal_job', label: 'تجديد + تغيير المهنة', orderIndex: 5 },
              { value: 'lost', label: 'بدل فاقد', orderIndex: 6 },
            ],
          },
        },
        {
          name: 'old_status',
          label: 'الحالة الاجتماعية القديمة',
          type: 'select',
          required: false,
          orderIndex: 2,
          showIf: JSON.stringify({ field: 'request_type', value: 'renewal_status' }),
          options: {
            create: [
              { value: 'single', label: 'أعزب/عزباء', orderIndex: 1 },
              { value: 'married', label: 'متزوج/ة', orderIndex: 2 },
              { value: 'divorced', label: 'مطلق/ة', orderIndex: 3 },
              { value: 'widowed', label: 'أرمل/ة', orderIndex: 4 },
            ],
          },
        },
        {
          name: 'new_status',
          label: 'الحالة الاجتماعية الجديدة',
          type: 'select',
          required: false,
          orderIndex: 3,
          showIf: JSON.stringify({ field: 'request_type', value: 'renewal_status' }),
          options: {
            create: [
              { value: 'single', label: 'أعزب/عزباء', orderIndex: 1 },
              { value: 'married', label: 'متزوج/ة', orderIndex: 2 },
              { value: 'divorced', label: 'مطلق/ة', orderIndex: 3 },
              { value: 'widowed', label: 'أرمل/ة', orderIndex: 4 },
            ],
          },
        },
        {
          name: 'new_address',
          label: 'العنوان الجديد',
          type: 'textarea',
          placeholder: 'أدخل العنوان الجديد بالتفصيل',
          required: false,
          orderIndex: 4,
          showIf: JSON.stringify({ field: 'request_type', value: 'renewal_address' }),
        },
        {
          name: 'address_proof_type',
          label: 'طريقة إثبات العنوان',
          type: 'select',
          required: false,
          orderIndex: 5,
          showIf: JSON.stringify({ field: 'request_type', value: 'renewal_address' }),
          options: {
            create: [
              { value: 'utility_bill', label: 'فاتورة مرافق (مياه/غاز/كهرباء)', orderIndex: 1 },
              { value: 'guarantor', label: 'ضامن قريب درجة أولى', orderIndex: 2 },
            ],
          },
        },
        {
          name: 'old_job',
          label: 'المهنة القديمة',
          type: 'text',
          placeholder: 'أدخل المهنة الحالية',
          required: false,
          orderIndex: 6,
          showIf: JSON.stringify({ field: 'request_type', value: 'renewal_job' }),
        },
        {
          name: 'new_job',
          label: 'المهنة الجديدة',
          type: 'text',
          placeholder: 'أدخل المهنة الجديدة',
          required: false,
          orderIndex: 7,
          showIf: JSON.stringify({ field: 'request_type', value: 'renewal_job' }),
        },
      ],
    },
  });

  // 2. شهادة الميلاد
  await upsertService({
    name: 'شهادة الميلاد',
    slug: 'birth-certificate',
    description: 'استخراج شهادة الميلاد الكمبيوتر',
    icon: '👶',
    categoryId: civilStatus.id,
    variants: {
      create: [
        { name: 'عادي (5 أيام)', priceCents: 10000, etaDays: 5 },
        { name: 'سريع (2 أيام)', priceCents: 18000, etaDays: 2 },
      ],
    },
    documents: {
      create: [
        {
          title: 'صورة شهادة الميلاد الورقية',
          description: 'الصادرة من الصحة',
          required: false,
          orderIndex: 1,
        },
        {
          title: 'صورة بطاقة الأب أو الأم',
          description: 'لاستخراج أول مرة',
          required: false,
          orderIndex: 2,
        },
        {
          title: 'صورة بطاقة صاحب الشهادة',
          description: 'للاستخراج اللاحق',
          required: false,
          orderIndex: 3,
        },
        { title: 'صورة الشهادة القديمة', description: 'إن وجدت', required: false, orderIndex: 4 },
      ],
    },
    fields: {
      create: [
        {
          name: 'request_type',
          label: 'نوع الطلب',
          type: 'select',
          required: true,
          orderIndex: 1,
          options: {
            create: [
              { value: 'first_time', label: 'أول مرة (مولود جديد)', orderIndex: 1 },
              { value: 'later', label: 'استخراج لاحق', orderIndex: 2 },
            ],
          },
        },
      ],
    },
  });

  // (Repeat for other services if needed, but for now we focus on National ID and stability)
  console.log('\n🎉 Seed process completed successfully!');
}

seedServices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
