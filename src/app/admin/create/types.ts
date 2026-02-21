// Types for Create Order Page
export interface Service {
  id: string;
  name: string;
  slug: string;
  variants: ServiceVariant[];
  fields: ServiceField[];
  documents: ServiceDocument[];
}

export interface ServiceField {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string | null;
  required: boolean;
  orderIndex: number;
  options: ServiceFieldOption[];
  showIf?: string; // JSON string
}

export interface ServiceFieldOption {
  id: string;
  value: string;
  label: string;
  requiredDocs?: string; // JSON array of document titles/IDs
  showFields?: string; // JSON array of field names
}

export interface ServiceDocument {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  showIf?: string;
}

export interface ServiceVariant {
  id: string;
  name: string;
  priceCents: number;
  etaDays: number;
}

export interface Category {
  id: string;
  name: string;
  services: Service[];
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  additionalPhone?: string;
  address?: string;
  governorate?: string;
  city?: string;
  district?: string;
  street?: string;
  buildingNumber?: string;
  apartmentNumber?: string;
  landmark?: string;
  birthDate?: string;
  fatherName?: string;
  idNumber?: string;
  motherName?: string;

  wifeName?: string;
}

export interface FormData {
  // Customer Basic Info
  customerPhone: string;
  additionalPhone: string;
  customerIdNumber: string;
  customerName: string;
  customerEmail: string;
  address: string;
  governorate: string;
  city: string;
  district: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  landmark: string;
  landlinePhone: string;
  // Personal Details
  birthDate: string;
  fatherName: string;
  idNumber: string;
  motherName: string;

  wifeName: string;
  wifeMotherName: string;
  marriageDate: string;
  divorceDate: string;
  deathDate: string;
  deceasedName: string;
  // Customer Type & Follow-up
  customerFollowUp: string;
  profession: string;
  gender: string;
  // Service Details
  serviceName: string;
  serviceSource: string;
  cardType: string;
  serviceReceipt: string;
  age: string;
  deliveryDate: string;
  quantity: number;
  otherFees: number;
  discount: string;
  value: number;
  total: number;
  paidAmount: string;
  remainingAmount: number;
  serviceDetails: string;
  photographyLocation: string;
  photographyDate: string;
  underImplementationReason: string;
  // Location Info
  policeStation: string;
  pickupLocation: string;
  // Documents
  originalDocuments: string;
  hasAttachments: boolean;
  attachedDocuments: string[];
  // Payment
  paymentMethod: string;
  // Notes
  notes: string;
  adminNotes: string;
  // Delivery
  deliveryType: string;
  deliveryFee: number;
  dynamicAnswers?: Record<string, string>;
  translationLanguage?: string;
  destination?: string;
  title?: string;
  uploadedDocuments?: UploadedDocument[];
}

export interface UploadedDocument {
  originalName: string;
  filename: string;
  filePath: string;
  fileSize: number;
  fileType: string;
}

export const initialFormData: FormData = {
  // Customer Basic Info
  customerPhone: '',
  additionalPhone: '',
  customerIdNumber: '',
  customerName: '',
  customerEmail: '',
  address: '',
  governorate: '',
  city: '',
  district: '',
  street: '',
  buildingNumber: '',
  apartmentNumber: '',
  landmark: '',
  landlinePhone: '',
  // Personal Details
  birthDate: '',
  fatherName: '',
  idNumber: '',
  motherName: '',

  wifeName: '',
  wifeMotherName: '',
  marriageDate: '',
  divorceDate: '',
  deathDate: '',
  deceasedName: '',
  // Customer Type & Follow-up
  customerFollowUp: '',
  profession: '',
  gender: '',
  // Service Details
  serviceName: '',
  serviceSource: '',
  cardType: '',
  serviceReceipt: 'AFTER',
  age: '',
  deliveryDate: '',
  quantity: 1,
  otherFees: 0,
  discount: '',
  value: 0,
  total: 0,
  paidAmount: '',
  remainingAmount: 0,
  serviceDetails: '',
  photographyLocation: '',
  photographyDate: '',
  underImplementationReason: '',
  // Location Info
  policeStation: '',
  pickupLocation: '',
  // Documents
  originalDocuments: '',
  hasAttachments: false,
  attachedDocuments: [],
  // Payment
  paymentMethod: 'CASH',
  // Notes
  notes: '',
  adminNotes: '',
  deliveryType: 'OFFICE',
  deliveryFee: 0,
  dynamicAnswers: {},
  translationLanguage: '',
  destination: '',
  title: '',
  uploadedDocuments: [],
};
