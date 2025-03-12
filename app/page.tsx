"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function SplashScreen() {
  const router = useRouter()
  const [opacity, setOpacity] = useState(0)

  useEffect(() => {
    // Fade in animation
    setOpacity(1)

    // Redirect to onboarding after 3 seconds
    const timer = setTimeout(() => {
      setOpacity(0) // Fade out
      setTimeout(() => {
        router.push("/onboarding")
      }, 500) // Wait for fade out animation to complete
    }, 3000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#121212] z-50">
      <div className="transition-opacity duration-500 ease-in-out flex flex-col items-center" style={{ opacity }}>
        <div className="animate-pulse">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20250127_191600_0000-olcvtnp0FvjK3vgbM0kkXRttTwwZNH.png"
            alt="Magnetar Logo"
            width={150}
            height={150}
            className="mb-4"
            priority
          />
        </div>
        <h1 className="text-3xl font-bold text-primary mt-4">MAGNETAR</h1>
      </div>
    </div>
  )
}

