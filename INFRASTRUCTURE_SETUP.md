# Infrastructure Setup Guide

## Prerequisites

Before running the application with the new infrastructure, you need:

1. **Redis Server** (Required)
2. **PostgreSQL** (Already configured)
3. **Node.js 18+** (Already installed)

---

## Step 1: Install Dependencies

Run the following command in PowerShell **as Administrator**:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then install dependencies:

```bash
npm install bullmq ioredis @sentry/nextjs pino pino-pretty node-cron @types/node-cron
```

---

## Step 2: Install and Start Redis

### Option A: Using Docker (Recommended)

```bash
docker run -d --name redis -p 6379:6379 redis:alpine
```

### Option B: Using Windows Installer

1. Download Redis from: https://github.com/microsoftarchive/redis/releases
2. Install and start Redis service
3. Verify: `redis-cli ping` (should return `PONG`)

### Option C: Using Cloud Redis (Upstash)

1. Sign up at https://upstash.com
2. Create a Redis database
3. Copy the connection URL to `.env`

---

## Step 3: Configure Environment Variables

Copy `.env.example` to `.env` and fill in the values:

```bash
# Redis (Required)
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Sentry (Optional but recommended for production)
SENTRY_DSN=your-sentry-dsn

# SMTP (Required for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@albadel.com.eg
```

---

## Step 4: Enable Next.js Instrumentation

Add to `next.config.js`:

```javascript
const nextConfig = {
  // ... existing config
  experimental: {
    instrumentationHook: true,
  },
};
```

---

## Step 5: Start the Application

```bash
npm run dev
```

The infrastructure will automatically:

- ✅ Connect to Redis
- ✅ Start queue workers
- ✅ Initialize cron jobs
- ✅ Enable rate limiting
- ✅ Start monitoring

---

## Verification

### Check Queue Status

Visit: `http://localhost:3000/api/queue/status?action=stats`

### Check Redis Connection

```bash
redis-cli ping
```

### View Logs

Logs will show:

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

## Features Enabled

### 1. Queue System

- **Image uploads** processed in background
- **Email notifications** queued
- **WhatsApp messages** queued
- **Report generation** async

### 2. Rate Limiting

- **Auth routes**: 5 requests / 15 min
- **Admin API**: 100 requests / 15 min
- **Public API**: 300 requests / 15 min
- **Public pages**: 60 requests / min

### 3. Background Jobs

- **File cleanup**: Daily at 2 AM
- **Database backup**: Daily at 3 AM
- **Daily reports**: Daily at 8 AM
- **Health check**: Every 5 minutes

### 4. Caching

- **Services**: Cached for 1 hour
- **Categories**: Cached for 24 hours
- **User profiles**: Cached for 5 minutes

### 5. Monitoring

- **Error tracking** with Sentry
- **Structured logging** with Pino
- **Performance monitoring**

---

## Troubleshooting

### Redis Connection Failed

```bash
# Check if Redis is running
redis-cli ping

# Start Redis (Docker)
docker start redis

# Check Redis logs
docker logs redis
```

### Workers Not Starting

Check logs for errors. Common issues:

- Redis not running
- Missing environment variables
- Port conflicts

### Rate Limiting Not Working

- Ensure Redis is connected
- Check middleware is enabled
- Verify `.env` configuration

---

## Production Deployment

### 1. Use Cloud Redis

- **Upstash**: https://upstash.com (Recommended)
- **Redis Cloud**: https://redis.com/cloud
- **AWS ElastiCache**: For AWS deployments

### 2. Configure Sentry

1. Create account at https://sentry.io
2. Create new project
3. Copy DSN to `.env`

### 3. Enable SMTP

Use a transactional email service:

- **SendGrid**
- **Mailgun**
- **AWS SES**

### 4. Environment Variables

Ensure all production environment variables are set:

- `REDIS_URL`
- `SENTRY_DSN`
- `SMTP_*` variables
- `B2_*` variables

---

## Monitoring Dashboard

### Queue Dashboard (Optional)

Install Bull Board for queue monitoring:

```bash
npm install @bull-board/express @bull-board/api
```

Access at: `http://localhost:3000/admin/queues`

---

## Support

For issues or questions:

1. Check logs in console
2. Verify Redis connection
3. Check environment variables
4. Review error messages in Sentry
