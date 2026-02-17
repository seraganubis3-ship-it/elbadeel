'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { Order, getStatusText } from '../types';

const MySwal = withReactContent(Swal);

interface LastOrderAlertProps {
  searchTerm: string;
}

export function LastOrderAlert({ searchTerm }: LastOrderAlertProps) {
  const [lastCheckTerm, setLastCheckTerm] = useState('');

  useEffect(() => {
    // Only search if term is long enough to be a phone or significant name part
    if (!searchTerm || searchTerm.length < 4 || searchTerm === lastCheckTerm) return;

    const checkLastOrder = async () => {
      try {
        // Use the existing search API but limit to 1 and sort by date desc
        const params = new URLSearchParams();
        params.set('search', searchTerm);
        params.set('limit', '1');
        params.set('sortBy', 'createdAt_desc');

        const response = await fetch(`/api/admin/orders?${params.toString()}`);
        if (!response.ok) return;

        const data = await response.json();
        const orders: Order[] = data.orders || [];

        if (orders.length > 0) {
          const lastOrder = orders[0];
          
          await MySwal.fire({
            title: '🔎 تم العثور على عميل سابق',
            html: `
              <div style="direction: rtl; text-align: right; font-size: 0.95rem;">
                <div style="margin-bottom: 8px;">
                   <span style="color: #64748b;">العميل:</span>
                   <span style="font-weight: bold; color: #0f172a;">${lastOrder?.customerName}</span>
                </div>
                <div style="margin-bottom: 8px;">
                   <span style="color: #64748b;">آخر خدمة:</span>
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
            timer: 5000,
            timerProgressBar: true,
            customClass: {
                popup: 'colored-toast'
            },
            background: '#e0f2fe',
            color: '#0369a1',
            didOpen: (toast) => {
              if (lastOrder && lastOrder.customerName) {
                  toast.addEventListener('click', () => {
                     window.location.href = `/admin/orders?search=${encodeURIComponent(lastOrder.customerName)}`;
                  });
              }
            }
          });
        }
        
        // Only set this AFTER successful check to prevent re-runs
        setLastCheckTerm(searchTerm);

      } catch (error) {
        console.error('Error checking last order:', error);
      }
    };

    const timer = setTimeout(() => {
        checkLastOrder();
    }, 1000); // 1s debounce to avoid spamming while typing

    return () => clearTimeout(timer);
  }, [searchTerm, lastCheckTerm]);

  return null; // Logic only component
}
