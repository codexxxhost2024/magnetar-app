"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { Bell, CheckCircle, CreditCard, MessageCircle, Trophy, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/contexts/auth-context"
import { getUserNotifications, markNotificationAsRead } from "@/lib/notification-service"
import Header from "@/components/header"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "system" | "social" | "team" | "financial" | "achievement"
  read: boolean
  data?: any
  timestamp: any
}

export default function NotificationsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    async function fetchNotifications() {
      try {
        const userNotifications = await getUserNotifications(user.uid)
        setNotifications(userNotifications)
      } catch (error) {
        console.error("Error fetching notifications:", error)
        toast({
          title: "Error",
          description: "Failed to load notifications. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [user, router, toast])

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await markNotificationAsRead(notification.id, user!.uid)

        // Update local state
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n)))

        // Handle navigation based on notification type if needed
        if (notification.data?.link) {
          router.push(notification.data.link)
        }
      } catch (error) {
        console.error("Error marking notification as read:", error)
      }
    } else if (notification.data?.link) {
      router.push(notification.data.link)
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    return notification.type === activeTab
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "system":
        return <Bell className="h-5 w-5 text-blue-500" />
      case "social":
        return <MessageCircle className="h-5 w-5 text-purple-500" />
      case "team":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "financial":
        return <CreditCard className="h-5 w-5 text-yellow-500" />
      case "achievement":
        return <Trophy className="h-5 w-5 text-orange-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Unknown time"

    try {
      // Handle Firebase server timestamp
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return format(date, "MMM d, yyyy 'at' h:mm a")
    } catch (error) {
      console.error("Error formatting timestamp:", error)
      return "Invalid date"
    }
  }

  return (
    <div className="pb-20 pt-16">
      <Header title="Notifications" showBack={true} showNotifications={false} />

      <div className="p-4">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="financial">Finance</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors ${notification.read ? "bg-background" : "bg-muted/30"}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className={`font-medium ${notification.read ? "" : "font-semibold"}`}>
                              {notification.title}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(notification.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-8">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg">No notifications</h3>
                <p className="text-muted-foreground mt-1">You don't have any notifications yet.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

