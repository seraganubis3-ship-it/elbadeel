import { PrismaClient } from '../src/generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 بدء عملية مسح جميع الطلبات...');

  // 1. Reset Form Serials to unconsumed state
  console.log('📦 جاري استرجاع السيريالات للعهدة...');
  const updatedSerials = await prisma.formSerial.updateMany({
    where: { orderId: { not: null } },
    data: {
      orderId: null,
      consumed: false,
      consumedAt: null,
      consumedByAdminId: null,
    },
  });
  console.log(`✅ تم استرجاع ${updatedSerials.count} سيريال للعهدة.`);

  // 2. Delete all orders (This will cascade to Payments, Documents, etc.)
  console.log('🧹 جاري مسح الطلبات وكافة البيانات المرتبطة بها...');
  const deletedOrders = await prisma.order.deleteMany({});
  console.log(`✅ تم مسح ${deletedOrders.count} طلب بنجاح.`);

  console.log('✨ تمت العملية بنجاح! قاعدة بيانات الطلبات الآن فارغة.');
}

main()
  .catch(e => {
    console.error('❌ حدث خطأ أثناء المسح:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
