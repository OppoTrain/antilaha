// SWR configuration for the application
import { SWRConfig } from "swr"

// Global SWR configuration provider
export const SWRProvider = ({ children }) => {
  return (
    <SWRConfig
      value={{
        // Global configuration for all SWR hooks
        revalidateOnFocus: false,
        revalidateIfStale: true,
        dedupingInterval: 60000, // 1 minute
        errorRetryCount: 3,
        errorRetryInterval: 5000, // 5 seconds
        focusThrottleInterval: 60000, // 1 minute
        suspense: false,
      }}
    >
      {children}
    </SWRConfig>
  )
}

// Custom fetcher with error handling
export const fetcher = async (url) => {
  const res = await fetch(url)

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error = new Error("An error occurred while fetching the data.")
    // Attach extra info to the error object.
    error.info = await res.json()
    error.status = res.status
    throw error
  }

  return res.json()
}
