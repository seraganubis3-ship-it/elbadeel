'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { signOut } from 'next-auth/react';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const COUNTDOWN_SECONDS = 60;
const CHECK_INTERVAL = 2000; // Check every 2 seconds

export function useInactivityTracker() {
  const [isActive, setIsActive] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  const lastActivityTimeRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startInactivityCheck = useCallback(() => {
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    
    checkIntervalRef.current = setInterval(() => {
      const now = Date.now();
      if (now - lastActivityTimeRef.current >= INACTIVITY_TIMEOUT) {
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

  const handleContinue = useCallback(() => {
    setShowDialog(false);
    setRemainingSeconds(0);
    setIsWarning(false);
    lastActivityTimeRef.current = Date.now();
    startInactivityCheck();
  }, [startInactivityCheck]);

  const handleLogout = useCallback(() => {
    setShowDialog(false);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    signOut({ callbackUrl: '/login' });
  }, []);

  useEffect(() => {
    const updateActivity = () => {
      lastActivityTimeRef.current = Date.now();
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Use passive listener for better scroll performance
    activityEvents.forEach(event => {
      document.addEventListener(event, updateActivity, { passive: true });
    });

    startInactivityCheck();

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

      activityEvents.forEach(event => {
        document.removeEventListener(event, updateActivity);
      });
    };
  }, [startInactivityCheck]);

  return {
    isActive,
    showDialog,
    remainingSeconds,
    isWarning,
    handleContinue,
    handleLogout,
  };
}
