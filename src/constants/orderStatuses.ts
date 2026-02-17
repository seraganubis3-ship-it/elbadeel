// Order Status Constants - Centralized definitions for all order statuses
// This file should be used across all components for consistency

// Order Status Values (stored in database)
export const ORDER_STATUS = {
  // الحالات الأساسية
  WAITING_CONFIRMATION: 'waiting_confirmation', // انتظار المراجعة
  WAITING_PAYMENT: 'waiting_payment', // تم مراجعة (في انتظار الدفع)
  PAYMENT_REVIEW: 'payment_review', // جاري مراجعة الدفع
  PARTIAL_PAYMENT: 'partial_payment', // دفع جزئي
  PAYMENT_CONFIRMED: 'payment_confirmed', // تم تأكيد الدفع
  SETTLEMENT: 'settlement', // تسديد
  FULFILLMENT: 'fulfillment', // استيفاء
  SUPPLY: 'supply', // ورود
  READY: 'ready', // جاهز للتسليم
  DELIVERED: 'delivered', // تم التسليم
  RETURNED: 'returned', // مرتجع
  CANCELLED: 'cancelled', // ملغي
  PROCESSING: 'processing', // تحت التنفيذ

  // Aliases for backwards compatibility
  PENDING: 'waiting_confirmation',
  IN_PROGRESS: 'fulfillment',
  COMPLETED: 'delivered',
} as const;

export type OrderStatusType = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Order Status Display Configuration (for UI)
export const ORDER_STATUS_CONFIG: Record<
  string,
  {
    label: string;
    labelEn: string;
    description: string;
    icon: string;
    color: string;
    bgColor: string;
    borderColor: string;
  }
> = {
  [ORDER_STATUS.WAITING_CONFIRMATION]: {
    label: 'انتظار المراجعة',
    labelEn: 'Waiting Review',
    description: 'تم استلام طلبك وسيتم مراجعته',
    icon: '⏳',
    color: 'text-yellow-800',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
  },
  [ORDER_STATUS.WAITING_PAYMENT]: {
    label: 'تم مراجعة (في انتظار الدفع)',
    labelEn: 'Reviewed (Pending Payment)',
    description: 'تمت المراجعة، يرجى سداد الرسوم',
    icon: '💳',
    color: 'text-orange-800',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200',
  },
  PROCESSING: {
    label: 'تحت التنفيذ',
    labelEn: 'Processing',
    description: 'جاري تنفيذ الطلب',
    icon: '⚡',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  [ORDER_STATUS.PAYMENT_REVIEW]: {
    label: 'جاري مراجعة الدفع',
    labelEn: 'Payment Review',
    description: 'تم إرسال الدفعة وجاري مراجعتها',
    icon: '⏳',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },
  [ORDER_STATUS.PARTIAL_PAYMENT]: {
    label: 'دفع جزئي',
    labelEn: 'Partial Payment',
    description: 'تم استلام جزء من المبلغ',
    icon: '💰',
    color: 'text-amber-800',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
  },
  [ORDER_STATUS.PAYMENT_CONFIRMED]: {
    label: 'تم الدفع',
    labelEn: 'Payment Confirmed',
    description: 'تم استلام الدفعة بنجاح',
    icon: '✅',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  [ORDER_STATUS.SETTLEMENT]: {
    label: 'تسديد',
    labelEn: 'Settlement',
    description: 'قيد التسديد والمراجعة',
    icon: '📋',
    color: 'text-blue-800',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
  },

  [ORDER_STATUS.SUPPLY]: {
    label: 'ورود',
    labelEn: 'Supply',
    description: 'قيد التوريد والإعداد',
    icon: '📦',
    color: 'text-indigo-800',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-200',
  },
  [ORDER_STATUS.READY]: {
    label: 'جاهز للتسليم',
    labelEn: 'Ready',
    description: 'طلبك جاهز للاستلام',
    icon: '🎉',
    color: 'text-teal-800',
    bgColor: 'bg-teal-100',
    borderColor: 'border-teal-200',
  },
  [ORDER_STATUS.DELIVERED]: {
    label: 'تم التسليم',
    labelEn: 'Delivered',
    description: 'تم تسليم الطلب بنجاح',
    icon: '🚚',
    color: 'text-emerald-800',
    bgColor: 'bg-emerald-100',
    borderColor: 'border-emerald-200',
  },
  [ORDER_STATUS.RETURNED]: {
    label: 'مرتجع',
    labelEn: 'Returned',
    description: 'تم إرجاع الطلب',
    icon: '↩️',
    color: 'text-gray-800',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
  },
  [ORDER_STATUS.FULFILLMENT]: {
    label: 'استيفاء',
    labelEn: 'Fulfillment',
    description: 'قيد الاستيفاء والتنفيذ',
    icon: '⚠️',
    color: 'text-purple-800',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-200',
  },
  [ORDER_STATUS.CANCELLED]: {
    label: 'ملغي',
    labelEn: 'Cancelled',
    description: 'تم إلغاء الطلب',
    icon: '❌',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
};

// Payment Method Constants
export const PAYMENT_METHOD = {
  CASH: 'CASH',
  VODAFONE_CASH: 'VODAFONE_CASH',
  INSTAPAY: 'INSTAPAY',
  BANK_TRANSFER: 'BANK_TRANSFER',
  CARD: 'CARD',
} as const;

export type PaymentMethodType = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];

export const PAYMENT_METHOD_CONFIG: Record<
  string,
  {
    label: string;
    labelEn: string;
    icon: string;
  }
> = {
  [PAYMENT_METHOD.CASH]: {
    label: 'كاش',
    labelEn: 'Cash',
    icon: '💵',
  },
  [PAYMENT_METHOD.VODAFONE_CASH]: {
    label: 'فودافون كاش',
    labelEn: 'Vodafone Cash',
    icon: '📱',
  },
  [PAYMENT_METHOD.INSTAPAY]: {
    label: 'انستا باي',
    labelEn: 'InstaPay',
    icon: '💳',
  },
  [PAYMENT_METHOD.BANK_TRANSFER]: {
    label: 'تحويل بنكي',
    labelEn: 'Bank Transfer',
    icon: '🏦',
  },
  [PAYMENT_METHOD.CARD]: {
    label: 'بطاقة ائتمان',
    labelEn: 'Credit Card',
    icon: '💳',
  },
};

// Helper functions
export function getStatusLabel(status: string): string {
  return ORDER_STATUS_CONFIG[status]?.label || status;
}

export function getStatusIcon(status: string): string {
  return ORDER_STATUS_CONFIG[status]?.icon || '❓';
}

export function getStatusColors(status: string) {
  const config = ORDER_STATUS_CONFIG[status];
  return config
    ? {
        color: config.color,
        bgColor: config.bgColor,
        borderColor: config.borderColor,
      }
    : {
        color: 'text-gray-800',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
      };
}

export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_CONFIG[method]?.label || method;
}

// Progress order for tracker (only main statuses in order)
export const ORDER_PROGRESS_STATUSES = [
  ORDER_STATUS.WAITING_CONFIRMATION,
  ORDER_STATUS.WAITING_PAYMENT,
  ORDER_STATUS.PAYMENT_CONFIRMED,
  ORDER_STATUS.SETTLEMENT,
  ORDER_STATUS.FULFILLMENT,
  ORDER_STATUS.SUPPLY,
  ORDER_STATUS.READY,
  ORDER_STATUS.DELIVERED,
];

// Status options for filters/dropdowns
export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label,
}));

export const PAYMENT_METHOD_OPTIONS = Object.entries(PAYMENT_METHOD_CONFIG).map(
  ([value, config]) => ({
    value,
    label: config.label,
  })
);
