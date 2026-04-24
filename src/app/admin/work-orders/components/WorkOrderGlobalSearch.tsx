'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
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
    <div ref={wrapperRef} className='relative w-full max-w-xl'>
      <div className='relative'>
        <input
          type='text'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder='ابحث برقم أمر الشغل، العميل، الحالة، أو التاريخ...'
          className='w-full rounded-xl border border-slate-200 bg-white px-11 py-3 text-sm font-bold text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
        />
        <div className='absolute right-3 top-1/2 -translate-y-1/2 text-slate-400'>
          <Search className='h-5 w-5' />
        </div>
        <div className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'>
          {loading ? (
            <div className='animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent'></div>
          ) : null}
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className='absolute left-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500'
            aria-label='مسح البحث'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className='absolute left-0 right-0 top-full z-50 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-100 bg-white shadow-xl shadow-slate-900/10'>
          {results.map((result, idx) => (
            <button
              key={`${result.type}-${result.key}-${idx}`}
              onClick={() => handleSelect(result)}
              className='group flex w-full items-center justify-between border-b border-slate-50 px-4 py-3 text-right transition-colors last:border-0 hover:bg-blue-50/50'
            >
              <div>
                <div className='font-bold text-slate-800 text-sm'>{result.label}</div>
                <div className='mt-0.5 text-xs text-slate-500'>
                  {result.type === 'WORK_ORDER' ? 'رقم أمر الشغل' : 'تاريخ العمل'} •{' '}
                  {result.matchingOrderCount} طلبات مطابقة
                </div>
                <div className='mt-1 text-xs font-bold text-blue-600'>{result.matchReason}</div>
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
