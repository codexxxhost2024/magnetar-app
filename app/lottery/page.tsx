"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Ticket, Gift, TrendingUp } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getLotteryDraws, buyLotteryTicket, type LotteryDraw } from "@/lib/data-service"
import { toast } from "@/hooks/use-toast"

export default function LotteryPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [tickets, setTickets] = useState(5)
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [pastDraws, setPastDraws] = useState<LotteryDraw[]>([])
  const [loading, setLoading] = useState(true)
  const [buyingTicket, setBuyingTicket] = useState(false)

  // Set next draw date to 7 days from now
  const nextDrawDate = new Date()
  nextDrawDate.setDate(nextDrawDate.getDate() + 7)

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const difference = nextDrawDate.getTime() - now.getTime()

      if (difference <= 0) {
        clearInterval(timer)
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds })
    }, 1000)

    return () => clearInterval(timer)
  }, [nextDrawDate])

  useEffect(() => {
    async function loadDraws() {
      try {
        setLoading(true)
        const draws = await getLotteryDraws()
        setPastDraws(draws)
      } catch (error) {
        console.error("Error loading lottery draws:", error)
        toast({
          title: "Error",
          description: "Failed to load lottery data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadDraws()
  }, [])

  const handleNumberSelect = (number: number) => {
    if (selectedNumbers.includes(number)) {
      setSelectedNumbers(selectedNumbers.filter((n) => n !== number))
    } else {
      if (selectedNumbers.length < 6) {
        setSelectedNumbers([...selectedNumbers, number])
      }
    }
  }

  const handleQuickPick = () => {
    const numbers: number[] = []
    while (numbers.length < 6) {
      const randomNumber = Math.floor(Math.random() * 49) + 1
      if (!numbers.includes(randomNumber)) {
        numbers.push(randomNumber)
      }
    }
    setSelectedNumbers(numbers)
  }

  const handleBuyTicket = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to buy lottery tickets",
        variant: "destructive",
      })
      return
    }

    if (selectedNumbers.length !== 6) {
      toast({
        title: "Incomplete Selection",
        description: "Please select 6 numbers",
        variant: "destructive",
      })
      return
    }

    try {
      setBuyingTicket(true)
      const success = await buyLotteryTicket(user.uid, selectedNumbers, 50)

      if (success) {
        setTickets((prev) => prev + 1)
        setSelectedNumbers([])
        toast({
          title: "Ticket Purchased",
          description: "Your lottery ticket has been purchased successfully!",
        })
      } else {
        throw new Error("Failed to buy ticket")
      }
    } catch (error) {
      console.error("Error buying ticket:", error)
      toast({
        title: "Purchase Failed",
        description: "There was a problem buying your ticket. Please try again.",
        variant: "destructive",
      })
    } finally {
      setBuyingTicket(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Magnetar Lottery</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        <Card className="mb-6 bg-gradient-to-r from-primary/20 to-primary/5">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-bold">Current Jackpot</h2>
                <p className="text-sm text-gray-600">Next draw: {nextDrawDate.toLocaleDateString()}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">{formatCurrency(10000000)}</p>
                <p className="text-xs text-green-600 flex items-center justify-end">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +₱500,000 since last draw
                </p>
              </div>
            </div>

            <div className="bg-white/80 rounded-lg p-3 mb-4">
              <h3 className="text-center font-medium mb-2">Next Draw In</h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-primary/10 rounded-lg p-2">
                  <p className="text-xl font-bold">{timeLeft.days}</p>
                  <p className="text-xs">Days</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-2">
                  <p className="text-xl font-bold">{timeLeft.hours}</p>
                  <p className="text-xs">Hours</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-2">
                  <p className="text-xl font-bold">{timeLeft.minutes}</p>
                  <p className="text-xs">Minutes</p>
                </div>
                <div className="bg-primary/10 rounded-lg p-2">
                  <p className="text-xl font-bold">{timeLeft.seconds}</p>
                  <p className="text-xs">Seconds</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Ticket className="h-5 w-5 mr-2 text-primary" />
                <span>
                  Your Tickets: <strong>{tickets}</strong>
                </span>
              </div>
              <Button size="sm" onClick={() => router.push("/lottery/tickets")}>
                View My Tickets
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="play" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="play">Play</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
            <TabsTrigger value="prizes">Prizes</TabsTrigger>
          </TabsList>

          <TabsContent value="play">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Select 6 Numbers (1-49)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {Array.from({ length: 49 }, (_, i) => i + 1).map((number) => (
                    <Button
                      key={number}
                      variant={selectedNumbers.includes(number) ? "default" : "outline"}
                      className="h-10 w-10 p-0 rounded-full"
                      onClick={() => handleNumberSelect(number)}
                    >
                      {number}
                    </Button>
                  ))}
                </div>

                <div className="flex justify-between items-center mb-4">
                  <p className="text-sm">Selected: {selectedNumbers.sort((a, b) => a - b).join(", ")}</p>
                  <Button variant="outline" size="sm" onClick={handleQuickPick}>
                    Quick Pick
                  </Button>
                </div>

                <Button
                  className="w-full"
                  disabled={selectedNumbers.length !== 6 || buyingTicket}
                  onClick={handleBuyTicket}
                >
                  {buyingTicket ? "Processing..." : "Buy Ticket (₱50)"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Past Draw Results</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((_, index) => (
                      <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                        </div>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5, 6].map((_, idx) => (
                            <div key={idx} className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastDraws.map((draw, index) => (
                      <div key={index} className="border-b pb-3 last:border-0 last:pb-0">
                        <div className="flex justify-between items-center mb-2">
                          <p className="font-medium">{draw.date}</p>
                          <p className="text-sm font-bold">{draw.jackpot}</p>
                        </div>
                        <div className="flex gap-2">
                          {draw.numbers.map((number, idx) => (
                            <div
                              key={idx}
                              className="bg-primary/10 rounded-full h-8 w-8 flex items-center justify-center text-sm font-medium"
                            >
                              {number}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button variant="outline" className="w-full mt-4">
                  View All Results
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="prizes">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Prize Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-yellow-100 p-2 rounded-full mr-2">
                        <Gift className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Jackpot (6 numbers)</p>
                        <p className="text-xs text-gray-500">Odds: 1 in 13,983,816</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatCurrency(10000000)}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full mr-2">
                        <Gift className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Match 5</p>
                        <p className="text-xs text-gray-500">Odds: 1 in 55,491</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatCurrency(50000)}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full mr-2">
                        <Gift className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Match 4</p>
                        <p className="text-xs text-gray-500">Odds: 1 in 1,033</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatCurrency(5000)}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full mr-2">
                        <Gift className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">Match 3</p>
                        <p className="text-xs text-gray-500">Odds: 1 in 57</p>
                      </div>
                    </div>
                    <p className="font-bold">{formatCurrency(500)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

