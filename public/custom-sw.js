const SW_TAG = 'custom-sw-v2';

self.addEventListener('install', event => {
  event.waitUntil(Promise.resolve());
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-orders') {
    event.waitUntil(Promise.resolve());
  }
});

self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(Promise.resolve());
  }
});

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'البديل للخدمات الحكومية';
  const options = {
    body: data.body || 'لديك تحديث جديد في طلبك',
    icon: '/icons/icon-192x192.png',
    badge: '/favicon.ico',
    data: data.data || {},
    tag: data.tag || SW_TAG,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification?.data?.url || '/';
  event.waitUntil(self.clients.openWindow(url));
});
