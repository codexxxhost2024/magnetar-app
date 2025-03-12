"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Lock, User, AlertCircle, Phone } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const { signIn, signInWithGoogle, signInAsGuest, signInWithPhone, confirmPhoneSignIn } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    phoneNumber: "",
    verificationCode: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [isPhoneAuth, setIsPhoneAuth] = useState(false)
  const [isVerificationSent, setIsVerificationSent] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password")
      return
    }

    try {
      setLoading(true)
      await signIn(formData.email, formData.password)
      // Redirect is handled in the signIn function
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Failed to log in")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      await signInWithGoogle()
      // Redirect is handled in the signInWithGoogle function
    } catch (err: any) {
      console.error("Google sign-in error:", err)
      if (err.message && err.message.includes("Sign-in cancelled")) {
        setError("Sign-in was cancelled. Please try again or use another sign-in method.")
      } else {
        setError(err.message || "Failed to sign in with Google")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGuestSignIn = async () => {
    try {
      setLoading(true)
      await signInAsGuest()
      // Redirect is handled in the signInAsGuest function
    } catch (err: any) {
      console.error("Guest sign-in error:", err)
      setError(err.message || "Failed to sign in as guest")
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSignIn = async () => {
    try {
      setLoading(true)
      localStorage.setItem("phoneNumber", formData.phoneNumber)
      await signInWithPhone()
      setIsVerificationSent(true)
    } catch (err: any) {
      console.error("Phone sign-in error:", err)
      setError(err.message || "Failed to send verification code")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async () => {
    try {
      setLoading(true)
      await confirmPhoneSignIn(formData.verificationCode)
      // Redirect is handled in the confirmPhoneSignIn function
    } catch (err: any) {
      console.error("Verification error:", err)
      setError(err.message || "Failed to verify code")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/20250127_191600_0000-olcvtnp0FvjK3vgbM0kkXRttTwwZNH.png"
            alt="Magnetar Logo"
            width={80}
            height={80}
            className="mb-2"
          />
          <h1 className="text-2xl font-bold text-text-primary">Welcome Back</h1>
          <p className="text-text-secondary">Log in to your Magnetar account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isPhoneAuth ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/reset-password" className="text-sm text-primary">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={loading}>
                {loading ? "Logging in..." : "Log In"}
              </Button>
            </>
          ) : (
            <>
              {!isVerificationSent ? (
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <div id="recaptcha-container"></div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="Enter your phone number"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={handlePhoneSignIn} className="w-full" disabled={loading}>
                    {loading ? "Sending code..." : "Send Verification Code"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    name="verificationCode"
                    type="text"
                    placeholder="Enter verification code"
                    value={formData.verificationCode}
                    onChange={handleChange}
                    required
                  />
                  <Button onClick={handleVerifyCode} className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Code"}
                  </Button>
                </div>
              )}
            </>
          )}
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-grow border-t border-divider"></div>
          <span className="mx-4 text-text-secondary text-sm">or continue with</span>
          <div className="flex-grow border-t border-divider"></div>
        </div>

        <div className="space-y-3">
          <Button type="button" variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => setIsPhoneAuth(!isPhoneAuth)}
            disabled={loading}
          >
            <Phone className="w-5 h-5 mr-2" />
            {isPhoneAuth ? "Switch to Email Login" : "Continue with Phone"}
          </Button>

          <Button type="button" variant="outline" className="w-full" onClick={handleGuestSignIn} disabled={loading}>
            <User className="w-5 h-5 mr-2" />
            Continue as Guest
          </Button>
        </div>

        <p className="mt-6 text-center text-text-secondary">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary font-medium">
            Sign Up
          </Link>
        </p>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  )
}

