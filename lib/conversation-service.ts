import { ref, push, set, get, update, onValue, off } from "firebase/database"
import { database } from "./firebase"

export interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: string
}

export interface Conversation {
  id: string
  personaId: string
  personaName: string
  messages: Message[]
  createdAt: string
  updatedAt: string
  tokensUsed: number
}

export interface UserTokens {
  total: number
  used: number
  remaining: number
  lastRefill: string
}

// Default token allocation
const DEFAULT_TOKENS = 1000
const TOKEN_REFILL_INTERVAL_DAYS = 7

// Create or update a conversation
export async function saveConversation(
  userId: string,
  personaId: string,
  personaName: string,
  messages: Message[],
  tokensUsed: number,
): Promise<string> {
  try {
    if (!database) {
      console.error("Database is not initialized")
      throw new Error("Database is not initialized")
    }

    // Check if this is a new conversation or updating an existing one
    const userConversationsRef = ref(database, `conversations/${userId}`)
    const snapshot = await get(userConversationsRef)

    let conversationId = ""
    let existingConversation = null

    // Look for an existing conversation with this persona
    if (snapshot.exists()) {
      const conversations = snapshot.val()
      for (const [id, conv] of Object.entries(conversations)) {
        const conversation = conv as any
        if (conversation.personaId === personaId) {
          conversationId = id
          existingConversation = conversation
          break
        }
      }
    }

    const now = new Date().toISOString()

    if (existingConversation) {
      // Update existing conversation
      const conversationRef = ref(database, `conversations/${userId}/${conversationId}`)
      await update(conversationRef, {
        messages,
        updatedAt: now,
        tokensUsed: existingConversation.tokensUsed + tokensUsed,
      })
    } else {
      // Create new conversation
      const newConversationRef = push(ref(database, `conversations/${userId}`))
      conversationId = newConversationRef.key || ""

      await set(newConversationRef, {
        personaId,
        personaName,
        messages,
        createdAt: now,
        updatedAt: now,
        tokensUsed,
      })
    }

    // Update user's token usage
    await updateTokenUsage(userId, tokensUsed)

    return conversationId
  } catch (error) {
    console.error("Error saving conversation:", error)
    throw error
  }
}

// Get all conversations for a user
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  try {
    if (!database) {
      console.error("Database is not initialized")
      return []
    }

    const userConversationsRef = ref(database, `conversations/${userId}`)
    const snapshot = await get(userConversationsRef)

    if (!snapshot.exists()) {
      return []
    }

    const conversations: Conversation[] = []
    const data = snapshot.val()

    for (const [id, conversation] of Object.entries(data)) {
      conversations.push({
        id,
        ...(conversation as any),
      })
    }

    // Sort by most recent first
    return conversations.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  } catch (error) {
    console.error("Error getting user conversations:", error)
    return []
  }
}

// Get a specific conversation
export async function getConversation(userId: string, conversationId: string): Promise<Conversation | null> {
  try {
    if (!database) {
      console.error("Database is not initialized")
      return null
    }

    const conversationRef = ref(database, `conversations/${userId}/${conversationId}`)
    const snapshot = await get(conversationRef)

    if (!snapshot.exists()) {
      return null
    }

    return {
      id: conversationId,
      ...(snapshot.val() as any),
    }
  } catch (error) {
    console.error("Error getting conversation:", error)
    return null
  }
}

// Delete a conversation
export async function deleteConversation(userId: string, conversationId: string): Promise<boolean> {
  try {
    if (!database) {
      console.error("Database is not initialized")
      return false
    }

    const conversationRef = ref(database, `conversations/${userId}/${conversationId}`)
    await set(conversationRef, null)
    return true
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return false
  }
}

// Get user's token information
export async function getUserTokens(userId: string): Promise<UserTokens> {
  try {
    if (!database) {
      console.error("Database is not initialized")
      return {
        total: DEFAULT_TOKENS,
        used: 0,
        remaining: DEFAULT_TOKENS,
        lastRefill: new Date().toISOString(),
      }
    }

    const tokensRef = ref(database, `users/${userId}/personaTokens`)
    const snapshot = await get(tokensRef)

    if (!snapshot.exists()) {
      // Initialize tokens if they don't exist
      const defaultTokens: UserTokens = {
        total: DEFAULT_TOKENS,
        used: 0,
        remaining: DEFAULT_TOKENS,
        lastRefill: new Date().toISOString(),
      }

      await set(tokensRef, defaultTokens)
      return defaultTokens
    }

    return snapshot.val() as UserTokens
  } catch (error) {
    console.error("Error getting user tokens:", error)
    return {
      total: DEFAULT_TOKENS,
      used: 0,
      remaining: DEFAULT_TOKENS,
      lastRefill: new Date().toISOString(),
    }
  }
}

// Update token usage
export async function updateTokenUsage(userId: string, tokensUsed: number): Promise<UserTokens> {
  try {
    if (!database) {
      console.error("Database is not initialized")
      throw new Error("Database is not initialized")
    }

    // Get current token info
    const tokens = await getUserTokens(userId)

    // Check if tokens need to be refilled (weekly)
    const lastRefill = new Date(tokens.lastRefill)
    const now = new Date()
    const daysSinceRefill = Math.floor((now.getTime() - lastRefill.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceRefill >= TOKEN_REFILL_INTERVAL_DAYS) {
      // Refill tokens
      const updatedTokens: UserTokens = {
        total: DEFAULT_TOKENS,
        used: tokensUsed,
        remaining: DEFAULT_TOKENS - tokensUsed,
        lastRefill: now.toISOString(),
      }

      await set(ref(database, `users/${userId}/personaTokens`), updatedTokens)
      return updatedTokens
    } else {
      // Update existing tokens
      const updatedTokens: UserTokens = {
        ...tokens,
        used: tokens.used + tokensUsed,
        remaining: Math.max(0, tokens.remaining - tokensUsed),
      }

      await set(ref(database, `users/${userId}/personaTokens`), updatedTokens)
      return updatedTokens
    }
  } catch (error) {
    console.error("Error updating token usage:", error)
    throw error
  }
}

// Subscribe to token changes
export function subscribeToTokens(userId: string, callback: (tokens: UserTokens) => void): () => void {
  if (!database) {
    console.error("Database is not initialized")
    // Return a no-op function
    return () => {}
  }

  const tokensRef = ref(database, `users/${userId}/personaTokens`)

  const listener = onValue(tokensRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.val() as UserTokens)
    } else {
      // Initialize tokens if they don't exist
      const defaultTokens: UserTokens = {
        total: DEFAULT_TOKENS,
        used: 0,
        remaining: DEFAULT_TOKENS,
        lastRefill: new Date().toISOString(),
      }

      set(tokensRef, defaultTokens)
        .then(() => callback(defaultTokens))
        .catch((error) => console.error("Error initializing tokens:", error))
    }
  })

  // Return unsubscribe function
  return () => off(tokensRef, "value", listener)
}

