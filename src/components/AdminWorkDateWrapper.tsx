'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import WorkDateModal from './WorkDateModal';

interface AdminWorkDateWrapperProps {
  children: React.ReactNode;
}

export default function AdminWorkDateWrapper({ children }: AdminWorkDateWrapperProps) {
  const { data: session, status } = useSession();
  const [showWorkDateModal, setShowWorkDateModal] = useState(false);

  useEffect(() => {
    // التحقق من وجود تاريخ العمل للأدمن
    if (status === 'authenticated' && session?.user) {
      const user = session.user as any;

      // إذا كان المستخدم أدمن ولا يوجد تاريخ عمل
      if (user.role === 'ADMIN' && !user.workDate) {
        // التحقق من localStorage كبديل مؤقت
        const savedWorkDate = localStorage.getItem('adminWorkDate');
        if (!savedWorkDate) {
          // تأخير بسيط للتأكد من تحميل الواجهة
          const timer = setTimeout(() => {
            setShowWorkDateModal(true);
          }, 500);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [session, status]);

  // إذا كان المستخدم ليس أدمن، أظهر المحتوى عادي
  if (status === 'loading') {
    return <div>جاري التحميل...</div>;
  }

  if (status === 'unauthenticated' || !session?.user) {
    return <>{children}</>;
  }

  const user = session.user as any;
  if (user.role !== 'ADMIN') {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <WorkDateModal
        isOpen={showWorkDateModal}
        onClose={() => setShowWorkDateModal(false)}
        userEmail={user.email || ''}
      />
    </>
  );
}
