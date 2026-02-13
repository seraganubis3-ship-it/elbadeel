// Performance optimization utilities

/**
 * Image optimization helper
 */
export const imageOptimization = {
  // Blur placeholder for images
  blurDataURL: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWUiLz48L3N2Zz4=',
  
  // Responsive image sizes
  sizes: {
    thumbnail: '(max-width: 640px) 100vw, 640px',
    card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
    hero: '100vw',
    full: '(max-width: 1920px) 100vw, 1920px',
  },
  
  // Quality settings
  quality: {
    thumbnail: 75,
    normal: 85,
    high: 95,
  },
};

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
