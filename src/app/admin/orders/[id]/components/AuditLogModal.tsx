'use client';

import React, { useMemo } from 'react';
import { Order } from '../types';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
}

const fieldTranslations: Record<string, string> = {
  quantity: 'الكمية',
  deliveryType: 'طريقة التوصيل',
  deliveryFee: 'رسوم التوصيل',
  otherFees: 'رسوم أخرى',
  discount: 'الخصم',
  statusReason: 'السبب / التفاصيل',
  customerName: 'الاسم',
  customerPhone: 'الهاتف',
  customerEmail: 'البريد الإلكتروني',
  address: 'العنوان',
  policeStation: 'قسم الشرطة',
  pickupLocation: 'مكان الاستلام',
  photographyLocation: 'مكان التصوير',
  notes: 'الملاحظات',
  adminNotes: 'ملاحظات الإدارة',
  idNumber: 'الرقم القومي',
  selectedFines: 'الغرامات والخدمات (كود)',
  title: 'الصفة',
  photographyDate: 'تاريخ التصوير',
};

const statusLabels: Record<string, string> = {
  waiting_confirmation: 'انتظار المراجعة',
  waiting_payment: 'في انتظار الدفع',
  processing: 'تحت التنفيذ',
  settlement: 'تسديد',
  supply: 'ورود',
  delivered: 'تم التسليم',
  fulfillment: 'استيفاء',
  returned: 'مرتجع',
  cancelled: 'ملغي',
  paid: 'مدفوع',
};

export default function AuditLogModal({ isOpen, onClose, order }: AuditLogModalProps) {
  const timelineEvents = useMemo(() => {
    if (!order) return [];

    const statusEvents = (order.statusHistory || []).map((h: any) => ({
      type: 'STATUS',
      id: `status_${h.id}`,
      date: new Date(h.changedAt),
      user: h.admin?.name || 'غير معروف',
      data: h,
    }));

    const auditEvents = (order.auditLogs || []).map((a: any) => ({
      type: 'AUDIT',
      id: `audit_${a.id}`,
      date: new Date(a.createdAt),
      user: a.user?.name || 'غير معروف',
      data: a,
    }));

    return [...statusEvents, ...auditEvents].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [order]);

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[100] flex items-center justify-center p-4' onClick={onClose}>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />

      {/* Modal */}
      <div
        className='relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200'
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='bg-gradient-to-l from-indigo-600 to-indigo-800 px-6 py-5 text-white flex items-center justify-between shrink-0'>
          <div className='flex items-center gap-3'>
            <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center'>
              <span className='text-xl'>📋</span>
            </div>
            <div>
              <h2 className='text-lg font-black'>سجل التغييرات</h2>
              <p className='text-indigo-200 text-xs font-bold'>
                جميع العمليات على الطلب #{order.serialNumber || order.id?.slice(-8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className='w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors'
          >
            ✕
          </button>
        </div>

        {/* Timeline Content */}
        <div className='flex-1 overflow-y-auto p-6' dir='rtl'>
          {timelineEvents.length === 0 ? (
            <div className='text-center py-16'>
              <div className='w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                <span className='text-3xl'>📭</span>
              </div>
              <p className='text-slate-500 font-bold'>لا توجد تغييرات مسجلة بعد</p>
              <p className='text-slate-400 text-sm mt-1'>
                ستظهر هنا جميع العمليات التي يقوم بها الموظفون
              </p>
            </div>
          ) : (
            <div className='relative'>
              {/* Timeline line */}
              <div className='absolute right-4 top-0 bottom-0 w-0.5 bg-slate-200' />

              <div className='space-y-4'>
                {timelineEvents.map((event: any) => {
                  const isStatus = event.type === 'STATUS';
                  const isPayment = event.data?.action === 'PAYMENT_UPDATE';
                  const isFieldUpdate = event.type === 'AUDIT' && !isPayment;

                  // Parse old/new values for audit events
                  let oldVals: any = {};
                  let newVals: any = {};
                  if (event.type === 'AUDIT') {
                    try {
                      oldVals = JSON.parse(event.data.oldValues || '{}');
                    } catch {}
                    try {
                      newVals = JSON.parse(event.data.newValues || '{}');
                    } catch {}
                  }

                  return (
                    <div key={event.id} className='relative pr-10'>
                      {/* Timeline dot */}
                      <div
                        className={`absolute right-2 top-2 w-5 h-5 rounded-full border-2 border-white shadow-md z-10 ${
                          isStatus ? 'bg-indigo-500' : isPayment ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />

                      <div
                        className={`p-4 rounded-2xl border transition-all ${
                          isStatus
                            ? 'bg-indigo-50/50 border-indigo-100'
                            : isPayment
                              ? 'bg-emerald-50/50 border-emerald-100'
                              : 'bg-amber-50/50 border-amber-100'
                        }`}
                      >
                        {/* Event header */}
                        <div className='flex items-center justify-between mb-2'>
                          <div className='flex items-center gap-2'>
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                isStatus
                                  ? 'bg-indigo-100 text-indigo-700'
                                  : isPayment
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {isStatus ? 'تغيير حالة' : isPayment ? 'عملية دفع' : 'تعديل بيانات'}
                            </span>
                            <span className='text-xs font-bold text-slate-500'>
                              👤 {event.user}
                            </span>
                          </div>
                          <span className='text-[10px] font-bold text-slate-400 dir-ltr'>
                            {event.date.toLocaleDateString('ar-EG', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            {event.date.toLocaleTimeString('ar-EG', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {/* Event details */}
                        {isStatus && (
                          <div className='flex items-center gap-2 text-sm'>
                            <span className='text-slate-500'>الحالة:</span>
                            <span className='bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-xs font-bold line-through'>
                              {statusLabels[oldVals.status] || oldVals.status || '—'}
                            </span>
                            <span className='text-slate-400'>←</span>
                            <span className='bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-lg text-xs font-bold'>
                              {statusLabels[event.data?.status || newVals.status] ||
                                event.data?.status ||
                                newVals.status ||
                                '—'}
                            </span>
                          </div>
                        )}

                        {isPayment && (
                          <div className='space-y-1 text-sm'>
                            <div className='flex items-center gap-2'>
                              <span className='text-slate-500'>المبلغ:</span>
                              <span className='bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-xs font-bold line-through'>
                                {((oldVals.paymentAmount || 0) / 100).toFixed(2)} ج.م
                              </span>
                              <span className='text-slate-400'>←</span>
                              <span className='bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg text-xs font-bold'>
                                {((newVals.paymentAmount || 0) / 100).toFixed(2)} ج.م
                              </span>
                            </div>
                            {newVals.paymentMethod && (
                              <div className='flex items-center gap-2'>
                                <span className='text-slate-500'>طريقة الدفع:</span>
                                <span className='text-xs font-bold text-emerald-700'>
                                  {newVals.paymentMethod}
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {isFieldUpdate && (
                          <div className='space-y-1.5'>
                            {Object.keys(newVals).map(fieldKey => {
                              const label = fieldTranslations[fieldKey] || fieldKey;
                              const oldVal = oldVals[fieldKey];
                              const newVal = newVals[fieldKey];
                              // Skip status field as it's handled separately
                              if (fieldKey === 'status') return null;
                              return (
                                <div
                                  key={fieldKey}
                                  className='flex items-center gap-2 text-sm flex-wrap'
                                >
                                  <span className='text-slate-600 font-bold text-xs'>{label}:</span>
                                  <span
                                    className='bg-slate-200 text-slate-600 px-2 py-0.5 rounded-lg text-xs line-through max-w-[120px] truncate'
                                    title={String(oldVal ?? '—')}
                                  >
                                    {String(oldVal ?? '—')}
                                  </span>
                                  <span className='text-slate-400'>←</span>
                                  <span
                                    className='bg-amber-100 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-bold max-w-[120px] truncate'
                                    title={String(newVal ?? '—')}
                                  >
                                    {String(newVal ?? '—')}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className='border-t border-slate-100 px-6 py-3 bg-slate-50 flex items-center justify-between shrink-0'>
          <span className='text-xs text-slate-400 font-bold'>
            إجمالي العمليات: {timelineEvents.length}
          </span>
          <button
            onClick={onClose}
            className='px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-sm font-bold transition-colors'
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
