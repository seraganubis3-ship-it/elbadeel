'use client';

import { useEffect, useState } from 'react';
import { offlineManager } from '@/lib/offline-manager';
import { useToast } from '@/components/Toast';

export const OfflineSyncTrigger = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const { showSuccess, showError, showWarning } = useToast();

  const checkForPendingOrders = async () => {
    const pending = await offlineManager.getPendingOrders();
    setPendingCount(pending.length);
  };

  const handleSync = async () => {
    if (navigator.onLine) {
      const result = await offlineManager.syncOrders();
      if (result.success && result.results?.length > 0) {
        showSuccess(
          'تم المزامنة بنجاح! 🔄',
          `تم رفع ${result.results.length} طلبات كانت محفوظة أوفلاين.`
        );
        checkForPendingOrders();
      } else if (result.error) {
        // Silent fail or minimal warning if it was an auto-sync
      }
    }
  };

  useEffect(() => {
    checkForPendingOrders();

    // Listen for online event
    window.addEventListener('online', handleSync);

    // Check periodically (every 5 minutes)
    const interval = setInterval(
      () => {
        checkForPendingOrders();
        handleSync();
      },
      5 * 60 * 1000
    );

    return () => {
      window.removeEventListener('online', handleSync);
      clearInterval(interval);
    };
  }, []);

  if (pendingCount === 0) return null;

  return (
    <div className='fixed bottom-24 right-4 z-[2000] animate-bounce-subtle'>
      <button
        onClick={handleSync}
        className='flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg border-2 border-white transition-all active:scale-95 group'
      >
        <span className='relative flex h-3 w-3'>
          <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-100 opacity-75'></span>
          <span className='relative inline-flex rounded-full h-3 w-3 bg-white'></span>
        </span>
        <span className='font-bold text-xs'>مزامنة {pendingCount} طلبات</span>
      </button>
    </div>
  );
};
