'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';

const INACTIVITY_TIMEOUT = 10 * 60 * 1000; // 10 minutes
const COUNTDOWN_SECONDS = 60;
const CHECK_INTERVAL = 5000; // Check every 5 seconds
const SYNC_KEY = 'last_app_activity_timestamp';

export function useInactivityTracker() {
  const [isActive, setIsActive] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  const lastActivityTimeRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const updateActivityLocally = useCallback(() => {
    const now = Date.now();
    lastActivityTimeRef.current = now;
    if (typeof window !== 'undefined') {
      localStorage.setItem(SYNC_KEY, now.toString());
    }
  }, []);

  const startInactivityCheck = useCallback(() => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();

      // Get the most recent activity across all tabs
      let effectiveLastActivity = lastActivityTimeRef.current;
      if (typeof window !== 'undefined') {
        const remoteLastActivity = localStorage.getItem(SYNC_KEY);
        if (remoteLastActivity) {
          effectiveLastActivity = Math.max(effectiveLastActivity, parseInt(remoteLastActivity));
          lastActivityTimeRef.current = effectiveLastActivity;
        }
      }

      if (now - effectiveLastActivity >= INACTIVITY_TIMEOUT) {
        if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);

        setIsActive(false);
        setIsWarning(true);
        setShowDialog(true);
        setRemainingSeconds(COUNTDOWN_SECONDS);

        countdownTimerRef.current = setInterval(() => {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
              signOut({ callbackUrl: '/login' });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, CHECK_INTERVAL);
  }, []);

  const handleContinue = useCallback(async () => {
    setShowDialog(false);
    setRemainingSeconds(0);
    setIsWarning(false);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

    // Refresh session on server
    try {
      await fetch('/api/auth/session');
    } catch (e) {
      console.error('Failed to refresh session:', e);
    }

    updateActivityLocally();
    startInactivityCheck();
  }, [startInactivityCheck, updateActivityLocally]);

  const handleLogout = useCallback(() => {
    setShowDialog(false);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    signOut({ callbackUrl: '/login' });
  }, []);

  useEffect(() => {
    const updateActivity = () => {
      updateActivityLocally();
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SYNC_KEY && e.newValue) {
        lastActivityTimeRef.current = parseInt(e.newValue);
        // If we were showing the dialog, close it because someone else active
        setShowDialog(false);
        setIsWarning(false);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        startInactivityCheck();
      }
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    window.addEventListener('storage', handleStorageChange);

    startInactivityCheck();

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [startInactivityCheck, updateActivityLocally]);

  return {
    isActive,
    showDialog,
    remainingSeconds,
    isWarning,
    handleContinue,
    handleLogout,
  };
}
