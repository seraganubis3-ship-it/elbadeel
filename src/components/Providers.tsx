'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from './Toast';
import ServiceWorkerDevCleanup from '@/components/ServiceWorkerDevCleanup';
import ServiceWorkerRecovery from '@/components/ServiceWorkerRecovery';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchOnWindowFocus={false} refetchInterval={0}>
      <ToastProvider>
        <ServiceWorkerDevCleanup />
        <ServiceWorkerRecovery />
        {children}
      </ToastProvider>
    </SessionProvider>
  );
}
