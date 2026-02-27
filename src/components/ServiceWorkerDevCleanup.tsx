'use client';

import { useEffect } from 'react';

export default function ServiceWorkerDevCleanup() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    if (typeof window === 'undefined') return;
    if (!('serviceWorker' in navigator)) return;

    const key = 'sw-dev-cleaned';
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    (async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }

      window.location.reload();
    })().catch(() => {});
  }, []);

  return null;
}
