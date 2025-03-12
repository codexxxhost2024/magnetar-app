"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, X, Video, Loader2, ImageIcon } from "lucide-react"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { storage } from "@/lib/firebase"
import { useAuth } from "@/contexts/auth-context"
import { Progress } from "@/components/ui/progress"

interface VideoUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: "social" | "course"
  onSuccess?: (videoUrl: string, data: any) => void
}

export function VideoUploadDialog({ open, onOpenChange, type, onSuccess }: VideoUploadDialogProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [instructor, setInstructor] = useState("")
  const [duration, setDuration] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null)
  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file type
      const validTypes = ["video/mp4", "video/webm", "video/ogg"]
      if (!validTypes.includes(file.type)) {
        alert("Invalid file type. Please upload MP4, WebM, or Ogg video.")
        return
      }

      setSelectedVideo(file)

      // Create preview
      const videoUrl = URL.createObjectURL(file)
      setVideoPreview(videoUrl)
    }
  }

  const removeSelectedVideo = () => {
    setSelectedVideo(null)
    setVideoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file type
      const validTypes = ["image/jpeg", "image/png", "image/webp"]
      if (!validTypes.includes(file.type)) {
        alert("Invalid file type. Please upload JPG, PNG, or WebP image.")
        return
      }

      setSelectedThumbnail(file)

      // Create preview
      const imageUrl = URL.createObjectURL(file)
      setThumbnailPreview(imageUrl)
    }
  }

  const removeSelectedThumbnail = () => {
    setSelectedThumbnail(null)
    setThumbnailPreview(null)
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = ""
    }
  }

  const handleUpload = async () => {
    if (!selectedVideo || !user) return

    if (!storage) {
      throw new Error("Firebase is not initialized.")
    }

    try {
      setUploading(true)
      setProgress(0)

      const videoFileName = `${Date.now()}_${selectedVideo.name.replace(/\s+/g, "_")}`
      const videoRef = storageRef(storage, `e-learn-videos/${user.uid}/${videoFileName}`)

      // Upload the video
      const uploadTask = uploadBytes(videoRef, selectedVideo)

      // Set progress to 40% after upload starts
      setProgress(40)

      await uploadTask

      // Get the download URL
      const videoUrl = await getDownloadURL(videoRef)
      setProgress(60)

      // Upload thumbnail if provided
      let thumbnailUrl = ""
      if (selectedThumbnail) {
        const thumbnailFileName = `${Date.now()}_thumbnail_${selectedThumbnail.name.replace(/\s+/g, "_")}`
        const thumbnailRef = storageRef(storage, `e-learn-thumbnails/${user.uid}/${thumbnailFileName}`)
        await uploadBytes(thumbnailRef, selectedThumbnail)
        thumbnailUrl = await getDownloadURL(thumbnailRef)
        setProgress(80)
      }

      const courseData = {
        title,
        description,
        instructor,
        duration,
        videoUrl,
        thumbnailUrl: thumbnailUrl || thumbnailPreview || "",
        userId: user.uid,
      }

      if (onSuccess) {
        onSuccess(videoUrl, courseData)
      }

      setProgress(100)
      setUploading(false)
      setTitle("")
      setDescription("")
      setInstructor("")
      setDuration("")
      setSelectedVideo(null)
      setVideoPreview(null)
      setSelectedThumbnail(null)
      setThumbnailPreview(null)
      onOpenChange(false)
    } catch (error) {
      console.error("Error uploading video:", error)
      setUploading(false)
      alert("An error occurred while uploading the video. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Course Video</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="instructor" className="text-right">
              Instructor
            </Label>
            <Input
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="duration" className="text-right">
              Duration (minutes)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="video" className="text-right">
              Video
            </Label>
            <div className="col-span-3">
              {!videoPreview ? (
                <div
                  className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Video className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2 flex text-sm text-gray-600">
                    <label
                      htmlFor="video-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                    >
                      <span>Upload a video</span>
                      <input
                        id="video-upload"
                        ref={fileInputRef}
                        name="video-upload"
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        onChange={handleVideoChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">MP4, WebM, or Ogg</p>
                </div>
              ) : (
                <div className="relative">
                  <video src={videoPreview} controls className="w-full h-auto rounded-md" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={removeSelectedVideo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="thumbnail" className="text-right">
              Thumbnail
            </Label>
            <div className="col-span-3">
              {!thumbnailPreview ? (
                <div
                  className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-gray-50"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-2 flex text-sm text-gray-600">
                    <label
                      htmlFor="thumbnail-upload"
                      className="relative cursor-pointer rounded-md bg-white font-medium text-primary hover:text-primary/90 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                    >
                      <span>Upload a thumbnail</span>
                      <input
                        id="thumbnail-upload"
                        ref={thumbnailInputRef}
                        name="thumbnail-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleThumbnailChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">JPG, PNG, or WebP</p>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={thumbnailPreview || "/placeholder.svg"}
                    alt="Thumbnail preview"
                    className="w-full h-auto rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8 rounded-full"
                    onClick={removeSelectedThumbnail}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {uploading && (
            <div className="col-span-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleUpload}
            disabled={!selectedVideo || uploading || !title || !description || !instructor || !duration}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

