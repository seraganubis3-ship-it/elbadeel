// Types for Admin Orders
export interface WhatsAppTemplate {
  id: string;
  name: string;
  message: string;
}

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
  additionalPhone?: string;
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
  destination?: string;
  title?: string;
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
  documents: Array<{
    id: string;
    orderId: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedAt: Date;
  }>;
  createdByAdmin?: { id: string; name: string; email: string } | null;
  paidAmount?: number;
  remainingAmount?: number;
}

export interface OrderFilters {
  searchTerm: string;
  statusFilter: string;
  deliveryFilter: string;
  dateFrom?: string;
  dateTo?: string;
  photographyDate?: string;
  selectedServiceIds: string[];
  orderSourceFilter: string;
  userIdFilter: string;
  createdByAdminIdFilter: string;
  deliveryTodayFilter: boolean;
  categoryId: string;
  employeeId: string;
}

export interface Service {
  id: string;
  name: string;
}

export interface Category {
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

export const getWhatsappTemplates = (order: Order): WhatsAppTemplate[] => {
  const templates: WhatsAppTemplate[] = [
    {
      id: 'welcome',
      name: 'ترحيب واستلام الطلب',
      message: `أهلاً بك أستاذ ${order.customerName}، تم استلام طلبك الخاص بخدمة ${order.service.name} بنجاح وجاري العمل عليه.`,
    },
    {
      id: 'in-progress',
      name: 'تحديث: قيد التنفيذ',
      message: `أهلاً بك أستاذ ${order.customerName}، بخصوص طلبك (${order.service.name})، تم البدء في التنفيذ وسنقوم بإبلاغك بمجرد الانتهاء.`,
    },
    {
      id: 'missing-docs',
      name: 'نقص في المستندات',
      message: `أهلاً بك أستاذ ${order.customerName}، بخصوص طلبك (${order.service.name})، يوجد نقص في بعض المستندات المطلوبة. يرجى مراجعة الموقع أو التواصل معنا لاستكمالها.`,
    },
    {
      id: 'completed',
      name: 'اكتمال الطلب',
      message: `أهلاً بك أستاذ ${order.customerName}، يسعدنا إبلاغك بأن طلبك الخاص بخدمة ${order.service.name} قد اكتمل وهو جاهز الآن.`,
    },
  ];

  return templates;
};
