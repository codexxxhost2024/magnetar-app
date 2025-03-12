"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  HelpCircle,
  FileText,
  MessageSquare,
  Calendar,
  Map,
  Gift,
  Headphones,
  BarChart,
  Calculator,
  Lightbulb,
  Newspaper,
} from "lucide-react"

interface MoreOption {
  icon: React.ReactNode
  label: string
  href: string
  color: string
}

export default function MorePage() {
  const router = useRouter()

  const moreOptions: MoreOption[] = [
    {
      icon: <HelpCircle className="h-6 w-6" />,
      label: "Help & Support",
      href: "/help",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      label: "Documents",
      href: "/documents",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      label: "Feedback",
      href: "/feedback",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      label: "Events",
      href: "/events",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: <Map className="h-6 w-6" />,
      label: "Find Offices",
      href: "/offices",
      color: "bg-amber-100 text-amber-600",
    },
    {
      icon: <Gift className="h-6 w-6" />,
      label: "Rewards",
      href: "/rewards",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: <Headphones className="h-6 w-6" />,
      label: "Customer Service",
      href: "/customer-service",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: <BarChart className="h-6 w-6" />,
      label: "Analytics",
      href: "/analytics",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      icon: <Calculator className="h-6 w-6" />,
      label: "Commission Calculator",
      href: "/calculator",
      color: "bg-teal-100 text-teal-600",
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      label: "Tips & Tricks",
      href: "/tips",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: <Newspaper className="h-6 w-6" />,
      label: "News & Updates",
      href: "/news",
      color: "bg-orange-100 text-orange-600",
    },
  ]

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">More Options</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        <div className="grid gap-4">
          {moreOptions.map((option, index) => (
            <Card
              key={index}
              className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(option.href)}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className={`${option.color} p-3 rounded-full mr-4`}>{option.icon}</div>
                  <div>
                    <h3 className="font-medium">{option.label}</h3>
                  </div>
                  <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

