import { useState, useEffect } from 'react';
import { cacheManager } from '@/lib/cache';

/**
 * React hook for using cached data with automatic updates
 * @param key Cache key
 * @param fetchFn Function that returns the data to cache
 * @param options Cache options
 */
export function useCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    expiry?: number | null;
    initialData?: T | null;
    revalidateOnFocus?: boolean;
    revalidateOnReconnect?: boolean;
    dedupingInterval?: number;
  } = {}
) {
  const {
    expiry = null,
    initialData = null,
    revalidateOnFocus = true,
    revalidateOnReconnect = true,
    dedupingInterval = 2000, // 2 seconds
  } = options;

  const [data, setData] = useState<T | null>(() => {
    // Try to get from cache on initial render
    const cachedData = cacheManager.get<T>(key, initialData);
    return cachedData;
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Function to fetch and update data
  const fetchData = async (force = false) => {
    // Deduping - don't fetch again if we recently fetched
    const now = Date.now();
    if (!force && now - lastFetchTime < dedupingInterval) {
      return;
    }

    setIsLoading(true);
    setLastFetchTime(now);

    try {
      const newData = await fetchFn();
      setData(newData);
      setError(null);
      
      // Update cache
      cacheManager.set(key, newData, expiry);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    // If we don't have data from cache, fetch it
    if (data === null) {
      fetchData();
    }
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set up revalidation on window focus
  useEffect(() => {
    if (!revalidateOnFocus) return;

    const onFocus = () => {
      fetchData();
    };

    window.addEventListener('focus', onFocus);
    return () => {
      window.removeEventListener('focus', onFocus);
    };
  }, [revalidateOnFocus]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set up revalidation on network reconnect
  useEffect(() => {
    if (!revalidateOnReconnect) return;

    const onOnline = () => {
      fetchData();
    };

    window.addEventListener('online', onOnline);
    return () => {
      window.removeEventListener('online', onOnline);
    };
  }, [revalidateOnReconnect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Function to manually trigger a refresh
  const refresh = () => {
    return fetchData(true);
  };

  return {
    data,
    isLoading,
    error,
    refresh,
  };
}
