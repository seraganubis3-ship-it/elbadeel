'use client';

import { useEffect, useState, useCallback } from 'react';
import { offlineManager } from '@/lib/offline-manager';
import { useToast } from '@/components/Toast';

export const OfflineSyncTrigger = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const { showSuccess } = useToast();

  const checkForPendingOrders = useCallback(async () => {
    const pending = await offlineManager.getPendingOrders();
    setPendingCount(pending.length);
  }, []);

  const handleSync = useCallback(async () => {
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
  }, [checkForPendingOrders, showSuccess]);

  const prefetchLookups = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const res = await fetch('/api/admin/offline/prefetch');
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success && data?.data) {
        await offlineManager.savePrefetchedData(data.data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    checkForPendingOrders();
    prefetchLookups();

    // Listen for online event
    const handleOnline = () => {
      handleSync();
      prefetchLookups();
    };
    window.addEventListener('online', handleOnline);

    // Check periodically (every 5 minutes)
    const interval = setInterval(
      () => {
        checkForPendingOrders();
        handleSync();
        prefetchLookups();
      },
      5 * 60 * 1000
    );

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(interval);
    };
  }, [checkForPendingOrders, handleSync, prefetchLookups]);

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
