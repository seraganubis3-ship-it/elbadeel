import React from 'react';
import { useRouter } from 'next/navigation';
import { offlineManager } from '@/lib/offline-manager';
import { printReceipt } from '../../../orders/utils/printReceipt';
import { useSession } from 'next-auth/react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onReset: () => void; // Function to reset form and start new order
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  orderId,
  onReset,
}) => {
  const router = useRouter();
  const { data: session } = useSession();

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto'>
      {/* Backdrop */}
      <div
        className='fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className='relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 transform transition-all scale-100 flex flex-col items-center text-center'>
        {/* Success Icon */}
        <div className='w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce'>
          <span className='text-4xl'>🎉</span>
        </div>

        <h3 className='text-2xl font-black text-slate-900 mb-2'>تم إنشاء الطلب بنجاح!</h3>

        <p className='text-slate-500 font-medium mb-8'>
          رقم الطلب: <span className='font-mono font-bold text-emerald-600'>#{orderId}</span>
        </p>

        <div className='grid grid-cols-2 gap-4 w-full'>
          <button
            onClick={async () => {
              if (!orderId) return;

              if (!orderId.startsWith('OFF-')) {
                router.push(`/admin/orders/${orderId}`);
                return;
              }

              const pendingOrders = await offlineManager.getPendingOrders();
              const offlineOrder = pendingOrders.find(o => o.offlineId === orderId);
              if (!offlineOrder) return;

              const services = await offlineManager.getServices();
              const service = services.find(s => s.id === offlineOrder.serviceId);
              const variant = service?.variants?.find((v: any) => v.id === offlineOrder.variantId);

              const createdAt =
                offlineOrder.workDate || offlineOrder.createdAt || new Date().toISOString();

              printReceipt({
                ...offlineOrder,
                id: offlineOrder.offlineId,
                createdAt,
                service: { name: service?.name || '—', slug: service?.slug || '' },
                variant: variant
                  ? { name: variant.name || '—', priceCents: variant.priceCents || 0 }
                  : null,
                deliveryDuration: variant?.etaDays ? `${variant.etaDays} يوم` : null,
                createdByAdmin: session?.user?.name ? { name: session.user.name } : null,
              });
            }}
            className='flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-95'
          >
            <span>🖨️</span>
            <span>طباعة الإيصال</span>
          </button>

          <button
            onClick={onReset}
            className='flex items-center justify-center gap-2 w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all active:scale-95'
          >
            <span>✨</span>
            <span>طلب جديد</span>
          </button>
        </div>
      </div>
    </div>
  );
};
