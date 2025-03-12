"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Download, Star, ExternalLink } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { getApps, installApp, type AppItem } from "@/lib/data-service"
import { toast } from "@/hooks/use-toast"

export default function AppsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [apps, setApps] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [installing, setInstalling] = useState<string | null>(null)

  const categories = ["All", "Business", "Finance", "Education", "Social", "Lifestyle"]

  useEffect(() => {
    async function loadApps() {
      if (!user) return

      try {
        setLoading(true)
        const appsData = await getApps(user.uid)
        setApps(appsData)
      } catch (error) {
        console.error("Error loading apps:", error)
        toast({
          title: "Error",
          description: "Failed to load apps. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadApps()
  }, [user])

  const filteredApps = activeCategory === "All" ? apps : apps.filter((app) => app.category === activeCategory)

  const handleInstall = async (app: AppItem) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to install apps",
        variant: "destructive",
      })
      return
    }

    try {
      setInstalling(app.id)
      const success = await installApp(user.uid, app.id)

      if (success) {
        // Update local state
        setApps(apps.map((a) => (a.id === app.id ? { ...a, installed: true } : a)))

        toast({
          title: "Success",
          description: `${app.name} has been installed successfully!`,
        })
      } else {
        throw new Error("Failed to install app")
      }
    } catch (error) {
      console.error("Error installing app:", error)
      toast({
        title: "Installation Failed",
        description: "There was a problem installing the app. Please try again.",
        variant: "destructive",
      })
    } finally {
      setInstalling(null)
    }
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Magnetar Apps</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 hide-scrollbar">
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={category === activeCategory ? "default" : "outline"}
              className="whitespace-nowrap"
              size="sm"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                      <div className="flex items-center mb-2">
                        <div className="h-4 bg-gray-200 rounded w-16 mr-3 animate-pulse" />
                        <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-full animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredApps.length > 0 ? (
              <div className="grid gap-4">
                {filteredApps.map((app) => (
                  <Card key={app.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <Image
                          src={app.icon || "/placeholder.svg"}
                          alt={app.name}
                          width={80}
                          height={80}
                          className="rounded-xl"
                        />
                        <div className="flex-1">
                          <h3 className="font-bold">{app.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{app.description}</p>
                          <div className="flex items-center text-sm text-gray-500 mb-2">
                            <div className="flex items-center mr-3">
                              <Star className="h-4 w-4 text-yellow-500 mr-1 fill-yellow-500" />
                              <span>{app.rating}</span>
                            </div>
                            <div className="flex items-center">
                              <Download className="h-4 w-4 mr-1" />
                              <span>{app.downloads}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => handleInstall(app)}
                            disabled={installing === app.id || app.installed}
                          >
                            {installing === app.id ? "Installing..." : app.installed ? "Installed" : "Install"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No apps found in this category</p>
                <Button variant="outline" onClick={() => setActiveCategory("All")}>
                  View All Apps
                </Button>
              </div>
            )}
          </>
        )}

        <div className="mt-6 text-center">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.open("https://magnetar.com/apps", "_blank")}
          >
            <ExternalLink className="h-4 w-4" />
            View All Apps
          </Button>
        </div>
      </div>
    </div>
  )
}

