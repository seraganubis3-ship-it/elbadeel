'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

const SESSION_TIMEOUT_MINUTES = 1;
const LAST_ACTIVITY_KEY = 'pwa_last_activity';
const IS_PWA_KEY = 'is_pwa_session';

export function usePWAAuth() {
  useEffect(() => {
    const isPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isPWA = isStandalone || isIOSStandalone;
      console.log('PWA Detection:', { isStandalone, isIOSStandalone, isPWA });
      return isPWA;
    };

    const handleSignOut = async () => {
      console.log('Signing out user...');
      try {
        await signOut({ callbackUrl: '/login', redirect: false });
        console.log('Sign out successful, redirecting...');
        window.location.href = '/login';
      } catch (error) {
        console.error('Sign out error:', error);
        localStorage.removeItem(LAST_ACTIVITY_KEY);
        localStorage.removeItem(IS_PWA_KEY);
        window.location.href = '/login';
      }
    };

    const checkPWAClosed = () => {
      const lastActivity = localStorage.getItem(LAST_ACTIVITY_KEY);
      const now = Date.now();
      console.log('Checking PWA activity:', { lastActivity, now });

      if (lastActivity) {
        const elapsedMinutes = (now - parseInt(lastActivity)) / (1000 * 60);
        console.log('Elapsed minutes:', elapsedMinutes);

        if (elapsedMinutes > SESSION_TIMEOUT_MINUTES) {
          console.log('PWA was closed for more than timeout, signing out...');
          handleSignOut();
          return;
        }
      }

      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      console.log('Updated last activity to:', now);
    };

    const handleVisibilityChange = () => {
      console.log('Visibility changed:', document.visibilityState);
      if (document.visibilityState === 'visible') {
        console.log('App became visible, checking PWA status...');
        checkPWAClosed();
      }
    };

    const handleBeforeUnload = () => {
      console.log('Before unload event - saving activity');
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    const handlePageHide = () => {
      console.log('Page hide event - saving activity');
      localStorage.setItem(LAST_ACTIVITY_KEY, Date.now().toString());
    };

    if (isPWA()) {
      console.log('PWA detected, initializing auth check');
      localStorage.setItem(IS_PWA_KEY, 'true');

      setTimeout(() => {
        checkPWAClosed();
      }, 100);

      window.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handlePageHide);
    } else {
      console.log('Not running in PWA mode');
    }

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);
}
