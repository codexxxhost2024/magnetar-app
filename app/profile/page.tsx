"use client"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import Header from "@/components/header"

export default function ProfilePage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    displayName: user?.displayName || "",
    bio: "Diamond member with 3 years of experience in digital marketing and content creation.",
    email: user?.email || "",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    website: "https://example.com",
    twitter: "@johnsmith",
    instagram: "@johnsmith",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    // Here you would typically save the data to your backend
    setIsEditing(false)
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    })
  }

  return (
    <div className="pb-16 pt-14">
      <Header title="Profile" showBack={true} />

      <div className="p-4">
        <Card className="mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <CardContent className="pt-0">
            <div className="flex flex-col items-center -mt-12">
              <Avatar className="h-24 w-24 border-4 border-background">
                <AvatarImage src="/placeholder.svg?height=96&width=96" alt={formData.displayName} />
                <AvatarFallback>{formData.displayName.charAt(0)}</AvatarFallback>
              </Avatar>
              {isEditing ? (
                <Input
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="mt-4 text-center text-xl font-bold"
                />
              ) : (
                <h2 className="mt-4 text-xl font-bold">{formData.displayName}</h2>
              )}
              <p className="text-sm text-text-secondary">Diamond Member</p>
              {isEditing ? (
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="mt-2 text-center text-sm"
                />
              ) : (
                <p className="mt-2 text-center text-sm">{formData.bio}</p>
              )}
              {isEditing ? (
                <div className="mt-4 flex gap-2">
                  <Button onClick={handleSave}>Save</Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} className="mt-4">
                  Edit Profile
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="info">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
          </TabsList>
          <TabsContent value="info" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              {isEditing ? (
                <Input id="email" name="email" value={formData.email} onChange={handleChange} />
              ) : (
                <div className="rounded-md border px-3 py-2">{formData.email}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              {isEditing ? (
                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
              ) : (
                <div className="rounded-md border px-3 py-2">{formData.phone}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              {isEditing ? (
                <Input id="location" name="location" value={formData.location} onChange={handleChange} />
              ) : (
                <div className="rounded-md border px-3 py-2">{formData.location}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              {isEditing ? (
                <Input id="website" name="website" value={formData.website} onChange={handleChange} />
              ) : (
                <div className="rounded-md border px-3 py-2">{formData.website}</div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="social" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              {isEditing ? (
                <Input id="twitter" name="twitter" value={formData.twitter} onChange={handleChange} />
              ) : (
                <div className="rounded-md border px-3 py-2">{formData.twitter}</div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              {isEditing ? (
                <Input id="instagram" name="instagram" value={formData.instagram} onChange={handleChange} />
              ) : (
                <div className="rounded-md border px-3 py-2">{formData.instagram}</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

