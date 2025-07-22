"use client"

import "@/styles/globals.css"
import type { AppProps } from "next/app"
import { NextUIProvider } from "@nextui-org/react"
import { useState, useEffect } from "react"
import { Noto_Kufi_Arabic } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
// import LoadingScreen from "../components/LoadingScreen"
import { useRouter } from "next/router"
import Script from "next/script"
import { cacheManager } from "@/lib/cache"
import Head from "next/head"
import Adminicon from "@/components/admin"

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["100", "200", "300", "400", "500", "700", "800", "900"],
  variable: "--font-noto-kufi",
})

interface CachedRouteData {
  content: string
  scrollPosition: number
  timestamp: number
}

export default function App({ Component, pageProps }: AppProps) {
  const [, setLoading] = useState(true)
  const router = useRouter()

  // Suppress console messages and errors
  useEffect(() => {
    // Store original console methods
    const originalConsole = {
      log: console.log,
      warn: console.warn,
      error: console.error,
      info: console.info,
      debug: console.debug
    }

    // Override console methods with no-op functions
    console.log = () => {}
    console.warn = () => {}
    console.error = () => {}
    console.info = () => {}
    console.debug = () => {}

    // Cleanup: Restore original console methods when component unmounts
    return () => {
      console.log = originalConsole.log
      console.warn = originalConsole.warn
      console.error = originalConsole.error
      console.info = originalConsole.info
      console.debug = originalConsole.debug
    }
  }, [])

  // Initialize cache manager
  useEffect(() => {
    // Initialize the cache system
    cacheManager.init()

    // Set up cache cleanup interval (every hour)
    const cleanupInterval = setInterval(
      () => {
        cacheManager.init() // This will trigger cleanup of expired items
      },
      60 * 60 * 1000,
    )

    return () => {
      clearInterval(cleanupInterval)
    }
  }, [])

  // Handle route change loading states
  useEffect(() => {
    // Cache the current route data to speed up back navigation
    const cacheRouteData = (url: string) => {
      if (typeof window === "undefined") return

      // Store the current page's HTML in cache
      const pageContent = document.documentElement.outerHTML
      cacheManager.set(
        `route_${url}`,
        {
          content: pageContent,
          scrollPosition: window.scrollY,
          timestamp: Date.now(),
        } as CachedRouteData,
        30 * 60 * 1000,
      ) // Cache for 30 minutes
    }

    // On initial load
    const handleComplete = () => {
      setTimeout(() => {
        setLoading(false)
        // Cache initial route
        cacheRouteData(router.asPath)
      }, 1000) // Delay to ensure everything is loaded
    }

    // On subsequent route changes
    const handleStart = (url: string) => {
      // Before navigating away, cache the current route
      cacheRouteData(router.asPath)

      // Check if we're navigating to a cached route
      const cachedRoute = cacheManager.get<CachedRouteData>(`route_${url}`)
      if (cachedRoute && Date.now() - cachedRoute.timestamp < 5 * 60 * 1000) {
        // If cached route is less than 5 minutes old, use shorter loading time
        setLoading(true)
        setTimeout(() => setLoading(false), 300)
      } else {
        setLoading(true)
      }
    }

    const handleFinish = (url: string) => {
      setTimeout(() => {
        setLoading(false)
        // Cache the new route
        cacheRouteData(url)
      }, 800)
    }

    // If initial load is complete
    if (router.isReady) {
      handleComplete()
    }

    // Add event listeners for route changes
    router.events.on("routeChangeStart", handleStart)
    router.events.on("routeChangeComplete", handleFinish)
    router.events.on("routeChangeError", handleFinish)

    return () => {
      router.events.off("routeChangeStart", handleStart)
      router.events.off("routeChangeComplete", handleFinish)
      router.events.off("routeChangeError", handleFinish)
    }
  }, [router])

  return (
    <>
      <main className={notoKufiArabic.className}>
        <Head>

              <title> انتِ لها  </title>
        <meta name="title" content="Curl Maker | كيرل ميكر" />
        {/* <meta
          name="description"
          content="كيرل ميكر - منتجات طبيعية وآمنة للعناية بالشعر في فلسطين - نابلس. Curl Maker - Natural and safe hair care products from Nablus, Palestine."
        />
        <meta
          name="keywords"
          content="Curl Maker, كيرل ميكر, منتجات شعر, العناية بالشعر, نابلس, فلسطين, شعر كيرلي, منتجات طبيعية, Hair Products, Nablus, Palestine, Curly Hair"
        /> */}
        </Head>
        <Script
          id="pwa-setup"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/service-worker.js').then(
                    function(registration) {
                      // ServiceWorker registration successful
                    },
                    function(err) {
                      // ServiceWorker registration failed
                    }
                  );
                });
              }
            `,
          }}
        />
          <Analytics />
          <SpeedInsights />
          <NextUIProvider>
            <Adminicon/>
            {/* {loading && <LoadingScreen />} */}
            <Component {...pageProps} />
          </NextUIProvider>
      </main>
    </>
  )
}