Object.defineProperty(exports, '__esModule', { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  skip,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  getRuntime,
} = require('./runtime/edge.js');

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

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError;
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError;
Prisma.PrismaClientInitializationError = PrismaClientInitializationError;
Prisma.PrismaClientValidationError = PrismaClientValidationError;
Prisma.NotFoundError = NotFoundError;
Prisma.Decimal = Decimal;

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag;
Prisma.empty = empty;
Prisma.join = join;
Prisma.raw = raw;
Prisma.validator = Public.validator;

/**
 * Extensions
 */
Prisma.getExtensionContext = Extensions.getExtensionContext;
Prisma.defineExtension = Extensions.defineExtension;

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
 * Create the Client
 */
const config = {
  generator: {
    name: 'client',
    provider: {
      fromEnvVar: null,
      value: 'prisma-client-js',
    },
    output: {
      value: 'C:\\Users\\serag\\Downloads\\Ofa\\web\\src\\generated\\client',
      fromEnvVar: null,
    },
    config: {
      engineType: 'library',
    },
    binaryTargets: [
      {
        fromEnvVar: null,
        value: 'windows',
        native: true,
      },
    ],
    previewFeatures: [],
    sourceFilePath: 'C:\\Users\\serag\\Downloads\\Ofa\\web\\prisma\\schema.prisma',
    isCustomOutput: true,
  },
  relativeEnvPaths: {
    rootEnvPath: null,
    schemaEnvPath: '../../../.env',
  },
  relativePath: '../../../prisma',
  clientVersion: '5.22.0',
  engineVersion: '605197351a3c8bdd595af2d2a9bc3025bca48ea2',
  datasourceNames: ['db'],
  activeProvider: 'postgresql',
  postinstall: false,
  inlineDatasources: {
    db: {
      url: {
        fromEnvVar: 'DATABASE_URL',
        value: null,
      },
    },
  },
  inlineSchema:
    'generator client {\n  provider = "prisma-client-js"\n  output   = "../src/generated/client"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\nmodel Account {\n  id                String  @id @default(cuid())\n  userId            String\n  type              String\n  provider          String\n  providerAccountId String\n  refresh_token     String?\n  access_token      String?\n  expires_at        Int?\n  token_type        String?\n  scope             String?\n  id_token          String?\n  session_state     String?\n  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([provider, providerAccountId])\n  @@index([userId])\n}\n\nmodel Session {\n  id           String   @id @default(cuid())\n  sessionToken String   @unique\n  userId       String\n  expires      DateTime\n  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n}\n\nmodel VerificationToken {\n  identifier String\n  token      String   @unique\n  expires    DateTime\n\n  @@unique([identifier, token])\n}\n\nmodel User {\n  id                      String       @id @default(cuid())\n  name                    String?\n  email                   String?      @unique\n  emailVerified           DateTime?\n  image                   String?\n  passwordHash            String?\n  phone                   String?\n  additionalPhone         String?\n  role                    String       @default("USER")\n  createdByAdminId        String?\n  createdByAdmin          User?        @relation("UserCreatedByAdmin", fields: [createdByAdminId], references: [id])\n  createdUsers            User[]       @relation("UserCreatedByAdmin")\n  createdOrders           Order[]      @relation("OrderCreatedByAdmin")\n  orders                  Order[]      @relation("OrderUser")\n  resetToken              String?\n  resetTokenExpiry        DateTime?\n  verificationToken       String?\n  verificationTokenExpiry DateTime?\n  verificationCode        String?\n  verificationCodeExpiry  DateTime?\n  createdAt               DateTime     @default(now())\n  updatedAt               DateTime     @updatedAt\n  address                 String?\n  governorate             String?\n  city                    String?\n  district                String?\n  street                  String?\n  buildingNumber          String?\n  apartmentNumber         String?\n  landmark                String?\n  birthDate               DateTime?\n  fatherName              String?\n  idNumber                String?\n  motherName              String?\n  nationality             String?\n  wifeName                String?\n  wifeMotherName          String?\n  accounts                Account[]\n  auditLogs               AuditLog[]\n  // orders moved above with explicit relation name\n  sessions                Session[]\n  // FormSerial audit relations\n  addedFormSerials        FormSerial[] @relation("FormSerialAddedBy")\n  consumedFormSerials     FormSerial[] @relation("FormSerialConsumedBy")\n  // Dependent relations\n  createdDependents       Dependent[]  @relation("DependentCreatedBy")\n\n  @@index([email])\n  @@index([role])\n  @@index([createdAt])\n  @@index([resetToken])\n  @@index([verificationToken])\n  @@index([verificationCode])\n  @@index([idNumber])\n  @@index([name])\n  @@index([createdByAdminId])\n}\n\nmodel Category {\n  id         String    @id @default(cuid())\n  name       String\n  slug       String    @unique\n  orderIndex Int       @default(0)\n  active     Boolean   @default(true)\n  createdAt  DateTime  @default(now())\n  updatedAt  DateTime  @updatedAt\n  icon       String?\n  services   Service[]\n\n  @@index([slug])\n  @@index([orderIndex])\n  @@index([active])\n}\n\nmodel Service {\n  id          String            @id @default(cuid())\n  name        String\n  slug        String            @unique\n  description String?\n  icon        String?\n  active      Boolean           @default(true)\n  categoryId  String\n  createdAt   DateTime          @default(now())\n  updatedAt   DateTime          @updatedAt\n  orders      Order[]\n  category    Category          @relation(fields: [categoryId], references: [id], onDelete: Cascade)\n  documents   ServiceDocument[]\n  variants    ServiceVariant[]\n  fields      ServiceField[] // Custom dynamic fields for this service\n\n  @@index([slug])\n  @@index([categoryId])\n  @@index([active])\n  @@index([createdAt])\n}\n\n// Dynamic form fields for services\nmodel ServiceField {\n  id          String  @id @default(cuid())\n  serviceId   String\n  name        String // Field identifier (e.g., "request_type", "old_status")\n  label       String // Display label (e.g., "نوع الطلب", "الحالة القديمة")\n  type        String // text, select, radio, checkbox, textarea, file\n  placeholder String? // Placeholder text\n  required    Boolean @default(false)\n  orderIndex  Int     @default(0)\n  active      Boolean @default(true)\n\n  // Conditional visibility\n  showIf String? // JSON: {"fieldName": "request_type", "value": "renewal_change"}\n\n  // Validation\n  validation String? // JSON: {"minLength": 3, "maxLength": 100, "pattern": "regex"}\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  service Service              @relation(fields: [serviceId], references: [id], onDelete: Cascade)\n  options ServiceFieldOption[] // For select/radio fields\n\n  @@index([serviceId])\n  @@index([orderIndex])\n  @@index([active])\n}\n\n// Options for select/radio fields\nmodel ServiceFieldOption {\n  id         String @id @default(cuid())\n  fieldId    String\n  value      String // Option value\n  label      String // Display label\n  orderIndex Int    @default(0)\n\n  // This option may require additional documents\n  requiredDocs String? // JSON array: ["doc_id_1", "doc_id_2"]\n\n  // This option may show additional fields\n  showFields String? // JSON array: ["field_name_1", "field_name_2"]\n\n  createdAt DateTime @default(now())\n\n  field ServiceField @relation(fields: [fieldId], references: [id], onDelete: Cascade)\n\n  @@index([fieldId])\n  @@index([orderIndex])\n}\n\nmodel ServiceVariant {\n  id            String            @id @default(cuid())\n  name          String\n  priceCents    Int\n  etaDays       Int\n  serviceId     String\n  active        Boolean           @default(true)\n  createdAt     DateTime          @default(now())\n  updatedAt     DateTime          @updatedAt\n  orders        Order[]\n  service       Service           @relation(fields: [serviceId], references: [id], onDelete: Cascade)\n  formTypeLinks FormTypeVariant[]\n\n  @@index([serviceId])\n  @@index([priceCents])\n  @@index([active])\n}\n\nmodel Order {\n  id                      String          @id @default(cuid())\n  userId                  String\n  serviceId               String\n  variantId               String\n  status                  String          @default("PENDING")\n  totalPrice              Int\n  totalCents              Int\n  customerName            String\n  customerPhone           String\n  additionalPhone         String?\n  customerEmail           String\n  address                 String?\n  governorate             String?\n  city                    String?\n  district                String?\n  street                  String?\n  buildingNumber          String?\n  apartmentNumber         String?\n  landmark                String?\n  notes                   String?\n  adminNotes              String?\n  createdAt               DateTime        @default(now())\n  updatedAt               DateTime        @updatedAt\n  completedAt             DateTime?\n  estimatedCompletionDate DateTime?\n  deliveryFee             Int             @default(0)\n  deliveryType            String          @default("OFFICE")\n  createdByAdminId        String?\n  createdByAdmin          User?           @relation("OrderCreatedByAdmin", fields: [createdByAdminId], references: [id])\n  birthDate               DateTime?\n  fatherName              String?\n  idNumber                String?\n  motherName              String?\n  nationality             String?\n  wifeName                String?\n  photographyLocation     String?\n  photographyDate         DateTime?\n  marriageDate            DateTime?\n  divorceDate             DateTime?\n  wifeMotherName          String?\n  quantity                Int             @default(1)\n  serviceDetails          String?\n  otherFees               Int             @default(0)\n  discount                Int             @default(0)\n  gender                  String?\n  policeStation           String?\n  pickupLocation          String?\n  originalDocuments       String?\n  attachedDocuments       String? // JSON array of attachment names\n  hasAttachments          Boolean         @default(false)\n  selectedFines           String? // JSON array of selected fine IDs\n  finesDetails            String? // JSON array of fine details\n  servicesDetails         String? // JSON object of services details\n  customerFollowUp        String? // Customer follow-up/dependent name\n  documents               Document[]\n  service                 Service         @relation(fields: [serviceId], references: [id], onDelete: Cascade)\n  user                    User            @relation("OrderUser", fields: [userId], references: [id], onDelete: Cascade)\n  variant                 ServiceVariant  @relation(fields: [variantId], references: [id], onDelete: Cascade)\n  orderDocuments          OrderDocument[]\n  payment                 Payment?\n  formSerials             FormSerial[]\n\n  // Promo Code Relations\n  promoCodeId    String?\n  promoCode      PromoCode? @relation(fields: [promoCodeId], references: [id])\n  discountAmount Int        @default(0) // Discount amount in cents\n\n  @@index([userId])\n  @@index([serviceId])\n  @@index([variantId])\n  @@index([status])\n  @@index([createdAt])\n  @@index([completedAt])\n  @@index([deliveryType])\n  @@index([idNumber])\n  @@index([createdByAdminId])\n  @@index([customerPhone])\n  @@index([promoCodeId])\n}\n\nmodel Payment {\n  id                String   @id @default(cuid())\n  orderId           String   @unique\n  amount            Int\n  currency          String   @default("EGP")\n  method            String\n  status            String   @default("PENDING")\n  createdAt         DateTime @default(now())\n  updatedAt         DateTime @updatedAt\n  paymentScreenshot String?\n  senderPhone       String?\n  notes             String?\n  order             Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  @@index([senderPhone])\n  @@index([status])\n  @@index([createdAt])\n  @@index([method])\n}\n\nmodel AuditLog {\n  id         String   @id @default(cuid())\n  userId     String?\n  action     String\n  entityType String\n  entityId   String?\n  oldValues  String?\n  newValues  String?\n  ipAddress  String?\n  userAgent  String?\n  createdAt  DateTime @default(now())\n  user       User?    @relation(fields: [userId], references: [id])\n\n  @@index([userId])\n  @@index([action])\n  @@index([entityType])\n  @@index([createdAt])\n}\n\nmodel FAQ {\n  id         String   @id @default(cuid())\n  question   String   @unique\n  answer     String\n  orderIndex Int      @default(0)\n  active     Boolean  @default(true)\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([orderIndex])\n  @@index([active])\n}\n\nmodel Document {\n  id         String   @id @default(cuid())\n  orderId    String\n  fileName   String\n  filePath   String\n  fileType   String\n  fileSize   Int\n  uploadedAt DateTime @default(now())\n  order      Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  @@index([orderId])\n  @@index([uploadedAt])\n}\n\nmodel OrderDocument {\n  id           String   @id @default(cuid())\n  orderId      String\n  fileName     String\n  filePath     String\n  fileSize     Int\n  fileType     String\n  documentType String\n  uploadedAt   DateTime @default(now())\n  order        Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)\n\n  @@index([orderId])\n  @@index([uploadedAt])\n  @@index([documentType])\n}\n\nmodel ServiceDocument {\n  id          String   @id @default(cuid())\n  serviceId   String\n  title       String\n  description String?\n  required    Boolean  @default(true)\n  showIf      String? // JSON: {"field": "request_type", "value": "renewal_status"}\n  orderIndex  Int      @default(0)\n  active      Boolean  @default(true)\n  createdAt   DateTime @default(now())\n  updatedAt   DateTime @updatedAt\n  service     Service  @relation(fields: [serviceId], references: [id], onDelete: Cascade)\n\n  @@index([serviceId])\n  @@index([orderIndex])\n  @@index([active])\n}\n\nmodel SystemSettings {\n  id              String   @id @default("main")\n  siteName        String   @default("البديل")\n  siteDescription String?\n  contactEmail    String?\n  contactPhone    String?\n  address         String?\n  workingHours    String?\n  socialLinks     String?\n  seoSettings     String?\n  updatedAt       DateTime @updatedAt\n}\n\n/// Forms inventory ("العهدة")\nmodel FormType {\n  id           String            @id @default(cuid())\n  name         String            @unique // عادي، سريع، فوري\n  description  String?\n  active       Boolean           @default(true)\n  createdAt    DateTime          @default(now())\n  updatedAt    DateTime          @updatedAt\n  // Which variants this form type can be used for\n  variantLinks FormTypeVariant[]\n  // Serial numbers belonging to this form type\n  serials      FormSerial[]\n\n  @@index([active])\n}\n\n// Many-to-many between form types and service variants\nmodel FormTypeVariant {\n  id               String         @id @default(cuid())\n  formTypeId       String\n  serviceVariantId String\n  createdAt        DateTime       @default(now())\n  formType         FormType       @relation(fields: [formTypeId], references: [id], onDelete: Cascade)\n  serviceVariant   ServiceVariant @relation(fields: [serviceVariantId], references: [id], onDelete: Cascade)\n\n  @@unique([formTypeId, serviceVariantId])\n  @@index([formTypeId])\n  @@index([serviceVariantId])\n}\n\n// Individual serial numbers for forms. Admin enters serials manually.\nmodel FormSerial {\n  id                String    @id @default(cuid())\n  formTypeId        String\n  serialNumber      String\n  // Optional: link to order when consumed\n  orderId           String?\n  consumed          Boolean   @default(false)\n  consumedAt        DateTime?\n  // Audit\n  addedByAdminId    String?\n  consumedByAdminId String?\n  createdAt         DateTime  @default(now())\n  updatedAt         DateTime  @updatedAt\n  formType          FormType  @relation(fields: [formTypeId], references: [id], onDelete: Cascade)\n  order             Order?    @relation(fields: [orderId], references: [id])\n  addedByAdmin      User?     @relation("FormSerialAddedBy", fields: [addedByAdminId], references: [id])\n  consumedByAdmin   User?     @relation("FormSerialConsumedBy", fields: [consumedByAdminId], references: [id])\n\n  @@unique([formTypeId, serialNumber])\n  @@index([formTypeId])\n  @@index([orderId])\n  @@index([consumed])\n  @@index([addedByAdminId])\n  @@index([consumedByAdminId])\n}\n\nmodel Dependent {\n  id               String   @id @default(cuid())\n  name             String\n  createdAt        DateTime @default(now())\n  updatedAt        DateTime @updatedAt\n  createdByAdminId String?\n  createdByAdmin   User?    @relation("DependentCreatedBy", fields: [createdByAdminId], references: [id])\n\n  @@index([name])\n  @@index([createdByAdminId])\n}\n\n// Promo Code Model\nmodel PromoCode {\n  id             String    @id @default(cuid())\n  code           String    @unique // The code users enter (e.g. WELCOME10)\n  type           String    @default("FIXED") // FIXED or PERCENTAGE\n  value          Int // Amount in cents or percentage (e.g. 10 for 10%)\n  minOrderAmount Int? // Minimum order amount in cents\n  maxDiscount    Int? // Max discount amount in cents (for percentage codes)\n  startDate      DateTime?\n  endDate        DateTime?\n  usageLimit     Int? // Max usage count overall\n  currentUsage   Int       @default(0)\n  isActive       Boolean   @default(true)\n  createdAt      DateTime  @default(now())\n  updatedAt      DateTime  @updatedAt\n  orders         Order[]\n\n  @@index([code])\n  @@index([isActive])\n}\n',
  inlineSchemaHash: '22fefd97c7877ac1988c2769625023a58979b49112d723c98df16945e25a1ff3',
  copyEngine: true,
};
config.dirname = '/';

config.runtimeDataModel = JSON.parse(
  '{"models":{"Account":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"provider","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"providerAccountId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"refresh_token","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"access_token","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"expires_at","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"token_type","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"scope","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"id_token","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"session_state","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"AccountToUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["provider","providerAccountId"]],"uniqueIndexes":[{"name":null,"fields":["provider","providerAccountId"]}],"isGenerated":false},"Session":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"sessionToken","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"expires","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"SessionToUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"VerificationToken":{"dbName":null,"fields":[{"name":"identifier","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"token","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"expires","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["identifier","token"]],"uniqueIndexes":[{"name":null,"fields":["identifier","token"]}],"isGenerated":false},"User":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"email","kind":"scalar","isList":false,"isRequired":false,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"emailVerified","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"image","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"passwordHash","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"phone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"additionalPhone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"role","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":"USER","isGenerated":false,"isUpdatedAt":false},{"name":"createdByAdminId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdByAdmin","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"UserCreatedByAdmin","relationFromFields":["createdByAdminId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"createdUsers","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"UserCreatedByAdmin","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdOrders","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Order","relationName":"OrderCreatedByAdmin","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"orders","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Order","relationName":"OrderUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"resetToken","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"resetTokenExpiry","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"verificationToken","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"verificationTokenExpiry","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"verificationCode","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"verificationCodeExpiry","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"address","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"governorate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"city","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"district","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"street","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"buildingNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"apartmentNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"landmark","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"birthDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"fatherName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"idNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"motherName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"nationality","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"wifeName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"wifeMotherName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"accounts","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Account","relationName":"AccountToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"auditLogs","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"AuditLog","relationName":"AuditLogToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"sessions","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Session","relationName":"SessionToUser","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"addedFormSerials","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FormSerial","relationName":"FormSerialAddedBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"consumedFormSerials","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FormSerial","relationName":"FormSerialConsumedBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"createdDependents","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Dependent","relationName":"DependentCreatedBy","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Category":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"slug","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"orderIndex","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"active","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"icon","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"services","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Service","relationName":"CategoryToService","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Service":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"slug","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"icon","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"active","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"categoryId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"orders","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Order","relationName":"OrderToService","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"category","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Category","relationName":"CategoryToService","relationFromFields":["categoryId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"documents","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServiceDocument","relationName":"ServiceToServiceDocument","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"variants","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServiceVariant","relationName":"ServiceToServiceVariant","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"fields","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServiceField","relationName":"ServiceToServiceField","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ServiceField":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"serviceId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"label","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"placeholder","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"required","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"orderIndex","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"active","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"showIf","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"validation","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"service","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Service","relationName":"ServiceToServiceField","relationFromFields":["serviceId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"options","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServiceFieldOption","relationName":"ServiceFieldToServiceFieldOption","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ServiceFieldOption":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"fieldId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"value","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"label","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"orderIndex","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"requiredDocs","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"showFields","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"field","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServiceField","relationName":"ServiceFieldToServiceFieldOption","relationFromFields":["fieldId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ServiceVariant":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"priceCents","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"etaDays","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"serviceId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"active","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"orders","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Order","relationName":"OrderToServiceVariant","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"service","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Service","relationName":"ServiceToServiceVariant","relationFromFields":["serviceId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"formTypeLinks","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FormTypeVariant","relationName":"FormTypeVariantToServiceVariant","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Order":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"serviceId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"variantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":"PENDING","isGenerated":false,"isUpdatedAt":false},{"name":"totalPrice","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"totalCents","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"customerName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"customerPhone","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"additionalPhone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"customerEmail","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"address","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"governorate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"city","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"district","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"street","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"buildingNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"apartmentNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"landmark","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"notes","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"adminNotes","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"completedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"estimatedCompletionDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"deliveryFee","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"deliveryType","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":"OFFICE","isGenerated":false,"isUpdatedAt":false},{"name":"createdByAdminId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdByAdmin","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"OrderCreatedByAdmin","relationFromFields":["createdByAdminId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"birthDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"fatherName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"idNumber","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"motherName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"nationality","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"wifeName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"photographyLocation","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"photographyDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"marriageDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"divorceDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"wifeMotherName","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"quantity","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":1,"isGenerated":false,"isUpdatedAt":false},{"name":"serviceDetails","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"otherFees","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"discount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"gender","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"policeStation","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"pickupLocation","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"originalDocuments","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"attachedDocuments","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"hasAttachments","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"selectedFines","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"finesDetails","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"servicesDetails","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"customerFollowUp","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"documents","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Document","relationName":"DocumentToOrder","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"service","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Service","relationName":"OrderToService","relationFromFields":["serviceId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"user","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"OrderUser","relationFromFields":["userId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"variant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServiceVariant","relationName":"OrderToServiceVariant","relationFromFields":["variantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"orderDocuments","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"OrderDocument","relationName":"OrderToOrderDocument","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"payment","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Payment","relationName":"OrderToPayment","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"formSerials","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FormSerial","relationName":"FormSerialToOrder","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"promoCodeId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"promoCode","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"PromoCode","relationName":"OrderToPromoCode","relationFromFields":["promoCodeId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"discountAmount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Payment":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"orderId","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"amount","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"currency","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":"EGP","isGenerated":false,"isUpdatedAt":false},{"name":"method","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"status","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":"PENDING","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"paymentScreenshot","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"senderPhone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"notes","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"order","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Order","relationName":"OrderToPayment","relationFromFields":["orderId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"AuditLog":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"userId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"action","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"entityType","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"entityId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"oldValues","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"newValues","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"ipAddress","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"userAgent","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"user","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"AuditLogToUser","relationFromFields":["userId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FAQ":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"question","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"answer","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"orderIndex","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"active","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"Document":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"orderId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"fileName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"filePath","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"fileType","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"fileSize","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"uploadedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"order","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Order","relationName":"DocumentToOrder","relationFromFields":["orderId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"OrderDocument":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"orderId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"fileName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"filePath","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"fileSize","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"fileType","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"documentType","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"uploadedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"order","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Order","relationName":"OrderToOrderDocument","relationFromFields":["orderId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"ServiceDocument":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"serviceId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"title","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"required","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"showIf","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"orderIndex","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"active","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"service","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Service","relationName":"ServiceToServiceDocument","relationFromFields":["serviceId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"SystemSettings":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":"main","isGenerated":false,"isUpdatedAt":false},{"name":"siteName","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":"البديل","isGenerated":false,"isUpdatedAt":false},{"name":"siteDescription","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"contactEmail","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"contactPhone","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"address","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"workingHours","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"socialLinks","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"seoSettings","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"FormType":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"description","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"active","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"variantLinks","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FormTypeVariant","relationName":"FormTypeToFormTypeVariant","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false},{"name":"serials","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FormSerial","relationName":"FormSerialToFormType","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false,"documentation":"Forms inventory (\\"العهدة\\")"},"FormTypeVariant":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"formTypeId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"serviceVariantId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"formType","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FormType","relationName":"FormTypeToFormTypeVariant","relationFromFields":["formTypeId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"serviceVariant","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"ServiceVariant","relationName":"FormTypeVariantToServiceVariant","relationFromFields":["serviceVariantId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["formTypeId","serviceVariantId"]],"uniqueIndexes":[{"name":null,"fields":["formTypeId","serviceVariantId"]}],"isGenerated":false},"FormSerial":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"formTypeId","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"serialNumber","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"orderId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"consumed","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":false,"isGenerated":false,"isUpdatedAt":false},{"name":"consumedAt","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"addedByAdminId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"consumedByAdminId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"formType","kind":"object","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"FormType","relationName":"FormSerialToFormType","relationFromFields":["formTypeId"],"relationToFields":["id"],"relationOnDelete":"Cascade","isGenerated":false,"isUpdatedAt":false},{"name":"order","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Order","relationName":"FormSerialToOrder","relationFromFields":["orderId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"addedByAdmin","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"FormSerialAddedBy","relationFromFields":["addedByAdminId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false},{"name":"consumedByAdmin","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"FormSerialConsumedBy","relationFromFields":["consumedByAdminId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[["formTypeId","serialNumber"]],"uniqueIndexes":[{"name":null,"fields":["formTypeId","serialNumber"]}],"isGenerated":false},"Dependent":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"name","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"createdByAdminId","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":true,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"createdByAdmin","kind":"object","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"User","relationName":"DependentCreatedBy","relationFromFields":["createdByAdminId"],"relationToFields":["id"],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false},"PromoCode":{"dbName":null,"fields":[{"name":"id","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":true,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":{"name":"cuid","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"code","kind":"scalar","isList":false,"isRequired":true,"isUnique":true,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"String","isGenerated":false,"isUpdatedAt":false},{"name":"type","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"String","default":"FIXED","isGenerated":false,"isUpdatedAt":false},{"name":"value","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"minOrderAmount","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"maxDiscount","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"startDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"endDate","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":false},{"name":"usageLimit","kind":"scalar","isList":false,"isRequired":false,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Int","isGenerated":false,"isUpdatedAt":false},{"name":"currentUsage","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Int","default":0,"isGenerated":false,"isUpdatedAt":false},{"name":"isActive","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"Boolean","default":true,"isGenerated":false,"isUpdatedAt":false},{"name":"createdAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":true,"type":"DateTime","default":{"name":"now","args":[]},"isGenerated":false,"isUpdatedAt":false},{"name":"updatedAt","kind":"scalar","isList":false,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"DateTime","isGenerated":false,"isUpdatedAt":true},{"name":"orders","kind":"object","isList":true,"isRequired":true,"isUnique":false,"isId":false,"isReadOnly":false,"hasDefaultValue":false,"type":"Order","relationName":"OrderToPromoCode","relationFromFields":[],"relationToFields":[],"isGenerated":false,"isUpdatedAt":false}],"primaryKey":null,"uniqueFields":[],"uniqueIndexes":[],"isGenerated":false}},"enums":{},"types":{}}'
);
defineDmmfProperty(exports.Prisma, config.runtimeDataModel);
config.engineWasm = undefined;

config.injectableEdgeEnv = () => ({
  parsed: {
    DATABASE_URL:
      (typeof globalThis !== 'undefined' && globalThis['DATABASE_URL']) ||
      (typeof process !== 'undefined' && process.env && process.env.DATABASE_URL) ||
      undefined,
  },
});

if (
  (typeof globalThis !== 'undefined' && globalThis['DEBUG']) ||
  (typeof process !== 'undefined' && process.env && process.env.DEBUG) ||
  undefined
) {
  Debug.enable(
    (typeof globalThis !== 'undefined' && globalThis['DEBUG']) ||
      (typeof process !== 'undefined' && process.env && process.env.DEBUG) ||
      undefined
  );
}

const PrismaClient = getPrismaClient(config);
exports.PrismaClient = PrismaClient;
Object.assign(exports, Prisma);
