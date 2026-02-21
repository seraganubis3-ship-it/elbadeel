'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Order, getStatusText } from '../types';

const MySwal = withReactContent(Swal);

interface LastOrderAlertProps {
  searchTerm: string;
  customerId?: string | undefined;
}

export function LastOrderAlert({ searchTerm, customerId }: LastOrderAlertProps) {
  const [lastCheckTerm, setLastCheckTerm] = useState('');
  const [lastCheckId, setLastCheckId] = useState('');

  useEffect(() => {
    // If we have a customerId, we check that.
    // If not, we check searchTerm but ONLY if it looks like a phone number (to avoid generic name matches)
    const isPhoneSearch = /^[0-9]{8,}/.test(searchTerm);
    const shouldCheck = customerId || (searchTerm && isPhoneSearch && searchTerm.length >= 10);

    // Prevent re-checking same data
    if (
      (customerId && customerId === lastCheckId) ||
      (!customerId && searchTerm === lastCheckTerm)
    ) {
      return;
    }

    if (!shouldCheck) return;

    const checkLastOrder = async () => {
      try {
        const params = new URLSearchParams();
        if (customerId) {
          params.set('userId', customerId);
        } else {
          params.set('search', searchTerm);
        }
        params.set('limit', '1');
        params.set('sortBy', 'createdAt_desc');

        const response = await fetch(`/api/admin/orders?${params.toString()}`);
        if (!response.ok) return;

        const data = await response.json();
        const orders: Order[] = data.orders || [];

        if (orders.length > 0) {
          const lastOrder = orders[0];

          await MySwal.fire({
            title: '🔎 آخر طلب مسجل للعميل',
            html: `
              <div style="direction: rtl; text-align: right; font-size: 0.95rem;">
                <div style="margin-bottom: 8px;">
                   <span style="color: #64748b;">العميل:</span>
                   <span style="font-weight: bold; color: #0f172a;">${lastOrder?.customerName}</span>
                </div>
                <div style="margin-bottom: 8px;">
                   <span style="color: #64748b;">الخدمة:</span>
                   <span style="font-weight: bold; color: #0f172a;">${lastOrder?.service?.name || 'غير محدد'}</span>
                </div>
                <div style="margin-bottom: 8px;">
                   <span style="color: #64748b;">التاريخ:</span>
                   <span style="font-weight: bold; color: #0f172a;">${lastOrder?.createdAt ? new Date(lastOrder.createdAt).toLocaleDateString('ar-EG') : ''}</span>
                </div>
                 <div>
                   <span style="color: #64748b;">الحالة:</span>
                   <span style="font-weight: bold; color: #0f172a;">${lastOrder?.status ? getStatusText(lastOrder.status) : ''}</span>
                </div>
              </div>
            `,
            icon: 'info',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 15000,
            timerProgressBar: true,
            customClass: {
              popup: 'colored-toast',
            },
            background: '#e0f2fe',
            color: '#0369a1',
            // No click navigation as requested
          });
        }

        setLastCheckTerm(searchTerm);
        if (customerId) setLastCheckId(customerId);
      } catch (error) {
                console.error('Error checking last order:', error);
      }
    };

    const timer = setTimeout(() => {
      checkLastOrder();
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm, customerId, lastCheckTerm, lastCheckId]);

  return null;
}
