import { useCallback, useMemo } from "react";

// Debounce hook for expensive operations
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  return useCallback(
    (...args: Parameters<T>) => {
      const timeoutId = setTimeout(() => callback(...args), delay);
      return () => clearTimeout(timeoutId);
    },
    [callback, delay]
  ) as T;
}

// Memoization helper for complex calculations
export function useMemoizedCalculation<T>(
  calculation: () => T,
  dependencies: any[]
): T {
  return useMemo(calculation, dependencies);
}

// Performance monitoring utilities
export const Performance = {
  // Track component render times
  measureRender: (componentName: string, fn: () => void) => {
    if (process.env.NODE_ENV === 'development') {
      const start = performance.now();
      fn();
      const end = performance.now();
      if (end - start > 16) { // Alert if render takes more than 16ms
        console.warn(`Slow render detected in ${componentName}: ${(end - start).toFixed(2)}ms`);
      }
    } else {
      fn();
    }
  },

  // Lazy load images with intersection observer
  lazyLoadImage: (element: HTMLImageElement, src: string) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          element.src = src;
          observer.unobserve(element);
        }
      });
    });
    observer.observe(element);
  },

  // Virtualization helper for long lists
  getVisibleItems: <T>(
    items: T[],
    containerHeight: number,
    itemHeight: number,
    scrollTop: number
  ) => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex: Math.max(0, startIndex - 1),
      endIndex,
      visibleItems: items.slice(Math.max(0, startIndex - 1), endIndex)
    };
  }
};

// Cache management for expensive computations
class CacheManager {
  private cache = new Map<string, { value: any; timestamp: number; ttl: number }>();

  set(key: string, value: any, ttlMs: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    return this.cache.size;
  }
}

export const cache = new CacheManager();