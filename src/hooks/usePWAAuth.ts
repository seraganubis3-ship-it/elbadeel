'use client';

import { useEffect, useRef } from 'react';
import { signOut } from 'next-auth/react';

const SESSION_ID_KEY = 'pwa_session_id';
const PREVIOUS_SESSION_ID_KEY = 'pwa_previous_session_id';
const IS_SIGNING_OUT_KEY = 'pwa_is_signing_out';

export function usePWAAuth() {
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (isInitializedRef.current) {
      return;
    }
    isInitializedRef.current = true;

    const isPWA = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandalone || isIOSStandalone;
    };

    const generateSessionId = () => {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    const checkSession = () => {
      const currentSessionId = sessionStorage.getItem(SESSION_ID_KEY);
      const previousSessionId = localStorage.getItem(PREVIOUS_SESSION_ID_KEY);
      const isSigningOut = sessionStorage.getItem(IS_SIGNING_OUT_KEY);

      if (isSigningOut) {
        return false;
      }

      if (previousSessionId && (!currentSessionId || currentSessionId !== previousSessionId)) {
        sessionStorage.setItem(IS_SIGNING_OUT_KEY, 'true');
        signOut({ callbackUrl: '/login' });
        return false;
      }

      return true;
    };

    const initializeSession = () => {
      const sessionId = generateSessionId();
      sessionStorage.setItem(SESSION_ID_KEY, sessionId);
      localStorage.setItem(PREVIOUS_SESSION_ID_KEY, sessionId);
    };

    if (isPWA()) {
      if (checkSession()) {
        initializeSession();
      }

      const handleBeforeUnload = () => {
        sessionStorage.clear();
      };

      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('pagehide', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
        window.removeEventListener('pagehide', handleBeforeUnload);
      };
    }

    return () => {};
  }, []);
}
