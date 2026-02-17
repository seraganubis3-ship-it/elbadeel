'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { searchWorkOrdersAction, SearchResult } from '../actions'; // Adjust import path if needed

export function WorkOrderGlobalSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTerm.length >= 2) {
        setLoading(true);
        try {
          // Verify we are importing the server action correctly.
          // If it fails, check actions.ts location relative to this component.
          // This component is in src/app/admin/work-orders/components/
          // actions.ts is in src/app/admin/work-orders/
          // So import should be '../actions'
          const data = await searchWorkOrdersAction(searchTerm);
          setResults(data);
          setIsOpen(true);
        } catch (error) {
          // console.error('Search failed', error);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelect = (result: SearchResult) => {
    setIsOpen(false);
    setSearchTerm('');
    if (result.type === 'WORK_ORDER') {
      router.push(`/admin/work-orders/${encodeURIComponent(result.key)}`);
    } else {
      router.push(`/admin/work-orders/date_${result.key}`);
    }
  };

  return (
    <div ref={wrapperRef} className='relative w-full max-w-lg'>
      <div className='relative'>
        <input
          type='text'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder='بحث عن أمر شغل (اسم العميل، رقم الهاتف، رقم الطلب)...'
          className='w-full px-4 py-3 pl-10 pr-10 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-bold shadow-sm'
        />
        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
          {loading ? (
            <div className='animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent'></div>
          ) : (
            <svg className='w-5 h-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          )}
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500'
          >
            <svg className='w-4 h-4' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M6 18L18 6M6 6l12 12'
              />
            </svg>
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 max-h-96 overflow-y-auto'>
          {results.map((result, idx) => (
            <button
              key={`${result.type}-${result.key}-${idx}`}
              onClick={() => handleSelect(result)}
              className='w-full text-right px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 flex items-center justify-between group'
            >
              <div>
                <div className='font-bold text-slate-800 text-sm'>{result.label}</div>
                <div className='text-xs text-slate-500 mt-0.5'>
                  {result.type === 'WORK_ORDER' ? 'رقم أمر الشغل' : 'تاريخ العمل'} •{' '}
                  {result.matchingOrderCount} طلبات مطابقة
                </div>
              </div>
              <div className='flex flex-col items-end gap-1'>
                <span className='text-[10px] font-bold px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full'>
                  {result.type === 'WORK_ORDER' ? 'WO' : 'DATE'}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && !loading && searchTerm.length >= 2 && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-4 text-center z-50'>
          <p className='text-slate-500 text-sm font-medium'>لا توجد نتائج مطابقة</p>
        </div>
      )}
    </div>
  );
}
