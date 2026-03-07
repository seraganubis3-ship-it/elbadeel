'use client';

import { useEffect, useState, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
const COUNTDOWN_SECONDS = 60;

export function useInactivityTracker() {
  const [isActive, setIsActive] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isWarning, setIsWarning] = useState(false);

  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetOnActivityRef = useRef<(() => void) | null>(null);

  const handleContinue = useCallback(() => {
    setShowDialog(false);
    setRemainingSeconds(0);
    setIsWarning(false);
    if (resetOnActivityRef.current) {
      resetOnActivityRef.current();
    }
  }, []);

  const handleLogout = useCallback(() => {
    setShowDialog(false);
    window.location.href = '/login';
  }, []);

  useEffect(() => {
    const resetInactivityTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      inactivityTimerRef.current = setTimeout(() => {
        setIsActive(false);
        setIsWarning(true);
        setShowDialog(true);
        setRemainingSeconds(COUNTDOWN_SECONDS);

        countdownTimerRef.current = setInterval(() => {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              if (countdownTimerRef.current) {
                clearInterval(countdownTimerRef.current);
              }
              window.location.href = '/login';
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, INACTIVITY_TIMEOUT);
    };

    resetOnActivityRef.current = resetInactivityTimer;

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach(event => {
      document.addEventListener(event, resetInactivityTimer);
    });

    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }

      activityEvents.forEach(event => {
        document.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, []);

  return {
    isActive,
    showDialog,
    remainingSeconds,
    isWarning,
    handleContinue,
    handleLogout,
  };
}
