# وثائق برنامج Windows - منصة الباديل لإدارة الطلبات

## نظرة عامة على النظام

منصة الباديل هي نظام متكامل لإدارة طلبات استخراج الأوراق الرسمية في مصر. النظام مبني على Next.js مع قاعدة بيانات PostgreSQL ويحتوي على لوحة تحكم إدارية شاملة.

## معلومات قاعدة البيانات

### إعدادات الاتصال
```env
# إعدادات قاعدة البيانات
DATABASE_URL="postgresql://albadil_user:albadil_password_2024@localhost:5432/albadil_prod"
HOST=localhost
PORT=5432
DATABASE_NAME=albadil_prod
USERNAME=albadil_user
PASSWORD=albadil_password_2024
```

### الجداول الرئيسية

#### 1. جدول المستخدمين (User)
```sql
CREATE TABLE "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE,
  "emailVerified" TIMESTAMP,
  "image" TEXT,
  "passwordHash" TEXT,
  "phone" TEXT,
  "role" TEXT DEFAULT 'USER',
  "resetToken" TEXT,
  "resetTokenExpiry" TIMESTAMP,
  "verificationToken" TEXT,
  "verificationTokenExpiry" TIMESTAMP,
  "verificationCode" TEXT,
  "verificationCodeExpiry" TIMESTAMP,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

**الأدوار المتاحة:**
- `ADMIN`: مدير النظام (صلاحيات كاملة)
- `STAFF`: موظف (إدارة الطلبات والخدمات)
- `VIEWER`: مشاهد (عرض التقارير فقط)
- `USER`: مستخدم عادي

#### 2. جدول الطلبات (Order)
```sql
CREATE TABLE "Order" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "serviceId" TEXT,
  "variantId" TEXT,
  "status" TEXT DEFAULT 'PENDING',
  "totalPrice" INTEGER,
  "totalCents" INTEGER,
  "customerName" TEXT,
  "customerPhone" TEXT,
  "customerEmail" TEXT,
  "address" TEXT,
  "notes" TEXT,
  "adminNotes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "completedAt" TIMESTAMP,
  "deliveryFee" INTEGER DEFAULT 0,
  "deliveryType" TEXT DEFAULT 'OFFICE'
);
```

**حالات الطلبات:**
- `PENDING`: في انتظار الدفع
- `PAYMENT_PENDING`: في انتظار تأكيد الدفع
- `REVIEWING`: قيد المراجعة
- `PROCESSING`: قيد التنفيذ
- `COMPLETED`: مكتمل
- `CANCELLED`: ملغي

#### 3. جدول الخدمات (Service)
```sql
CREATE TABLE "Service" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "slug" TEXT UNIQUE,
  "description" TEXT,
  "icon" TEXT,
  "active" BOOLEAN DEFAULT true,
  "categoryId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

#### 4. جدول أنواع الخدمات (ServiceVariant)
```sql
CREATE TABLE "ServiceVariant" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "priceCents" INTEGER,
  "etaDays" INTEGER,
  "serviceId" TEXT,
  "active" BOOLEAN DEFAULT true,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

#### 5. جدول المدفوعات (Payment)
```sql
CREATE TABLE "Payment" (
  "id" TEXT PRIMARY KEY,
  "orderId" TEXT UNIQUE,
  "amount" INTEGER,
  "currency" TEXT DEFAULT 'EGP',
  "method" TEXT,
  "status" TEXT DEFAULT 'PENDING',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  "paymentScreenshot" TEXT,
  "senderPhone" TEXT,
  "notes" TEXT
);
```

#### 6. جدول سجل التدقيق (AuditLog)
```sql
CREATE TABLE "AuditLog" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT,
  "action" TEXT,
  "entityType" TEXT,
  "entityId" TEXT,
  "oldValues" TEXT,
  "newValues" TEXT,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW()
);
```

## نظام المصادقة والأذونات

### معلومات تسجيل الدخول الافتراضية
```env
# حساب المدير الافتراضي
ADMIN_EMAIL=admin@albadil.com
ADMIN_PASSWORD=admin123456
ADMIN_ROLE=ADMIN
```

### نظام الأذونات
```typescript
const roleToPermissions = {
  ADMIN: [
    "users:read", "users:write",
    "orders:read", "orders:write", 
    "services:read", "services:write",
    "reports:read"
  ],
  STAFF: [
    "users:read",
    "orders:read", "orders:write",
    "services:read",
    "reports:read"
  ],
  VIEWER: [
    "orders:read",
    "services:read", 
    "reports:read"
  ],
  USER: []
};
```

## ميزات لوحة التحكم

### 1. لوحة التحكم الرئيسية
- **الرابط:** `/admin`
- **الوصف:** عرض إحصائيات سريعة وروابط للوحدات المختلفة
- **الميزات:**
  - إحصائيات الطلبات (إجمالي، مكتمل، معلق)
  - إحصائيات المبيعات
  - عدد المستخدمين النشطين
  - روابط سريعة لجميع الوحدات

### 2. إدارة الطلبات
- **الرابط:** `/admin/orders`
- **الميزات:**
  - عرض جميع الطلبات مع الفلترة والبحث
  - تحديث حالة الطلبات
  - إضافة ملاحظات إدارية
  - عرض تفاصيل الطلبات والدفعات
  - إدارة المرفقات والوثائق
  - فلترة حسب الحالة ونوع التوصيل
  - ترتيب حسب التاريخ أو السعر أو العميل

### 3. إدارة المستخدمين
- **الرابط:** `/admin/users`
- **الميزات:**
  - عرض جميع المستخدمين مع البحث والفلترة
  - تغيير أدوار المستخدمين
  - تفعيل/إلغاء تفعيل الحسابات
  - عرض تفاصيل المستخدمين
  - حذف المستخدمين
  - إحصائيات المستخدمين حسب الدور

### 4. إدارة الخدمات
- **الرابط:** `/admin/services`
- **الميزات:**
  - إضافة وتعديل الخدمات
  - إدارة أنواع الخدمات والأسعار
  - إدارة الفئات
  - تحديد الوثائق المطلوبة لكل خدمة

### 5. التقارير والإحصائيات
- **الرابط:** `/admin/reports`
- **الميزات:**
  - تقارير المبيعات اليومية والشهرية
  - إحصائيات الطلبات حسب الحالة
  - رسوم بيانية للإيرادات والطلبات
  - مقارنة الأداء مع الفترات السابقة
  - تصدير التقارير

### 6. إعدادات النظام
- **الرابط:** `/admin/settings`
- **الميزات:**
  - إعدادات الموقع العامة
  - معلومات الاتصال
  - ساعات العمل
  - الروابط الاجتماعية
  - إعدادات SEO

## API Endpoints

### 1. إدارة الطلبات
```typescript
// جلب جميع الطلبات
GET /api/admin/orders
Headers: { Authorization: "Bearer <token>" }

// جلب طلب محدد
GET /api/admin/orders/[id]

// تحديث حالة الطلب
PUT /api/admin/orders/[id]/status
Body: {
  status: "pending" | "payment_pending" | "reviewing" | "processing" | "completed" | "cancelled",
  adminNotes?: string
}

// حذف طلب
DELETE /api/admin/orders/[id]
```

### 2. إدارة المستخدمين
```typescript
// جلب المستخدمين
GET /api/admin/users?q=search&role=ADMIN&page=1&pageSize=10

// تحديث دور المستخدم
POST /api/admin/users/[id]/role
Body: { role: "ADMIN" | "STAFF" | "VIEWER" | "USER" }

// تحديث حالة المستخدم
POST /api/admin/users/[id]/status
Body: { isActive: boolean }

// حذف مستخدم
DELETE /api/admin/users/[id]
```

### 3. التقارير
```typescript
// جلب التقارير
GET /api/admin/reports?period=30d
// الفترات المتاحة: 7d, 30d, 90d, this-month, last-month, all
```

## متطلبات النظام

### متطلبات الخادم
- **Node.js:** >= 18.0.0
- **PostgreSQL:** >= 13.0
- **RAM:** 4GB كحد أدنى
- **Storage:** 10GB مساحة فارغة

### متطلبات قاعدة البيانات
```sql
-- إنشاء قاعدة البيانات
CREATE DATABASE albadil_prod;

-- إنشاء المستخدم
CREATE USER albadil_user WITH PASSWORD 'albadil_password_2024';

-- منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE albadil_prod TO albadil_user;
```

## إعدادات البيئة

### ملف .env
```env
# Database Configuration
DATABASE_URL="postgresql://albadil_user:albadil_password_2024@localhost:5432/albadil_prod"

# NextAuth Configuration
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"

# Environment
NODE_ENV="production"

# Cron Job Configuration
CRON_API_KEY=your-secret-cron-api-key-here
```

## هيكل الملفات

```
src/
├── app/
│   ├── admin/                 # لوحة التحكم الإدارية
│   │   ├── page.tsx          # الصفحة الرئيسية
│   │   ├── orders/           # إدارة الطلبات
│   │   ├── users/            # إدارة المستخدمين
│   │   ├── services/         # إدارة الخدمات
│   │   ├── reports/          # التقارير
│   │   └── settings/         # الإعدادات
│   └── api/
│       └── admin/            # API endpoints للإدارة
├── components/               # المكونات المشتركة
├── lib/                     # المكتبات والمساعدات
│   ├── auth.ts              # إعدادات المصادقة
│   ├── prisma.ts            # اتصال قاعدة البيانات
│   └── permissions.ts       # نظام الأذونات
└── types/                   # تعريفات TypeScript
```

## الميزات المتقدمة

### 1. نظام الإشعارات
- إشعارات فورية لتحديث حالة الطلبات
- تنبيهات للمدفوعات الجديدة
- إشعارات انتهاء صلاحية الطلبات

### 2. نظام النسخ الاحتياطي
- نسخ احتياطية تلقائية يومية
- استعادة البيانات من النسخ الاحتياطية
- تصدير البيانات بصيغة JSON/CSV

### 3. نظام السجلات
- تسجيل جميع العمليات الإدارية
- تتبع تغييرات البيانات
- سجل تسجيل الدخول والخروج

### 4. نظام الأمان
- تشفير كلمات المرور
- حماية من SQL Injection
- التحقق من صحة البيانات
- حماية CSRF

## دليل الاستخدام

### 1. تسجيل الدخول
1. افتح المتصفح وانتقل إلى `/admin`
2. أدخل البريد الإلكتروني وكلمة المرور
3. اضغط على "تسجيل الدخول"

### 2. إدارة الطلبات
1. من لوحة التحكم، اضغط على "إدارة الطلبات"
2. استخدم الفلاتر للبحث عن طلبات محددة
3. اضغط على "عرض التفاصيل" لرؤية تفاصيل الطلب
4. غيّر حالة الطلب من القائمة المنسدلة
5. أضف ملاحظات إدارية إذا لزم الأمر

### 3. إدارة المستخدمين
1. من لوحة التحكم، اضغط على "إدارة المستخدمين"
2. استخدم البحث للعثور على مستخدم محدد
3. غيّر دور المستخدم من القائمة المنسدلة
4. فعّل أو ألغ تفعيل الحساب حسب الحاجة

### 4. عرض التقارير
1. من لوحة التحكم، اضغط على "التقارير"
2. اختر الفترة الزمنية المطلوبة
3. راجع الإحصائيات والرسوم البيانية
4. قم بتصدير التقرير إذا لزم الأمر

## استكشاف الأخطاء

### مشاكل شائعة وحلولها

#### 1. خطأ في الاتصال بقاعدة البيانات
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**الحل:**
- تأكد من تشغيل PostgreSQL
- تحقق من صحة بيانات الاتصال في ملف .env
- تأكد من أن المنفذ 5432 مفتوح

#### 2. خطأ في المصادقة
```
Error: Invalid credentials
```
**الحل:**
- تحقق من صحة البريد الإلكتروني وكلمة المرور
- تأكد من أن المستخدم له دور ADMIN
- تحقق من إعدادات NEXTAUTH_SECRET

#### 3. خطأ في الصلاحيات
```
Error: Unauthorized access
```
**الحل:**
- تأكد من أن المستخدم له الصلاحيات المطلوبة
- تحقق من دور المستخدم في قاعدة البيانات
- راجع إعدادات الأذونات

## الدعم الفني

### معلومات الاتصال
- **البريد الإلكتروني:** support@albadil.com
- **الهاتف:** +20 123 456 7890
- **ساعات العمل:** 9:00 ص - 6:00 م (بتوقيت القاهرة)

### الموارد الإضافية
- **دليل المطور:** `/docs/developer-guide.md`
- **API Documentation:** `/docs/api-reference.md`
- **Video Tutorials:** `/docs/tutorials/`

---

**ملاحظة:** هذا الدليل مخصص لإنشاء برنامج Windows يعمل كعميل لخادم الويب. يجب على المطور إنشاء واجهة مستخدم Windows (WPF أو WinUI) تتصل بـ API endpoints المذكورة أعلاه.
