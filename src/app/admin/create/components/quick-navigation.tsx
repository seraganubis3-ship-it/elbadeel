'use client';

interface QuickNavigationProps {
  isMobile?: boolean;
}

const navItems = [
  { id: 'customer-info', icon: '👤', label: 'العميل' },
  { id: 'service-selection', icon: '🔧', label: 'الخدمة' },
  { id: 'documents-section', icon: '📄', label: 'المستندات' },
  { id: 'payment-section', icon: '💳', label: 'الدفع' },
  { id: 'actions-section', icon: '✅', label: 'إجراءات' },
];

const mobileNavItems = [
  { id: 'customer-info', icon: '👤', label: 'العميل' },
  { id: 'service-selection', icon: '🔧', label: 'الخدمة' },
  { id: 'documents-section', icon: '📄', label: 'مستندات' },
  { id: 'payment-section', icon: '💳', label: 'الدفع' },
  { id: 'actions-section', icon: '✅', label: 'إجراء' },
];

export function QuickNavigation({ isMobile = false }: QuickNavigationProps) {
  const handleNavClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (isMobile) {
    // Mobile/Tablet: Bottom horizontal bar
    return (
      <div className='fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl px-2 py-2 safe-area-inset-bottom'>
        <div className='flex justify-around items-center gap-1 max-w-lg mx-auto'>
          {mobileNavItems.map(item => (
            <button
              key={item.id}
              type='button'
              onClick={() => handleNavClick(item.id)}
              className='flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-all duration-150'
            >
              <span className='text-xl'>{item.icon}</span>
              <span className='text-[10px] font-semibold text-gray-600'>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Desktop: Right sidebar
  return (
    <div className='fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden lg:flex flex-col gap-2'>
      {navItems.map(item => (
        <button
          key={item.id}
          type='button'
          onClick={() => handleNavClick(item.id)}
          className='flex items-center gap-2 px-3 py-2 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-200'
        >
          <span className='text-lg'>{item.icon}</span>
          <span className='text-xs font-semibold text-gray-700 whitespace-nowrap'>
            {item.label}
          </span>
        </button>
      ))}
    </div>
  );
}
