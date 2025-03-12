"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Play, Plus } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { VideoUploadDialog } from "@/components/video-upload-dialog"
import { toast } from "@/components/ui/use-toast"
import { getAllCourses, createCourse, type Course } from "@/lib/course-service"
import { Timestamp } from "firebase/firestore"

export default function ELearnPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  useEffect(() => {
    if (authLoading) return

    if (!user) {
      router.push("/login")
      return
    }

    const fetchCourses = async () => {
      setLoading(true)
      try {
        const fetchedCourses = await getAllCourses()
        setCourses(fetchedCourses)
      } catch (error) {
        console.error("Error fetching courses:", error)
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        })
      }
      setLoading(false)
    }

    fetchCourses()
  }, [user, authLoading, router])

  const handleUploadSuccess = async (videoUrl: string, data: any) => {
    try {
      const courseData: Omit<Course, "id"> = {
        uid: user?.uid || "",
        author: user?.displayName || "Unknown",
        created_at: Timestamp.now(),
        description: data.description || "No description provided",
        image_thumbnail: data.thumbnailUrl || "", // Use the uploaded thumbnail
        title: data.title,
        video_url: videoUrl,
      }

      const courseId = await createCourse(courseData)

      setCourses((prevCourses) => [
        ...prevCourses,
        {
          id: courseId,
          ...courseData,
        } as Course,
      ])

      setIsUploadDialogOpen(false)
      toast({
        title: "Success",
        description: "Course uploaded successfully.",
      })
    } catch (error) {
      console.error("Error creating course:", error)
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
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
        <h1 className="text-xl font-bold">E-Learning Center</h1>
        <Button variant="ghost" size="icon" onClick={() => setIsUploadDialogOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </header>

      <div className="content-area p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="motivational">Motivational</TabsTrigger>
            <TabsTrigger value="business">Business</TabsTrigger>
            <TabsTrigger value="leadership">Leadership</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <CourseList courses={courses} />
          </TabsContent>
          <TabsContent value="motivational">
            <CourseList
              courses={courses.filter(
                (course) =>
                  course.description?.toLowerCase().includes("motivational") || course.category === "Motivational",
              )}
            />
          </TabsContent>
          <TabsContent value="business">
            <CourseList
              courses={courses.filter(
                (course) => course.description?.toLowerCase().includes("business") || course.category === "Business",
              )}
            />
          </TabsContent>
          <TabsContent value="leadership">
            <CourseList
              courses={courses.filter(
                (course) =>
                  course.description?.toLowerCase().includes("leadership") || course.category === "Leadership",
              )}
            />
          </TabsContent>
        </Tabs>
      </div>

      <VideoUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        type="course"
        onSuccess={handleUploadSuccess}
      />
    </div>
  )
}

function CourseList({ courses }: { courses: Course[] }) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          <div className="relative aspect-video">
            <img
              src={course.image_thumbnail || "/placeholder.svg"}
              alt={course.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-1">{course.title}</h3>
            <p className="text-sm text-gray-500 mb-2">{course.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{course.author}</span>
              <Button size="sm" onClick={() => router.push(`/e-learn/${course.id}`)}>
                Start
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

