"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface HeaderProps {
  title: string
  showBack?: boolean
  showNotifications?: boolean
}

export default function Header({ title, showBack = false, showNotifications = true }: HeaderProps) {
  const router = useRouter()

  return (
    <header className="app-header">
      {showBack && (
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="w-9"></div>
    </header>
  )
}

