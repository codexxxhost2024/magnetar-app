"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signOut,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithCredential,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { getDatabase, ref as dbRef, update } from "firebase/database"
import { createNotification } from "@/lib/notification-service"

interface AuthContextType {
  user: User | null
  loading: boolean
  customUserData: CustomUserData | null
  setCustomUserData: React.Dispatch<React.SetStateAction<CustomUserData | null>>
  logout: () => Promise<void>
  signUp: (email: string, password: string, name: string, phone: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInAsGuest: () => Promise<void>
  signInWithPhone: () => Promise<void>
  confirmPhoneSignIn: (verificationCode: string) => Promise<void>
  resetPassword: () => Promise<void>
}

// Update the CustomUserData interface to include the new fields
export interface CustomUserData {
  appName: string
  bio: string
  createdAt: string
  email: string
  lastLogin: string
  lastUpdated: string
  location: string
  name: string
  phone: string
  photoURL: string
  profileCompleted: boolean
  socialLinks: {
    facebook?: string
    instagram?: string
    linkedin?: string
    twitter?: string
    whatsapp?: string
  }
  walletBalance: number
  isPremium?: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [customUserData, setCustomUserData] = useState<CustomUserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [verificationId, setVerificationId] = useState<string | null>(null)
  const router = useRouter()
  const database = getDatabase()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)

        const userDocRef = doc(db, "users", firebaseUser.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          setCustomUserData(userDoc.data() as CustomUserData)
        }
      } else {
        setUser(null)
        setCustomUserData(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Update the createOrUpdateUserDocument function to include the new fields
  const createOrUpdateUserDocument = async (firebaseUser: User, name: string, phone: string) => {
    const userDocRef = doc(db, "users", firebaseUser.uid)
    const userDoc = await getDoc(userDocRef)

    // Also update the user in the Realtime Database
    const userDbRef = dbRef(database, `users/${firebaseUser.uid}`)

    if (!userDoc.exists()) {
      const now = new Date().toISOString()
      const userData = {
        appName: "magnetar",
        bio: "",
        createdAt: now,
        email: firebaseUser.email,
        lastLogin: now,
        lastUpdated: now,
        location: "",
        name: name || firebaseUser.displayName || "",
        phone: phone || firebaseUser.phoneNumber || "",
        photoURL: firebaseUser.photoURL || "",
        profileCompleted: false,
        socialLinks: {
          facebook: "",
          instagram: "",
          linkedin: "",
          twitter: "",
          whatsapp: "",
        },
        walletBalance: 0,
      }

      await setDoc(userDocRef, userData)
      await update(userDbRef, userData)

      // Create welcome notification
      await createNotification(
        firebaseUser.uid,
        "Welcome to Magnetar!",
        "Thank you for joining our platform. Explore all the features and start your journey with us.",
        "system",
        { link: "/home" },
      )
    } else {
      const updateData = {
        lastLogin: new Date().toISOString(),
      }

      await setDoc(userDocRef, updateData, { merge: true })

      await update(userDbRef, updateData)
    }
  }

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await createOrUpdateUserDocument(userCredential.user, name, phone)
      router.push("/home")
    } catch (error) {
      console.error("Error during signup:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/home")
    } catch (error) {
      console.error("Error during sign in:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const userCredential = await signInWithPopup(auth, provider)
      await createOrUpdateUserDocument(
        userCredential.user,
        userCredential.user.displayName || "",
        userCredential.user.phoneNumber || "",
      )
      router.push("/home")
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Sign-in cancelled. Please try again or use another sign-in method.")
      } else {
        throw error
      }
    }
  }

  const signInAsGuest = async () => {
    try {
      const userCredential = await signInAnonymously(auth)
      await createOrUpdateUserDocument(userCredential.user, "Guest", "")
      router.push("/home")
    } catch (error) {
      console.error("Error during guest sign in:", error)
      throw error
    }
  }

  const signInWithPhone = async () => {
    const phoneNumber = localStorage.getItem("phoneNumber")
    if (!phoneNumber) {
      throw new Error("Phone number not found")
    }

    const recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
      size: "invisible",
    })
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier)
    setVerificationId(confirmationResult.verificationId)
  }

  const confirmPhoneSignIn = async (verificationCode: string) => {
    if (!verificationId) {
      throw new Error("Verification ID not found")
    }
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode)
    const userCredential = await signInWithCredential(auth, credential)
    await createOrUpdateUserDocument(userCredential.user, "", userCredential.user.phoneNumber || "")
    router.push("/home")
  }

  const logout = async () => {
    try {
      await signOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error during logout:", error)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      console.error("Error during password reset:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        customUserData,
        setCustomUserData,
        loading,
        logout,
        signUp,
        signIn,
        signInWithGoogle,
        signInAsGuest,
        signInWithPhone,
        confirmPhoneSignIn,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

