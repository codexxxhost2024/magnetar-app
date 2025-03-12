"use client"

import type React from "react"
import { Roboto } from "next/font/google"
import "./globals.css"
import BottomNavbar from "@/components/bottom-navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import RouteGuard from "@/components/route-guard"
import { useEffect, useState } from "react"
import * as serviceWorker from "./sw"
import { usePathname } from "next/navigation"
import { initializeDatabase } from "@/lib/database-init"
import { requestNotificationPermission } from "@/lib/permissions"
import { database } from "@/lib/firebase"

const roboto = Roboto({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
})

function ServiceWorkerRegistration() {
  useEffect(() => {
    serviceWorker.register()

    // Only request notification permissions on load
    // Other permissions will be requested when needed
    const setupNotifications = async () => {
      try {
        await requestNotificationPermission()
      } catch (error) {
        console.log("Notification permission not granted:", error)
      }
    }

    setupNotifications()

    return () => {
      serviceWorker.unregister()
    }
  }, [])

  return null
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isFullScreenPage = pathname === "/" || pathname === "/onboarding"
  const [dbInitialized, setDbInitialized] = useState(false)

  useEffect(() => {
    // Initialize Firebase database with default data if needed
    const setupDatabase = async () => {
      try {
        // Check if Firebase is properly configured before initializing
        if (typeof window !== "undefined" && window.localStorage) {
          // Check for Firebase configuration error
          const firebaseError = localStorage.getItem("firebaseError")
          if (firebaseError) {
            console.warn("Firebase initialization skipped due to previous errors")
            setDbInitialized(true)
            return
          }
        }

        // Check if database is available
        if (!database) {
          console.warn("Database is not available, skipping initialization")
          setDbInitialized(true)
          return
        }

        // Initialize Firebase database structure only
        await initializeDatabase()
        setDbInitialized(true)
        console.log("Firebase database initialization completed")
      } catch (error) {
        console.error("Error during database initialization:", error)
        // Store error in localStorage to prevent repeated attempts
        if (typeof window !== "undefined" && window.localStorage) {
          localStorage.setItem("firebaseError", "true")
        }
        // Still set as initialized to not block the app
        setDbInitialized(true)
      }
    }

    setupDatabase()

    // Register for push notifications if supported
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then((registration) => {
        // Check if we already have a subscription
        registration.pushManager.getSubscription().then((subscription) => {
          if (!subscription) {
            // We'll request notification permission when needed
            console.log("No push subscription found")
          }
        })
      })
    }
  }, [])

  // Show loading until database is initialized
  if (!dbInitialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="ml-3 text-gray-600">Initializing app...</p>
      </div>
    )
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${roboto.className} bg-background ${isFullScreenPage ? "overflow-hidden" : "min-h-screen"}`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <RouteGuard>
              <main className={isFullScreenPage ? "" : "pt-0 pb-16"}>{children}</main>
              <BottomNavbar />
              <ServiceWorkerRegistration />
            </RouteGuard>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

