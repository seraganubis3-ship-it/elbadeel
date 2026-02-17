import React from 'react';

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
  return (
    <div className='mb-6'>
      <div className='flex space-x-2 space-x-reverse overflow-x-auto pb-2 scrollbar-hide'>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center space-x-2 space-x-reverse px-4 py-3 rounded-xl transition-all duration-200 whitespace-nowrap
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-200'
                }
              `}
            >
              {tab.icon && (
                <span className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                  {tab.icon}
                </span>
              )}
              <span className='font-medium text-sm sm:text-base'>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
