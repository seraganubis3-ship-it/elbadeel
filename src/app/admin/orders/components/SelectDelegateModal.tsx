'use client';

import { useState, useEffect } from 'react';

interface Delegate {
  id: string;
  name: string;
  idNumber: string;
  unionCardFront?: string;
  idCardFront?: string;
}

interface SelectDelegateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (delegate?: Delegate, authType?: 'passport' | 'work-permit') => void;
  mode?: 'default' | 'authorization';
  isOptional?: boolean;
}

export function SelectDelegateModal({
  isOpen,
  onClose,
  onConfirm,
  mode = 'default',
  isOptional = false,
}: SelectDelegateModalProps) {
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [selectedDelegateId, setSelectedDelegateId] = useState<string>('');
  const [authType, setAuthType] = useState<'passport' | 'work-permit'>('passport');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDelegates();
    }
  }, [isOpen]);

  const fetchDelegates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/delegates?active=true');
      const data = await res.json();
      if (data.delegates) {
        setDelegates(data.delegates);
      }
    } catch (error) {
      // generic error handling or ignore
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    const delegate = delegates.find(d => d.id === selectedDelegateId);
    
    // If optional and no delegate, confirm with undefined
    if (isOptional && !delegate) {
        onConfirm(undefined);
        return;
    }

    if (delegate) {
      if (mode === 'authorization') {
        onConfirm(delegate, authType);
      } else {
        onConfirm(delegate);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm'>
      <div className='bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden'>
        <div className='p-6'>
          <h3 className='text-xl font-bold text-gray-900 mb-4 text-center'>
            {mode === 'authorization' ? 'طباعة تفويض' : 'اختر المندوب لطباعة الكشف'}
          </h3>

          {loading ? (
             <div className="flex justify-center p-4">
               <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : (
            <div className='space-y-4'>
              {mode === 'authorization' && (
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    نوع التفويض
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setAuthType('passport')}
                      className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                        authType === 'passport'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      جواز سفر
                    </button>
                    <button
                      onClick={() => setAuthType('work-permit')}
                      className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                        authType === 'work-permit'
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      تصريح عمل
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  المندوب
                </label>
                <select
                  value={selectedDelegateId}
                  onChange={(e) => setSelectedDelegateId(e.target.value)}
                  className='w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all'
                >
                  <option value=''>{isOptional ? 'بدون مندوب (طباعة مباشرة)' : 'اختر المندوب...'}</option>
                  {delegates.map((delegate) => (
                    <option key={delegate.id} value={delegate.id}>
                      {delegate.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className='mt-6 flex gap-3'>
            <button
              onClick={handleConfirm}
              disabled={!isOptional && !selectedDelegateId}
              className='flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
            >
              طباعة
            </button>
            <button
              onClick={onClose}
              className='flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-colors'
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
