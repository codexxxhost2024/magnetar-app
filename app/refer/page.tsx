"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Share2, Copy, Users, Gift, Award } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import Image from "next/image"

export default function ReferPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)
  const [email, setEmail] = useState("")

  const referralCode = `MAG${user?.uid?.substring(0, 6) || "123456"}`

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Magnetar",
          text: `Use my referral code ${referralCode} to join Magnetar and start your journey to financial freedom!`,
          url: `https://magnetar.com/join?code=${referralCode}`,
        })
      } catch (error) {
        console.error("Error sharing:", error)
        // Fallback to copy if sharing fails
        handleCopyCode()
        alert("Sharing failed. Link copied to clipboard instead!")
      }
    } else {
      // Fallback for browsers that don't support the Web Share API
      handleCopyCode()
      alert("Sharing not supported on this device. Link copied to clipboard instead!")
    }
  }

  const handleSendInvite = () => {
    if (!email) return

    // Simulate sending invitation
    alert(`Invitation sent to ${email}`)
    setEmail("")
  }

  const rewards = [
    { level: "Bronze", requirement: "1 referral", reward: "₱500 bonus" },
    { level: "Silver", requirement: "5 referrals", reward: "₱3,000 bonus" },
    { level: "Gold", requirement: "10 referrals", reward: "₱7,500 bonus" },
    { level: "Platinum", requirement: "25 referrals", reward: "₱20,000 bonus" },
    { level: "Diamond", requirement: "50 referrals", reward: "₱50,000 bonus + Luxury Trip" },
  ]

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Refer & Earn</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        <div className="bg-primary/10 p-6 rounded-lg mb-6 text-center">
          <Image
            src="/placeholder.svg?height=120&width=120"
            alt="Refer friends"
            width={120}
            height={120}
            className="mx-auto mb-4"
          />
          <h2 className="text-xl font-bold mb-2">Invite Friends & Earn Rewards</h2>
          <p className="text-gray-600 mb-4">Earn up to ₱2,000 for each friend who joins and activates their account</p>

          <div className="bg-white p-3 rounded-lg flex items-center justify-between mb-4">
            <div className="font-bold text-lg">{referralCode}</div>
            <Button size="sm" variant="outline" onClick={handleCopyCode}>
              <Copy className="h-4 w-4 mr-1" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <Button className="w-full gap-2" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
            Share Referral Code
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Invite via Email</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="friend@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleSendInvite}>Send</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Your Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6">
              <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl font-bold">3</span>
              </div>
              <p className="text-gray-500 mb-4">You've referred 3 friends so far</p>
              <Button variant="outline" onClick={() => router.push("/affiliate")}>
                View Referral Details
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center">
              <Gift className="h-5 w-5 mr-2 text-primary" />
              Referral Rewards
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewards.map((reward, index) => (
                <div key={index} className="flex items-center">
                  <div className="mr-3">
                    <Award
                      className={`h-6 w-6 ${
                        index === 0
                          ? "text-yellow-600"
                          : index === 1
                            ? "text-gray-400"
                            : index === 2
                              ? "text-yellow-500"
                              : index === 3
                                ? "text-purple-500"
                                : "text-blue-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{reward.level}</p>
                    <p className="text-xs text-gray-500">{reward.requirement}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{reward.reward}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

