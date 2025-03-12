"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, ImageIcon, Video, X } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/auth-context"
import { VideoUploadDialog } from "@/components/video-upload-dialog"

// Add imports
import { createPost, subscribeToPostUpdates, addComment, toggleLike } from "@/lib/social-service"

interface Post {
  id: string
  user: {
    name: string
    avatar?: string
    initials: string
    uid: string
  }
  timestamp: string
  content: string
  image?: string
  likes: number
  comments: {
    user: string
    comment: string
  }[]
  video?: string
  likedBy: string[]
}

export default function SocialPage() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [newPost, setNewPost] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [videoUploadOpen, setVideoUploadOpen] = useState(false)
  const [commentText, setCommentText] = useState<{ [postId: string]: string }>({})

  // Update the useEffect to use real-time updates
  useEffect(() => {
    if (!user) return

    // Subscribe to posts real-time updates
    const unsubscribe = subscribeToPostUpdates((updatedPosts) => {
      // Format timestamps for display
      const formattedPosts = updatedPosts.map((post) => ({
        ...post,
        // Ensure user object and initials exist
        user: {
          ...post.user,
          initials: post.user?.initials || post.user?.name?.charAt(0) || "?",
        },
        timestamp: formatTimestamp(post.timestamp),
      }))

      setPosts(formattedPosts)
    })

    return () => unsubscribe()
  }, [user])

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Just now"

    const now = new Date()
    const postTime = new Date(timestamp)
    const diffInSeconds = Math.floor((now.getTime() - postTime.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return `${Math.floor(diffInSeconds / 86400)} days ago`
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedImage(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeSelectedImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
  }

  // Update the handlePostSubmit function
  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!newPost.trim() && !selectedImage) || !user) return

    try {
      setLoading(true)

      // Get user info
      const displayName = user.displayName || "Anonymous User"
      const initials = displayName ? displayName.charAt(0) : "A"

      // Create the post with real data
      await createPost(user.uid, displayName, initials, newPost, selectedImage || undefined)

      // Clear form
      setNewPost("")
      setSelectedImage(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error creating post:", error)
    } finally {
      setLoading(false)
    }
  }

  // Add functions for comments and likes
  const handleAddComment = async (postId: string, comment: string) => {
    if (!comment.trim() || !user) return

    try {
      const displayName = user.displayName || "Anonymous User"
      const initials = displayName ? displayName.charAt(0) : "A"

      await addComment(postId, user.uid, displayName, initials, comment)

      // Comment will appear automatically due to real-time subscription
      setCommentText({ ...commentText, [postId]: "" })
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const handleLikePost = async (postId: string) => {
    if (!user) return

    try {
      await toggleLike(postId, user.uid)

      // Like count will update automatically due to real-time subscription
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  // Helper function to safely get initials
  const getInitials = (user: any) => {
    if (!user) return "?"
    return user.initials || (user.name ? user.name.charAt(0) : "?")
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <h1 className="text-xl font-bold">Social Feed</h1>
      </header>

      <div className="p-4 content-area">
        <Card className="mb-4 dark:bg-gray-800 dark:text-white dark:border-gray-700">
          <CardContent className="pt-4">
            <form onSubmit={handlePostSubmit}>
              <div className="flex items-start gap-3 mb-3">
                <Avatar>
                  <AvatarFallback>{user?.displayName?.charAt(0) || "A"}</AvatarFallback>
                </Avatar>
                <Input
                  placeholder="What's on your mind?"
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  className="flex-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              {imagePreview && (
                <div className="relative mb-3">
                  <Image
                    src={imagePreview || "/placeholder.svg"}
                    alt="Preview"
                    width={300}
                    height={200}
                    className="rounded-md max-h-[200px] w-auto object-contain"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full"
                    onClick={removeSelectedImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="dark:text-gray-300 dark:border-gray-600"
                    onClick={() => document.getElementById("image-upload")?.click()}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Photo
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="dark:text-gray-300 dark:border-gray-600"
                    onClick={() => setVideoUploadOpen(true)}
                  >
                    <Video className="w-4 h-4 mr-1" />
                    Video
                  </Button>
                </div>
                <Button type="submit" disabled={loading || (!newPost.trim() && !selectedImage)}>
                  {loading ? "Posting..." : "Post"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {posts.map((post) => (
          <Card key={post.id} className="mb-4">
            <CardHeader className="flex flex-row items-center p-4">
              <Link href="#" className="flex items-center gap-2 text-sm font-semibold">
                <Avatar>
                  <AvatarFallback>{getInitials(post.user)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{post.user?.name || "Anonymous"}</p>
                  <p className="text-xs text-gray-500">{post.timestamp}</p>
                </div>
              </Link>
              <Button variant="ghost" size="icon" className="w-8 h-8 ml-auto rounded-full">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 pt-0">
              <p className="mb-3">{post.content}</p>
              {post.image && (
                <div className="rounded-md overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    width={600}
                    height={400}
                    alt="Post image"
                    className="w-full object-cover"
                  />
                </div>
              )}
              {post.video && (
                <div className="rounded-md overflow-hidden mt-3">
                  <video
                    src={post.video}
                    controls
                    className="w-full h-auto"
                    poster="/placeholder.svg?height=400&width=600"
                  />
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col p-4 pt-0">
              <div className="flex items-center w-full border-t border-b py-2 my-2">
                <Button variant="ghost" size="sm" onClick={() => handleLikePost(post.id)}>
                  <Heart className="w-4 h-4 mr-1" />
                  {post.likedBy && post.likedBy.length > 0 ? `${post.likedBy.length} Likes` : "Like"}
                </Button>
                <Button variant="ghost" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Comment
                </Button>
                <Button variant="ghost" size="sm">
                  <Send className="w-4 h-4 mr-1" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Bookmark className="w-4 h-4" />
                </Button>
              </div>

              <div className="w-full">
                {(post.comments || []).map((comment, index) => (
                  <div key={index} className="py-2">
                    <div className="flex gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">{comment.user?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div className="bg-gray-100 rounded-lg p-2 flex-1 dark:bg-gray-700">
                        <p className="text-sm font-medium">{comment.user || "Anonymous"}</p>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="flex items-center gap-2 mt-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback>{user?.displayName?.charAt(0) || "A"}</AvatarFallback>
                  </Avatar>
                  <Input
                    placeholder="Write a comment..."
                    className="flex-1 h-8 text-sm dark:bg-gray-700 dark:text-white dark:border-gray-600"
                    value={commentText[post.id] || ""}
                    onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddComment(post.id, commentText[post.id] || "")
                      }
                    }}
                  />
                  <Button size="sm" onClick={() => handleAddComment(post.id, commentText[post.id] || "")}>
                    Post
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
      <VideoUploadDialog open={videoUploadOpen} onOpenChange={setVideoUploadOpen} type="social" />
    </div>
  )
}

