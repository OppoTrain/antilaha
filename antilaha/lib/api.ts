import { cachedApiRequest } from "./cache"

/**
 * API client with built-in caching
 */
export const api = {
  /**
   * Fetch data from API with caching
   * @param endpoint API endpoint
   * @param options Fetch options
   * @param expiry Cache expiration time in milliseconds
   */
  get: async <T = any>(
    endpoint: string,
    options: RequestInit = {},
    expiry: number | null = 30 * 60 * 1000, // Default: 30 minutes
  ): Promise<T> => {
    const url = endpoint.startsWith("http") ? endpoint : `/api/${endpoint}`
    return cachedApiRequest<T>(
      url,
      {
        method: "GET",
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      },
      expiry,
    )
  },

  /**
   * Post data to API (not cached)
   * @param endpoint API endpoint
   * @param data Data to send
   * @param options Fetch options
   */
  post: async <T = any, D = any>(endpoint: string, data: D, options: RequestInit = {}): Promise<T> => {
    const url = endpoint.startsWith("http") ? endpoint : `/api/${endpoint}`
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Put data to API (not cached)
   * @param endpoint API endpoint
   * @param data Data to send
   * @param options Fetch options
   */
  put: async <T = any, D = any>(endpoint: string, data: D, options: RequestInit = {}): Promise<T> => {
    const url = endpoint.startsWith("http") ? endpoint : `/api/${endpoint}`
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      body: JSON.stringify(data),
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Delete data from API (not cached)
   * @param endpoint API endpoint
   * @param options Fetch options
   */
  delete: async <T = any>(endpoint: string, options: RequestInit = {}): Promise<T> => {
    const url = endpoint.startsWith("http") ? endpoint : `/api/${endpoint}`
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    return response.json()
  },

  /**
   * Invalidate cache for a specific endpoint
   * @param endpoint API endpoint
   */
  invalidateCache: (endpoint: string): void => {
    const url = endpoint.startsWith("http") ? endpoint : `/api/${endpoint}`
    const cacheKey = `api_${url}_{}`
    const cacheManager = require("./cache").cacheManager
    cacheManager.remove(cacheKey)
  },
}
