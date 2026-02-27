'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ServiceWorkerRecovery() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const key = 'last-online-path';
    if (pathname && pathname !== '/offline') {
      sessionStorage.setItem(key, pathname);
      return;
    }

    if (pathname !== '/offline') return;
    if (!navigator.onLine) return;
    if (!('serviceWorker' in navigator)) return;

    const fallbackPath = sessionStorage.getItem(key) || '/admin';

    (async () => {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));

      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }

      window.location.replace(fallbackPath);
    })().catch(() => {
      window.location.replace(fallbackPath);
    });
  }, [pathname]);

  return null;
}
