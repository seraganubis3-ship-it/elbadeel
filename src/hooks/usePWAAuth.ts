'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

const LAST_OPEN_TIME = 'pwa_last_open';
const MIN_REOPEN_TIME = 10000;

export function usePWAAuth() {
  useEffect(() => {
    const isPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandalone || isIOSStandalone;
    };

    if (isPWA()) {
      console.log('PWA detected');

      const lastOpenTime = localStorage.getItem(LAST_OPEN_TIME);
      const now = Date.now();

      if (lastOpenTime) {
        const timeDiff = now - parseInt(lastOpenTime);
        console.log('Time since last open:', timeDiff, 'ms');

        if (timeDiff > MIN_REOPEN_TIME) {
          console.log('App was closed and reopened, signing out...');
          localStorage.removeItem(LAST_OPEN_TIME);
          signOut({ callbackUrl: '/login' });
          return;
        }
      }

      localStorage.setItem(LAST_OPEN_TIME, now.toString());
      console.log('Updated last open time');
    }

    return () => {};
  }, []);
}
