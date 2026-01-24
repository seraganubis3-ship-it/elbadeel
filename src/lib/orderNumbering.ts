import { prisma } from '@/lib/prisma';

/**
 * إنشاء رقم طلب مرتب جديد
 * @returns رقم الطلب التالي (مثل: 000001, 000002, إلخ)
 */
export async function generateOrderNumber(): Promise<string> {
  try {
    const lastOrder = await prisma.order.findFirst({
      orderBy: { id: 'desc' },
    });

    let nextNumber = 1;

    if (lastOrder) {
      const lastOrderNumber = parseInt(lastOrder.id);
      if (!isNaN(lastOrderNumber)) {
        nextNumber = lastOrderNumber + 1;
      }
    }

    return nextNumber.toString().padStart(6, '0');
  } catch (error) {
    // في حالة الخطأ، نستخدم timestamp كبديل
    return Date.now().toString().slice(-6);
  }
}

/**
 * التحقق من وجود رقم طلب
 * @param orderNumber رقم الطلب للتحقق
 * @returns true إذا كان الرقم موجود
 */
export async function orderNumberExists(orderNumber: string): Promise<boolean> {
  try {
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderNumber },
    });
    return !!existingOrder;
  } catch (error) {
    return false;
  }
}

/**
 * إنشاء رقم طلب فريد (مع التحقق من عدم التكرار)
 * @returns رقم طلب فريد
 */
export async function generateUniqueOrderNumber(): Promise<string> {
  let orderNumber: string;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    orderNumber = await generateOrderNumber();
    attempts++;

    if (attempts >= maxAttempts) {
      orderNumber = `${new Date().getFullYear()}${Date.now().toString().slice(-6)}`;
      break;
    }
  } while (await orderNumberExists(orderNumber));

  return orderNumber;
}
