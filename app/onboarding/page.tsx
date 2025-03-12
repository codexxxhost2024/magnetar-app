"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export default function OnboardingPage() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [fadeIn, setFadeIn] = useState(true)

  const slides = [
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file-QZ2tP2W84iPZsQNhhrvu6T-wIwRjKViC2SOJwgkbTpIU7qRUFduwi.webp",
      title: "Welcome to Magnetar",
      description: "Your path to financial freedom starts here",
    },
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file-4Z1y2waBxsefmG8Ft3adw8-HzW0V2MOt7iT6SR9E3qTODYZstWGeM.webp",
      title: "Grow Your Network",
      description: "Build and lead successful teams",
    },
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot_20250308_104408_ChatGPT.jpg-AMl0k9qbzoyC9sFd34AHvQ87cWcvbO.jpeg",
      title: "Learn and Earn",
      description: "Master proven strategies for success",
    },
    {
      image:
        "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/file-PhTMzy5mgc7t1G3v8jAFCX-2FdZDmTHSINiPbatHwdvcyBUzgKeAW.webp",
      title: "Track Your Progress",
      description: "Watch your success grow exponentially",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeIn(false)
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setFadeIn(true)
      }, 500)
    }, 5000)

    return () => clearInterval(interval)
  }, [slides.length])

  const handleGetStarted = () => {
    router.push("/signup")
  }

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background Image */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
        <Image
          src={slides[currentSlide].image || "/placeholder.svg"}
          alt={slides[currentSlide].title}
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay with more opacity at the bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30" />
      </div>

      {/* Content Container */}
      <div className="absolute bottom-0 left-0 right-0 p-8 pb-32">
        <div className={`transition-opacity duration-500 ${fadeIn ? "opacity-100" : "opacity-0"}`}>
          <h2 className="text-white text-4xl font-bold mb-3">{slides[currentSlide].title}</h2>
          <p className="text-white/90 text-xl">{slides[currentSlide].description}</p>
        </div>
      </div>

      {/* Button Container */}
      <div className="absolute bottom-[50px] left-0 right-0 flex justify-center px-8">
        <Button
          onClick={handleGetStarted}
          className="w-full bg-primary hover:bg-primary/90 text-white py-6 rounded-lg text-lg font-medium"
        >
          Get Started
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              currentSlide === index ? "w-8 bg-primary" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}

