/**
 * Cache utility for storing and retrieving data from local storage
 * with expiration support and automatic cleanup
 */

// Cache item structure with expiration
interface CacheItem<T> {
  value: T;
  expiry: number | null; // Timestamp when the cache expires (null = never expires)
  timestamp: number;     // When the item was cached
}

// Cache configuration
interface CacheConfig {
  defaultExpiry: number; // Default expiration time in milliseconds
  prefix: string;        // Prefix for all cache keys
  version: string;       // Cache version for invalidation
}

// Default configuration
const DEFAULT_CONFIG: CacheConfig = {
  defaultExpiry: 24 * 60 * 60 * 1000, // 24 hours
  prefix: 'app_cache_',
  version: '1.0.0',
};

export class CacheManager {
  private config: CacheConfig;
  private isInitialized: boolean = false;

  constructor(customConfig: Partial<CacheConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  /**
   * Initialize the cache manager
   * This should be called once when the app starts
   */
  public init(): void {
    if (typeof window === 'undefined') return;
    
    this.isInitialized = true;
    this.cleanupExpiredItems();
    
    // Perform cache version check and clear if needed
    const storedVersion = localStorage.getItem(`${this.config.prefix}version`);
    if (storedVersion !== this.config.version) {
      this.clearAll();
      localStorage.setItem(`${this.config.prefix}version`, this.config.version);
    }
  }

  /**
   * Set an item in the cache
   * @param key Cache key
   * @param value Value to store
   * @param expiry Custom expiration time in milliseconds (optional)
   */
  public set<T>(key: string, value: T, expiry?: number | null): void {
    if (typeof window === 'undefined') return;
    if (!this.isInitialized) this.init();

    const prefixedKey = this.getPrefixedKey(key);
    const now = Date.now();
    
    const cacheItem: CacheItem<T> = {
      value,
      expiry: expiry === null ? null : now + (expiry || this.config.defaultExpiry),
      timestamp: now,
    };

    try {
      localStorage.setItem(prefixedKey, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache storage error:', error);
      // If storage is full, clear old items and try again
      this.clearOldItems();
      try {
        localStorage.setItem(prefixedKey, JSON.stringify(cacheItem));
      } catch (retryError) {
        console.error('Cache storage retry failed:', retryError);
      }
    }
  }

  /**
   * Get an item from the cache
   * @param key Cache key
   * @param defaultValue Default value if item is not found or expired
   */
  public get<T>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === 'undefined') return defaultValue;
    if (!this.isInitialized) this.init();

    const prefixedKey = this.getPrefixedKey(key);
    const cachedItem = localStorage.getItem(prefixedKey);
    
    if (!cachedItem) return defaultValue;
    
    try {
      const parsedItem = JSON.parse(cachedItem) as CacheItem<T>;
      const now = Date.now();
      
      // Check if item is expired
      if (parsedItem.expiry !== null && parsedItem.expiry < now) {
        localStorage.removeItem(prefixedKey);
        return defaultValue;
      }
      
      return parsedItem.value;
    } catch (error) {
      console.error('Cache parse error:', error);
      return defaultValue;
    }
  }

  /**
   * Remove an item from the cache
   * @param key Cache key
   */
  public remove(key: string): void {
    if (typeof window === 'undefined') return;
    
    const prefixedKey = this.getPrefixedKey(key);
    localStorage.removeItem(prefixedKey);
  }

  /**
   * Check if an item exists in the cache and is not expired
   * @param key Cache key
   */
  public has(key: string): boolean {
    if (typeof window === 'undefined') return false;
    if (!this.isInitialized) this.init();

    const prefixedKey = this.getPrefixedKey(key);
    const cachedItem = localStorage.getItem(prefixedKey);
    
    if (!cachedItem) return false;
    
    try {
      const parsedItem = JSON.parse(cachedItem) as CacheItem<any>;
      const now = Date.now();
      
      // Check if item is expired
      if (parsedItem.expiry !== null && parsedItem.expiry < now) {
        localStorage.removeItem(prefixedKey);
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all cached items
   */
  public clearAll(): void {
    if (typeof window === 'undefined') return;
    
    // Only remove items with our prefix
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.config.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Keep the version
    localStorage.setItem(`${this.config.prefix}version`, this.config.version);
  }

  /**
   * Clean up expired items
   */
  private cleanupExpiredItems(): void {
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const keysToRemove: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.config.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          if (item.expiry !== null && item.expiry < now) {
            keysToRemove.push(key);
          }
        } catch {
          // If we can't parse it, remove it
          keysToRemove.push(key);
        }
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clear old items when storage is full
   * Removes the oldest 20% of items
   */
  private clearOldItems(): void {
    if (typeof window === 'undefined') return;
    
    const cacheItems: { key: string; timestamp: number }[] = [];
    
    // Collect all cache items with timestamps
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.config.prefix)) {
        try {
          const item = JSON.parse(localStorage.getItem(key) || '');
          if (item.timestamp) {
            cacheItems.push({ key, timestamp: item.timestamp });
          }
        } catch {
          // If we can't parse it, add it with a very old timestamp
          cacheItems.push({ key, timestamp: 0 });
        }
      }
    }
    
    // Sort by timestamp (oldest first)
    cacheItems.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove the oldest 20% of items
    const itemsToRemove = Math.ceil(cacheItems.length * 0.2);
    cacheItems.slice(0, itemsToRemove).forEach(item => {
      localStorage.removeItem(item.key);
    });
  }

  /**
   * Get the prefixed key
   * @param key Original key
   */
  private getPrefixedKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }
}

// Create and export a singleton instance
export const cacheManager = new CacheManager();

// Helper functions for common use cases

/**
 * Cache the result of an async function
 * @param key Cache key
 * @param fetchFn Function that returns the data to cache
 * @param expiry Custom expiration time in milliseconds (optional)
 */
export async function cachedFetch<T>(
  key: string, 
  fetchFn: () => Promise<T>, 
  expiry?: number | null
): Promise<T> {
  // Check if we have a valid cached value
  const cachedValue = cacheManager.get<T>(key);
  
  if (cachedValue !== null) {
    return cachedValue;
  }
  
  // If not cached or expired, fetch new data
  const data = await fetchFn();
  
  // Cache the result
  cacheManager.set(key, data, expiry);
  
  return data;
}

/**
 * Cache API response with automatic URL-based keys
 * @param url API URL
 * @param options Fetch options
 * @param expiry Custom expiration time in milliseconds (optional)
 */
export async function cachedApiRequest<T = any>(
  url: string,
  options: RequestInit = {},
  expiry?: number | null
): Promise<T> {
  // Create a cache key based on the URL and options
  const cacheKey = `api_${url}_${JSON.stringify(options)}`;
  
  return cachedFetch<T>(
    cacheKey,
    async () => {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }
      return response.json();
    },
    expiry
  );
}
