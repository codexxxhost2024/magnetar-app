"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, Share2, User, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getCourse, type Course } from "@/lib/course-service"
import { format } from "date-fns"
import Hls from "hls.js"

// HlsPlayer component
const HlsPlayer = ({
  src,
  poster,
  onError,
  autoPlay = false,
  title,
}: { src: string; poster: string; onError: () => void; autoPlay?: boolean; title: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (Hls.isSupported() && src) {
      const hls = new Hls()
      hls.loadSource(src)
      hls.attachMedia(videoRef.current!)
      hls.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (autoPlay) {
          videoRef.current?.play()
        }
      })
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // try to recover network error
              console.log("fatal network error encountered, try to recover")
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error("fatal media error encountered, trying to recover")
              hls.recoverMediaError()
              break
            default:
              // cannot recover
              hls.destroy()
              onError()
              break
          }
        }
      })

      return () => {
        hls.destroy()
      }
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = src
      videoRef.current.addEventListener("loadedmetadata", () => {
        if (autoPlay) {
          videoRef.current?.play()
        }
      })
    }
  }, [src, autoPlay, onError])

  return <video ref={videoRef} className="w-full aspect-video rounded-lg" controls poster={poster} title={title} />
}

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const courseId = params.courseId as string

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null)
  const [currentVideoTitle, setCurrentVideoTitle] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const loadCourse = async () => {
      setLoading(true)
      try {
        const courseData = await getCourse(courseId)
        if (courseData) {
          setCourse(courseData)

          // If there's a main course video, set it as current
          if (courseData.video_url) {
            setCurrentVideoUrl(courseData.video_url)
            setCurrentVideoTitle(courseData.title)
          }
        } else {
          router.push("/course")
        }
      } catch (error) {
        console.error("Error loading course:", error)
        router.push("/course")
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [courseId, router, user])

  const handleVideoError = () => {
    setVideoError("There was an error playing this video. Please try again or contact support if the issue persists.")
  }

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

  const formattedDate = course.created_at ? format(course.created_at.toDate(), "MMMM d, yyyy") : "Recently added"

  return (
    <div className="pb-16 flex flex-col min-h-screen">
      <header className="app-header flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold truncate">{course.title}</h1>
        <Button variant="ghost" size="icon">
          <Share2 className="h-5 w-5" />
        </Button>
      </header>

      <div className="content-area flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            {videoError ? (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-4 text-center">
                <p>{videoError}</p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => {
                    setVideoError(null)
                    // forcing re-render by clearing and restoring the URL
                    if (!course) return
                    const tempUrl = course.video_url
                    setCourse({ ...course, video_url: "" })
                    setTimeout(() => setCourse({ ...course, video_url: tempUrl }), 100)
                  }}
                >
                  Try Again
                </Button>
              </div>
            ) : (
              <HlsPlayer
                src={course.video_url}
                poster={course.image_thumbnail}
                onError={handleVideoError}
                autoPlay
                title={course.title}
              />
            )}
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

