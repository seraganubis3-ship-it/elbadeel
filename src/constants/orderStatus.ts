export const ORDER_STATUS_CONFIG = {
  waiting_confirmation: {
    text: 'انتظار التاكيد',
    class: 'bg-yellow-100 text-yellow-800',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '⏳',
  },
  waiting_payment: {
    text: 'انتظار الدفع',
    class: 'bg-orange-100 text-orange-800',
    color: 'bg-orange-100 text-orange-800',
    icon: '💳',
  },
  paid: {
    text: 'تم الدفع',
    class: 'bg-green-100 text-green-800',
    color: 'bg-green-100 text-green-800',
    icon: '💰',
  },
  settlement: {
    text: 'تسديد',
    class: 'bg-blue-100 text-blue-800',
    color: 'bg-blue-100 text-blue-800',
    icon: '📋',
  },
  fulfillment: {
    text: 'استيفاء',
    class: 'bg-purple-100 text-purple-800',
    color: 'bg-purple-100 text-purple-800',
    icon: '⚡',
  },
  supply: {
    text: 'توريد',
    class: 'bg-indigo-100 text-indigo-800',
    color: 'bg-indigo-100 text-indigo-800',
    icon: '📦',
  },
  delivery: {
    text: 'تسليم',
    class: 'bg-teal-100 text-teal-800',
    color: 'bg-teal-100 text-teal-800',
    icon: '🚚',
  },
  completed: {
    text: 'مكتمل',
    class: 'bg-emerald-100 text-emerald-800',
    color: 'bg-emerald-100 text-emerald-800',
    icon: '✅',
  },
  returned: {
    text: 'مرتجع',
    class: 'bg-red-100 text-red-800',
    color: 'bg-red-100 text-red-800',
    icon: '↩️',
  },
  cancelled: {
    text: 'الغاء',
    class: 'bg-gray-100 text-gray-800',
    color: 'bg-gray-100 text-gray-800',
    icon: '❌',
  },
  // Additional/Legacy statuses for fallback
  pending: {
    text: 'في انتظار الدفع',
    class: 'bg-yellow-100 text-yellow-800',
    color: 'bg-yellow-100 text-yellow-800',
    icon: '💳',
  },
  payment_pending: {
    text: 'في انتظار تأكيد الدفع',
    class: 'bg-orange-100 text-orange-800',
    color: 'bg-orange-100 text-orange-800',
    icon: '⏳',
  },
  payment_confirmed: {
    text: 'مدفوع بالكامل',
    class: 'bg-green-100 text-green-800',
    color: 'bg-green-100 text-green-800',
    icon: '💰',
  },
  partial_payment: {
    text: 'دفع جزئي',
    class: 'bg-amber-100 text-amber-800',
    color: 'bg-amber-100 text-amber-800',
    icon: '💵',
  },
  reviewing: {
    text: 'قيد المراجعة',
    class: 'bg-blue-100 text-blue-800',
    color: 'bg-blue-100 text-blue-800',
    icon: '🔍',
  },
  processing: {
    text: 'قيد التنفيذ',
    class: 'bg-purple-100 text-purple-800',
    color: 'bg-purple-100 text-purple-800',
    icon: '⚡',
  },
} as const;

export type OrderStatusKey = keyof typeof ORDER_STATUS_CONFIG;

export const getOrderStatus = (status: string) => {
  return (
    ORDER_STATUS_CONFIG[status as OrderStatusKey] || {
      text: status,
      class: 'bg-gray-100 text-gray-800',
      color: 'bg-gray-100 text-gray-800',
      icon: '❓',
    }
  );
};
