"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Copy, Share2, TrendingUp, Users, DollarSign, Link } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"

export default function AffiliatePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  const affiliateLink = `https://social.magnetarstore.com/home?ref=${user?.uid || "user123"}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(affiliateLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Magnetar",
          text: "Join me on Magnetar and start your journey to financial freedom!",
          url: affiliateLink,
        })
      } catch (error) {
        console.error("Error sharing:", error)
      }
    } else {
      handleCopyLink()
    }
  }

  const affiliateStats = [
    { label: "Clicks", value: 245, icon: <Link className="h-5 w-5 text-blue-600" />, change: "+12%" },
    { label: "Signups", value: 32, icon: <Users className="h-5 w-5 text-green-600" />, change: "+8%" },
    { label: "Earnings", value: "₱12,450", icon: <DollarSign className="h-5 w-5 text-purple-600" />, change: "+15%" },
  ]

  const recentReferrals = [
    { name: "John D.", date: "Mar 8, 2025", status: "Active", commission: "₱1,200" },
    { name: "Maria L.", date: "Mar 7, 2025", status: "Active", commission: "₱950" },
    { name: "Robert S.", date: "Mar 5, 2025", status: "Pending", commission: "₱0" },
    { name: "Sarah K.", date: "Mar 3, 2025", status: "Active", commission: "₱1,500" },
    { name: "Michael P.", date: "Feb 28, 2025", status: "Inactive", commission: "₱750" },
  ]

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Affiliate Program</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Your Affiliate Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-2 rounded-lg flex-1 overflow-hidden text-ellipsis whitespace-nowrap mr-2">
                {affiliateLink}
              </div>
              <Button size="icon" variant="outline" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {copied && <div className="text-center text-sm text-green-600 mb-4">Link copied to clipboard!</div>}
            <Button className="w-full gap-2" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
              Share Your Link
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {affiliateStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-3 flex flex-col items-center">
                <div className="bg-gray-100 p-2 rounded-full mb-2">{stat.icon}</div>
                <div className="text-center">
                  <p className="text-lg font-bold">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-xs text-green-600 flex items-center justify-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="referrals" className="mb-6">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
            <TabsTrigger value="commissions">Commissions</TabsTrigger>
          </TabsList>

          <TabsContent value="referrals">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Recent Referrals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReferrals.map((referral, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{referral.name}</p>
                        <p className="text-xs text-gray-500">{referral.date}</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            referral.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : referral.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {referral.status}
                        </span>
                        <p className="text-sm font-medium mt-1">{referral.commission}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Referrals
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commissions">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Commission Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Earned:</span>
                    <span className="font-bold">₱12,450</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Pending:</span>
                    <span className="font-bold">₱2,300</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Available for Withdrawal:</span>
                    <span className="font-bold">₱8,150</span>
                  </div>
                  <div className="border-t pt-4 mt-4">
                    <Button className="w-full">Withdraw Commissions</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Affiliate Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                Marketing Materials
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Promotional Banners
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Email Templates
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                Affiliate FAQ
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

