import { ref, set, get } from "firebase/database"
import { database } from "./firebase"

interface UserProfile {
  displayName: string | null
  email: string | null
  photoURL: string | null
  isAnonymous: boolean
  createdAt?: string
  lastLogin?: string
  wallet?: {
    balance: number
    currency: string
  }
  team?: {
    size: number
    directRecruits: number
    activeMembers: number
  }
}

// Create a new user profile in the database
export async function createUserProfile(userId: string, userData: UserProfile): Promise<boolean> {
  try {
    const userRef = ref(database, `users/${userId}`)

    // Check if user already exists
    const snapshot = await get(userRef)
    if (snapshot.exists()) {
      // User already exists, update lastLogin
      await set(ref(database, `users/${userId}/lastLogin`), new Date().toISOString())
      return true
    }

    // Create new user profile
    const newUserData = {
      ...userData,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      wallet: {
        balance: 0,
        currency: "PHP",
      },
      team: {
        size: 0,
        directRecruits: 0,
        activeMembers: 0,
      },
    }

    await set(userRef, newUserData)
    return true
  } catch (error) {
    console.error("Error creating user profile:", error)
    return false
  }
}

// Update the database initialization function to handle Firebase configuration errors
export async function initializeDatabase(): Promise<void> {
  try {
    // Check if database is available (Firebase is configured)
    if (!database) {
      console.warn("Database initialization skipped - Firebase not configured")
      return
    }

    // Check if courses exist
    const coursesRef = ref(database, "courses")
    const coursesSnapshot = await get(coursesRef)

    if (!coursesSnapshot.exists()) {
      // Create default courses
      const defaultCourses = {
        course1: {
          title: "Getting Started with Magnetar",
          description: "Learn the basics of Magnetar and how to get started with your business.",
          thumbnail:
            "https://firebasestorage.googleapis.com/v0/b/magnetar-app.appspot.com/o/courses%2Fcourse1.jpg?alt=media",
          duration: "1 hour",
          category: "Basics",
          level: "Beginner",
          modules: [
            {
              title: "Introduction to Magnetar",
              duration: "10 min",
            },
            {
              title: "Setting Up Your Account",
              duration: "15 min",
            },
            {
              title: "Your First Sale",
              duration: "20 min",
            },
            {
              title: "Building Your Team",
              duration: "15 min",
            },
          ],
        },
        course2: {
          title: "Advanced Marketing Strategies",
          description: "Take your marketing skills to the next level with these advanced strategies.",
          thumbnail:
            "https://firebasestorage.googleapis.com/v0/b/magnetar-app.appspot.com/o/courses%2Fcourse2.jpg?alt=media",
          duration: "2 hours",
          category: "Marketing",
          level: "Intermediate",
          modules: [
            {
              title: "Social Media Marketing",
              duration: "30 min",
            },
            {
              title: "Email Marketing Campaigns",
              duration: "25 min",
            },
            {
              title: "Content Creation",
              duration: "35 min",
            },
            {
              title: "Analytics and Optimization",
              duration: "30 min",
            },
          ],
        },
      }

      await set(coursesRef, defaultCourses)
    }

    // Initialize other default data as needed
  } catch (error) {
    console.error("Error initializing database:", error)
  }
}

