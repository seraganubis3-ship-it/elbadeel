'use client';

import { STATUS_CONFIG } from '../types';

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  bulkStatus: string;
  updating: boolean;
  onSelectAll: () => void;
  onBulkStatusChange: (status: string) => void;
  onApplyBulkStatus: () => void;
  onPrintReport: () => void;
  hasOrders: boolean;
}

export function BulkActions({
  selectedCount,
  totalCount,
  bulkStatus,
  updating,
  onSelectAll,
  onBulkStatusChange,
  onApplyBulkStatus,
  onPrintReport,
  hasOrders,
}: BulkActionsProps) {
  return (
    <div className='bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-100/50 p-4 mb-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        {/* Selection Info */}
        <div className='flex items-center gap-4'>
          <button
            onClick={onSelectAll}
            className='flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-sm font-medium'
          >
            <input
              type='checkbox'
              checked={selectedCount === totalCount && totalCount > 0}
              onChange={onSelectAll}
              className='w-4 h-4 text-blue-600 border-gray-300 rounded'
            />
            <span>
              {selectedCount === totalCount && totalCount > 0 ? 'إلغاء تحديد الكل' : 'تحديد الكل'}
            </span>
          </button>

          {selectedCount > 0 && (
            <span className='px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium'>
              {selectedCount} طلب محدد
            </span>
          )}
        </div>

        {/* Bulk Actions */}
        <div className='flex items-center gap-3'>
          {/* Print Report Button */}
          {hasOrders && (
            <button
              onClick={onPrintReport}
              className='flex items-center gap-2 px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-xl transition-colors text-sm font-medium'
            >
              <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z'
                />
              </svg>
              طباعة كشف
            </button>
          )}

          {/* Bulk Status Update */}
          {selectedCount > 0 && (
            <div className='flex items-center gap-2'>
              <select
                value={bulkStatus}
                onChange={e => onBulkStatusChange(e.target.value)}
                className='px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm'
              >
                <option value=''>تغيير الحالة...</option>
                {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                  <option key={key} value={key}>
                    {config.icon} {config.text}
                  </option>
                ))}
              </select>

              <button
                onClick={onApplyBulkStatus}
                disabled={!bulkStatus || updating}
                className='flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {updating ? (
                  <>
                    <svg className='w-4 h-4 animate-spin' fill='none' viewBox='0 0 24 24'>
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      />
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      />
                    </svg>
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <svg className='w-4 h-4' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M5 13l4 4L19 7'
                      />
                    </svg>
                    تطبيق
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
