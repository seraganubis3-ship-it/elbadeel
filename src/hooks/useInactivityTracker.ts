'use client';

import { useEffect, useState, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000;
const WARNING_TIME = 30 * 1000;

export function useInactivityTracker() {
  const [isActive, setIsActive] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const handleContinue = useCallback(() => {
    setShowDialog(false);
    resetTimer();
  }, []);

  const handleLogout = useCallback(() => {
    setShowDialog(false);
    window.location.href = '/login';
  }, []);

  const resetTimer = useCallback(() => {
    setIsActive(true);
    setShowDialog(false);
    setRemainingSeconds(0);
  }, []);

  useEffect(() => {
    let inactivityTimer: NodeJS.Timeout | null = null;
    let warningTimer: NodeJS.Timeout | null = null;
    let countdownTimer: NodeJS.Timeout | null = null;

    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);

      inactivityTimer = setTimeout(() => {
        console.log('Inactivity timeout reached');
        setIsActive(false);
        setShowDialog(true);
        setRemainingSeconds(60);

        countdownTimer = setInterval(() => {
          setRemainingSeconds(prev => {
            if (prev <= 1) {
              if (countdownTimer) clearInterval(countdownTimer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }, INACTIVITY_TIMEOUT);
    };

    const resetOnActivity = () => {
      resetInactivityTimer();
    };

    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    activityEvents.forEach(event => {
      document.addEventListener(event, resetOnActivity);
    });

    resetInactivityTimer();

    return () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      if (warningTimer) clearTimeout(warningTimer);
      if (countdownTimer) clearInterval(countdownTimer);

      activityEvents.forEach(event => {
        document.removeEventListener(event, resetOnActivity);
      });
    };
  }, []);

  return {
    isActive,
    showDialog,
    remainingSeconds,
    handleContinue,
    handleLogout,
  };
}
