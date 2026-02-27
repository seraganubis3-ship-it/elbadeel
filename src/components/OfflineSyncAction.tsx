'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { offlineManager } from '@/lib/offline-manager';
import { useToast } from '@/components/Toast';

type Props = {
  className?: string;
  iconClassName?: string;
  label?: string;
};

export function OfflineSyncAction({ className, iconClassName, label }: Props) {
  const { showError, showSuccess } = useToast();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [online, setOnline] = useState<boolean>(() =>
    typeof window === 'undefined' ? true : navigator.onLine
  );

  const refreshPendingCount = useCallback(async () => {
    const pending = await offlineManager.getPendingOrders();
    setPendingCount(pending.length);
  }, []);

  const canSync = useMemo(() => online && !syncing, [online, syncing]);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      showError('غير متصل بالإنترنت', 'لا يمكن المزامنة الآن. حاول مرة أخرى عند عودة النت.');
      return;
    }

    setSyncing(true);
    try {
      const result = await offlineManager.syncOrders();
      await refreshPendingCount();

      const createdCount = Array.isArray(result.results)
        ? result.results.filter(r => r.status === 'created' || r.status === 'synced').length
        : 0;

      if (createdCount > 0) {
        showSuccess('تمت المزامنة ✅', `تم رفع ${createdCount} طلبات كانت محفوظة أوفلاين.`);
      } else {
        showSuccess('المزامنة محدثة', 'لا يوجد طلبات أوفلاين معلّقة حالياً.');
      }
    } catch (err) {
      showError('فشل المزامنة', String(err));
    } finally {
      setSyncing(false);
    }
  }, [refreshPendingCount, showError, showSuccess]);

  useEffect(() => {
    refreshPendingCount();

    const handleOnline = () => {
      setOnline(true);
      refreshPendingCount().catch(() => {});
    };

    const handleOffline = () => {
      setOnline(false);
      refreshPendingCount().catch(() => {});
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const intervalId = window.setInterval(() => {
      refreshPendingCount().catch(() => {});
    }, 30_000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.clearInterval(intervalId);
    };
  }, [refreshPendingCount]);

  return (
    <button type='button' onClick={syncNow} disabled={!canSync} className={className}>
      <svg className={iconClassName} fill='none' stroke='currentColor' viewBox='0 0 24 24'>
        <path
          strokeLinecap='round'
          strokeLinejoin='round'
          strokeWidth={2}
          d='M4 4v6h6M20 20v-6h-6M20 10a8 8 0 00-14.93-3M4 14a8 8 0 0014.93 3'
        />
      </svg>
      <span>{label || 'مزامنة الأوفلاين'}</span>
      <span className='px-2 py-0.5 rounded-full bg-white/15 border border-white/20 text-xs font-black tabular-nums'>
        {pendingCount}
      </span>
    </button>
  );
}
