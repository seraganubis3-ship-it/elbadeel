# 📘 البديل للخدمات الحكومية - دوكمنتيشن المشروع الشاملة

## 📑 فهرس المحتويات

1. [نظرة عامة على المشروع](#نظرة-عامة)
2. [المعمارية التقنية](#المعمارية-التقنية)
3. [قاعدة البيانات](#قاعدة-البيانات)
4. [المميزات والوظائف](#المميزات-والوظائف)
5. [الـ APIs والـ Routes](#apis-routes)
6. [نظام المصادقة](#نظام-المصادقة)
7. [الدفع والكوبونات](#الدفع-والكوبونات)
8. [الشات بوت والذكاء الاصطناعي](#الشات-بوت)
9. [لوحة التحكم الإدارية](#لوحة-التحكم)
10. [البيئة والإعدادات](#البيئة-والإعدادات)
11. [النشر والتشغيل](#النشر-والتشغيل)
12. [استكشاف الأخطاء](#استكشاف-الأخطاء)

---

## 🎯 نظرة عامة على المشروع {#نظرة-عامة}

### الهدف

منصة إلكترونية متكاملة لتقديم الخدمات الحكومية المصرية (بطاقات الرقم القومي، جوازات السفر، شهادات الميلاد، رخص القيادة، إلخ) بطريقة سلسة وسريعة مع توصيل للمنزل أو المكتب.

### التكنولوجيا المستخدمة

**Frontend & Backend:**

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom Components مع Headless UI
- **Icons**: Heroicons و Custom SVGs

**Database & ORM:**

- **Database**: PostgreSQL (Production) / SQLite (Development)
- **ORM**: Prisma ORM
- **Migrations**: Handled by Prisma

**Authentication:**

- **Library**: NextAuth.js v5 (Auth.js)
- **Providers**:
  - Credentials (Email/Password)
  - Google OAuth
- **Session**: JWT-based
- **Password Hashing**: bcrypt

**AI & Chatbot:**

- **Provider**: Google Gemini AI (2.0 Flash / 1.5 Pro)
- **Library**: @google/genai
- **Features**: Context-aware responses, Service recommendations

**Payment:**

- **Provider**: Paymob (Egypt)
- **Methods**: Card, Mobile Wallet, Cash on Delivery

**File Upload:**

- **Storage**: Local filesystem (`/public/uploads`)
- **Processing**: Sharp (if needed - not currently implemented)

**Notifications:**

- **WhatsApp**: Planned via WhatsApp Business API
- **In-app**: Custom notification system

---

## 🏗️ المعمارية التقنية {#المعمارية-التقنية}

### هيكل المشروع

```
web/
├── prisma/                    # Database schema & migrations
│   ├── schema.prisma         # Data models
│   ├── migrations/           # Auto-generated migrations
│   └── seed-*.ts            # Seeding scripts
│
├── public/                   # Static assets
│   ├── images/              # Product images
│   ├── uploads/             # User uploaded files
│   └── icons/               # PWA icons
│
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (auth)/         # Auth routes (login, register)
│   │   ├── admin/          # Admin dashboard
│   │   ├── api/            # API routes
│   │   ├── checkout/       # Payment pages
│   │   ├── service/        # Service detail pages
│   │   └── user/           # User profile pages
│   │
│   ├── components/         # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   │
│   ├── lib/                # Utility libraries
│   │   ├── auth.ts        # Auth helpers
│   │   ├── prisma.ts      # Prisma client
│   │   ├── logger.ts      # Logging utility
│   │   └── ai-knowledge.ts # AI knowledge base
│   │
│   └── types/              # TypeScript type definitions
│
├── .env                    # Environment variables (local)
├── .env.example           # Template for env vars
├── next.config.js         # Next.js configuration
├── tailwind.config.ts     # Tailwind CSS config
└── tsconfig.json          # TypeScript config
```

### معمارية App Router

```
src/app/
├── page.tsx                    # الصفحة الرئيسية
├── layout.tsx                  # Layout رئيسي (Navbar, Footer)
│
├── (auth)/                     # Auth Group
│   ├── login/page.tsx
│   ├── register/page.tsx
│   └── layout.tsx             # Auth-specific layout
│
├── admin/                      # Admin Dashboard
│   ├── layout.tsx             # Admin sidebar + auth guard
│   ├── page.tsx               # Dashboard home
│   ├── orders/                # إدارة الطلبات
│   ├── services/              # إدارة الخدمات
│   ├── users/                 # إدارة المستخدمين
│   ├── promo-codes/          # أكواد الخصم
│   ├── create/                # إنشاء طلب جديد
│   └── analytics/             # التقارير
│
├── service/[slug]/            # صفحة تفاصيل الخدمة
│   └── page.tsx
│
├── checkout/                  # صفحات الدفع
│   ├── page.tsx              # Checkout form
│   └── success/              # Payment success
│
└── api/                       # API Routes
    ├── auth/[...nextauth]/   # NextAuth endpoints
    ├── orders/               # Order CRUD
    ├── admin/                # Admin APIs
    ├── ai/chat/              # Chatbot endpoint
    └── payments/             # Payment integration
```

---

## 🗄️ قاعدة البيانات {#قاعدة-البيانات}

### Schema Overview

#### **User** - المستخدمين

```prisma
model User {
  id                String    @id @default(cuid())
  name              String
  email             String?   @unique
  password          String?
  phone             String    @unique
  role              Role      @default(USER)

  // Personal Info
  birthDate         DateTime?
  fatherName        String?
  motherName        String?
  wifeName          String?
  idNumber          String?   @unique
  nationality       String?

  // Address
  address           String?
  governorate       String?
  city              String?
  district          String?
  street            String?
  buildingNumber    String?
  apartmentNumber   String?
  landmark          String?

  // Relations
  orders            Order[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

#### **Service** - الخدمات

```prisma
model Service {
  id          String            @id @default(cuid())
  name        String
  slug        String            @unique
  description String?
  category    ServiceCategory   @relation(fields: [categoryId], references: [id])
  categoryId  String

  // Features
  active      Boolean           @default(true)
  featured    Boolean           @default(false)

  // Relations
  variants    ServiceVariant[]
  documents   ServiceDocument[]
  fields      ServiceField[]    // Dynamic form fields
  orders      Order[]

  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
}
```

#### **ServiceVariant** - أنواع الخدمة (عادي/مستعجل)

```prisma
model ServiceVariant {
  id          String   @id @default(cuid())
  service     Service  @relation(fields: [serviceId], references: [id])
  serviceId   String

  name        String
  priceCents  Int      // السعر بالقروش
  etaDays     Int      // مدة التنفيذ بالأيام
  active      Boolean  @default(true)

  orders      Order[]
}
```

#### **Order** - الطلبات

```prisma
model Order {
  id                  String         @id @default(cuid())

  // Service Info
  service             Service        @relation(fields: [serviceId], references: [id])
  serviceId           String
  variant             ServiceVariant @relation(fields: [variantId], references: [id])
  variantId           String

  // User Info
  user                User?          @relation(fields: [userId], references: [id])
  userId              String?
  customerName        String
  customerPhone       String
  customerEmail       String?

  // Address
  address             String?
  governorate         String?
  city                String?
  deliveryType        String         @default("OFFICE")
  deliveryFee         Int            @default(0)

  // Pricing
  totalCents          Int
  discount            Int            @default(0)
  discountAmount      Int            @default(0)
  promoCode           PromoCode?     @relation(fields: [promoCodeId], references: [id])
  promoCodeId         String?

  // Status
  status              String         @default("PENDING")

  // Documents
  orderDocuments      OrderDocument[]

  // Admin
  createdByAdmin      User?          @relation("AdminCreatedOrders", fields: [createdByAdminId], references: [id])
  createdByAdminId    String?
  adminNotes          String?

  // Dynamic Fields (JSON)
  dynamicAnswers      Json?
  serviceDetails      String?

  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt
}
```

#### **Payment** - المدفوعات

```prisma
model Payment {
  id            String   @id @default(cuid())
  order         Order    @relation(fields: [orderId], references: [id])
  orderId       String

  amount        Int      // بالقروش
  method        String   // CARD, WALLET, CASH
  status        String   // PENDING, CONFIRMED, FAILED

  // Paymob Integration
  paymobOrderId String?
  transactionId String?

  senderPhone   String?
  notes         String?

  createdAt     DateTime @default(now())
}
```

#### **PromoCode** - أكواد الخصم

```prisma
model PromoCode {
  id              String    @id @default(cuid())
  code            String    @unique
  type            String    // FIXED or PERCENTAGE
  value           Int       // القيمة (قروش للـ FIXED أو % للـ PERCENTAGE)

  // Limits
  usageLimit      Int?
  currentUsage    Int       @default(0)
  minOrderAmount  Int?      // الحد الأدنى للطلب
  maxDiscount     Int?      // الحد الأقصى للخصم (للـ PERCENTAGE)

  // Dates
  startDate       DateTime?
  endDate         DateTime?
  isActive        Boolean   @default(true)

  // Relations
  orders          Order[]

  createdAt       DateTime  @default(now())
}
```

### Database Commands

```bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Seed database
npx prisma db seed

# Open Prisma Studio
npx prisma studio

# Reset database (CAUTION!)
npx prisma migrate reset
```

---

## ✨ المميزات والوظائف {#المميزات-والوظائف}

### 1. الصفحة الرئيسية

- **Hero Section** مع Call-to-Action
- **عرض الخدمات** بالتصنيفات
- **الأسعار والمميزات**
- **Footer** مع روابط التواصل

### 2. نظام الخدمات

#### إضافة/تعديل خدمة (Admin):

- اسم الخدمة والوصف
- التصنيف (Category)
- **Variants**: أنواع مختلفة (عادي، مستعجل، VIP)
- **Dynamic Fields**: أسئلة ديناميكية (Quiz) للعميل
- **Documents**: المستندات المطلوبة (مع إمكانية الربط بالإجابات)
- **حالة التفعيل** (active/inactive)

#### عرض الخدمة (User):

- معلومات تفصيلية
- اختيار النوع (Variant)
- ملء البيانات الديناميكية
- رفع المستندات
- إضافة للعربة أو طلب مباشر

### 3. نظام الطلبات

#### إنشاء طلب (User):

1. اختيار الخدمة والنوع
2. ملء البيانات الشخصية
3. اختيار طريقة التوصيل (مكتب/منزل)
4. رفع المستندات المطلوبة
5. اختيار طريقة الدفع
6. تأكيد الطلب

#### إدارة الطلبات (Admin):

- عرض كل الطلبات مع **فلترة متقدمة**:
  - البحث (اسم، رقم، خدمة)
  - الحالة (pending, confirmed, in_progress, completed, cancelled)
  - التاريخ (من/إلى)
  - نوع التوصيل
  - الخدمة
  - المصدر (مكتب/أونلاين)
- **تحديث الحالة** (فردي أو جماعي)
- **عرض التفاصيل** الكاملة للطلب
- **Pagination** (10 طلبات/صفحة)

#### حالات الطلب:

```typescript
PENDING; // جديد - في انتظار المراجعة
CONFIRMED; // تم التأكيد
PAYMENT_CONFIRMED; // تم الدفع
IN_PROGRESS; // جاري التنفيذ
READY; // جاهز للاستلام
COMPLETED; // تم التسليم
CANCELLED; // ملغي
PARTIAL_PAYMENT; // دفع جزئي
REFUNDED; // مسترد
```

### 4. نظام الدفع

#### طرق الدفع:

- **بطاقة ائتمان** (Paymob)
- **محفظة إلكترونية** (Paymob)
- **كاش عند الاستلام**

#### تدفق الدفع:

1. العميل يختار طريقة الدفع
2. إنشاء Payment Intent في Paymob
3. Redirect للـ Payment Gateway
4. Callback من Paymob
5. تحديث حالة الطلب

### 5. نظام الكوبونات

#### أنواع الخصم:

- **FIXED**: قيمة ثابتة (مثلاً 50 جنيه)
- **PERCENTAGE**: نسبة مئوية (مثلاً 10%)

#### قيود الكوبون:

- **usageLimit**: عدد مرات الاستخدام
- **minOrderAmount**: الحد الأدنى للطلب
- **maxDiscount**: الحد الأقصى للخصم (للنسبة المئوية)
- **startDate/endDate**: فترة الصلاحية

#### التحقق من الكوبون:

```typescript
POST /api/promo-codes/validate
Body: { code: "LAUNCH25", orderTotal: 50000 }

Response: {
  valid: true,
  discountAmount: 5000,
  newTotal: 45000
}
```

### 6. الشات بوت (AI)

#### المميزات:

- **Context-Aware**: يفهم سياق المحادثة
- **Service Recommendations**: يقترح الخدمات المناسبة
- **Order History**: يعرض طلبات المستخدم السابقة
- **Multi-Model Fallback**: يجرب نماذج AI مختلفة

#### كيف يعمل:

1. المستخدم يكتب سؤال
2. النظام يبني Context من:
   - Knowledge Base (معلومات الخدمات)
   - User Profile (إذا كان مسجل دخوله)
   - Conversation History
3. إرسال للـ Gemini AI
4. AI يرد بإجابة مخصصة

#### API:

```typescript
POST /api/ai/chat
Body: {
  message: "عايز أجدد البطاقة",
  userId: "...",
  isAuthenticated: true
}

Response: {
  success: true,
  response: "تمام! هل البطاقة منتهية ولا ضاعت؟...",
  source: "ai-v2"
}
```

### 7. لوحة التحكم الإدارية

#### الصفحات:

- **Dashboard**: إحصائيات (طلبات اليوم، الإيرادات، الحالات)
- **Orders**: إدارة الطلبات
- **Services**: إدارة الخدمات
- **Users**: عرض المستخدمين
- **Promo Codes**: إدارة الكوبونات
- **Create Order**: إنشاء طلب من المكتب
- **Analytics**: تقارير (قريباً)

#### الحماية:

- كل صفحات Admin محمية بـ `requireAuth()`
- فحص `role === "ADMIN"`
- Redirect للـ Login إذا غير مصرح

---

## 🔌 الـ APIs والـ Routes {#apis-routes}

### Public APIs

#### `GET /api/services`

عرض كل الخدمات النشطة

```typescript
Response: {
  services: [
    {
      id: "...",
      name: "تجديد بطاقة الرقم القومي",
      slug: "national-id-renewal",
      category: { name: "البطاقات" },
      variants: [...]
    }
  ]
}
```

#### `GET /api/services/[slug]`

تفاصيل خدمة معينة

```typescript
Response: {
  service: {
    id: "...",
    name: "...",
    description: "...",
    variants: [...],
    documents: [...],
    fields: [...]
  }
}
```

#### `POST /api/orders`

إنشاء طلب جديد (للمستخدمين)

```typescript
Body: {
  serviceId: "...",
  variantId: "...",
  customerName: "أحمد محمد",
  customerPhone: "01012345678",
  deliveryType: "HOME",
  address: "...",
  dynamicAnswers: { ... }
}

Response: {
  success: true,
  order: { ... }
}
```

#### `POST /api/promo-codes/validate`

التحقق من كود الخصم

```typescript
Body: { code: "LAUNCH25", orderTotal: 50000 }
Response: { valid: true, discountAmount: 5000, ... }
```

### Admin APIs

#### `GET /api/admin/orders`

جلب الطلبات مع الفلترة

```typescript
Query Params:
  - userId
  - createdByAdminId
  - from (DD/MM/YYYY)
  - to (DD/MM/YYYY)
  - serviceIds[]
  - createdByAdmin (true/false)
  - page
  - limit

Response: {
  success: true,
  orders: [...],
  pagination: { page, limit, total, totalPages }
}
```

#### `POST /api/admin/orders`

إنشاء طلب من المكتب

```typescript
Body: {
  serviceId, variantId,
  customerName, customerPhone,
  workDate: "DD/MM/YYYY",  // تاريخ العمل
  paidAmount, paymentMethod,
  ...
}
```

#### `PUT /api/admin/orders/[id]/status`

تحديث حالة طلب

```typescript
Body: {
  status: 'CONFIRMED';
}
Response: {
  success: true;
}
```

#### `PUT /api/admin/orders/bulk-status`

تحديث حالة عدة طلبات

```typescript
Body: {
  orderIds: ["id1", "id2", ...],
  status: "IN_PROGRESS"
}
```

#### `GET /api/admin/services`

جلب كل الخدمات (للإدارة)

#### `PUT /api/admin/services/[id]`

تحديث خدمة

```typescript
Body: {
  name, description, categoryId,
  variants: [...],
  documents: [...],
  fields: [...]
}
```

#### `GET /api/admin/promo-codes`

جلب الكوبونات

#### `POST /api/admin/promo-codes`

إنشاء كوبون جديد

#### `DELETE /api/admin/promo-codes/[id]`

حذف/إيقاف كوبون

### AI API

#### `POST /api/ai/chat`

إرسال رسالة للشات بوت

```typescript
Body: {
  message: "...",
  userId?: "...",
  isAuthenticated?: boolean,
  currentPath?: "/"
}

Response: {
  success: true,
  response: "...",
  source: "ai-v2"
}
```

---

## 🔐 نظام المصادقة {#نظام-المصادقة}

### NextAuth.js Configuration

الملف: `auth.config.ts`

```typescript
export const authConfig = {
  providers: [
    CredentialsProvider({
      async authorize(credentials) {
        // البحث عن المستخدم بالـ email/phone
        // التحقق من كلمة المرور بـ bcrypt
        // إرجاع user object
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      // إضافة البيانات للـ JWT
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      // نقل البيانات من JWT للـ session
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};
```

### Helper Functions

الملف: `src/lib/auth.ts`

```typescript
// التحقق من تسجيل الدخول
export async function requireAuth() {
  const session = await getServerSession(authConfig);
  if (!session) {
    redirect('/login');
  }
  return session;
}

// التحقق من صلاحية Admin
export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }
  return session;
}

// الحصول على تاريخ العمل
export function getWorkDate(session) {
  // للـ Admins يمكنهم تخصيص التاريخ
  // للـ Users يكون التاريخ الحالي
}
```

### استخدام في الصفحات

```typescript
// Server Component
export default async function AdminPage() {
  const session = await requireAuth();
  if (session.user.role !== 'ADMIN') redirect('/');

  // باقي الكود...
}

// API Route
export async function GET(request) {
  const session = await requireAuth();

  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // باقي الكود...
}
```

---

## 💳 الدفع والكوبونات {#الدفع-والكوبونات}

### تكامل Paymob

#### التهيئة:

```env
PAYMOB_API_KEY=your_key
PAYMOB_SECRET_KEY=your_secret
PAYMOB_INTEGRATION_ID_CARD=123456
PAYMOB_INTEGRATION_ID_WALLET=789012
```

#### تدفق الدفع:

1. **إنشاء Order في Paymob:**

```typescript
const paymobOrder = await fetch('https://accept.paymob.com/api/ecommerce/orders', {
  method: 'POST',
  body: JSON.stringify({
    auth_token: token,
    amount_cents: totalCents,
    currency: 'EGP',
    items: [...]
  })
});
```

2. **إنشاء Payment Key:**

```typescript
const paymentKey = await fetch('https://accept.paymob.com/api/acceptance/payment_keys', {
  method: 'POST',
  body: JSON.stringify({
    auth_token: token,
    amount_cents: totalCents,
    order_id: paymobOrder.id,
    billing_data: { ... },
    integration_id: INTEGRATION_ID
  })
});
```

3. **Redirect للـ iFrame:**

```typescript
window.location.href = `https://accept.paymob.com/api/acceptance/iframes/${IFRAME_ID}?payment_token=${paymentKey.token}`;
```

4. **Callback Handler:**

```typescript
POST / api / payments / callback;

// التحقق من HMAC signature
// تحديث حالة الطلب
// Redirect للـ success page
```

### منطق الكوبونات

```typescript
// التحقق من الكوبون
const promo = await prisma.promoCode.findUnique({ where: { code } });

if (!promo.isActive) throw new Error('غير فعال');
if (promo.endDate && new Date() > promo.endDate) throw new Error('منتهي');
if (promo.usageLimit && promo.currentUsage >= promo.usageLimit) throw new Error('تم الاستخدام');
if (promo.minOrderAmount && orderTotal < promo.minOrderAmount) throw new Error('الحد الأدنى...');

// حساب الخصم
let discount = 0;
if (promo.type === 'FIXED') {
  discount = promo.value;
} else {
  discount = Math.round((orderTotal * promo.value) / 100);
  if (promo.maxDiscount && discount > promo.maxDiscount) {
    discount = promo.maxDiscount;
  }
}

// تحديث الاستخدام
await prisma.promoCode.update({
  where: { id: promo.id },
  data: { currentUsage: { increment: 1 } },
});
```

---

## 🤖 الشات بوت والذكاء الاصطناعي {#الشات-بوت}

### معمارية AI Service

الملف: `src/app/api/ai/chat/route.ts`

```typescript
// Context Builder
class ContextBuilder {
  static async build(request) {
    const [businessData, userData] = await Promise.all([
      this.getBusinessData(), // الخدمات من DB
      this.getUserData(request), // بيانات المستخدم
    ]);

    return `
      SYSTEM PROMPT + PERSONALITY
      BUSINESS DATA (Services, Prices, Documents)
      USER DATA (Name, Orders)
      CONVERSATION HISTORY
    `;
  }

  static async getBusinessData() {
    const services = await prisma.service.findMany({
      include: { variants, documents, fields },
    });

    // تحويل لـ formatted text للـ AI
    return services
      .map(
        s => `
      SERVICE: ${s.name}
      SLUG: /service/${s.slug}
      VARIANTS: ...
      DOCUMENTS: ...
    `
      )
      .join('\n');
  }
}

// Gemini Service
class GeminiService {
  static async generate(prompt) {
    // Multi-model fallback
    for (const model of ['gemini-2.0-flash', 'gemini-1.5-pro']) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: { temperature: 0.7, maxOutputTokens: 2048 },
        });

        return response.text;
      } catch (e) {
        // Try next model
      }
    }
  }
}
```

### System Prompt

```
أنت **أحمد**، موظف خدمة عملاء في شركة "البديل للخدمات الحكومية".

التعليمات:
1. كن ودوداً ومصرياً في الأسلوب
2. اسأل أسئلة توضيحية قبل إعطاء التفاصيل
3. لا تعطي كل المعلومات مرة واحدة
4. استخدم روابط كاملة للخدمات
5. NEVER invent service slugs

مثال للتفاعل:
User: "عايز أجدد البطاقة"
Ahmed: "من عيوني! البطاقة منتهية ولا ضاعت منك؟"
```

### Session Management

```typescript
const sessionStore = new Map<string, UserSession>();

interface UserSession {
  history: string[]; // آخر 20 رسالة
  lastAccess: number;
}

// تحديث الـ history
ContextBuilder.updateHistory(request, userMsg, aiMsg);
```

---

## 📊 لوحة التحكم الإدارية {#لوحة-التحكم}

### الصفحات الرئيسية

#### 1. Dashboard (`/admin`)

- **إحصائيات اليوم**: عدد الطلبات، الإيرادات
- **Quick Stats**: حسب الحالة
- **Recent Orders**: آخر 5 طلبات

#### 2. Orders (`/admin/orders`)

- **Filters**:
  - Search bar (اسم، رقم، خدمة)
  - Status dropdown
  - Date range (من/إلى)
  - Service multi-select
  - Delivery type
  - Order source (مكتب/أونلاين)
- **Bulk Actions**: تحديث حالة عدة طلبات
- **Pagination**: 10 per page
- **Order Details Modal**

#### 3. Services (`/admin/services`)

- **List View**: كل الخدمات
- **Edit**: تعديل خدمة موجودة
- **Components**:
  - Basic Info (name, description, category)
  - Variants Manager
  - Documents Manager
  - Dynamic Fields (Quiz)

#### 4. Create Order (`/admin/create`)

- **Multi-Step Form**:
  1. Service Selection
  2. Customer Info
  3. Personal Details
  4. Documents Upload
  5. Payment & Notes
- **Features**:
  - Auto-complete للعملاء
  - Form serial validation
  - Work date override
  - Instant payment recording

#### 5. Promo Codes (`/admin/promo-codes`)

- **List**: كل الكوبونات
- **Create/Edit Modal**
- **Stats**: Usage count
- **Status**: Active/Inactive/Expired

### Custom Hooks

#### `useOrders`

```typescript
export function useOrders(showSuccess, showError) {
  const [orders, setOrders] = useState([]);
  const [filters, setFilters] = useState({ ... });

  // Fetch with filters
  const fetchOrders = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.dateFrom) params.set('from', filters.dateFrom);
    // ...

    const response = await fetch(`/api/admin/orders?${params}`);
    setOrders(response.orders);
  }, [filters]);

  // Update status
  const updateOrderStatus = async (orderId, status) => {
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });

    fetchOrders();
    showSuccess("تم التحديث!");
  };

  return { orders, filters, updateOrderStatus, ... };
}
```

#### `useCreateOrder`

```typescript
export function useCreateOrder() {
  const [formData, setFormData] = useState({ ... });
  const [selectedService, setSelectedService] = useState(null);

  // Calculate total
  const calculateTotal = () => {
    let total = selectedVariant.priceCents;
    total += deliveryFee;
    total -= discount;
    total -= promoDiscount;
    return Math.max(0, total);
  };

  // Submit order
  const handleSubmit = async () => {
    const response = await fetch('/api/admin/orders', {
      method: 'POST',
      body: JSON.stringify({ ...formData })
    });

    if (response.ok) {
      showSuccess("تم إنشاء الطلب!");
      router.push('/admin/orders');
    }
  };

  return { formData, setFormData, handleSubmit, ... };
}
```

---

## ⚙️ البيئة والإعدادات {#البيئة-والإعدادات}

### ملف `.env`

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ofa_db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Google AI
GOOGLE_API_KEY="your-gemini-api-key"

# Paymob
PAYMOB_API_KEY="your-paymob-key"
PAYMOB_SECRET_KEY="your-paymob-secret"
PAYMOB_INTEGRATION_ID_CARD="123456"
PAYMOB_INTEGRATION_ID_WALLET="789012"
PAYMOB_IFRAME_ID="12345"

# WhatsApp (Optional)
WHATSAPP_API_TOKEN="your-whatsapp-token"
WHATSAPP_PHONE_NUMBER_ID="your-phone-id"

# App Settings
NODE_ENV="development"
```

### ملف `next.config.js`

```javascript
const nextConfig = {
  images: {
    domains: ['localhost', 'your-domain.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  experimental: {
    serverActions: true,
  },
};
```

### ملف `tailwind.config.ts`

```typescript
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...}
      },
      fontFamily: {
        cairo: ['Cairo', 'sans-serif']
      }
    }
  }
};
```

---

## 🚀 النشر والتشغيل {#النشر-والتشغيل}

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 3. Run dev server
npm run dev

# 4. Open browser
# http://localhost:3000
```

### Production Build

```bash
# 1. Build
npm run build

# 2. Start production server
npm start
```

### Docker Deployment (Optional)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
# Build image
docker build -t ofa-web .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  ofa-web
```

### Vercel Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Add environment variables in Vercel Dashboard
# 4. Prisma: Add postbuild script

# package.json
{
  "scripts": {
    "postbuild": "prisma generate"
  }
}
```

### Database Migration (Production)

```bash
# Apply migrations
npx prisma migrate deploy

# OR reset (CAUTION!)
npx prisma migrate reset --force
```

---

## 🔧 استكشاف الأخطاء {#استكشاف-الأخطاء}

### مشاكل شائعة وحلولها

#### 1. Build Errors

**خطأ:** `Type error: Object is possibly 'undefined'`

```typescript
// ❌ Wrong
const newV = [...variants];
newV[i].name = value;

// ✅ Correct
setVariants(prev => prev.map((v, idx) => (idx === i ? { ...v, name: value } : v)));
```

**خطأ:** `Module not found: Can't resolve '@/...'`

```bash
# حل: تأكد من tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

#### 2. Database Issues

**خطأ:** `Prisma Client initialization error`

```bash
# حل
npx prisma generate
npm run dev
```

**خطأ:** `Migration failed`

```bash
# حل: Reset في Development
npx prisma migrate reset

# Production: Fix manually or rollback
```

#### 3. Authentication Errors

**خطأ:** `Invalid session`

```typescript
// تأكد من:
1. NEXTAUTH_SECRET موجود في .env
2. NEXTAUTH_URL صحيح
3. Cookies enabled في المتصفح
```

**خطأ:** `Credentials signin error`

```typescript
// تحقق من:
1. البريد/الهاتف صحيح
2. bcrypt.compare يعمل
3. User موجود في DB
```

#### 4. AI Chatbot Issues

**خطأ:** `All AI models failed`

```typescript
// أسباب محتملة:
1. GOOGLE_API_KEY غير صحيح
2. Quota exceeded
3. Network issue

// حل
- تحقق من API Key
- جرب model واحد أولاً
```

#### 5. Payment Issues

**خطأ:** `Paymob authentication failed`

```bash
# تحقق من:
1. PAYMOB_API_KEY
2. PAYMOB_SECRET_KEY
3. Network connection
```

**خطأ:** `HMAC verification failed`

```typescript
// تأكد من:
1. Secret key صحيح
2. Callback URL مناسب
3. Request body كامل
```

### Logging & Debugging

```typescript
// استخدم logger بدلاً من console
import { logger } from '@/lib/logger';

logger.info('User logged in', { userId: user.id });
logger.error('Payment failed', error);
logger.warn('Low stock', { productId });
```

### Performance Optimization

```typescript
// 1. Database Queries
// ❌ N+1 Problem
for (const order of orders) {
  const service = await prisma.service.findUnique({
    where: { id: order.serviceId }
  });
}

// ✅ Include relation
const orders = await prisma.order.findMany({
  include: { service: true }
});

// 2. Image Optimization
// ✅ Use Next.js Image
import Image from 'next/image';

<Image
  src="/image.jpg"
  width={500}
  height={300}
  alt="..."
/>
```

---

## 📝 ملاحظات نهائية

### Security Best Practices

1. ✅ استخدم Environment Variables للمفاتيح السرية
2. ✅ Hash كلمات المرور بـ bcrypt
3. ✅ Validate كل الـ inputs
4. ✅ استخدم HTTPS في Production
5. ✅ Rate limiting للـ APIs
6. ✅ CSRF protection (NextAuth handles this)

### Code Quality

1. ✅ TypeScript strict mode
2. ✅ ESLint + Prettier
3. ✅ Consistent naming conventions
4. ✅ Error handling في كل API
5. ✅ Logging للأحداث المهمة
