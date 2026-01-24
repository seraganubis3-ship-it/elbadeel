Object.defineProperty(exports, '__esModule', { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip,
} = require('./runtime/index-browser.js');

const Prisma = {};

exports.Prisma = Prisma;
exports.$Enums = {};

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: '5.22.0',
  engine: '605197351a3c8bdd595af2d2a9bc3025bca48ea2',
};

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.Decimal = Decimal;

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.validator = Public.validator;

/**
 * Extensions
 */
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull,
};

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable',
});

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  type: 'type',
  provider: 'provider',
  providerAccountId: 'providerAccountId',
  refresh_token: 'refresh_token',
  access_token: 'access_token',
  expires_at: 'expires_at',
  token_type: 'token_type',
  scope: 'scope',
  id_token: 'id_token',
  session_state: 'session_state',
};

exports.Prisma.SessionScalarFieldEnum = {
  id: 'id',
  sessionToken: 'sessionToken',
  userId: 'userId',
  expires: 'expires',
};

exports.Prisma.VerificationTokenScalarFieldEnum = {
  identifier: 'identifier',
  token: 'token',
  expires: 'expires',
};

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  emailVerified: 'emailVerified',
  image: 'image',
  passwordHash: 'passwordHash',
  phone: 'phone',
  additionalPhone: 'additionalPhone',
  role: 'role',
  createdByAdminId: 'createdByAdminId',
  resetToken: 'resetToken',
  resetTokenExpiry: 'resetTokenExpiry',
  verificationToken: 'verificationToken',
  verificationTokenExpiry: 'verificationTokenExpiry',
  verificationCode: 'verificationCode',
  verificationCodeExpiry: 'verificationCodeExpiry',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  address: 'address',
  governorate: 'governorate',
  city: 'city',
  district: 'district',
  street: 'street',
  buildingNumber: 'buildingNumber',
  apartmentNumber: 'apartmentNumber',
  landmark: 'landmark',
  birthDate: 'birthDate',
  fatherName: 'fatherName',
  idNumber: 'idNumber',
  motherName: 'motherName',
  nationality: 'nationality',
  wifeName: 'wifeName',
  wifeMotherName: 'wifeMotherName',
};

exports.Prisma.CategoryScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  orderIndex: 'orderIndex',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  icon: 'icon',
};

exports.Prisma.ServiceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  description: 'description',
  icon: 'icon',
  active: 'active',
  categoryId: 'categoryId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.ServiceFieldScalarFieldEnum = {
  id: 'id',
  serviceId: 'serviceId',
  name: 'name',
  label: 'label',
  type: 'type',
  placeholder: 'placeholder',
  required: 'required',
  orderIndex: 'orderIndex',
  active: 'active',
  showIf: 'showIf',
  validation: 'validation',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.ServiceFieldOptionScalarFieldEnum = {
  id: 'id',
  fieldId: 'fieldId',
  value: 'value',
  label: 'label',
  orderIndex: 'orderIndex',
  requiredDocs: 'requiredDocs',
  showFields: 'showFields',
  createdAt: 'createdAt',
};

exports.Prisma.ServiceVariantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  priceCents: 'priceCents',
  etaDays: 'etaDays',
  serviceId: 'serviceId',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.OrderScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  serviceId: 'serviceId',
  variantId: 'variantId',
  status: 'status',
  totalPrice: 'totalPrice',
  totalCents: 'totalCents',
  customerName: 'customerName',
  customerPhone: 'customerPhone',
  additionalPhone: 'additionalPhone',
  customerEmail: 'customerEmail',
  address: 'address',
  governorate: 'governorate',
  city: 'city',
  district: 'district',
  street: 'street',
  buildingNumber: 'buildingNumber',
  apartmentNumber: 'apartmentNumber',
  landmark: 'landmark',
  notes: 'notes',
  adminNotes: 'adminNotes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  completedAt: 'completedAt',
  estimatedCompletionDate: 'estimatedCompletionDate',
  deliveryFee: 'deliveryFee',
  deliveryType: 'deliveryType',
  createdByAdminId: 'createdByAdminId',
  birthDate: 'birthDate',
  fatherName: 'fatherName',
  idNumber: 'idNumber',
  motherName: 'motherName',
  nationality: 'nationality',
  wifeName: 'wifeName',
  photographyLocation: 'photographyLocation',
  photographyDate: 'photographyDate',
  marriageDate: 'marriageDate',
  divorceDate: 'divorceDate',
  wifeMotherName: 'wifeMotherName',
  quantity: 'quantity',
  serviceDetails: 'serviceDetails',
  otherFees: 'otherFees',
  discount: 'discount',
  gender: 'gender',
  policeStation: 'policeStation',
  pickupLocation: 'pickupLocation',
  originalDocuments: 'originalDocuments',
  attachedDocuments: 'attachedDocuments',
  hasAttachments: 'hasAttachments',
  selectedFines: 'selectedFines',
  finesDetails: 'finesDetails',
  servicesDetails: 'servicesDetails',
  customerFollowUp: 'customerFollowUp',
  promoCodeId: 'promoCodeId',
  discountAmount: 'discountAmount',
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  amount: 'amount',
  currency: 'currency',
  method: 'method',
  status: 'status',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  paymentScreenshot: 'paymentScreenshot',
  senderPhone: 'senderPhone',
  notes: 'notes',
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  action: 'action',
  entityType: 'entityType',
  entityId: 'entityId',
  oldValues: 'oldValues',
  newValues: 'newValues',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  createdAt: 'createdAt',
};

exports.Prisma.FAQScalarFieldEnum = {
  id: 'id',
  question: 'question',
  answer: 'answer',
  orderIndex: 'orderIndex',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.DocumentScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  fileName: 'fileName',
  filePath: 'filePath',
  fileType: 'fileType',
  fileSize: 'fileSize',
  uploadedAt: 'uploadedAt',
};

exports.Prisma.OrderDocumentScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  fileName: 'fileName',
  filePath: 'filePath',
  fileSize: 'fileSize',
  fileType: 'fileType',
  documentType: 'documentType',
  uploadedAt: 'uploadedAt',
};

exports.Prisma.ServiceDocumentScalarFieldEnum = {
  id: 'id',
  serviceId: 'serviceId',
  title: 'title',
  description: 'description',
  required: 'required',
  showIf: 'showIf',
  orderIndex: 'orderIndex',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.SystemSettingsScalarFieldEnum = {
  id: 'id',
  siteName: 'siteName',
  siteDescription: 'siteDescription',
  contactEmail: 'contactEmail',
  contactPhone: 'contactPhone',
  address: 'address',
  workingHours: 'workingHours',
  socialLinks: 'socialLinks',
  seoSettings: 'seoSettings',
  updatedAt: 'updatedAt',
};

exports.Prisma.FormTypeScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  active: 'active',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.FormTypeVariantScalarFieldEnum = {
  id: 'id',
  formTypeId: 'formTypeId',
  serviceVariantId: 'serviceVariantId',
  createdAt: 'createdAt',
};

exports.Prisma.FormSerialScalarFieldEnum = {
  id: 'id',
  formTypeId: 'formTypeId',
  serialNumber: 'serialNumber',
  orderId: 'orderId',
  consumed: 'consumed',
  consumedAt: 'consumedAt',
  addedByAdminId: 'addedByAdminId',
  consumedByAdminId: 'consumedByAdminId',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.DependentScalarFieldEnum = {
  id: 'id',
  name: 'name',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  createdByAdminId: 'createdByAdminId',
};

exports.Prisma.PromoCodeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  type: 'type',
  value: 'value',
  minOrderAmount: 'minOrderAmount',
  maxDiscount: 'maxDiscount',
  startDate: 'startDate',
  endDate: 'endDate',
  usageLimit: 'usageLimit',
  currentUsage: 'currentUsage',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc',
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive',
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last',
};

exports.Prisma.ModelName = {
  Account: 'Account',
  Session: 'Session',
  VerificationToken: 'VerificationToken',
  User: 'User',
  Category: 'Category',
  Service: 'Service',
  ServiceField: 'ServiceField',
  ServiceFieldOption: 'ServiceFieldOption',
  ServiceVariant: 'ServiceVariant',
  Order: 'Order',
  Payment: 'Payment',
  AuditLog: 'AuditLog',
  FAQ: 'FAQ',
  Document: 'Document',
  OrderDocument: 'OrderDocument',
  ServiceDocument: 'ServiceDocument',
  SystemSettings: 'SystemSettings',
  FormType: 'FormType',
  FormTypeVariant: 'FormTypeVariant',
  FormSerial: 'FormSerial',
  Dependent: 'Dependent',
  PromoCode: 'PromoCode',
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message;
        const runtime = getRuntime();
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message =
            'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' +
            runtime.prettyName +
            '`).';
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`;

        throw new Error(message);
      },
    });
  }
}

exports.PrismaClient = PrismaClient;

Object.assign(exports, Prisma);
