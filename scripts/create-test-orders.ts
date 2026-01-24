import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

const ARABIC_NAMES = [
  'محمد أحمد علي',
  'سارة محمود حسن',
  'أحمد محمود إبراهيم',
  'ليلى يوسف خليل',
  'محمود عبد الله',
  'فاطمة الزهراء محمد',
  'إبراهيم حسن مصطفى',
  'مريم علي حسن',
  'عمر خالد وليد',
  'نورا جمال الدين',
  'ياسين محمد عبد الرحمن',
  'حنين إيهاب كمال',
  'زياد طارق صبحي',
  'ملك هاني فوزي',
  'يوسف شادي نبيل',
];

const POLICE_STATIONS = ['FIRST_POLICE_STATION', 'SECOND_POLICE_STATION', 'THIRD_POLICE_STATION'];
const CITIES = ['القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'المنوفية'];
const STATUSES = [
  'waiting_confirmation',
  'waiting_payment',
  'paid',
  'settlement',
  'fulfillment',
  'supply',
  'delivery',
  'completed',
];

async function main() {
  console.log('🚀 بدء إنشاء طلبات تجريبية...');

  // Get existing services and variants
  const services = await prisma.service.findMany({
    include: { variants: true },
  });

  if (services.length === 0) {
    console.error('❌ لا توجد خدمات في قاعدة البيانات. يرجى تشغيل الـ seed أولاً.');
    return;
  }

  // Get or create a sample user
  const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminUser) {
    console.error('❌ لم يتم العثور على مدير نظام (ADMIN).');
    return;
  }

  const createdOrders = [];

  for (let i = 0; i < 15; i++) {
    const service = services[Math.floor(Math.random() * services.length)];
    if (!service) continue;
    const variant = service.variants[Math.floor(Math.random() * service.variants.length)];
    if (!variant) continue;
    const name = ARABIC_NAMES[i % ARABIC_NAMES.length];
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];

    // Generate some random data
    const idNumber = '2' + Math.random().toString().slice(2, 15); // Random 14 digit ID
    const phone = '01' + Math.floor(100000000 + Math.random() * 900000000).toString();
    const price = variant.priceCents;

    const isPassport = service.slug.includes('passport') || service.name.includes('جواز');
    const isBirthCert = service.slug.includes('birth') || service.name.includes('ميلاد');
    const isDeathCert = service.slug.includes('death') || service.name.includes('وفاة');

    const orderData: any = {
      userId: adminUser.id,
      serviceId: service.id,
      variantId: variant.id,
      status: status,
      totalCents: price,
      totalPrice: price,
      customerName: name,
      customerPhone: phone,
      customerEmail: `customer${i}@example.com`,
      idNumber: idNumber,
      createdByAdminId: adminUser.id,
      notes: 'طلب تجريبي تم إنشاؤه بواسطة السكربت',
      governorate: CITIES[Math.floor(Math.random() * CITIES.length)],
      quantity: Math.floor(Math.random() * 3) + 1,
    };

    if (isPassport) {
      orderData.policeStation = POLICE_STATIONS[Math.floor(Math.random() * POLICE_STATIONS.length)];
      orderData.pickupLocation = 'مكتب جوازات ' + orderData.governorate;
    }

    if (isBirthCert || isDeathCert) {
      orderData.motherName = 'فاطمة محمد علي';
      orderData.birthDate = new Date(
        1990 + Math.floor(Math.random() * 20),
        Math.floor(Math.random() * 12),
        Math.floor(Math.random() * 28) + 1
      );
    }

    const order = await prisma.order.create({
      data: orderData,
    });

    createdOrders.push(order.id);
    console.log(`✅ تم إنشاء طلب: ${order.id} - ${service.name} (${name})`);
  }

  console.log(`✨ تم بنجاح إنشاء ${createdOrders.length} طلب تجريبي!`);
}

main()
  .catch(e => {
    console.error('❌ حدث خطأ أثناء تنفيذ السكربت:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
