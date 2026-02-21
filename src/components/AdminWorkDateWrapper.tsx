'use client';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import WorkDateModal from './WorkDateModal';
import { hasPermission } from '@/lib/permissions';

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

      // إذا كان المستخدم لديه صلاحية وإنشاء طلبات أو إدارة ومفيش تاريخ عمل
      if ((hasPermission(user, 'CREATE_ORDER') || hasPermission(user, 'MANAGE_ORDERS')) && !user.workDate) {
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

  // إذا كان المستخدم ليس أدمن أو موظف، أظهر المحتوى عادي
  if (status === 'loading') {
    return <div>جاري التحميل...</div>;
  }

  if (status === 'unauthenticated' || !session?.user) {
    return <>{children}</>;
  }

  const user = session.user as any;
  if (!hasPermission(user, 'CREATE_ORDER') && !hasPermission(user, 'MANAGE_ORDERS')) {
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
