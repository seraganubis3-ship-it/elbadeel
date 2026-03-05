'use client';

import InactivityDialog from '@/components/InactivityDialog';
import { useInactivityTracker } from '@/hooks/useInactivityTracker';

export default function InactivityWrapper({ children }: { children: React.ReactNode }) {
  const { showDialog, remainingSeconds, handleContinue, handleLogout } = useInactivityTracker();

  return (
    <>
      {children}
      <InactivityDialog
        isOpen={showDialog}
        remainingSeconds={remainingSeconds}
        onContinue={handleContinue}
        onLogout={handleLogout}
      />
    </>
  );
}
