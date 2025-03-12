"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Search, User, Users, Clock } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { processTransfer, getWalletBalance } from "@/lib/finance-service"
import { getUserMembers } from "@/lib/member-service"
import { useAuth } from "@/hooks/use-auth"

interface Contact {
  id: string
  name: string
  initials: string
  phone?: string
}

export default function TransferPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [recentContacts, setRecentContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const { user } = useAuth()

  useEffect(() => {
    if (!user) return

    // Load user's members from the database
    const loadData = async () => {
      try {
        // Get all members added by the user
        const userMembers = await getUserMembers(user.uid)
        setContacts(userMembers)

        // Use the first 5 members as recent contacts
        setRecentContacts(userMembers.slice(0, 5))

        // Get user's wallet balance
        const balance = await getWalletBalance(user.uid)
        setWalletBalance(balance)
      } catch (error) {
        console.error("Error loading transfer data:", error)
      }
    }

    loadData()
  }, [user])

  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleTransfer = async () => {
    if (!amount || isNaN(Number(amount)) || !selectedContact || !user) return

    const transferAmount = Number(amount)

    // Check if user has enough balance
    if (transferAmount > walletBalance) {
      alert("Insufficient balance. Please enter a smaller amount.")
      return
    }

    setLoading(true)
    try {
      // Process the actual transfer
      await processTransfer(
        user.uid,
        selectedContact.id,
        selectedContact.name,
        transferAmount,
        `Transfer to ${selectedContact.name}`,
      )

      // Show success and redirect
      alert(`Successfully transferred ₱${amount} to ${selectedContact.name}`)
      router.push("/home")
    } catch (error) {
      console.error("Error processing transfer:", error)
      alert("Failed to complete transfer. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const presetAmounts = [100, 500, 1000, 5000]

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Transfer Money</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        {!selectedContact ? (
          <>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Tabs defaultValue="recent" className="mb-6">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="contacts">Contacts</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
              </TabsList>

              <TabsContent value="recent">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    {recentContacts.length > 0 ? (
                      recentContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Avatar className="mr-3">
                            <AvatarFallback>{contact.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{contact.name}</h3>
                            <p className="text-sm text-gray-500">{contact.phone || "No phone number"}</p>
                          </div>
                          <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No recent transfers</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contacts">
                <Card>
                  <CardContent className="p-4 space-y-2">
                    {filteredContacts.length > 0 ? (
                      filteredContacts.map((contact) => (
                        <div
                          key={contact.id}
                          className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                          onClick={() => setSelectedContact(contact)}
                        >
                          <Avatar className="mr-3">
                            <AvatarFallback>{contact.initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{contact.name}</h3>
                            <p className="text-sm text-gray-500">{contact.phone || "No phone number"}</p>
                          </div>
                          <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6">
                        <User className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">No contacts found</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="team">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center py-6">
                      <Users className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-500 mb-2">Transfer to your team members</p>
                      <Button onClick={() => router.push("/members")}>View Team Members</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <Card className="mb-6">
              <CardHeader className="flex flex-col items-center pb-2">
                <Avatar className="h-16 w-16 mb-2">
                  <AvatarFallback className="text-xl">{selectedContact.initials}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-lg">{selectedContact.name}</CardTitle>
                <p className="text-sm text-gray-500">{selectedContact.phone || "No phone number"}</p>
              </CardHeader>
              <CardContent>
                <div className="relative mb-4">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</div>
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                    className="pl-8 text-xl font-bold"
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  {presetAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant="outline"
                      onClick={() => setAmount(preset.toString())}
                      className="font-medium"
                    >
                      ₱{preset}
                    </Button>
                  ))}
                </div>

                <Button
                  className="w-full"
                  disabled={!amount || isNaN(Number(amount)) || loading}
                  onClick={handleTransfer}
                >
                  {loading ? "Processing..." : "Transfer Now"}
                </Button>

                <Button variant="outline" className="w-full mt-2" onClick={() => setSelectedContact(null)}>
                  Change Recipient
                </Button>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>Transfers are processed instantly</p>
              <p>No fees for transfers between Magnetar users</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

