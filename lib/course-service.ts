import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  type Timestamp,
  addDoc,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore"
import { ref, getDatabase, get, child } from "firebase/database"
import { db } from "./firebase"

export interface Course {
  id: string
  uid?: string
  author: string
  created_at: Timestamp | string
  description: string
  image_thumbnail: string
  thumbnail_url?: string
  title: string
  video_url: string
}

// Get a single course by ID
export async function getCourse(courseId: string): Promise<Course | null> {
  try {
    // First try Firestore
    const courseRef = doc(db, "course", courseId)
    const courseSnap = await getDoc(courseRef)

    if (courseSnap.exists()) {
      const courseData = courseSnap.data() as Omit<Course, "id">
      return {
        id: courseSnap.id,
        ...courseData,
      }
    }

    // If not found in Firestore, try Realtime Database
    const dbRef = ref(getDatabase())
    const rtdbSnapshot = await get(child(dbRef, `course/${courseId}`))

    if (rtdbSnapshot.exists()) {
      const data = rtdbSnapshot.val()
      return {
        id: courseId,
        author: data.author || "Unknown",
        created_at: data.created_at || new Date().toISOString(),
        description: data.description || "",
        image_thumbnail: data.image_thumbnail || "",
        title: data.title || "Untitled Course",
        video_url: data.video_url || "",
      }
    }

    console.log("Course not found in either database")
    return null
  } catch (error) {
    console.error("Error getting course:", error)
    return null
  }
}

export async function updateCourseProgress(userId: string, courseId: string, progress: number): Promise<void> {
  try {
    const progressRef = doc(db, `users/${userId}/courseProgress/${courseId}`)
    await setDoc(progressRef, { progress }, { merge: true })
  } catch (error) {
    console.error("Error updating course progress:", error)
    throw error
  }
}

export async function getAllCourses(): Promise<Course[]> {
  try {
    const courses: Course[] = []

    // First try to get courses from Firestore
    try {
      const coursesRef = collection(db, "course")
      const coursesQuery = query(coursesRef, orderBy("created_at", "desc"))
      const snapshot = await getDocs(coursesQuery)

      courses.push(
        ...snapshot.docs.map((doc) => {
          const data = doc.data() as Omit<Course, "id">
          return {
            id: doc.id,
            ...data,
          }
        }),
      )
    } catch (firestoreError) {
      console.warn("Error fetching from Firestore:", firestoreError)
    }

    // Then try to get courses from Realtime Database
    try {
      const dbRef = ref(getDatabase())
      const rtdbSnapshot = await get(child(dbRef, "course"))

      if (rtdbSnapshot.exists()) {
        const rtdbCourses = rtdbSnapshot.val()

        // Convert object to array and add to courses
        Object.entries(rtdbCourses).forEach(([id, data]: [string, any]) => {
          courses.push({
            id,
            author: data.author || "Unknown",
            created_at: data.created_at || new Date().toISOString(),
            description: data.description || "",
            image_thumbnail: data.image_thumbnail || "",
            title: data.title || "Untitled Course",
            video_url: data.video_url || "",
          })
        })
      }
    } catch (rtdbError) {
      console.warn("Error fetching from Realtime Database:", rtdbError)
    }

    // If no courses found in either database, return sample data
    if (courses.length === 0) {
      return [
        {
          id: "NqESX5E5lH0fO5o47lPt",
          author: "Genesis Domingo",
          created_at: {
            toDate: () => new Date("2025-03-11T10:23:00Z"),
          } as Timestamp,
          description: "This is a very hardcore training that is needed for all MLM members.",
          image_thumbnail:
            "https://firebasestorage.googleapis.com/v0/b/ces-project-f8b4e.firebasestorage.app/o/thumbnail%2Freceived_638583032018426.png?alt=media&token=bb7e2181-d83f-40d8-a6d1-9a4ad8ad33b1",
          title: "Power of Magnetar",
          video_url:
            "https://firebasestorage.googleapis.com/v0/b/ces-project-f8b4e.firebasestorage.app/o/course-video%2FGoal%20Setting%20by%20Genesis%20Domingo.mp4?alt=media&token=7f3c93d3-f394-4dbc-9279-e8dda7d9f8b7",
        },
      ]
    }

    return courses
  } catch (error) {
    console.error("Error getting courses:", error)
    // Return a sample course if there's an error
    return [
      {
        id: "NqESX5E5lH0fO5o47lPt",
        author: "Genesis Domingo",
        created_at: {
          toDate: () => new Date("2025-03-11T10:23:00Z"),
        } as Timestamp,
        description: "This is a very hardcore training that is needed for all MLM members.",
        image_thumbnail:
          "https://firebasestorage.googleapis.com/v0/b/ces-project-f8b4e.firebasestorage.app/o/thumbnail%2Freceived_638583032018426.png?alt=media&token=bb7e2181-d83f-40d8-a6d1-9a4ad8ad33b1",
        title: "Power of Magnetar",
        video_url:
          "https://firebasestorage.googleapis.com/v0/b/ces-project-f8b4e.firebasestorage.app/o/course-video%2FGoal%20Setting%20by%20Genesis%20Domingo.mp4?alt=media&token=7f3c93d3-f394-4dbc-9279-e8dda7d9f8b7",
      },
    ]
  }
}

export async function createCourse(courseData: Omit<Course, "id" | "created_at">): Promise<string> {
  try {
    const coursesRef = collection(db, "course")
    const newCourseRef = await addDoc(coursesRef, {
      ...courseData,
      // If thumbnail_url is provided, use it for image_thumbnail
      image_thumbnail: courseData.thumbnail_url || courseData.image_thumbnail,
      created_at: serverTimestamp(),
    })
    return newCourseRef.id
  } catch (error) {
    console.error("Error creating course:", error)
    throw error
  }
}

// Get courses by category
export async function getCoursesByCategory(category: string): Promise<Course[]> {
  try {
    const coursesRef = collection(db, "course")
    const coursesQuery = query(coursesRef, where("category", "==", category), orderBy("created_at", "desc"))
    const snapshot = await getDocs(coursesQuery)

    return snapshot.docs.map((doc) => {
      const data = doc.data() as Omit<Course, "id">
      return {
        id: doc.id,
        ...data,
      }
    })
  } catch (error) {
    console.error(`Error getting courses by category ${category}:`, error)
    return []
  }
}

// Format timestamp for display
export function formatCourseDate(timestamp: Timestamp | string): string {
  if (typeof timestamp === "string") {
    return new Date(timestamp).toLocaleDateString()
  }

  try {
    return timestamp.toDate().toLocaleDateString()
  } catch (error) {
    return "Unknown date"
  }
}

