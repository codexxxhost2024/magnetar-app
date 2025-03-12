import { ref, push, set, get, update, query, orderByChild, equalTo, serverTimestamp } from "firebase/database"
import { database } from "./firebase"

interface Notification {
  userId: string
  title: string
  message: string
  type: "system" | "social" | "team" | "financial" | "achievement"
  read: boolean
  data?: any
  timestamp: any
}

// Create a notification
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "system" | "social" | "team" | "financial" | "achievement",
  data?: any,
): Promise<string> {
  try {
    const notification: Notification = {
      userId,
      title,
      message,
      type,
      read: false,
      ...(data && { data }),
      timestamp: serverTimestamp(),
    }

    const notificationsRef = ref(database, "notifications")
    const newNotificationRef = push(notificationsRef)

    await set(newNotificationRef, notification)

    // Update unread count
    const userRef = ref(database, `users/${userId}/notificationCounts/${type}`)
    const countSnapshot = await get(userRef)

    if (countSnapshot.exists()) {
      await update(userRef, { unread: (countSnapshot.val().unread || 0) + 1 })
    } else {
      await set(userRef, { unread: 1 })
    }

    return newNotificationRef.key || ""
  } catch (error) {
    console.error("Error creating notification:", error)
    throw error
  }
}

// Get user notifications
export async function getUserNotifications(userId: string): Promise<any[]> {
  try {
    const notificationsRef = ref(database, "notifications")
    const userNotificationsQuery = query(notificationsRef, orderByChild("userId"), equalTo(userId))

    const snapshot = await get(userNotificationsQuery)

    if (!snapshot.exists()) {
      return []
    }

    const notifications: any[] = []
    const data = snapshot.val()

    for (const [id, notification] of Object.entries(data)) {
      notifications.push({
        id,
        ...(notification as any),
      })
    }

    // Sort by timestamp (newest first)
    return notifications.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return timeB - timeA
    })
  } catch (error) {
    console.error("Error getting notifications:", error)
    return []
  }
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  try {
    const notificationRef = ref(database, `notifications/${notificationId}`)
    const snapshot = await get(notificationRef)

    if (!snapshot.exists()) {
      throw new Error("Notification not found")
    }

    const notification = snapshot.val() as Notification

    if (notification.userId !== userId) {
      throw new Error("Unauthorized access")
    }

    // Already read
    if (notification.read) {
      return true
    }

    // Mark as read
    await update(notificationRef, { read: true })

    // Update unread count
    const userRef = ref(database, `users/${userId}/notificationCounts/${notification.type}`)
    const countSnapshot = await get(userRef)

    if (countSnapshot.exists()) {
      const current = countSnapshot.val().unread || 0
      await update(userRef, { unread: Math.max(0, current - 1) })
    }

    return true
  } catch (error) {
    console.error("Error marking notification as read:", error)
    return false
  }
}

// Get unread notification counts
export async function getUnreadNotificationCounts(userId: string): Promise<Record<string, number>> {
  try {
    const countsRef = ref(database, `users/${userId}/notificationCounts`)
    const snapshot = await get(countsRef)

    if (!snapshot.exists()) {
      return {
        system: 0,
        social: 0,
        team: 0,
        financial: 0,
        achievement: 0,
        total: 0,
      }
    }

    const counts = snapshot.val()
    let total = 0

    Object.values(counts).forEach((typeCount: any) => {
      total += typeCount.unread || 0
    })

    return {
      system: counts.system?.unread || 0,
      social: counts.social?.unread || 0,
      team: counts.team?.unread || 0,
      financial: counts.financial?.unread || 0,
      achievement: counts.achievement?.unread || 0,
      total,
    }
  } catch (error) {
    console.error("Error getting notification counts:", error)
    return {
      system: 0,
      social: 0,
      team: 0,
      financial: 0,
      achievement: 0,
      total: 0,
    }
  }
}

