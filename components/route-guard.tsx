"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

// Public routes that don't require authentication
const publicRoutes = ["/", "/onboarding", "/login", "/signup", "/reset-password"]

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    // Authentication logic
    if (!loading) {
      // Check if route requires authentication
      const requiresAuth = !publicRoutes.includes(pathname)

      if (requiresAuth && !user) {
        // Not logged in, redirect to login
        console.log("User not authenticated, redirecting to login")
        router.push("/login")
      } else if (user && (pathname === "/" || pathname === "/onboarding")) {
        // Logged in user trying to access splash or onboarding, redirect to home
        router.push("/home")
      } else {
        setAuthorized(true)
      }
    }
  }, [user, loading, pathname, router])

  // Show loading or children based on authorization state
  return loading || !authorized ? (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  ) : (
    children
  )
}

