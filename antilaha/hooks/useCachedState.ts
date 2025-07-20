import { useState, useEffect } from 'react';
import { cacheManager } from '@/lib/cache';

/**
 * React hook for persisting state in local storage cache
 * Similar to useState but persists the value in cache
 * @param key Cache key
 * @param initialValue Initial value
 * @param expiry Custom expiration time in milliseconds (optional)
 */
export function useCachedState<T>(
  key: string,
  initialValue: T,
  expiry: number | null = null
): [T, (value: T | ((prevValue: T) => T)) => void] {
  // Initialize state with cached value or initial value
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    const cachedValue = cacheManager.get<T>(key);
    return cachedValue !== null ? cachedValue : initialValue;
  });

  // Update cache when state changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    cacheManager.set(key, state, expiry);
  }, [key, state, expiry]);

  return [state, setState];
}
