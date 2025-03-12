"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Clock, Play, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getAllCourses, type Course } from "@/lib/course-service"
import { formatDistanceToNow } from "date-fns"

const VideoPreview = ({ src, poster }: { src: string; poster: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  // Use image instead of video if there's an error or no valid source
  if (hasError || !src) {
    return (
      <div className="relative h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
        {poster ? (
          <img src={poster || "/placeholder.svg"} alt="Course thumbnail" className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center text-gray-500">
            <ImageIcon className="h-12 w-12 mb-2" />
            <span>Preview not available</span>
          </div>
        )}
      </div>
    )
  }

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch((err) => {
          console.error("Error playing video:", err)
          setHasError(true)
        })
      }
      setIsPlaying(!isPlaying)
    }
  }

  return (
    <div className="relative h-48">
      <video
        ref={videoRef}
        poster={poster}
        className="w-full h-full object-cover"
        muted
        loop
        playsInline
        onError={() => setHasError(true)}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div
        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300"
        style={{ opacity: isPlaying ? 0 : 1 }}
      >
        <Button variant="ghost" size="icon" className="text-white" onClick={togglePlay}>
          <Play className="h-12 w-12" />
        </Button>
      </div>
    </div>
  )
}

export default function CoursePage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true)
      try {
        const coursesData = await getAllCourses()
        setCourses(coursesData)
      } catch (error) {
        console.error("Error loading courses:", error)
        // Fallback to sample data
        setCourses([
          {
            id: "NqESX5E5lH0fO5o47lPt",
            author: "Genesis Domingo",
            created_at: {
              toDate: () => new Date("2025-03-11T10:23:00Z"),
            } as any,
            description: "This is a very hardcore training that is needed for all MLM members.",
            image_thumbnail:
              "https://firebasestorage.googleapis.com/v0/b/ces-project-f8b4e.firebasestorage.app/o/thumbnail%2Freceived_638583032018426.png?alt=media&token=bb7e2181-d83f-40d8-a6d1-9a4ad8ad33b1",
            title: "Power of Magnetar",
            video_url:
              "https://firebasestorage.googleapis.com/v0/b/ces-project-f8b4e.firebasestorage.app/o/course-video%2FGoal%20Setting%20by%20Genesis%20Domingo.mp4?alt=media&token=7f3c93d3-f394-4dbc-9279-e8dda7d9f8b7",
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="pb-16 flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold">Courses</h1>
        </div>
      </header>

      <div className="content-area flex-1 p-4 pt-2">
        {courses.length === 0 ? (
          <p className="text-center text-gray-500">No courses available.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer"
                onClick={() => router.push(`/course/${course.id}`)}
              >
                <VideoPreview src={course.video_url} poster={course.image_thumbnail} />
                <div className="p-3">
                  <h2 className="text-base font-semibold mb-1 truncate">{course.title}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>{course.author}</span>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {typeof course.created_at === "string"
                        ? formatDistanceToNow(new Date(course.created_at), { addSuffix: true })
                        : formatDistanceToNow(course.created_at.toDate(), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

