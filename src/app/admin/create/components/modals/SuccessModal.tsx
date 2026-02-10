import React from 'react';
import { useRouter } from 'next/navigation';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string | null;
  onReset: () => void; // Function to reset form and start new order
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, orderId, onReset }) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 transform transition-all scale-100 flex flex-col items-center text-center">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <span className="text-4xl">🎉</span>
        </div>

        <h3 className="text-2xl font-black text-slate-900 mb-2">
          تم إنشاء الطلب بنجاح!
        </h3>
        
        <p className="text-slate-500 font-medium mb-8">
          رقم الطلب: <span className="font-mono font-bold text-emerald-600">#{orderId}</span>
        </p>

        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            onClick={() => {
              if (orderId) {
                router.push(`/admin/orders/${orderId}`);
              }
            }}
            className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-200 active:scale-95"
          >
            <span>🖨️</span>
            <span>طباعة الإيصال</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all active:scale-95"
          >
            <span>✨</span>
            <span>طلب جديد</span>
          </button>
        </div>

      </div>
    </div>
  );
};
