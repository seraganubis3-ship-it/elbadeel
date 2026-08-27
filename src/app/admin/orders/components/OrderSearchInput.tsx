'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { offlineManager } from '@/lib/offline-manager';

interface OrderSearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function OrderSearchInput({ value, onChange }: OrderSearchInputProps) {
  const [inputValue, setInputValue] = useState(value);
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [suggestedUser, setSuggestedUser] = useState<any | null>(null);
  const [suggestion, setSuggestion] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const abortControllerRef = useRef<AbortController>();
  const orderSearchTimeoutRef = useRef<NodeJS.Timeout>();

  // Sync with prop
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (orderSearchTimeoutRef.current) clearTimeout(orderSearchTimeoutRef.current);

    orderSearchTimeoutRef.current = setTimeout(() => {
      onChange(inputValue.trim());
    }, 450);

    return () => {
      if (orderSearchTimeoutRef.current) clearTimeout(orderSearchTimeoutRef.current);
    };
  }, [inputValue, onChange]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchUsers = useCallback((term: string) => {
    if (abortControllerRef.current) abortControllerRef.current.abort();
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (term.length < 1) {
      setSearchResults([]);
      setSuggestedUser(null);
      setSuggestion('');
      setShowDropdown(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;
      setSearching(true);

      try {
        let results: any[] = [];

        // Online Search
        if (typeof window !== 'undefined' && navigator.onLine) {
          const params = new URLSearchParams();
          params.append('name', term);
          const response = await fetch(`/api/admin/users/search?${params.toString()}`, {
            signal: controller.signal,
          });
          if (response.ok) {
            const data = await response.json();
            results = data.users || [];
            // Cache results
            for (const user of results) {
              await offlineManager.upsertCustomer(user);
            }
          }
        }

        // Fallback to local if empty or offline
        if (results.length === 0) {
          results = await offlineManager.searchCustomers(term);
        }

        setSearchResults(results);
        if (results.length > 0) {
          setSuggestedUser(results[0]);
          setShowDropdown(true);

          // Ghost text suggestion
          const bestMatch = results[0].name;
          if (bestMatch.toLowerCase().startsWith(term.toLowerCase())) {
            setSuggestion(bestMatch);
          } else {
            setSuggestion('');
          }
        } else {
          setSuggestedUser(null);
          setSuggestion('');
          setShowDropdown(false);
        }
      } catch (error: any) {
        if (error.name !== 'AbortError') {
          console.error('Search error', error);
        }
      } finally {
        setSearching(false);
      }
    }, 300);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    searchUsers(newVal);
  };

  const handleSelectUser = (user: any) => {
    // Prefer phone as it's more unique and searchable
    const term = user.phone || user.name;
    setInputValue(term);
    onChange(term);
    setShowDropdown(false);
    setSuggestion('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (showDropdown && suggestedUser && !e.shiftKey && suggestion) {
        // If we have a ghost suggestion and hit Enter, maybe select it?
        // Or if user wants to search for EXACTLY what they typed (e.g. Order ID)
        // Usually Enter should trigger the search with current input.

        // If suggestion matches input + suffix, maybe auto-complete?
        if (
          suggestion.toLowerCase().startsWith(inputValue.toLowerCase()) &&
          suggestion !== inputValue
        ) {
          setInputValue(suggestion);
          // And search for that user
          // But maybe user typed "123" (Order ID) and suggestion is "123456789" (Phone).
          // If they hit Enter, they might mean "123".
        }
      }
      onChange(inputValue);
      setShowDropdown(false);
    }

    // Allow Tab to autocomplete ghost text
    if (e.key === 'Tab' && suggestion && showDropdown) {
      e.preventDefault();
      setInputValue(suggestion);
    }
  };

  return (
    <div className='relative group' ref={dropdownRef}>
      <div className='absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10'>
        {searching ? (
          <span className='animate-spin block'>⏳</span>
        ) : (
          <svg
            className='w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        )}
      </div>

      {/* Ghost Text */}
      {suggestion &&
        inputValue &&
        suggestion.toLowerCase().startsWith(inputValue.toLowerCase()) && (
          <div className='absolute inset-0 pr-11 pl-4 py-3 sm:py-4 font-medium text-slate-400 pointer-events-none z-0 user-select-none opacity-50 flex items-center text-sm sm:text-base'>
            <span className='opacity-0'>{inputValue}</span>
            <span>{suggestion.slice(inputValue.length)}</span>
          </div>
        )}

      <input
        type='text'
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (inputValue.length >= 1 && searchResults.length > 0) setShowDropdown(true);
        }}
        placeholder='ابحث بالاسم، الهاتف، الرقم القومي، رقم الطلب أو رقم الاستمارة...'
        className='w-full pr-11 pl-4 py-3 sm:py-4 bg-slate-50 hover:bg-slate-100 focus:bg-white border-2 border-slate-200 hover:border-slate-300 focus:border-blue-500 rounded-xl sm:rounded-2xl transition-all text-sm sm:text-base text-slate-900 placeholder-slate-400 font-medium shadow-sm focus:shadow-md outline-none relative z-10 bg-transparent'
      />

      {/* Dropdown */}
      {showDropdown && searchResults.length > 0 && (
        <div className='absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-[100] animate-in fade-in slide-in-from-top-2'>
          {suggestedUser && (
            <div
              onClick={() => handleSelectUser(suggestedUser)}
              className='p-3 bg-blue-50/50 hover:bg-blue-50 cursor-pointer border-b border-blue-100 flex items-center justify-between group transition-colors'
            >
              <div className='flex items-center gap-3'>
                <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm'>
                  ✨
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='font-bold text-blue-900 text-sm'>{suggestedUser.name}</span>
                    <span className='text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold'>
                      مقترح
                    </span>
                  </div>
                  <span className='text-xs text-blue-600 font-mono font-bold'>
                    {suggestedUser.phone}
                  </span>
                </div>
              </div>
            </div>
          )}

          {searchResults.map(user => (
            <div
              key={user.id}
              onClick={() => handleSelectUser(user)}
              className='p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center gap-3'
            >
              <div className='w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm'>
                👤
              </div>
              <div className='flex-1'>
                <div className='font-bold text-slate-700 text-sm'>{user.name}</div>
                <div className='text-xs text-slate-400 font-mono flex items-center gap-2'>
                  {user.idNumber && (
                    <span className='bg-slate-100 px-1 rounded'>{user.idNumber}</span>
                  )}
                  <span>{user.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
