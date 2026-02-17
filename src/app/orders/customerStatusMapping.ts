import { ORDER_STATUS } from '@/constants/orderStatuses';

export interface CustomerStatus {
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

export const getCustomerStatus = (status: string): CustomerStatus => {
  switch (status) {
    case ORDER_STATUS.WAITING_CONFIRMATION:
      return {
        label: 'انتظار المراجعة',
        color: 'text-yellow-800',
        bgColor: 'bg-yellow-100',
        icon: '⏳',
      };

    case ORDER_STATUS.WAITING_PAYMENT:
      return {
        label: 'تم مراجعة (في انتظار الدفع)',
        color: 'text-orange-800',
        bgColor: 'bg-orange-100',
        icon: '💳',
      };

    case ORDER_STATUS.PAYMENT_REVIEW:
      return {
        label: 'جاري مراجعة الدفع',
        color: 'text-blue-800',
        bgColor: 'bg-blue-100',
        icon: '⏳',
      };

    // Paid statuses group
    case ORDER_STATUS.PAYMENT_CONFIRMED:
    case ORDER_STATUS.PARTIAL_PAYMENT:
    case ORDER_STATUS.SETTLEMENT:
    case ORDER_STATUS.FULFILLMENT:
    case ORDER_STATUS.PROCESSING:
      return {
        label: 'تم الدفع',
        color: 'text-green-800',
        bgColor: 'bg-green-100',
        icon: '✅',
      };

    // Ready statuses group
    case ORDER_STATUS.SUPPLY:
    case ORDER_STATUS.READY:
      return {
        label: 'جاهز للتسليم',
        color: 'text-teal-800',
        bgColor: 'bg-teal-100',
        icon: '🎉',
      };

    case ORDER_STATUS.DELIVERED:
      return {
        label: 'تم التسليم',
        color: 'text-emerald-800',
        bgColor: 'bg-emerald-100',
        icon: '🚚',
      };

    case ORDER_STATUS.CANCELLED:
      return {
        label: 'ملغي',
        color: 'text-red-800',
        bgColor: 'bg-red-100',
        icon: '❌',
      };

    case ORDER_STATUS.RETURNED:
      return {
        label: 'مرتجع',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        icon: '↩️',
      };

    default:
      return {
        label: 'غير محدد',
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        icon: '❓',
      };
  }
};

// Progress Steps Definition
export const CUSTOMER_PROGRESS_STEPS = [
  {
    id: 'review',
    label: 'انتظار المراجعة',
    description: 'جاري مراجعة طلبك',
    icon: '⏳',
    statuses: [ORDER_STATUS.WAITING_CONFIRMATION],
  },
  {
    id: 'payment',
    label: 'انتظار الدفع',
    description: 'يرجى سداد رسوم الخدمة',
    icon: '💳',
    statuses: [ORDER_STATUS.WAITING_PAYMENT, ORDER_STATUS.PAYMENT_REVIEW],
  },
  {
    id: 'processing',
    label: 'تم الدفع',
    description: 'جاري تنفيذ خدمتك',
    icon: '⚙️',
    statuses: [
      ORDER_STATUS.PAYMENT_CONFIRMED,
      ORDER_STATUS.PARTIAL_PAYMENT,
      ORDER_STATUS.SETTLEMENT,
      ORDER_STATUS.FULFILLMENT,
      ORDER_STATUS.PROCESSING,
    ],
  },
  {
    id: 'ready',
    label: 'جاهز للتسليم',
    description: 'طلبك جاهز للاستلام/التوصيل',
    icon: '🎉',
    statuses: [ORDER_STATUS.SUPPLY, ORDER_STATUS.READY],
  },
  {
    id: 'delivered',
    label: 'تم التسليم',
    description: 'تم تسليم الطلب بنجاح',
    icon: '🚚',
    statuses: [ORDER_STATUS.DELIVERED],
  },
];

export const getCurrentStepIndex = (status: string): number => {
  // Handle edge cases
  if (status === ORDER_STATUS.CANCELLED || status === ORDER_STATUS.RETURNED) {
    return -1; // Special state
  }

  const index = CUSTOMER_PROGRESS_STEPS.findIndex(step =>
    (step.statuses as readonly string[]).includes(status)
  );

  // If status not found (shouldn't happen matching above), try to find nearest previous step logic?
  // For now return 0 if waiting, or last if completed not in list?
  // Let's stick to explicit match.

  return index;
};
