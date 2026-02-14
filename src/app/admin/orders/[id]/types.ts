export interface Order {
  id: string;
  serialNumber?: string;
  status: string;
  totalCents: number;
  deliveryType: string;
  deliveryFee: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  estimatedCompletionDate?: string | Date;

  // Service
  service: {
    id: string;
    name: string;
    slug: string;
  };
  variant: {
    id: string;
    name: string;
    priceCents: number;
    etaDays: number;
  };
  serviceSource?: string;
  cardType?: string;
  serviceReceipt?: string;
  serviceDetails?: string;
  underImplementationReason?: string;
  photographyLocation?: string;
  photographyDate?: string;

  // Customer & Identity
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  idNumber?: string;
  birthDate?: string;
  gender?: string;
  profession?: string;
  nationality?: string;

  // Personal & Family
  fatherName?: string;
  motherName?: string;
  wifeName?: string;
  wifeMotherName?: string;
  marriageDate?: string;
  divorceDate?: string;
  deathDate?: string;
  age?: string;
  landlinePhone?: string;

  // Address
  address: string;
  governorate?: string;
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  landmark?: string;
  additionalPhone?: string;
  policeStation?: string;
  pickupLocation?: string;
  translationLanguage?: string;
  destination?: string;
  title?: string;

  // Classification
  customerType?: string;
  customerFollowUp?: string;
  gracePeriod?: string;

  // Financial specifics
  quantity?: number;
  otherFees?: number;
  discount?: number;
  value?: number;
  paidAmount?: number;
  remainingAmount?: number;
  selectedFines?: string;
  finesDetails?: string;
  servicesDetails?: string;

  // Relationships
  notes: string;
  adminNotes: string;
  originalDocuments?: string;
  hasAttachments?: boolean;
  attachedDocuments?: string[] | string;
  paymentMethod?: string;

  createdByAdmin?: {
    id: string;
    name: string;
    email: string;
  } | null;

  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };

  payment?: OrderPayment;
  orderDocuments: OrderDocument[];
  formSerials?: FormSerial[];
  documents?: {
    id: string;
    fileName: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string | Date;
  }[];
}

export interface OrderPayment {
  id: string;
  method: string;
  status: string;
  amount: number;
  senderPhone: string;
  paymentScreenshot: string;
  notes: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OrderDocument {
  id: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  documentType: string;
  uploadedAt: string | Date;
}

export interface FormSerial {
  id: string;
  serialNumber: string;
  formType: {
    id: string;
    name: string;
  };
  consumed: boolean;
  consumedAt?: string | Date;
}

import { getOrderStatus } from '@/constants/orderStatus';

export { getOrderStatus as getStatusBadge };
