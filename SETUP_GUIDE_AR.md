# 📋 دليل الإعداد السريع - البنية التحتية

## ✅ الخطوات المطلوبة

### 1️⃣ تثبيت الـ Dependencies

افتح PowerShell **كمسؤول** واكتب:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

ثم في مجلد المشروع:

```bash
npm install
```

الـ packages الجديدة اللي هتتثبت:

- `bullmq` - نظام الطوابير
- `ioredis` - Redis client
- `@sentry/nextjs` - تتبع الأخطاء
- `pino` + `pino-pretty` - Logging
- `node-cron` - المهام الدورية

---

### 2️⃣ تثبيت Redis (بدون Docker)

#### طريقة 1: Memurai (Windows Redis)

1. حمل من: https://www.memurai.com/get-memurai
2. ثبت البرنامج
3. Redis هيشتغل تلقائياً على `localhost:6379`

#### طريقة 2: Upstash (Cloud - مجاني)

1. روح https://upstash.com
2. سجل حساب مجاني
3. اعمل Redis database
4. انسخ الـ connection URL
5. حطه في `.env`:

```env
REDIS_URL=rediss://default:xxxxx@xxxxx.upstash.io:6379
```

---

### 3️⃣ تحديث ملف `.env`

أضف هذه المتغيرات لملف `.env`:

```env
# ============================================
# Redis (مطلوب)
# ============================================
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# Queue Settings (اختياري - القيم الافتراضية كويسة)
# ============================================
QUEUE_CONCURRENCY=5
QUEUE_MAX_RETRIES=3

# ============================================
# Sentry (اختياري - للـ production)
# ============================================
SENTRY_DSN=
# اتركها فاضية لو مش عاوز Sentry دلوقتي

# ============================================
# SMTP Email (مطلوب للإشعارات)
# ============================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@albadel.com.eg

# ملحوظة: لو بتستخدم Gmail، لازم تعمل App Password من:
# https://myaccount.google.com/apppasswords

# ============================================
# Logging (اختياري)
# ============================================
LOG_LEVEL=info
# القيم المتاحة: trace, debug, info, warn, error, fatal
```

---

### 4️⃣ تفعيل Instrumentation في Next.js

افتح `next.config.js` وأضف:

```javascript
const nextConfig = {
  // ... الإعدادات الموجودة
  experimental: {
    instrumentationHook: true,
  },
};
```

---

### 5️⃣ شغل المشروع

```bash
npm run dev
```

هتشوف في الـ console:

```
🚀 Initializing application infrastructure...
✅ Redis connected
✅ Image upload worker started
✅ Email worker started
✅ WhatsApp worker started
🕐 Initializing cron jobs...
✅ 4 cron jobs initialized
✅ Infrastructure initialized successfully
```

---

## 🎯 الميزات الجديدة

### 1. Queue System (نظام الطوابير)

**قبل:**

- رفع الصور كان بيحصل synchronous
- لو الرفع فشل، الطلب كله يفشل
- المستخدم يستنى لحد ما الصورة تترفع

**بعد:**

- رفع الصور في الخلفية
- لو فشل، يعيد المحاولة 3 مرات
- المستخدم يكمل شغله فوراً
- تتبع حالة الـ job من API

**مثال استخدام:**

```typescript
import { addImageUploadJob } from '@/lib/queue/queues';

// بدل ما ترفع الصورة مباشرة:
const job = await addImageUploadJob({
  fileBuffer: buffer,
  fileName: 'image.jpg',
  folder: 'orders',
  orderId: '123',
});

// تتبع حالة الـ job:
// GET /api/queue/status?jobId=xxx&queue=image-upload
```

---

### 2. Rate Limiting (حماية من الهجمات)

**الحدود:**

- **صفحات تسجيل الدخول**: 5 طلبات / 15 دقيقة
- **Admin API**: 100 طلب / 15 دقيقة
- **Public API**: 300 طلب / 15 دقيقة
- **الصفحات العادية**: 60 طلب / دقيقة

**مثال الـ Response Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1707789600000
```

**لو تجاوز الحد:**

```json
{
  "error": "تجاوزت الحد المسموح من الطلبات",
  "retryAfter": 300
}
```

---

### 3. Background Jobs (مهام تلقائية)

| المهمة              | الوقت      | الوظيفة                      |
| ------------------- | ---------- | ---------------------------- |
| **File Cleanup**    | يومياً 2 ص | مسح الملفات المؤقتة القديمة  |
| **Database Backup** | يومياً 3 ص | نسخ احتياطي للقاعدة + رفع B2 |
| **Daily Reports**   | يومياً 8 ص | إرسال تقرير للأدمن بالإيميل  |
| **Health Check**    | كل 5 دقائق | فحص صحة القاعدة              |

**تشغيل يدوي:**

```typescript
import { triggerJob } from '@/lib/cron/scheduler';

await triggerJob('cleanup'); // تشغيل التنظيف
await triggerJob('backup'); // نسخة احتياطية
await triggerJob('reports'); // تقرير يومي
```

---

### 4. Enhanced Caching (تحسين الأداء)

**قبل:**

- Cache محلي في الـ server
- لو عندك أكثر من server، كل واحد له cache مختلف

**بعد:**

- Cache مركزي في Redis
- كل الـ servers تشوف نفس الـ cache
- Cache invalidation فوري

**مثال:**

```typescript
import { cacheAside, deleteCache } from '@/lib/cache/redis';

// Get with auto-cache
const services = await cacheAside(
  'services:all',
  async () => await prisma.service.findMany(),
  { ttl: 3600 } // 1 hour
);

// Invalidate when updated
await deleteCache('services:all');
```

---

### 5. Monitoring (المراقبة)

**Structured Logging:**

```typescript
import { log } from '@/lib/monitoring/logger';

log.info('Order created', { orderId: '123', userId: 'abc' });
log.error('Payment failed', new Error('...'));
log.warn('Low stock', { productId: '456' });
```

**Error Tracking (Sentry):**

- تتبع الأخطاء تلقائياً
- Performance monitoring
- User context
- Breadcrumbs

---

## 🔍 التحقق من التثبيت

### 1. فحص Redis

```bash
# لو مثبت Memurai:
redis-cli ping
# المفروض يرجع: PONG

# لو Upstash:
# شوف الـ console لما تشغل npm run dev
```

### 2. فحص Queue Status

افتح في المتصفح:

```
http://localhost:3000/api/queue/status?action=stats
```

المفروض تشوف:

```json
{
  "success": true,
  "queues": [
    {
      "queue": "image-upload",
      "stats": {
        "waiting": 0,
        "active": 0,
        "completed": 5,
        "failed": 0
      }
    }
  ]
}
```

### 3. فحص Rate Limiting

جرب تعمل 10 طلبات سريعة لأي API:

```bash
for i in {1..10}; do curl http://localhost:3000/api/services; done
```

المفروض تشوف headers:

```
X-RateLimit-Remaining: 290
```

---

## ⚠️ ملاحظات مهمة

### الأخطاء الحمراء في IDE

الأخطاء دي عادية **قبل** ما تعمل `npm install`:

- `Cannot find module 'ioredis'`
- `Cannot find module 'bullmq'`
- `Cannot find module '@sentry/nextjs'`

**الحل:** شغل `npm install` وهتختفي

### لو Redis مش شغال

التطبيق هيشتغل عادي لكن:

- ❌ Queue system معطل
- ❌ Rate limiting معطل
- ❌ Redis cache معطل
- ✅ Next.js cache شغال
- ✅ باقي التطبيق شغال 100%

### Production Deployment

لو هترفع على production:

1. **استخدم Cloud Redis** (Upstash مجاني)
2. **فعّل Sentry** للـ error tracking
3. **استخدم SMTP service** (SendGrid, Mailgun)
4. **شغل pg_dump** للـ backups

---

## 📊 الفرق قبل وبعد

| الميزة              | قبل          | بعد                 |
| ------------------- | ------------ | ------------------- |
| **رفع الصور**       | Synchronous  | Background Queue    |
| **Rate Limiting**   | In-memory    | Redis-based         |
| **Caching**         | Next.js only | Redis + Next.js     |
| **Background Jobs** | ❌           | ✅ Cron jobs        |
| **Monitoring**      | Console logs | Structured + Sentry |
| **Email**           | Direct send  | Queued              |
| **Backups**         | Manual       | Automated daily     |
| **Reports**         | Manual       | Automated daily     |

---

## 🆘 المشاكل الشائعة

### Redis connection failed

```bash
# تأكد إن Redis شغال:
redis-cli ping

# لو مش شغال (Memurai):
# Start > Services > Memurai > Start

# لو Upstash:
# تأكد من REDIS_URL في .env
```

### Workers not starting

- تأكد من `experimental.instrumentationHook: true` في `next.config.js`
- امسح `.next` folder: `rm -rf .next`
- شغل تاني: `npm run dev`

### Rate limiting not working

- تأكد Redis شغال
- تأكد من `src/middleware.ts` موجود
- شوف الـ console للأخطاء

---

## 📞 الدعم

لو عندك أي مشكلة:

1. شوف الـ console logs
2. تأكد Redis شغال: `redis-cli ping`
3. تأكد الـ environment variables صح
4. شوف `/api/queue/status` للـ queue status
