"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Play, Clock, Search, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { VideoUploadDialog } from "@/components/video-upload-dialog"

interface MediaItem {
  id: string
  title: string
  thumbnail: string
  duration: string
  category: string
  date: string
  views: number
}

export default function MediaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [videoUploadOpen, setVideoUploadOpen] = useState(false)

  const mediaItems: MediaItem[] = [
    {
      id: "1",
      title: "Magnetar Product Showcase 2025",
      thumbnail: "/placeholder.svg?height=200&width=350",
      duration: "12:45",
      category: "Products",
      date: "Mar 8, 2025",
      views: 1245,
    },
    {
      id: "2",
      title: "Success Story: Diamond Rank Achievement",
      thumbnail: "/placeholder.svg?height=200&width=350",
      duration: "18:30",
      category: "Success Stories",
      date: "Mar 5, 2025",
      views: 3567,
    },
    {
      id: "3",
      title: "Effective Recruitment Strategies",
      thumbnail: "/placeholder.svg?height=200&width=350",
      duration: "24:15",
      category: "Training",
      date: "Mar 2, 2025",
      views: 2890,
    },
    {
      id: "4",
      title: "Magnetar Annual Convention Highlights",
      thumbnail: "/placeholder.svg?height=200&width=350",
      duration: "32:10",
      category: "Events",
      date: "Feb 28, 2025",
      views: 5432,
    },
    {
      id: "5",
      title: "Social Media Marketing for MLM",
      thumbnail: "/placeholder.svg?height=200&width=350",
      duration: "15:45",
      category: "Training",
      date: "Feb 25, 2025",
      views: 1876,
    },
    {
      id: "6",
      title: "CEO Interview: Vision for 2025",
      thumbnail: "/placeholder.svg?height=200&width=350",
      duration: "28:20",
      category: "Corporate",
      date: "Feb 20, 2025",
      views: 4321,
    },
  ]

  const categories = ["All", "Products", "Training", "Success Stories", "Events", "Corporate"]

  const filteredMedia = mediaItems.filter((item) => item.title.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Media Center</h1>
        <Button variant="ghost" size="icon" onClick={() => setVideoUploadOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="p-4 content-area">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex overflow-x-auto pb-2 mb-4 gap-2 hide-scrollbar">
          {categories.map((category, index) => (
            <Badge
              key={index}
              variant={index === 0 ? "default" : "outline"}
              className="whitespace-nowrap cursor-pointer transition-all hover:scale-105"
            >
              {category}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="videos" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="podcasts">Podcasts</TabsTrigger>
            <TabsTrigger value="presentations">Presentations</TabsTrigger>
          </TabsList>

          <TabsContent value="videos">
            <div className="grid gap-4">
              {filteredMedia.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <Image
                        src={item.thumbnail || "/placeholder.svg"}
                        alt={item.title}
                        width={350}
                        height={200}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="rounded-full bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 transition-transform duration-300 hover:scale-110"
                        >
                          <Play className="h-6 w-6 text-primary" />
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                        {item.duration}
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold mb-1">{item.title}</h3>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center">
                          <Badge variant="outline" className="mr-2">
                            {item.category}
                          </Badge>
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{item.views} views</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="podcasts">
            <div className="text-center py-10">
              <h3 className="text-xl font-bold mb-2">Podcasts Coming Soon</h3>
              <p className="text-gray-500 mb-6">We're working on bringing you the best audio content</p>
              <Button>Get Notified</Button>
            </div>
          </TabsContent>

          <TabsContent value="presentations">
            <div className="text-center py-10">
              <h3 className="text-xl font-bold mb-2">Presentations</h3>
              <p className="text-gray-500 mb-6">Access our collection of business presentations</p>
              <Button>Browse Presentations</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <VideoUploadDialog open={videoUploadOpen} onOpenChange={setVideoUploadOpen} type="social" />
    </div>
  )
}

