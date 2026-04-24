import { prisma } from '@/lib/prisma';

export async function getIncentiveConfig() {
  try {
    let config = await prisma.incentiveConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      config = await prisma.incentiveConfig.create({
        data: {
          id: 'default',
          isEnabled: true,
          pointsPerOrder: 10,
          pointsPerEdit: 5,
          pointsPerSerial: 5,
          pointsPerPayment: 10,
          egpPerPoint: 1.0,
        },
      });
    }

    return config;
  } catch (error) {
    console.error('Error fetching IncentiveConfig:', error);
    return {
      id: 'default',
      isEnabled: true,
      pointsPerOrder: 10,
      pointsPerEdit: 5,
      pointsPerSerial: 5,
      pointsPerPayment: 10,
      egpPerPoint: 1.0,
      updatedAt: new Date(),
    };
  }
}

export type ActionType =
  | 'ORDER_COMPLETED'
  | 'DATA_EDIT'
  | 'SERIAL_BOUND'
  | 'PAYMENT_SETTLED'
  | 'MANUAL_ADJUSTMENT';

export async function awardSupervisorPoints({
  userId,
  actionType,
  customPoints,
  orderId,
  description,
}: {
  userId: string;
  actionType: ActionType;
  customPoints?: number;
  orderId?: string;
  description?: string;
}) {
  try {
    if (!userId) return;

    const config = await getIncentiveConfig();
    if (!config.isEnabled) return;

    let points = customPoints;

    if (points === undefined) {
      switch (actionType) {
        case 'ORDER_COMPLETED':
          points = config.pointsPerOrder;
          break;
        case 'DATA_EDIT':
          points = config.pointsPerEdit;
          break;
        case 'SERIAL_BOUND':
          points = config.pointsPerSerial;
          break;
        case 'PAYMENT_SETTLED':
          points = config.pointsPerPayment;
          break;
        default:
          points = 0;
      }
    }

    if (points === 0) return;

    const defaultDescMap: Record<ActionType, string> = {
      ORDER_COMPLETED: 'إكمال معالجة طلب',
      DATA_EDIT: 'تعديل وتدقيق بيانات طلب',
      SERIAL_BOUND: 'ربط سيريال استمارة بالطلب',
      PAYMENT_SETTLED: 'تأكيد وتأطير تسديد مالي',
      MANUAL_ADJUSTMENT: 'تعديل يدوياً من الإدارة',
    };

    const finalDesc = description || defaultDescMap[actionType] || actionType;

    await prisma.supervisorPointLog.create({
      data: {
        userId,
        actionType,
        points,
        orderId: orderId || null,
        description: finalDesc,
      },
    });
  } catch (error) {
    console.error('Error awarding supervisor points:', error);
  }
}
