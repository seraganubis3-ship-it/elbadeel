// Types for Admin Orders
export interface Order {
  id: string;
  service: {
    name: string;
    slug: string;
  };
  variant: {
    name: string;
    priceCents: number;
    etaDays: number;
  };
  status: string;
  totalCents: number;
  deliveryType: string;
  deliveryFee: number;
  createdAt: Date;
  estimatedCompletionDate?: Date;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  notes: string;
  adminNotes: string;
  serviceDetails?: string;
  // Additional fields for birth certificate
  birthDate?: string;
  profession?: string;
  motherName?: string;
  fatherName?: string;
  nationality?: string;
  deathDate?: string;
  idNumber?: string;
  quantity?: number;
  customerFollowUp?: string;
  policeStation?: string;
  pickupLocation?: string;
  photographyLocation?: string;
  photographyDate?: string;
  marriageDate?: string;
  divorceDate?: string;
  governorate?: string;
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  landmark?: string;
  wifeMotherName?: string;
  wifeName?: string;
  otherFees?: number;
  selectedFines?: string;
  finesDetails?: string;
  servicesDetails?: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  payment?: {
    id: string;
    method: string;
    status: string;
    senderPhone: string;
    paymentScreenshot: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
  };
  orderDocuments: Array<{
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    documentType: string;
    uploadedAt: Date;
  }>;
  createdByAdmin?: { id: string; name: string; email: string } | null;
}

export interface OrderFilters {
  searchTerm: string;
  statusFilter: string;
  deliveryFilter: string;
  dateFrom: string;
  dateTo: string;
  selectedServiceIds: string[];
  orderSourceFilter: string;
  userIdFilter: string;
  createdByAdminIdFilter: string;
  deliveryTodayFilter: boolean;
}

export interface Service {
  id: string;
  name: string;
}

export interface Admin {
  id: string;
  name: string;
}

import { ORDER_STATUS_CONFIG, OrderStatusKey } from '@/constants/orderStatus';

export { ORDER_STATUS_CONFIG as STATUS_CONFIG };
export type { OrderStatusKey as StatusKey };

// Helper functions (kept for backward compatibility but modified to use centralized config)
export const getStatusText = (status: string): string => {
  return ORDER_STATUS_CONFIG[status as OrderStatusKey]?.text || status;
};

export const getStatusClass = (status: string): string => {
  return ORDER_STATUS_CONFIG[status as OrderStatusKey]?.class || 'bg-gray-100 text-gray-800';
};

export const getStatusIcon = (status: string): string => {
  return ORDER_STATUS_CONFIG[status as OrderStatusKey]?.icon || '❓';
};

export const getDeliveryInfo = (order: Order) => {
  if (order.deliveryType === 'OFFICE') {
    return {
      type: 'استلام من المكتب',
      fee: 'مجاناً',
      color: 'text-blue-600',
    };
  } else {
    return {
      type: 'توصيل على العنوان',
      fee: `+${(order.deliveryFee / 100).toFixed(2)} جنيه`,
      color: 'text-green-600',
    };
  }
};

// WhatsApp message templates
export const getWhatsappTemplates = (order: Order | null) => [
  {
    id: 'new_order',
    name: '🆕 طلب جديد',
    message: `🏢 *منصة البديل*\n\nمرحباً *${order?.customerName}* 👋\n\n✅ تم استلام طلبك بنجاح!\n\n📋 *تفاصيل الطلب:*\n• رقم الطلب: #${order?.id}\n• الخدمة: ${order?.service?.name}\n• المبلغ: ${order ? (order.totalCents / 100).toFixed(2) : 0} جنيه\n\nسنقوم بالتواصل معك قريباً.\n\n🌐 منصة البديل`,
  },
  {
    id: 'order_ready',
    name: '✅ جاهز للاستلام',
    message: `🏢 *منصة البديل*\n\nمرحباً *${order?.customerName}* 👋\n\n🎉 *طلبك جاهز للاستلام!*\n\n📋 رقم الطلب: #${order?.id}\n📌 الخدمة: ${order?.service?.name}\n\n📍 يمكنك استلام طلبك من مكتبنا.\n\n🌐 منصة البديل`,
  },
  {
    id: 'payment_reminder',
    name: '💰 تذكير بالدفع',
    message: `🏢 *منصة البديل*\n\nمرحباً *${order?.customerName}* 👋\n\n💰 *تذكير بالدفع*\n\n📋 رقم الطلب: #${order?.id}\n💵 المبلغ: ${order ? (order.totalCents / 100).toFixed(2) : 0} جنيه\n\nيرجى سداد المبلغ لاستكمال الطلب.\n\n🌐 منصة البديل`,
  },
  {
    id: 'order_delivered',
    name: '🚚 تم التسليم',
    message: `🏢 *منصة البديل*\n\nمرحباً *${order?.customerName}* 👋\n\n✅ *تم تسليم طلبك بنجاح!*\n\n📋 رقم الطلب: #${order?.id}\n📌 الخدمة: ${order?.service?.name}\n\nشكراً لثقتك في منصة البديل 🙏\n\n🌐 منصة البديل`,
  },
];
