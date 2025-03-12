"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Share2, User, Calendar, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getCourse, type Course } from "@/lib/course-service"
import { format } from "date-fns"

// Video player component
const VideoPlayer = ({
  src,
  poster,
  title,
}: {
  src: string
  poster?: string
  title?: string
}) => {
  const [error, setError] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  if (!src || error) {
    return (
      <div className="relative w-full aspect-video bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
        {poster ? (
          <div className="relative w-full h-full">
            <img
              src={poster || "/placeholder.svg"}
              alt={title || "Video thumbnail"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="text-white text-center p-4">
                <Play className="h-16 w-16 mx-auto mb-2" />
                <p>Video preview not available</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <Play className="h-16 w-16 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">Video not available</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      poster={poster}
      className="w-full aspect-video bg-black"
      onError={() => setError(true)}
    >
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCourse = async () => {
      setLoading(true)
      try {
        const courseData = await getCourse(courseId)
        if (courseData) {
          setCourse(courseData)
        } else {
          // Fallback to sample data if course not found
          setCourse({
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
          })
        }
      } catch (error) {
        console.error("Error loading course:", error)
        // Fallback to sample data if there's an error
        setCourse({
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
        })
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!course) {
    return null
  }

  const formattedDate = course.created_at
    ? typeof course.created_at === "string"
      ? format(new Date(course.created_at), "MMMM d, yyyy")
      : format(course.created_at.toDate(), "MMMM d, yyyy")
    : "Recently added"

  return (
    <div className="pb-16 flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-bold truncate">{course.title}</h1>
        </div>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <div className="content-area flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <VideoPlayer src={course.video_url} poster={course.image_thumbnail} title={course.title} />
          </div>

          <div className="p-4">
            <h1 className="text-2xl font-bold mb-2">{course.title}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{course.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <User className="h-5 w-5 mb-1 text-primary" />
                <span className="text-xs text-gray-500">Author</span>
                <span className="font-medium text-sm">{course.author}</span>
              </div>

              <div className="flex flex-col items-center bg-gray-100 dark:bg-gray-800 p-3 rounded-lg">
                <Calendar className="h-5 w-5 mb-1 text-primary" />
                <span className="text-xs text-gray-500">Published</span>
                <span className="font-medium text-sm">{formattedDate}</span>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-lg font-semibold mb-2">About this course</h2>
              <p className="text-gray-600 dark:text-gray-300">{course.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

