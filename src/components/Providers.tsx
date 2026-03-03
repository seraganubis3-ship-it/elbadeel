'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './Toast';
import ServiceWorkerDevCleanup from '@/components/ServiceWorkerDevCleanup';
import ServiceWorkerRecovery from '@/components/ServiceWorkerRecovery';
import { usePWAAuth } from '@/hooks/usePWAAuth';

function PWASessionProvider({ children }: { children: React.ReactNode }) {
  usePWAAuth();
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <ToastProvider>
        <ServiceWorkerDevCleanup />
        <ServiceWorkerRecovery />
        <PWASessionProvider>{children}</PWASessionProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
