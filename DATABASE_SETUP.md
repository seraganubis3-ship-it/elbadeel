# إعداد قاعدة البيانات - منصة الباديل

## نظرة عامة
تم توحيد قاعدة البيانات لاستخدام **PostgreSQL** فقط، وهو الخيار الأفضل للإنتاج والتطوير.

## المتطلبات
- Docker و Docker Compose مثبتان
- Node.js 18+ مثبت
- npm أو yarn مثبت

## خطوات الإعداد

### 1. تشغيل قاعدة البيانات
```bash
# تشغيل PostgreSQL و Redis
npm run docker:up

# أو مباشرة
docker-compose up -d
```

### 2. إنشاء ملف .env
انسخ محتوى `.env.example` إلى ملف `.env` جديد:
```bash
cp .env.example .env
```

ثم عدل المتغيرات حسب احتياجاتك:
```env
DATABASE_URL="postgresql://albadil_user:albadil_password_2024@localhost:5432/albadil_prod"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. إنشاء قاعدة البيانات
```bash
# إنشاء جداول قاعدة البيانات
npm run db:push

# أو استخدام المايجريشن
npm run db:migrate
```

### 4. إدخال البيانات الأولية
```bash
npm run db:seed
```

### 5. تشغيل التطبيق
```bash
npm run dev
```

## إدارة قاعدة البيانات

### الوصول إلى pgAdmin
- افتح المتصفح على: http://localhost:5050
- البريد الإلكتروني: admin@albadil.com
- كلمة المرور: admin123

### الوصول المباشر لقاعدة البيانات
```bash
docker exec -it albadil_postgres psql -U albadil_user -d albadil_prod
```

### أوامر مفيدة
```bash
# إيقاف قاعدة البيانات
npm run docker:down

# إعادة تشغيل
npm run docker:restart

# عرض السجلات
npm run docker:logs

# إعادة إنشاء قاعدة البيانات
docker-compose down -v
docker-compose up -d
npm run db:push
npm run db:seed
```

## هيكل قاعدة البيانات

### الجداول الرئيسية:
- **User**: المستخدمين (العملاء والموظفين)
- **Category**: فئات الخدمات
- **Service**: الخدمات المتاحة
- **ServiceVariant**: أنواع الخدمات والأسعار
- **Order**: الطلبات
- **Payment**: المدفوعات
- **Document**: المستندات المرفقة
- **FAQ**: الأسئلة الشائعة
- **SystemSettings**: إعدادات النظام

### المميزات:
- دعم كامل للغة العربية
- فهرسة محسنة للأداء
- نظام تدقيق شامل
- دعم الملفات المتعددة
- نظام صلاحيات متقدم

## استكشاف الأخطاء

### مشكلة الاتصال بقاعدة البيانات
```bash
# فحص حالة الحاويات
docker ps

# فحص سجلات PostgreSQL
docker logs albadil_postgres

# اختبار الاتصال
docker exec -it albadil_postgres pg_isready -U albadil_user -d albadil_prod
```

### مشكلة في Prisma
```bash
# إعادة إنشاء Prisma Client
npm run db:generate

# إعادة تطبيق المايجريشن
npm run db:migrate
```

## النسخ الاحتياطي

### إنشاء نسخة احتياطية
```bash
docker exec -t albadil_postgres pg_dump -c -U albadil_user albadil_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

### استعادة نسخة احتياطية
```bash
docker exec -i albadil_postgres psql -U albadil_user -d albadil_prod < backup_file.sql
```

## الأداء والتحسين

### إعدادات PostgreSQL المحسنة:
- `pg_stat_statements` لتتبع الأداء
- فهارس محسنة للبحث
- دعم البحث النصي العربي
- إدارة الذاكرة المحسنة

### نصائح للأداء:
- استخدم الفهارس المناسبة
- راقب استعلامات قاعدة البيانات
- استخدم Redis للتخزين المؤقت
- قم بعمل نسخ احتياطية منتظمة
