'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

const SESSION_TIMEOUT_MINUTES = 30;
const LAST_ACTIVITY_KEY = 'pwa_last_activity';
const IS_PWA_KEY = 'is_pwa_session';

export function usePWAAuth() {
  useEffect(() => {
    const checkPWAClosed = () => {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      const now = Date.now();

      if (lastActivity) {
        const elapsedMinutes = (now - parseInt(lastActivity)) / (1000 * 60);

        if (elapsedMinutes > SESSION_TIMEOUT_MINUTES) {
          console.log('PWA was closed for more than 30 minutes, signing out...');
          handleSignOut();
        }
      }

      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkPWAClosed();
      }
    };

    const handleBeforeUnload = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    const handlePageHide = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    const handleSignOut = async () => {
      try {
        await signOut({ callbackUrl: '/login' });
      } catch (error) {
        console.error('Sign out error:', error);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        localStorage.removeItem(IS_PWA_KEY);
        window.location.href = '/login';
      }
    };

    const isPWA = () => {
      return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
      );
    };

    if (isPWA()) {
      localStorage.setItem(IS_PWA_KEY, 'true');
      checkPWAClosed();

      window.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);
    }

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);
}
