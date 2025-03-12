"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronLeft, Search, Plus, MessageCircle, PhoneCall, ExternalLink } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { ChatDialog } from "@/components/chat-dialog"
import { database } from "@/lib/firebase-config"
import { ref, onValue } from "firebase/database"

// Update the Member interface to include more fields
interface Member {
  id: string
  name: string
  photoURL?: string
  rank: string
  joinDate: string
  earnings: number
  phone?: string
  email?: string
  socialLinks?: {
    whatsapp?: string
    facebook?: string
    linkedin?: string
    twitter?: string
  }
}

export default function MembersPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [rankFilter, setRankFilter] = useState("all")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isChatOpen, setIsChatOpen] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    const fetchMembers = async () => {
      setLoading(true)
      try {
        // Use Firebase Realtime Database to fetch users
        const usersRef = ref(database, "users")
        onValue(usersRef, (snapshot) => {
          const data = snapshot.val()
          if (data) {
            const membersList: Member[] = []

            Object.entries(data).forEach(([id, userData]: [string, any]) => {
              // Skip the current user
              if (id === user.uid) return

              // Skip users without necessary data
              if (!userData || userData.isAnonymous === true) return

              const member: Member = {
                id,
                name: userData.displayName || "Anonymous User",
                photoURL: userData.photoURL || "",
                rank: userData.rank || "Bronze",
                joinDate: userData.joinDate || new Date().toLocaleDateString(),
                earnings: userData.earnings?.total || 0,
                phone: userData.phone || "",
                email: userData.email || "",
                socialLinks: userData.socialLinks || {},
              }

              membersList.push(member)
            })

            setMembers(membersList)
          }
          setLoading(false)
        })
      } catch (error) {
        console.error("Error fetching members:", error)
        toast({
          title: "Error",
          description: "Failed to load members. Please try again.",
          variant: "destructive",
        })
        setLoading(false)
      }
    }

    fetchMembers()
  }, [user, authLoading, router])

  const filteredMembers = members.filter((member) => {
    const nameMatch = member.name.toLowerCase().includes(searchTerm.toLowerCase())
    const rankMatch = rankFilter === "all" || member.rank === rankFilter
    return nameMatch && rankMatch
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleMessageClick = (member: Member) => {
    setSelectedMember(member)
    setIsChatOpen(true)
  }

  const handleCallClick = (member: Member) => {
    if (member.phone) {
      window.open(`tel:${member.phone}`, "_blank")
    } else {
      toast({
        title: "No Phone Number",
        description: `${member.name} has not added a phone number yet.`,
      })
    }
  }

  const handleWhatsAppClick = (member: Member) => {
    if (member.phone) {
      // Remove any non-numeric characters from the phone number
      const phoneNumber = member.phone.replace(/\D/g, "")
      window.open(`https://wa.me/${phoneNumber}`, "_blank")
    } else if (member.socialLinks?.whatsapp) {
      window.open(member.socialLinks.whatsapp, "_blank")
    } else {
      toast({
        title: "No WhatsApp",
        description: `${member.name} has not added WhatsApp contact information.`,
      })
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Team Members</h1>
        <Button variant="ghost" size="icon" onClick={() => router.push("/members/add")}>
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="content-area p-4">
        <div className="flex space-x-2 mb-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={rankFilter} onValueChange={setRankFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by rank" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Ranks</SelectItem>
              <SelectItem value="Bronze">Bronze</SelectItem>
              <SelectItem value="Silver">Silver</SelectItem>
              <SelectItem value="Gold">Gold</SelectItem>
              <SelectItem value="Platinum">Platinum</SelectItem>
              <SelectItem value="Diamond">Diamond</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="hover:bg-accent">
              <CardContent className="p-4 flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.photoURL} alt={member.name} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-gray-500">{member.rank}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(member.earnings)}</p>
                  <p className="text-sm text-gray-500">Joined {member.joinDate}</p>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => handleMessageClick(member)} title="Message">
                    <MessageCircle className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleCallClick(member)} title="Call">
                    <PhoneCall className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleWhatsAppClick(member)} title="WhatsApp">
                    <ExternalLink className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>No members found.</p>
          </div>
        )}
      </div>

      {selectedMember && (
        <ChatDialog
          open={isChatOpen}
          onOpenChange={setIsChatOpen}
          member={{
            id: selectedMember.id,
            name: selectedMember.name,
            avatar: selectedMember.photoURL,
            initials: selectedMember.name.charAt(0),
          }}
        />
      )}
    </div>
  )
}

