import { getDatabase, ref, get } from "firebase/database"
import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore"
import { db } from "./firebase"

/**
 * Utility function to migrate data from Realtime Database to Firestore
 * This can be used to sync data between the two databases
 */
export async function migrateCoursesToFirestore() {
  try {
    // Get courses from Realtime Database
    const dbRef = ref(getDatabase(), "course")
    const snapshot = await get(dbRef)

    if (!snapshot.exists()) {
      console.log("No courses found in Realtime Database")
      return []
    }

    const rtdbCourses = snapshot.val()
    const migratedCourses = []

    // Migrate each course to Firestore
    for (const [id, courseData] of Object.entries(rtdbCourses)) {
      const data = courseData as any

      // Check if course already exists in Firestore
      const firestoreRef = doc(db, "course", id)
      const firestoreDoc = await getDoc(firestoreRef)

      if (!firestoreDoc.exists()) {
        // Create new document in Firestore
        await setDoc(firestoreRef, {
          author: data.author || "Unknown",
          created_at: new Date(data.created_at || Date.now()),
          description: data.description || "",
          image_thumbnail: data.image_thumbnail || "",
          title: data.title || "Untitled Course",
          video_url: data.video_url || "",
        })

        migratedCourses.push(id)
      }
    }

    console.log(`Migrated ${migratedCourses.length} courses to Firestore`)
    return migratedCourses
  } catch (error) {
    console.error("Error migrating courses:", error)
    return []
  }
}

/**
 * Get all members from the database
 */
export async function getAllMembers() {
  try {
    // Try Firestore first
    const membersCollection = collection(db, "members")
    const firestoreSnapshot = await getDocs(membersCollection)

    if (!firestoreSnapshot.empty) {
      return firestoreSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
    }

    // If no members in Firestore, try Realtime Database
    const dbRef = ref(getDatabase(), "members")
    const rtdbSnapshot = await get(dbRef)

    if (rtdbSnapshot.exists()) {
      const membersData = rtdbSnapshot.val()
      return Object.entries(membersData).map(([id, data]) => ({
        id,
        ...data,
      }))
    }

    return []
  } catch (error) {
    console.error("Error fetching members:", error)
    return []
  }
}

/**
 * Get user data from both authentication and database
 */
export async function getEnhancedUserData(userId: string) {
  try {
    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, "users", userId))

    if (userDoc.exists()) {
      return userDoc.data()
    }

    // If not in Firestore, try Realtime Database
    const dbRef = ref(getDatabase(), `users/${userId}`)
    const rtdbSnapshot = await get(dbRef)

    if (rtdbSnapshot.exists()) {
      return rtdbSnapshot.val()
    }

    return null
  } catch (error) {
    console.error("Error fetching enhanced user data:", error)
    return null
  }
}

