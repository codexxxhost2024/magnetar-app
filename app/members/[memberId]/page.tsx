"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Users,
  DollarSign,
  Calendar,
  Award,
  TrendingUp,
  MessageCircle,
} from "lucide-react"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"
import { ChatDialog } from "@/components/chat-dialog"

interface Member {
  id: string
  name: string
  avatar?: string
  initials: string
  rank: string
  phone: string
  joinDate: string
  email?: string
  teamSize?: number
  earnings?: string
  location?: string
}

export default function MemberDetailPage() {
  const params = useParams()
  const router = useRouter()
  const memberId = params.memberId as string

  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    if (!database) {
      console.error("Firebase database is not available")
      setLoading(false)
      router.push("/members") // Redirect if database is not available
      return () => {}
    }

    const memberRef = ref(database, `members/${memberId}`)

    const unsubscribe = onValue(memberRef, (snapshot) => {
      setLoading(true)
      const data = snapshot.val()

      if (data) {
        setMember({
          id: memberId,
          ...data,
        })
      } else {
        // Member not found, redirect
        router.push("/members")
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [memberId, router])

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Diamond":
        return "bg-blue-100 text-blue-800"
      case "Platinum":
        return "bg-purple-100 text-purple-800"
      case "Gold":
        return "bg-amber-100 text-amber-800"
      case "Silver":
        return "bg-gray-100 text-gray-800"
      case "Bronze":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!member) {
    return null
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold truncate">Member Profile</h1>
        <Button variant="ghost" size="icon" onClick={() => setChatOpen(true)}>
          <MessageCircle className="h-5 w-5" />
        </Button>
      </header>

      <div className="content-area">
        <div className="bg-primary/10 p-6 flex flex-col items-center">
          <Avatar className="h-24 w-24 mb-4">
            {member.avatar && <AvatarImage src={member.avatar} alt={member.name} />}
            <AvatarFallback className="text-2xl">{member.initials}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold mb-1">{member.name}</h1>
          <Badge variant="outline" className={`${getRankColor(member.rank)} border-0 mb-3`}>
            {member.rank}
          </Badge>

          <div className="flex gap-2">
            <Button size="sm" variant="default" className="gap-1" asChild>
              <a href={`tel:${member.phone}`}>
                <Phone className="h-4 w-4" />
                Call
              </a>
            </Button>
            {member.email && (
              <Button size="sm" variant="outline" className="gap-1" asChild>
                <a href={`mailto:${member.email}`}>
                  <Mail className="h-4 w-4" />
                  Email
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="p-4">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-2">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mb-2">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-lg font-bold">{member.teamSize || 0}</span>
                  <span className="text-xs text-gray-500">Team Size</span>
                </div>

                <div className="flex flex-col items-center p-2">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full mb-2">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-lg font-bold">{member.earnings || "$0"}</span>
                  <span className="text-xs text-gray-500">Earnings</span>
                </div>

                <div className="flex flex-col items-center p-2">
                  <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-full mb-2">
                    <Calendar className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-lg font-bold">{member.joinDate}</span>
                  <span className="text-xs text-gray-500">Joined</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="info" className="mb-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="info">Info</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="info">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{member.phone}</span>
                  </div>

                  {member.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{member.email}</span>
                    </div>
                  )}

                  {member.location && (
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{member.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Rank Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <Award className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      Current Rank: <strong>{member.rank}</strong>
                    </span>
                  </div>

                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                    <span>
                      Next Rank:{" "}
                      <strong>
                        {member.rank === "Bronze"
                          ? "Silver"
                          : member.rank === "Silver"
                            ? "Gold"
                            : member.rank === "Gold"
                              ? "Platinum"
                              : member.rank === "Platinum"
                                ? "Diamond"
                                : "Maximum Rank Achieved"}
                      </strong>
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="team">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium mb-1">Team Members</h3>
                    <p className="text-gray-500 mb-4">View {member.name}'s team structure and performance</p>
                    <Button>View Team Structure</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardContent className="p-4">
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                    <h3 className="text-lg font-medium mb-1">Recent Activity</h3>
                    <p className="text-gray-500 mb-4">Track {member.name}'s recent performance and activities</p>
                    <Button>View Activity Log</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      {member && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          member={{
            id: member.id,
            name: member.name,
            avatar: member.avatar,
            initials: member.initials,
          }}
        />
      )}
    </div>
  )
}

