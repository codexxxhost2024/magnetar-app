"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Eye,
  EyeOff,
  Grid3X3,
  Briefcase,
  GraduationCap,
  Film,
  ShoppingBag,
  Gamepad2,
  Ticket,
  MoreHorizontal,
  BellIcon as Bullhorn,
  Brain,
  UserPlus,
  LinkIcon,
  Bell,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { ref, onValue, set } from "firebase/database"
import { database } from "@/lib/firebase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface UserData {
  displayName: string
  rank: string
  earnings: {
    total: number
    monthly: number
    weekly: number
  }
  team: {
    size: number
    directRecruits: number
    activeMembers: number
  }
  wallet: {
    currency: string
  }
}

export default function Home() {
  const { user, logout } = useAuth()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(false)
  const [unreadCount, setUnreadCount] = useState(1) // Default to 1 for demonstration

  useEffect(() => {
    if (!user || !database) return

    const userRef = ref(database, `users/${user.uid}`)
    const unsubscribe = onValue(
      userRef,
      async (snapshot) => {
        setLoading(true)
        let data = snapshot.val()

        if (!data) {
          // If user data doesn't exist, create default data
          const defaultUserData: UserData = {
            displayName: user.displayName || "New User",
            rank: "Beginner",
            earnings: {
              total: 0,
              monthly: 0,
              weekly: 0,
            },
            team: {
              size: 0,
              directRecruits: 0,
              activeMembers: 0,
            },
            wallet: {
              currency: "PHP",
            },
          }

          // Set the default data in the database
          await set(userRef, defaultUserData)
          data = defaultUserData
        }

        setUserData(data)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching user data:", error)
        setLoading(false)
      },
    )

    return () => unsubscribe()
  }, [user, database])

  const quickLinks = [
    {
      icon: <Brain className="w-6 h-6 text-text-primary dark:text-text-primary" />,
      label: "Persona",
      href: "/persona",
    },
    { icon: <Grid3X3 className="w-6 h-6 text-text-primary dark:text-text-primary" />, label: "Apps", href: "/apps" },
    {
      icon: <LinkIcon className="w-6 h-6 text-text-primary dark:text-text-primary" />,
      label: "Affiliate",
      href: "/affiliate",
    },
    {
      icon: <UserPlus className="w-6 h-6 text-text-primary dark:text-text-primary" />,
      label: "Refer",
      href: "/refer",
    },
    {
      icon: <Bullhorn className="w-6 h-6 text-text-primary dark:text-text-primary" />,
      label: "Marketer",
      href: "/marketer",
    },
    {
      icon: <Briefcase className="w-6 h-6 text-text-primary dark:text-text-primary" />,
      label: "Finance",
      href: "/finance",
    },
    {
      icon: <GraduationCap className="w-6 h-6 text-text-primary dark:text-text-primary" />,
      label: "Course",
      href: "/course",
    },
    { icon: <Film className="w-6 h-6 text-text-primary dark:text-text-primary" />, label: "Media", href: "/media" },
    {
      icon: <ShoppingBag className="w-6 h-6 text-text-primary dark:text-text-primary" />,
      label: "Shop",
      href: "/shop",
    },
    { icon: <Gamepad2 className="w-6 h-6 text-text-primary dark:text-text-primary" />, label: "Games", href: "/games" },
    {
      icon: <Ticket className="w-6 h-6 text-text-primary dark:text-text-primary" />,
      label: "Lottery",
      href: "/lottery",
    },
    {
      icon: <MoreHorizontal className="w-6 h-6 text-text-primary dark:text-text-primary" />,
      label: "More",
      href: "/more",
    },
  ]

  const recentUsers = [
    { id: "JD", name: "JohnDo", color: "bg-indigo-500", href: "/members/1" },
    { id: "JS", name: "JaneSm", color: "bg-emerald-500", href: "/members/2" },
    { id: "AW", name: "AliceW", color: "bg-red-500", href: "/members/3" },
    { id: "BJ", name: "BobJoh", color: "bg-amber-500", href: "/members/4" },
    { id: "EG", name: "EvaGre", color: "bg-blue-500", href: "/members/5" },
    { id: "M", name: "Mike", color: "bg-purple-500", href: "/members/6" },
  ]

  const handleToggleBalance = () => {
    setShowBalance(!showBalance)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: userData?.wallet?.currency || "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!userData) {
    return <div>Error: Unable to load user data</div>
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="app-header">
        <div className="flex items-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20250127_191600_0000-olcvtnp0FvjK3vgbM0kkXRttTwwZNH.png"
            alt="Magnetar Logo"
            width={40}
            height={40}
            className="mr-2"
          />
          <h1 className="text-xl font-bold">MAGNETAR</h1>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Bell className="w-6 h-6 text-black" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarFallback>{user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
        </div>
      </header>

      <Tabs defaultValue="wallet" className="w-full">
        <TabsList className="w-full flex justify-between bg-white border-b border-divider dark:bg-surface dark:border-divider">
          <TabsTrigger
            value="wallet"
            className="flex-1 py-3 font-medium border-b-2 border-primary data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Wallet
          </TabsTrigger>
          <TabsTrigger
            value="subscribe"
            className="flex-1 py-3 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Subscribe
          </TabsTrigger>
          <TabsTrigger
            value="credit"
            className="flex-1 py-3 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Credit
          </TabsTrigger>
          <TabsTrigger
            value="loans"
            className="flex-1 py-3 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Loans
          </TabsTrigger>
          <TabsTrigger
            value="cards"
            className="flex-1 py-3 font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary"
          >
            Cards
          </TabsTrigger>
        </TabsList>

        <TabsContent value="wallet" className="p-4 content-area">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">{userData?.displayName || user?.displayName || "User"}</h2>
                  <p className="text-text-secondary">{user?.phoneNumber || "09916188909"}</p>
                </div>
                {userData?.rank && (
                  <div className="bg-primary/10 px-3 py-1 rounded-full text-primary text-sm font-medium">
                    {userData.rank}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h3 className="text-4xl font-bold flex items-center">
                  {showBalance ? formatCurrency(userData?.earnings?.total || 0) : "₱•••••"}
                  <button className="ml-auto" onClick={handleToggleBalance}>
                    {showBalance ? (
                      <EyeOff className="w-6 h-6 text-text-secondary" />
                    ) : (
                      <Eye className="w-6 h-6 text-text-secondary" />
                    )}
                  </button>
                </h3>
                <p className="text-text-secondary">Available balance</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Link href="/cash-in" className="btn-primary hover-scale text-center">
                  Cash In
                </Link>
                <Link href="/transfer" className="btn-primary hover-scale text-center">
                  Transfer
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {quickLinks.map((link, index) => (
              <Link
                href={link.href}
                key={index}
                className="flex flex-col items-center justify-center bg-white rounded-lg p-3 shadow-sm border border-divider dark:bg-surface dark:border-divider hover-scale hover-shadow"
              >
                <div className="bg-surface rounded-lg p-3 mb-2 dark:bg-[#2A2A2A]">{link.icon}</div>
                <span className="text-xs text-center text-text-secondary">{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold mb-4">Recent Users</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2 hide-scrollbar">
              {recentUsers.map((user) => (
                <Link href={user.href} key={user.id} className="flex flex-col items-center hover-scale">
                  <div
                    className={`${user.color} w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold mb-1`}
                  >
                    {user.id}
                  </div>
                  <span className="text-xs text-text-secondary">{user.name}</span>
                </Link>
              ))}
            </div>
          </div>

          {userData?.team && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-bold mb-3">Team Overview</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-surface dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-sm text-text-secondary mb-1">Team Size</p>
                    <p className="text-xl font-bold">{userData.team.size}</p>
                  </div>
                  <div className="bg-surface dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-sm text-text-secondary mb-1">Direct</p>
                    <p className="text-xl font-bold">{userData.team.directRecruits}</p>
                  </div>
                  <div className="bg-surface dark:bg-gray-800 p-3 rounded-lg text-center">
                    <p className="text-sm text-text-secondary mb-1">Active</p>
                    <p className="text-xl font-bold">{userData.team.activeMembers}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  View Team Details
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subscribe" className="p-4 content-area">
          <div className="text-center py-10">
            <h3 className="text-xl font-bold mb-2">Subscription Services</h3>
            <p className="text-text-secondary mb-6">Unlock premium features with our subscription plans</p>
            <Button>View Subscription Plans</Button>
          </div>
        </TabsContent>

        <TabsContent value="credit" className="p-4 content-area">
          <div className="text-center py-10">
            <h3 className="text-xl font-bold mb-2">Credit Services</h3>
            <p className="text-text-secondary mb-6">Access credit facilities to grow your business</p>
            <Button>Apply for Credit</Button>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="p-4 content-area">
          <div className="text-center py-10">
            <h3 className="text-xl font-bold mb-2">Loan Services</h3>
            <p className="text-text-secondary mb-6">Quick and easy loans for your business needs</p>
            <Button>Apply for Loan</Button>
          </div>
        </TabsContent>

        <TabsContent value="cards" className="p-4 content-area">
          <div className="text-center py-10">
            <h3 className="text-xl font-bold mb-2">Card Services</h3>
            <p className="text-text-secondary mb-6">Manage your cards and payment methods</p>
            <Button>View Cards</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

