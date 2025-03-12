"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  Search,
  Users,
  Database,
  Calendar,
  Mail,
  Layout,
  BarChart,
  FileText,
  UserPlus,
  Star,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { getMarketingTools, type MarketingTool } from "@/lib/data-service"
import { toast } from "@/hooks/use-toast"

// Helper function to get icon component based on icon name
const getIconComponent = (iconName: string) => {
  const icons = {
    Users: <Users className="h-6 w-6 text-blue-600" />,
    Database: <Database className="h-6 w-6 text-green-600" />,
    Calendar: <Calendar className="h-6 w-6 text-purple-600" />,
    Mail: <Mail className="h-6 w-6 text-red-600" />,
    Layout: <Layout className="h-6 w-6 text-amber-600" />,
    BarChart: <BarChart className="h-6 w-6 text-indigo-600" />,
    FileText: <FileText className="h-6 w-6 text-cyan-600" />,
    UserPlus: <UserPlus className="h-6 w-6 text-pink-600" />,
  }

  return icons[iconName as keyof typeof icons] || <FileText className="h-6 w-6 text-gray-600" />
}

export default function MarketerPage() {
  const router = useRouter()
  const { user, customUserData } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")
  const [marketingTools, setMarketingTools] = useState<MarketingTool[]>([])
  const [loading, setLoading] = useState(true)

  const categories = [
    "All",
    "Lead Generation",
    "Data Collection",
    "Social Media",
    "Email Marketing",
    "Web Tools",
    "Analytics",
    "Content",
  ]

  const handleToolClick = (tool: MarketingTool) => {
    if (tool.isPremium && customUserData?.isPremium !== true) {
      toast({
        title: "Premium Feature",
        description: "This tool requires a premium subscription",
        variant: "destructive",
      })
      return
    }

    router.push(`/marketer/${tool.id}`)
  }

  useEffect(() => {
    async function loadTools() {
      try {
        setLoading(true)
        const tools = await getMarketingTools()
        setMarketingTools(tools)
      } catch (error) {
        console.error("Error loading marketing tools:", error)
        toast({
          title: "Error",
          description: "Failed to load marketing tools. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadTools()
  }, [])

  const filteredTools = marketingTools.filter((tool) => {
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "All" || tool.category === activeCategory

    return matchesSearch && matchesCategory
  })

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Marketer Tools</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search marketing tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 hide-scrollbar">
          {categories.map((category, index) => (
            <Badge
              key={index}
              variant={category === activeCategory ? "default" : "outline"}
              className="whitespace-nowrap cursor-pointer transition-all hover:scale-105"
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <div className="bg-gray-200 p-3 rounded-lg mr-4 w-12 h-12 animate-pulse" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-full mb-3 animate-pulse" />
                      <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredTools.length > 0 ? (
              <div className="grid gap-4">
                {filteredTools.map((tool) => (
                  <Card key={tool.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start">
                        <div className="bg-gray-100 p-3 rounded-lg mr-4">{getIconComponent(tool.iconName)}</div>
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="font-bold">{tool.name}</h3>
                            {tool.isPremium && (
                              <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-0">
                                <Star className="h-3 w-3 mr-1 fill-amber-500" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{tool.description}</p>
                          <Button
                            size="sm"
                            variant={tool.isPremium ? "outline" : "default"}
                            onClick={() => handleToolClick(tool)}
                            className={tool.isPremium ? "border-primary text-primary hover:bg-primary/10" : ""}
                          >
                            {tool.isPremium ? "Upgrade to Access" : "Open Tool"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <Search className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <h3 className="text-lg font-medium mb-1">No tools found</h3>
                <p className="text-gray-500">Try adjusting your search or filter</p>
              </div>
            )}
          </>
        )}

        <div className="mt-6 p-4 bg-primary/10 rounded-lg">
          <h3 className="font-bold mb-2">Marketer Pro Subscription</h3>
          <p className="text-sm text-gray-600 mb-3">
            Unlock all premium marketing tools and features with our Marketer Pro subscription.
          </p>
          <Button className="w-full" onClick={() => router.push("/subscription")}>
            Upgrade to Pro
          </Button>
        </div>
      </div>
    </div>
  )
}

