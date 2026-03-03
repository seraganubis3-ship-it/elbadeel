'use client';

import { useEffect } from 'react';
import { signOut } from 'next-auth/react';

const SESSION_ID_KEY = 'pwa_session_id';
const PREVIOUS_SESSION_ID_KEY = 'pwa_previous_session_id';

export function usePWAAuth() {
  useEffect(() => {
    const isPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      const isPWA = isStandalone || isIOSStandalone;
      console.log('PWA Detection:', { isStandalone, isIOSStandalone, isPWA });
      return isPWA;
    };

    const generateSessionId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const handleSignOut = async () => {
      console.log('Signing out user...');
      try {
        await signOut({ callbackUrl: '/login', redirect: false });
        console.log('Sign out successful, redirecting...');
        window.location.href = '/login';
      } catch (error) {
        console.error('Sign out error:', error);
        localStorage.removeItem(SESSION_ID_KEY);
        localStorage.removeItem(PREVIOUS_SESSION_ID_KEY);
        window.location.href = '/login';
      }
    };

    const checkSession = () => {
      const currentSessionId = sessionStorage.getItem(SESSION_ID_KEY);
      const previousSessionId = localStorage.getItem(PREVIOUS_SESSION_ID_KEY);

      console.log('Checking session:', { currentSessionId, previousSessionId });

      if (previousSessionId && (!currentSessionId || currentSessionId !== previousSessionId)) {
        console.log('PWA was closed and reopened, signing out...');
        handleSignOut();
        return false;
      }

      return true;
    };

    const initializeSession = () => {
      const sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      localStorage.setItem(PREVIOUS_SESSION_ID_KEY, sessionId);
      console.log('Session initialized:', sessionId);
    };

    if (isPWA()) {
      console.log('PWA detected, initializing auth check');

      if (checkSession()) {
        initializeSession();
      }

      window.addEventListener('beforeunload', () => {
        console.log('Before unload - clearing session storage');
        sessionStorage.clear();
      });

      window.addEventListener('pagehide', () => {
        console.log('Page hide - clearing session storage');
        sessionStorage.clear();
      });
    } else {
      console.log('Not running in PWA mode');
    }

    return () => {};
  }, []);
}
