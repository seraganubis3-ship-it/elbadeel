# 🚀 دليل نشر منصة الباديل للإنتاج

## 📋 المتطلبات الأساسية

### الخادم (Server):
- **OS**: Ubuntu 20.04 LTS أو أحدث
- **RAM**: 2GB على الأقل (4GB موصى به)
- **Storage**: 20GB على الأقل
- **Domain**: نطاق مفعل (مثل: albadil.com)

### البرامج المطلوبة:
- Docker & Docker Compose
- Node.js 18+ 
- Nginx
- Certbot (Let's Encrypt)

## 🗄️ إعداد قاعدة البيانات PostgreSQL

### 1. تشغيل قاعدة البيانات:
```bash
# تشغيل الخدمات
npm run docker:up

# التحقق من حالة الخدمات
npm run docker:logs

# الوصول لـ pgAdmin
# http://your-server-ip:5050
# Email: admin@albadil.com
# Password: admin123
```

### 2. إعداد قاعدة البيانات:
```bash
# إنشاء Prisma Client
npm run db:generate

# تطبيق Schema على قاعدة البيانات
npm run db:push

# إدخال البيانات الأولية
npm run db:seed
```

### 3. إعداد متغيرات البيئة:
```bash
# نسخ ملف البيئة
cp .env.example .env.production

# تعديل المتغيرات
nano .env.production
```

**محتوى ملف .env.production:**
```env
# Database
DATABASE_URL="postgresql://albadil_user:albadil_password_2024@localhost:5432/albadil_prod"

# NextAuth
NEXTAUTH_URL="https://albadil.com"
NEXTAUTH_SECRET="your-production-secret-key-here"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

## 🔒 إعداد SSL

### 1. تشغيل سكريبت SSL:
```bash
# جعل السكريبت قابل للتنفيذ
chmod +x setup-ssl.sh

# تشغيل السكريبت
sudo ./setup-ssl.sh
```

### 2. التحقق من SSL:
```bash
# اختبار الشهادة
sudo certbot certificates

# اختبار الموقع
curl -I https://albadil.com
```

## 🚀 نشر التطبيق

### 1. بناء التطبيق:
```bash
# تثبيت التبعيات
npm install

# بناء التطبيق
npm run build
```

### 2. تشغيل التطبيق:
```bash
# تشغيل في الخلفية
npm run start

# أو استخدام PM2
npm install -g pm2
pm2 start npm --name "albadil" -- start
pm2 startup
pm2 save
```

### 3. إعداد Nginx:
```bash
# نسخ ملف التكوين
sudo cp nginx.conf /etc/nginx/sites-available/albadil

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/albadil /etc/nginx/sites-enabled/

# اختبار التكوين
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

## 📊 مراقبة الأداء

### 1. مراقبة قاعدة البيانات:
```bash
# عرض الإحصائيات
docker exec albadil_postgres psql -U albadil_user -d albadil_prod -c "SELECT * FROM pg_stat_database;"

# عرض الجداول الكبيرة
docker exec albadil_postgres psql -U albadil_user -d albadil_prod -c "
SELECT schemaname, tablename, attname, n_distinct, correlation 
FROM pg_stats 
WHERE schemaname = 'public' 
ORDER BY n_distinct DESC;"
```

### 2. مراقبة التطبيق:
```bash
# عرض السجلات
pm2 logs albadil

# عرض الإحصائيات
pm2 monit

# عرض حالة الخدمات
pm2 status
```

### 3. مراقبة الخادم:
```bash
# استخدام الموارد
htop

# مساحة القرص
df -h

# الذاكرة
free -h
```

## 🔧 الصيانة

### 1. نسخ احتياطي لقاعدة البيانات:
```bash
# إنشاء نسخة احتياطية
docker exec albadil_postgres pg_dump -U albadil_user albadil_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# استعادة نسخة احتياطية
docker exec -i albadil_postgres psql -U albadil_user -d albadil_prod < backup_file.sql
```

### 2. تحديث التطبيق:
```bash
# سحب التحديثات
git pull origin main

# تثبيت التبعيات الجديدة
npm install

# إعادة بناء التطبيق
npm run build

# إعادة تشغيل التطبيق
pm2 restart albadil
```

### 3. تجديد شهادة SSL:
```bash
# تجديد تلقائي (يتم كل 60 يوم)
sudo certbot renew

# تجديد يدوي
sudo certbot renew --force-renewal
```

## 🚨 استكشاف الأخطاء

### مشاكل شائعة:

#### 1. قاعدة البيانات لا تعمل:
```bash
# التحقق من حالة Docker
docker ps

# عرض سجلات PostgreSQL
docker logs albadil_postgres

# إعادة تشغيل الخدمة
docker restart albadil_postgres
```

#### 2. SSL لا يعمل:
```bash
# التحقق من الشهادة
sudo certbot certificates

# اختبار Nginx
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

#### 3. التطبيق لا يعمل:
```bash
# عرض السجلات
pm2 logs albadil

# إعادة تشغيل التطبيق
pm2 restart albadil

# التحقق من المنفذ
netstat -tlnp | grep :3000
```

## 📈 تحسين الأداء

### 1. تحسين قاعدة البيانات:
```sql
-- إنشاء indexes إضافية
CREATE INDEX CONCURRENTLY idx_orders_user_status ON "Order" ("userId", status);
CREATE INDEX CONCURRENTLY idx_services_category_active ON "Service" ("categoryId", active);

-- تحليل الإحصائيات
ANALYZE;
```

### 2. تحسين Nginx:
```bash
# تفعيل Gzip
# (مفعل بالفعل في nginx.conf)

# تفعيل HTTP/2
# (مفعل بالفعل في nginx.conf)

# إعداد Cache
# (مفعل بالفعل في nginx.conf)
```

### 3. تحسين Node.js:
```bash
# إعداد متغيرات البيئة
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=2048"

# استخدام PM2 cluster mode
pm2 start npm --name "albadil" -- start -i max
```

## 🔐 الأمان

### 1. جدار الحماية:
```bash
# عرض القواعد
sudo ufw status

# إضافة قواعد إضافية
sudo ufw allow from your-ip-address
sudo ufw deny 22  # منع SSH من IP معين
```

### 2. تحديث النظام:
```bash
# تحديث أسبوعي
sudo apt update && sudo apt upgrade -y

# إعادة تشغيل تلقائي للأمان
sudo apt install unattended-upgrades
```

### 3. مراقبة الأمان:
```bash
# فحص الملفات المشبوهة
sudo find /var/www -type f -exec grep -l "eval(" {} \;

# مراقبة السجلات
sudo tail -f /var/log/nginx/access.log | grep -E "(404|500|403)"
```

## 📞 الدعم

### معلومات الاتصال:
- **Email**: admin@albadil.com
- **Phone**: +20 10 2160 6893
- **Working Hours**: الأحد - الخميس: 9:00 ص - 6:00 م

### روابط مفيدة:
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/docs/)

---

**ملاحظة**: تأكد من اختبار كل خطوة قبل الانتقال للخطوة التالية. في حالة وجود أي مشاكل، راجع السجلات ووثائق البرامج المستخدمة.
