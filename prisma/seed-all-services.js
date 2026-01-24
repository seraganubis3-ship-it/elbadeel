const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedServices() {
  console.log('🚀 Starting to seed services...\n');

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
  const nationalId = await prisma.service.create({
    data: {
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
            showIf: JSON.stringify({ field: 'request_type', value: 'first_time' }),
          },
          {
            title: 'صورة بطاقة قريب درجة أولى',
            description: 'الأب أو الأم أو الأخ (مطلوب لأول مرة)',
            required: false,
            orderIndex: 2,
            showIf: JSON.stringify({ field: 'request_type', value: 'first_time' }),
          },
          {
            title: 'صورة البطاقة الحالية',
            description: 'للتجديد أو بدل الفاقد',
            required: false,
            orderIndex: 3,
            showIf: JSON.stringify({ field: 'request_type', value: 'renewal' }), // Also for other renewal types if needed, but let's keep it simple for now or use multiple conditions logic later. For now, let's assume it appears for basic renewal.
          },
          // Actually, for multiple renewal types, simple equality check isn't enough if we strictly use {field: value}.
          // But for current simple logic, let's target specific scenarios.
          {
            title: 'صورة البطاقة (وجه وشهر)',
            description: '',
            required: true,
            orderIndex: 3,
            showIf: JSON.stringify({ field: 'request_type', value: 'renewal_status' }),
          },
          {
            title: 'صورة عقد الزواج',
            description: 'لتغيير الحالة الاجتماعية للمتزوج',
            required: true,
            orderIndex: 4,
            showIf: JSON.stringify({ field: 'new_status', value: 'married' }),
          },
          {
            title: 'صورة بطاقة الزوج/الزوجة',
            description: 'لتغيير الحالة الاجتماعية',
            required: true,
            orderIndex: 5,
            showIf: JSON.stringify({ field: 'new_status', value: 'married' }),
          },
          {
            title: 'صورة عقد الطلاق',
            description: 'لتغيير الحالة للمطلق/ة',
            required: true,
            orderIndex: 6,
            showIf: JSON.stringify({ field: 'new_status', value: 'divorced' }),
          },
          {
            title: 'شهادة الوفاة',
            description: 'لتغيير الحالة للأرمل/ة',
            required: true,
            orderIndex: 6,
            showIf: JSON.stringify({ field: 'new_status', value: 'widowed' }),
          },
          {
            title: 'فاتورة مرافق',
            description: 'مياه أو غاز أو كهرباء لإثبات العنوان',
            required: true,
            orderIndex: 7,
            showIf: JSON.stringify({ field: 'address_proof_type', value: 'utility_bill' }),
          },
          {
            title: 'مستند إثبات المهنة',
            description: 'خطاب من جهة العمل أو النقابة',
            required: true,
            orderIndex: 8,
            showIf: JSON.stringify({ field: 'request_type', value: 'renewal_job' }),
          },
          {
            title: 'محضر الشرطة',
            description: 'في حالة فقدان البطاقة',
            required: true,
            orderIndex: 9,
            showIf: JSON.stringify({ field: 'request_type', value: 'lost' }),
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
    },
  });
  console.log(`✅ Service: بطاقة الرقم القومي`);

  // 2. شهادة الميلاد
  const birthCert = await prisma.service.create({
    data: {
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
    },
  });
  console.log(`✅ Service: شهادة الميلاد`);

  // 3. قسيمة زواج كمبيوتر
  const marriageCert = await prisma.service.create({
    data: {
      name: 'قسيمة زواج كمبيوتر',
      slug: 'marriage-certificate',
      description: 'استخراج قسيمة الزواج الكمبيوتر',
      icon: '💍',
      categoryId: civilStatus.id,
      variants: {
        create: [
          { name: 'عادي (5 أيام)', priceCents: 12000, etaDays: 5 },
          { name: 'سريع (2 أيام)', priceCents: 20000, etaDays: 2 },
        ],
      },
      documents: {
        create: [
          { title: 'صورة بطاقة الزوج', description: '', required: true, orderIndex: 1 },
          { title: 'صورة بطاقة الزوجة', description: '', required: true, orderIndex: 2 },
          { title: 'صورة عقد الزواج', description: '', required: true, orderIndex: 3 },
        ],
      },
    },
  });
  console.log(`✅ Service: قسيمة زواج كمبيوتر`);

  // 4. قسيمة طلاق
  const divorceCert = await prisma.service.create({
    data: {
      name: 'قسيمة طلاق',
      slug: 'divorce-certificate',
      description: 'استخراج قسيمة الطلاق',
      icon: '💔',
      categoryId: civilStatus.id,
      variants: {
        create: [
          { name: 'عادي (5 أيام)', priceCents: 12000, etaDays: 5 },
          { name: 'سريع (2 أيام)', priceCents: 20000, etaDays: 2 },
        ],
      },
      documents: {
        create: [
          { title: 'صورة بطاقة العميل', description: '', required: true, orderIndex: 1 },
          { title: 'صورة عقد الطلاق', description: '', required: true, orderIndex: 2 },
        ],
      },
    },
  });
  console.log(`✅ Service: قسيمة طلاق`);

  // 5. شهادة وفاة
  const deathCert = await prisma.service.create({
    data: {
      name: 'شهادة وفاة',
      slug: 'death-certificate',
      description: 'استخراج شهادة الوفاة',
      icon: '⚰️',
      categoryId: civilStatus.id,
      variants: {
        create: [
          { name: 'عادي (5 أيام)', priceCents: 10000, etaDays: 5 },
          { name: 'سريع (2 أيام)', priceCents: 18000, etaDays: 2 },
        ],
      },
      documents: {
        create: [
          { title: 'صورة بطاقة المتوفى', description: '', required: true, orderIndex: 1 },
          { title: 'صورة بطاقة مقدم الطلب', description: '', required: true, orderIndex: 2 },
        ],
      },
    },
  });
  console.log(`✅ Service: شهادة وفاة`);

  // 6. جواز السفر
  const passport = await prisma.service.create({
    data: {
      name: 'جواز السفر',
      slug: 'passport',
      description: 'استخراج وتجديد جواز السفر',
      icon: '🛂',
      categoryId: passports.id,
      variants: {
        create: [
          { name: 'عادي (14 يوم)', priceCents: 50000, etaDays: 14 },
          { name: 'سريع (7 أيام)', priceCents: 80000, etaDays: 7 },
          { name: 'فوري (3 أيام)', priceCents: 120000, etaDays: 3 },
        ],
      },
      documents: {
        create: [
          { title: 'صورة البطاقة الشخصية', description: '', required: true, orderIndex: 1 },
          {
            title: 'شهادة الجيش',
            description: 'للذكور فوق 18 سنة',
            required: false,
            orderIndex: 2,
          },
          { title: 'إثبات القيد التعليمي', description: 'للطلاب', required: false, orderIndex: 3 },
          { title: 'جواز السفر القديم', description: 'للتجديد', required: false, orderIndex: 4 },
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
                { value: 'renewal', label: 'تجديد', orderIndex: 2 },
              ],
            },
          },
          {
            name: 'gender',
            label: 'النوع',
            type: 'select',
            required: true,
            orderIndex: 2,
            options: {
              create: [
                { value: 'male', label: 'ذكر', orderIndex: 1 },
                { value: 'female', label: 'أنثى', orderIndex: 2 },
              ],
            },
          },
          {
            name: 'is_student',
            label: 'هل أنت طالب/ة؟',
            type: 'select',
            required: true,
            orderIndex: 3,
            options: {
              create: [
                { value: 'yes', label: 'نعم', orderIndex: 1 },
                { value: 'no', label: 'لا', orderIndex: 2 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Service: جواز السفر`);

  // 7. قيد عائلي
  const familyRecord = await prisma.service.create({
    data: {
      name: 'قيد عائلي',
      slug: 'family-record',
      description: 'استخراج القيد العائلي',
      icon: '👨‍👩‍👧‍👦',
      categoryId: records.id,
      variants: {
        create: [
          { name: 'عادي (7 أيام)', priceCents: 20000, etaDays: 7 },
          { name: 'سريع (3 أيام)', priceCents: 35000, etaDays: 3 },
        ],
      },
      documents: {
        create: [
          { title: 'صورة بطاقة العميل', description: '', required: true, orderIndex: 1 },
          { title: 'شهادة ميلاد العميل', description: '', required: true, orderIndex: 2 },
          { title: 'شهادة ميلاد الأب', description: '', required: true, orderIndex: 3 },
          { title: 'شهادة ميلاد الأم', description: '', required: true, orderIndex: 4 },
          { title: 'شهادات ميلاد الإخوة', description: 'إن وجدوا', required: false, orderIndex: 5 },
          { title: 'قسيمة زواج الوالدين', description: '', required: true, orderIndex: 6 },
          { title: 'شهادات وفاة', description: 'في حالة الوفاة', required: false, orderIndex: 7 },
        ],
      },
    },
  });
  console.log(`✅ Service: قيد عائلي`);

  // 8. قيد فردي
  const individualRecord = await prisma.service.create({
    data: {
      name: 'قيد فردي',
      slug: 'individual-record',
      description: 'استخراج القيد الفردي',
      icon: '👤',
      categoryId: records.id,
      variants: {
        create: [
          { name: 'عادي (5 أيام)', priceCents: 10000, etaDays: 5 },
          { name: 'سريع (2 أيام)', priceCents: 18000, etaDays: 2 },
        ],
      },
      documents: {
        create: [{ title: 'صورة بطاقة العميل', description: '', required: true, orderIndex: 1 }],
      },
    },
  });
  console.log(`✅ Service: قيد فردي`);

  // 9. سجل تجاري
  const commercialRecord = await prisma.service.create({
    data: {
      name: 'سجل تجاري',
      slug: 'commercial-record',
      description: 'استخراج وتجديد السجل التجاري',
      icon: '🏢',
      categoryId: records.id,
      variants: {
        create: [
          { name: 'عادي (10 أيام)', priceCents: 30000, etaDays: 10 },
          { name: 'سريع (5 أيام)', priceCents: 50000, etaDays: 5 },
        ],
      },
      documents: {
        create: [
          { title: 'صورة السجل التجاري القديم', description: '', required: true, orderIndex: 1 },
          { title: 'أصل البطاقة الشخصية', description: '', required: true, orderIndex: 2 },
        ],
      },
    },
  });
  console.log(`✅ Service: سجل تجاري`);

  // 10. خدمة الترجمة
  const translationService = await prisma.service.create({
    data: {
      name: 'خدمة الترجمة',
      slug: 'translation-service',
      description: 'ترجمة المستندات لأي لغة',
      icon: '✍️',
      categoryId: translation.id,
      variants: {
        create: [
          { name: 'عادي (3 أيام)', priceCents: 15000, etaDays: 3 },
          { name: 'سريع (يوم واحد)', priceCents: 25000, etaDays: 1 },
        ],
      },
      documents: {
        create: [
          {
            title: 'المستند المراد ترجمته',
            description: 'شهادة ميلاد / وفاة / زواج / طلاق / قيد عائلي / قيد فردي',
            required: true,
            orderIndex: 1,
          },
        ],
      },
      fields: {
        create: [
          {
            name: 'document_type',
            label: 'نوع المستند',
            type: 'select',
            required: true,
            orderIndex: 1,
            options: {
              create: [
                { value: 'birth', label: 'شهادة ميلاد', orderIndex: 1 },
                { value: 'death', label: 'شهادة وفاة', orderIndex: 2 },
                { value: 'marriage', label: 'قسيمة زواج', orderIndex: 3 },
                { value: 'divorce', label: 'قسيمة طلاق', orderIndex: 4 },
                { value: 'family_record', label: 'قيد عائلي', orderIndex: 5 },
                { value: 'individual_record', label: 'قيد فردي', orderIndex: 6 },
              ],
            },
          },
          {
            name: 'target_language',
            label: 'لغة الترجمة',
            type: 'text',
            placeholder: 'مثال: الإنجليزية، الفرنسية، الألمانية',
            required: true,
            orderIndex: 2,
          },
        ],
      },
    },
  });
  console.log(`✅ Service: خدمة الترجمة`);

  // 11. خدمة التصديق
  const attestation = await prisma.service.create({
    data: {
      name: 'خدمة التصديق',
      slug: 'attestation',
      description: 'تصديق المستندات من السفارات والقنصليات',
      icon: '🔖',
      categoryId: translation.id,
      variants: {
        create: [
          { name: 'عادي (7 أيام)', priceCents: 40000, etaDays: 7 },
          { name: 'سريع (3 أيام)', priceCents: 60000, etaDays: 3 },
        ],
      },
      documents: {
        create: [
          { title: 'المستند المراد تصديقه', description: '', required: true, orderIndex: 1 },
        ],
      },
      fields: {
        create: [
          {
            name: 'embassy',
            label: 'جهة التصديق',
            type: 'select',
            required: true,
            orderIndex: 1,
            options: {
              create: [
                { value: 'saudi_consulate', label: 'القنصلية السعودية', orderIndex: 1 },
                { value: 'saudi_attache', label: 'الملحقية السعودية', orderIndex: 2 },
                { value: 'uae_embassy', label: 'سفارة الإمارات', orderIndex: 3 },
                { value: 'kuwait_embassy', label: 'سفارة الكويت', orderIndex: 4 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Service: خدمة التصديق`);

  console.log('\n🎉 All services seeded successfully!');
}

seedServices()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
