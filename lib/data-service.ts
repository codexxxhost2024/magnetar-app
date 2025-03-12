import { storage, firestore } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  addDoc,
} from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { v4 as uuidv4 } from "uuid"
import type { CustomUserData } from "@/contexts/auth-context"

// Types
export interface AppItem {
  id: string
  name: string
  description: string
  icon: string
  rating: number
  downloads: string
  category: string
  installed?: boolean
}

export interface GameItem {
  id: string
  name: string
  image: string
  category: string
  players: string
  duration: string
  description: string
}

export interface MediaItem {
  id: string
  title: string
  thumbnail: string
  duration: string
  category: string
  date: string
  videoUrl?: string
}

export interface Product {
  id: string
  name: string
  image: string
  price: number
  rating: number
  category: string
  inStock: boolean
}

export interface MarketingTool {
  id: string
  name: string
  description: string
  iconName: string
  category: string
  isPremium: boolean
}

export interface Member {
  id: string
  displayName: string
  photoURL: string
  rank: string
  joinDate: string
  earnings: number
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  category: string
  progress: number
}

export interface UserProfile {
  displayName?: string
  photoURL?: string
  phoneNumber?: string
  address?: string
  bio?: string
}

// Apps
export async function getApps(userId: string): Promise<AppItem[]> {
  try {
    const appsRef = collection(firestore, "apps")
    const appsSnapshot = await getDocs(appsRef)

    // Get user's installed apps
    const userAppsRef = collection(firestore, "users", userId, "installedApps")
    const userAppsSnapshot = await getDocs(userAppsRef)
    const installedAppIds = userAppsSnapshot.docs.map((doc) => doc.id)

    return appsSnapshot.docs.map((doc) => {
      const data = doc.data() as AppItem
      return {
        ...data,
        id: doc.id,
        installed: installedAppIds.includes(doc.id),
      }
    })
  } catch (error) {
    console.error("Error fetching apps:", error)
    return []
  }
}

export async function installApp(userId: string, appId: string): Promise<boolean> {
  try {
    await setDoc(doc(firestore, "users", userId, "installedApps", appId), {
      installedAt: Timestamp.now(),
    })
    return true
  } catch (error) {
    console.error("Error installing app:", error)
    return false
  }
}

// Games
export async function getGames(): Promise<GameItem[]> {
  try {
    const gamesRef = collection(firestore, "games")
    const gamesSnapshot = await getDocs(gamesRef)

    return gamesSnapshot.docs.map((doc) => {
      const data = doc.data() as GameItem
      return {
        ...data,
        id: doc.id,
      }
    })
  } catch (error) {
    console.error("Error fetching games:", error)
    return []
  }
}

// Media
export async function getMediaItems(category = "all"): Promise<MediaItem[]> {
  try {
    const mediaCollection = collection(firestore, "media")

    const mediaQuery = category !== "all" ? query(mediaCollection, where("category", "==", category)) : mediaCollection

    const mediaSnapshot = await getDocs(mediaQuery)

    return mediaSnapshot.docs.map((doc) => {
      const data = doc.data() as MediaItem
      return {
        ...data,
        id: doc.id,
      }
    })
  } catch (error) {
    console.error("Error fetching media:", error)
    return []
  }
}

export async function uploadMedia(
  userId: string,
  file: File,
  metadata: { title: string; category: string; description?: string },
): Promise<string | null> {
  try {
    const fileId = uuidv4()
    const fileExtension = file.name.split(".").pop()
    const storagePath = `media/${userId}/${fileId}.${fileExtension}`
    const storageRef = ref(storage, storagePath)

    await uploadBytes(storageRef, file)
    const downloadUrl = await getDownloadURL(storageRef)

    return downloadUrl
  } catch (error) {
    console.error("Error uploading media:", error)
    return null
  }
}

// Products
export async function getProducts(category = "all"): Promise<Product[]> {
  try {
    const productsCollection = collection(firestore, "products")

    const productsQuery =
      category !== "all" ? query(productsCollection, where("category", "==", category)) : productsCollection

    const productsSnapshot = await getDocs(productsQuery)

    return productsSnapshot.docs.map((doc) => {
      const data = doc.data() as Product
      return {
        ...data,
        id: doc.id,
      }
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function addToCart(userId: string, productId: string, quantity = 1): Promise<boolean> {
  try {
    const cartItemRef = doc(firestore, "users", userId, "cart", productId)
    const cartItemDoc = await getDoc(cartItemRef)

    if (cartItemDoc.exists()) {
      // Update quantity if item already in cart
      const currentQuantity = cartItemDoc.data().quantity || 0
      await updateDoc(cartItemRef, {
        quantity: currentQuantity + quantity,
      })
    } else {
      // Add new item to cart
      await setDoc(cartItemRef, {
        productId,
        quantity,
        addedAt: Timestamp.now(),
      })
    }

    return true
  } catch (error) {
    console.error("Error adding to cart:", error)
    return false
  }
}

export async function getCartItems(userId: string): Promise<{ product: Product; quantity: number }[]> {
  try {
    const cartRef = collection(firestore, "users", userId, "cart")
    const cartSnapshot = await getDocs(cartRef)

    const cartItems = cartSnapshot.docs.map((doc) => ({
      productId: doc.id,
      quantity: doc.data().quantity || 1,
    }))

    // Get product details for each cart item
    const cartWithProducts = await Promise.all(
      cartItems.map(async (item) => {
        const productDoc = await getDoc(doc(firestore, "products", item.productId))
        if (productDoc.exists()) {
          return {
            product: { ...productDoc.data(), id: productDoc.id } as Product,
            quantity: item.quantity,
          }
        }
        return null
      }),
    )

    return cartWithProducts.filter((item) => item !== null) as { product: Product; quantity: number }[]
  } catch (error) {
    console.error("Error fetching cart:", error)
    return []
  }
}

// Marketing Tools
export async function getMarketingTools(): Promise<MarketingTool[]> {
  try {
    const toolsRef = collection(firestore, "marketingTools")
    const toolsSnapshot = await getDocs(toolsRef)

    return toolsSnapshot.docs.map((doc) => {
      const data = doc.data() as MarketingTool
      return {
        ...data,
        id: doc.id,
      }
    })
  } catch (error) {
    console.error("Error fetching marketing tools:", error)
    return []
  }
}

// Lottery
export interface LotteryDraw {
  id: string
  date: string
  numbers: number[]
  jackpot: string
}

export async function getLotteryDraws(): Promise<LotteryDraw[]> {
  try {
    const drawsRef = collection(firestore, "lotteryDraws")
    const drawsQuery = query(drawsRef, orderBy("drawDate", "desc"), limit(5))
    const drawsSnapshot = await getDocs(drawsQuery)

    return drawsSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        date: data.drawDate.toDate().toLocaleDateString(),
        numbers: data.numbers,
        jackpot: data.jackpot,
      }
    })
  } catch (error) {
    console.error("Error fetching lottery draws:", error)
    return []
  }
}

export async function buyLotteryTicket(userId: string, numbers: number[], cost: number): Promise<boolean> {
  try {
    // First check if user has enough balance
    const userDoc = await getDoc(doc(firestore, "users", userId))
    if (!userDoc.exists()) return false

    const balance = userDoc.data().walletBalance || 0
    if (balance < cost) return false

    // Create the ticket
    const ticketsRef = collection(firestore, "users", userId, "lotteryTickets")
    await addDoc(ticketsRef, {
      numbers,
      purchaseDate: Timestamp.now(),
      cost,
      drawDate: null, // This would be set to the next draw date
      result: null,
    })

    // Deduct from wallet
    await updateDoc(doc(firestore, "users", userId), {
      walletBalance: balance - cost,
    })

    return true
  } catch (error) {
    console.error("Error buying lottery ticket:", error)
    return false
  }
}

// User profile and settings
export async function updateUserProfile(userId: string, profileData: Partial<CustomUserData>): Promise<boolean> {
  try {
    const userDocRef = doc(firestore, "users", userId)
    await updateDoc(userDocRef, {
      ...profileData,
      lastUpdated: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("Error updating profile:", error)
    return false
  }
}

export async function updateUserSettings(
  userId: string,
  settings: {
    notifications?: {
      push?: boolean
      email?: boolean
      sms?: boolean
    }
    privacy?: {
      profileVisibility?: boolean
      showOnlineStatus?: boolean
      showActivity?: boolean
    }
    language?: string
  },
): Promise<boolean> {
  try {
    await updateDoc(doc(firestore, "users", userId), {
      settings,
      updatedAt: Timestamp.now(),
    })
    return true
  } catch (error) {
    console.error("Error updating settings:", error)
    return false
  }
}

// Members
export async function getMembers(userId: string): Promise<Member[]> {
  try {
    const membersRef = collection(firestore, "members")
    const membersSnapshot = await getDocs(query(membersRef, where("uplineId", "==", userId)))

    return membersSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        displayName: data.name,
        photoURL: data.avatar || "",
        rank: data.rank,
        joinDate: data.joinDate,
        earnings: data.earnings || 0,
      }
    })
  } catch (error) {
    console.error("Error fetching members:", error)
    return []
  }
}

export async function addTeamMember(
  userId: string,
  memberData: { name: string; email: string; rank: string },
): Promise<boolean> {
  try {
    const newMemberRef = doc(collection(firestore, "members"))
    await setDoc(newMemberRef, {
      ...memberData,
      uplineId: userId,
      joinDate: new Date().toLocaleDateString(),
      earnings: 0,
    })
    return true
  } catch (error) {
    console.error("Error adding team member:", error)
    return false
  }
}

// Courses

export async function getCourses(): Promise<Course[]> {
  try {
    const coursesRef = collection(firestore, "courses")
    const coursesSnapshot = await getDocs(coursesRef)

    return coursesSnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        duration: data.duration,
        category: data.category,
        progress: data.progress,
      }
    })
  } catch (error) {
    console.error("Error fetching courses:", error)
    return []
  }
}

