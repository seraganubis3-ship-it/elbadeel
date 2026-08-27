import React, { useRef } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export function Tabs({ tabs, activeTab, onTabChange }: TabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;

    event.preventDefault();
    const nextIndex =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? -1 : 1) + tabs.length) % tabs.length;
    const nextTab = tabs[nextIndex];
    if (!nextTab) return;

    onTabChange(nextTab.id);
    requestAnimationFrame(() => tabRefs.current[nextIndex]?.focus());
  };

  return (
    <div className='mb-5 rounded-2xl border border-white/70 bg-white/80 p-2 shadow-sm shadow-slate-200/70 backdrop-blur'>
      <div className='flex gap-2 overflow-x-auto scrollbar-hide' role='tablist'>
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              ref={element => {
                tabRefs.current[index] = element;
              }}
              type='button'
              role='tab'
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onTabChange(tab.id)}
              onKeyDown={event => handleKeyDown(event, index)}
              className={`
                flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap border outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20
                ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100 border-emerald-600'
                    : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 border-slate-200'
                }
              `}
            >
              {tab.icon && (
                <span className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`}>
                  {tab.icon}
                </span>
              )}
              <span className='font-black text-sm sm:text-base'>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
