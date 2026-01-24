export interface AdminNotification {
  id: string;
  type: 'delivery_due' | 'low_stock' | 'system';
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

export interface DeliveryDueNotification {
  orderId: string;
  customerName: string;
  serviceName: string;
  dueDate: Date;
}

export interface LowStockNotification {
  formTypeId: string;
  formTypeName: string;
  currentCount: number;
  minThreshold: number;
}
