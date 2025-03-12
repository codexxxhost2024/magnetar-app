import { database } from "@/lib/firebase-config"
import { ref, push, set, onValue, off, query, orderByChild } from "firebase/database"

export interface ChatMessage {
  senderId: string
  senderName: string
  senderInitials: string
  text: string
  timestamp: number
}

export const sendMessage = async (
  currentUserId: string,
  currentUserName: string,
  currentUserInitials: string,
  recipientId: string,
  message: string,
): Promise<boolean> => {
  try {
    // Create a unique chat ID by combining the two user IDs (sorted alphabetically)
    const chatId = [currentUserId, recipientId].sort().join("_")

    // Reference to the chat messages
    const chatRef = ref(database, `chats/${chatId}/messages`)

    // Create a new message
    const newMessageRef = push(chatRef)

    // Set the message data
    await set(newMessageRef, {
      senderId: currentUserId,
      senderName: currentUserName,
      senderInitials: currentUserInitials,
      text: message,
      timestamp: Date.now(),
    })

    return true
  } catch (error) {
    console.error("Error sending message:", error)
    return false
  }
}

export const subscribeToChat = (
  currentUserId: string,
  recipientId: string,
  callback: (messages: ChatMessage[]) => void,
) => {
  // Create a unique chat ID by combining the two user IDs (sorted alphabetically)
  const chatId = [currentUserId, recipientId].sort().join("_")

  // Reference to the chat messages
  const chatRef = ref(database, `chats/${chatId}/messages`)

  // Create a query to order messages by timestamp
  const messagesQuery = query(chatRef, orderByChild("timestamp"))

  // Subscribe to changes
  onValue(messagesQuery, (snapshot) => {
    const messages: ChatMessage[] = []

    snapshot.forEach((childSnapshot) => {
      messages.push(childSnapshot.val() as ChatMessage)
    })

    callback(messages)
  })

  // Return a function to unsubscribe
  return () => {
    off(chatRef)
  }
}

