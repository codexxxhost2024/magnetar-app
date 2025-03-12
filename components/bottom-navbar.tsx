"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Globe, BookOpen, Settings, Users } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function BottomNavbar() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Don't show navbar on public routes or splash/onboarding pages
  if (!user || pathname === "/" || pathname === "/onboarding" || pathname === "/login" || pathname === "/signup") {
    return null
  }

  const isActive = (path: string) => {
    return pathname === path
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-divider flex justify-around items-center h-16 z-50 dark:bg-surface dark:border-divider">
      <Link href="/social" className={`nav-icon ${isActive("/social") ? "active" : ""}`}>
        <Globe size={24} />
        <span className="text-xs mt-1">Social</span>
      </Link>

      <Link href="/course" className={`nav-icon ${isActive("/course") ? "active" : ""}`}>
        <BookOpen size={24} />
        <span className="text-xs mt-1">Course</span>
      </Link>

      <Link href="/home" className="relative flex items-center justify-center">
        <div className="logo-circle absolute -top-7">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20250127_191600_0000-olcvtnp0FvjK3vgbM0kkXRttTwwZNH.png"
            alt="Magnetar Logo"
            width={55}
            height={55}
            className="object-cover"
          />
        </div>
        <div className="h-6"></div>
      </Link>

      <Link href="/members" className={`nav-icon ${isActive("/members") ? "active" : ""}`}>
        <Users size={24} />
        <span className="text-xs mt-1">Members</span>
      </Link>

      <Link href="/settings" className={`nav-icon ${isActive("/settings") ? "active" : ""}`}>
        <Settings size={24} />
        <span className="text-xs mt-1">Settings</span>
      </Link>
    </div>
  )
}

