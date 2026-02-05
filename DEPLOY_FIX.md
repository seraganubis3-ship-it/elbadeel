# Production Fix & Deployment Guide

This document outlines the steps to apply the fixes for Cloudflare 521 errors, Prisma connection issues, and Next.js stability.

## 1. Codebase Updates (Already Applied)

- **Prisma Stability**: `src/lib/databaseMonitor.ts` now uses the shared Prisma singleton to prevent "Connection Limit Exceeded".
- **PM2 Configuration**: A new `ecosystem.config.js` has been created to replace `concurrently`. This allows independent management of the Web App and WhatsApp Bot.
- **Build Stability**: `next.config.js` now uses the Git Commit Hash as the Build ID. This prevents "Failed to find Server Action" errors when the server restarts but the client code hasn't changed.

## 2. Server Configuration

### Nginx Configuration

Update your Nginx config (`/etc/nginx/sites-available/your-site`) to include these headers. This prevents Cloudflare from timing out (524) or getting confused by connection drops.

```nginx
server {
    # ... existing SSL/server blocks ...

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        # Timeouts to prevent Cloudflare 524
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;

        # Vital for Next.js
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Cloudflare Configuration

To permanently fix the 521 errors:

1.  **SSL/TLS Mode**: Set to **Full (Strict)**.
    - _Why_: Only "Strict" uses the valid SSL certificate on your Origin server (managed by Nginx/Certbot). "Flexible" causes infinite redirect loops or 521s if the origin expects HTTPS.
2.  **Caching Rules (Page Rules)**:
    - **Rule 1**: `https://yourdomain.com/_next/*` -> **Cache Level: Cache Everything**. (Speeds up static assets massively).
    - **Rule 2**: `https://yourdomain.com/api/*` -> **Cache Level: Bypass**. (Ensures APIs are never stale).

## 3. New Deployment Strategy

DO NOT use `npm run start` in production anymore. Use the new PM2 setup.

### First Time Setup:

```bash
# 1. Stop existing process
pm2 delete all

# 2. Build the app
npm run build

# 3. Start with new config
pm2 start ecosystem.config.js
pm2 save
```

### Subsequent Deployments (Zero Downtime for Web):

```bash
# 1. Pull changes
git pull origin main

# 2. Install dependencies & Generate Client
npm install
npx prisma generate

# 3. Build
npm run build

# 4. Reload only the Web App (Keeps WhatsApp running)
pm2 reload haiba-web
```

## 4. Troubleshooting Checklist

- **If 521 Persistence**: Check `pm2 logs haiba-web`. If the app is crashing immediately, the port 3000 might be taken or `.env` is missing.
- **If Prisma Error**: Ensure `DATABASE_URL` ends with `?connection_limit=10` (or similar) in `.env` if you are not using PgBouncer, to define a hard cap per instance.
