import { ref, push, set, get, update, remove, serverTimestamp, onValue } from "firebase/database"
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage"
import { database, storage } from "@/lib/firebase"

interface PostComment {
  userId: string
  userName: string
  userInitials: string
  comment: string
  timestamp: any
}

interface Post {
  userId: string
  userDisplayName: string
  userInitials: string
  content: string
  image?: string
  video?: string
  likes: number
  comments: PostComment[]
  timestamp: any
}

// Create a new post
export async function createPost(
  userId: string,
  displayName: string,
  initials: string,
  content: string,
  image?: File,
  video?: string,
): Promise<string> {
  try {
    let imageUrl = ""

    // Upload image if provided
    if (image) {
      const imageRef = storageRef(storage, `posts/${userId}/${Date.now()}_${image.name}`)
      await uploadBytes(imageRef, image)
      imageUrl = await getDownloadURL(imageRef)
    }

    // Create post in database
    const post: Post = {
      userId,
      userDisplayName: displayName,
      userInitials: initials,
      content,
      ...(imageUrl && { image: imageUrl }),
      ...(video && { video }),
      likes: 0,
      comments: [],
      timestamp: serverTimestamp(),
    }

    const postsRef = ref(database, "posts")
    const newPostRef = push(postsRef)

    await set(newPostRef, post)

    return newPostRef.key || ""
  } catch (error) {
    console.error("Error creating post:", error)
    throw error
  }
}

// Get all posts (with optional limit)
export async function getPosts(limit?: number): Promise<any[]> {
  try {
    const postsRef = ref(database, "posts")
    const snapshot = await get(postsRef)

    if (!snapshot.exists()) {
      return []
    }

    const posts: any[] = []
    const data = snapshot.val()

    for (const [id, post] of Object.entries(data)) {
      posts.push({
        id,
        ...(post as any),
      })
    }

    // Sort by timestamp (newest first)
    posts.sort((a, b) => {
      const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0
      const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0
      return timeB - timeA
    })

    // Apply limit if specified
    return limit ? posts.slice(0, limit) : posts
  } catch (error) {
    console.error("Error getting posts:", error)
    return []
  }
}

// Add comment to a post
export async function addComment(
  postId: string,
  userId: string,
  userName: string,
  userInitials: string,
  comment: string,
): Promise<boolean> {
  try {
    const postRef = ref(database, `posts/${postId}`)
    const snapshot = await get(postRef)

    if (!snapshot.exists()) {
      throw new Error("Post not found")
    }

    const post = snapshot.val()
    const comments = post.comments || []

    const newComment: PostComment = {
      userId,
      userName,
      userInitials,
      comment,
      timestamp: serverTimestamp(),
    }

    comments.push(newComment)

    await update(postRef, { comments })

    return true
  } catch (error) {
    console.error("Error adding comment:", error)
    return false
  }
}

// Like or unlike a post
export async function toggleLike(postId: string, userId: string): Promise<boolean> {
  try {
    // First check if user already liked the post
    const likeRef = ref(database, `postLikes/${postId}/${userId}`)
    const likeSnapshot = await get(likeRef)

    const postRef = ref(database, `posts/${postId}`)
    const postSnapshot = await get(postRef)

    if (!postSnapshot.exists()) {
      throw new Error("Post not found")
    }

    const post = postSnapshot.val()
    const currentLikes = post.likes || 0

    if (likeSnapshot.exists()) {
      // User already liked the post, so unlike it
      await remove(likeRef)
      await update(postRef, { likes: Math.max(0, currentLikes - 1) })
    } else {
      // User hasn't liked the post, so like it
      await set(likeRef, true)
      await update(postRef, { likes: currentLikes + 1 })
    }

    return true
  } catch (error) {
    console.error("Error toggling like:", error)
    return false
  }
}

// Subscribe to posts with real-time updates
export function subscribeToPostUpdates(callback: (posts: any[]) => void): () => void {
  const postsRef = ref(database, "posts")

  const listener = onValue(postsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([])
      return
    }

    const posts: any[] = []
    const data = snapshot.val()

    for (const [id, post] of Object.entries(data)) {
      posts.push({
        id,
        ...(post as any),
      })
    }

    // Sort by timestamp (newest first)
    posts.sort((a, b) => {
      // Handle server timestamps
      const timeA =
        typeof a.timestamp === "object"
          ? a.timestamp?.seconds * 1000 || Date.now()
          : a.timestamp
            ? new Date(a.timestamp).getTime()
            : 0
      const timeB =
        typeof b.timestamp === "object"
          ? b.timestamp?.seconds * 1000 || Date.now()
          : b.timestamp
            ? new Date(b.timestamp).getTime()
            : 0

      return timeB - timeA
    })

    callback(posts)
  })

  // Return unsubscribe function
  return () => onValue(postsRef, listener)
}

