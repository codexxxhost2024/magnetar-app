"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, Search, Trophy, Users, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { getGames, type GameItem } from "@/lib/data-service"
import { toast } from "@/hooks/use-toast"

export default function GamesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [games, setGames] = useState<GameItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")

  const categories = ["All", "Strategy", "Memory", "Arcade", "Quiz", "Simulation", "Adventure"]

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true)
        const gamesData = await getGames()
        setGames(gamesData)
      } catch (error) {
        console.error("Error loading games:", error)
        toast({
          title: "Error",
          description: "Failed to load games. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  const filteredGames = games.filter((game) => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = activeCategory === "All" || game.category === activeCategory
    return matchesSearch && matchesCategory
  })

  const handlePlayGame = (game: GameItem) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to play games",
        variant: "destructive",
      })
      return
    }

    // In a real app, this would navigate to the game or launch it
    toast({
      title: "Starting Game",
      description: `${game.name} is launching...`,
    })
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Magnetar Games</h1>
        <Button variant="ghost" size="icon">
          <Trophy className="h-5 w-5" />
        </Button>
      </header>

      <div className="p-4 content-area">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search games..."
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
                <CardContent className="p-0">
                  <div className="h-48 bg-gray-200 animate-pulse" />
                  <div className="p-3">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-1 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse" />
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse" />
                      <div className="h-8 bg-gray-200 rounded w-16 animate-pulse" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {filteredGames.length > 0 ? (
              <div className="grid gap-4">
                {filteredGames.map((game) => (
                  <Card key={game.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                          src={game.image || "/placeholder.svg"}
                          alt={game.name}
                          width={350}
                          height={200}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-primary">{game.category}</Badge>
                        </div>
                      </div>
                      <div className="p-3">
                        <h3 className="font-bold mb-1">{game.name}</h3>
                        <p className="text-sm text-gray-600 mb-2">{game.description}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-xs text-gray-500">
                            <Users className="h-3 w-3 mr-1" />
                            <span className="mr-3">{game.players} players</span>
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{game.duration}</span>
                          </div>
                          <Button size="sm" onClick={() => handlePlayGame(game)}>
                            Play
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">No games found matching your search</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setActiveCategory("All")
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

