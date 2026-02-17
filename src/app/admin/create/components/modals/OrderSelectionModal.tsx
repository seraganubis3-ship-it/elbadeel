import React, { useState, useEffect } from 'react';
import { Customer } from '../../types';

interface OrderSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: Customer | null;
}

interface OrderSummary {
  id: string;
  serviceName: string;
  totalCents: number;
  createdAt: string;
  orderNumber?: number;
}

export const OrderSelectionModal: React.FC<OrderSelectionModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      // Reuse the existing API but maybe we need a param to list regular orders?
      // Since we don't have a dedicated API for "list orders by customer and date" that returns simple JSON for selection,
      // we might need to rely on the existing collective-receipt API or just fetch from orders endpoint if possible.
      // However, the user asked for "search for customer -> show services".
      // Use the collective-receipt API to fetch ALL orders for this customer (no date param)
      const cleanCustomerId = encodeURIComponent(customer!.id.trim());
      const res = await fetch(`/api/admin/collective-receipt?customerId=${cleanCustomerId}`);

      if (res.ok) {
        const data = await res.json();
        // The API returns { orders: [...] }
        setOrders(data.orders);
        // Default select all
        setSelectedOrders(new Set(data.orders.map((o: any) => o.id)));
      } else {
        setError('فشل في جلب الطلبات');
      }
    } catch (err) {
      setError('حدث خطأ أثناء الاتصال');
    } finally {
      setLoading(false);
    }
  }, [customer]);

  useEffect(() => {
    if (isOpen && customer?.id) {
      fetchOrders();
    } else {
      setOrders([]);
      setSelectedOrders(new Set());
    }
  }, [isOpen, customer, fetchOrders]);

  const toggleOrder = (orderId: string) => {
    const newSelected = new Set(selectedOrders);
    if (newSelected.has(orderId)) {
      newSelected.delete(orderId);
    } else {
      newSelected.add(orderId);
    }
    setSelectedOrders(newSelected);
  };

  const handlePrint = () => {
    if (selectedOrders.size === 0) return;

    const orderIds = Array.from(selectedOrders).join(',');
    const today = new Date().toISOString().split('T')[0];
    const cleanCustomerId = encodeURIComponent(customer!.id.trim());

    // Construct URL with orderIds
    const url = `/admin/collective-receipt?customerId=${cleanCustomerId}&date=${today}&orderIds=${orderIds}`;
    window.open(url, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200'>
      <div className='bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-100'>
        <div className='p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between'>
          <div>
            <h3 className='text-lg font-black text-slate-900'>طباعة إيصال مجمع</h3>
            <p className='text-xs font-bold text-slate-500 mt-1'>
              حدد الخدمات التي تريد طباعتها للعميل: {customer?.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className='text-slate-400 hover:text-rose-500 transition-colors'
          >
            <svg className='w-6 h-6' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2.5}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        </div>

        <div className='p-6 max-h-[60vh] overflow-y-auto custom-scrollbar'>
          {loading ? (
            <div className='flex justify-center py-8'>
              <div className='w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin'></div>
            </div>
          ) : error ? (
            <div className='text-center py-8 text-rose-500 font-bold'>{error}</div>
          ) : orders.length === 0 ? (
            <div className='text-center py-8 text-slate-400 font-bold'>
              لا توجد طلبات مسجلة لهذا العميل اليوم
            </div>
          ) : (
            <div className='space-y-3'>
              {orders.map(order => {
                const isSelected = selectedOrders.has(order.id);
                return (
                  <div
                    key={order.id}
                    onClick={() => toggleOrder(order.id)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/30'
                        : 'border-slate-100 hover:border-emerald-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className='flex items-center gap-4'>
                      <div
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 bg-white group-hover:border-emerald-400'
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className='w-4 h-4'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                            strokeWidth={3}
                          >
                            <path d='M5 13l4 4L19 7' />
                          </svg>
                        )}
                      </div>
                      <div>
                        <div className='font-bold text-slate-800 text-sm'>{order.serviceName}</div>
                        <div className='text-[10px] font-bold text-slate-400 mt-0.5' dir='ltr'>
                          {(order.totalCents / 100).toFixed(2)} EGP
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className='p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3'>
          <button
            onClick={handlePrint}
            disabled={selectedOrders.size === 0}
            className='flex-1 py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-slate-200'
          >
            طباعة ({selectedOrders.size})
          </button>
          <button
            onClick={onClose}
            className='px-6 py-3 bg-white border-2 border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all'
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
};
