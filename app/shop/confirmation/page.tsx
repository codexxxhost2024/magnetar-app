"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ShoppingBag, Home } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export default function ConfirmationPage() {
  const router = useRouter()
  const { user } = useAuth()

  // Generate a random order number
  const orderNumber = `MAG-${Math.floor(100000 + Math.random() * 900000)}`

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  return (
    <div className="pb-16">
      <div className="p-4 content-area">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="bg-green-100 p-4 rounded-full mb-4">
            <Check className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-gray-500 mb-6 text-center">
            Thank you for your purchase. Your order has been received and is being processed.
          </p>

          <Card className="w-full mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Order Number</span>
                <span className="font-medium">{orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method</span>
                <span>Credit Card</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping Method</span>
                <span>Standard Delivery</span>
              </div>
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>₱3,997</span>
              </div>
            </CardContent>
          </Card>

          <Card className="w-full mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Your order will be shipped to:</p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-medium">{user?.displayName || "User"}</p>
                <p>123 Sample Street</p>
                <p>Manila, Philippines 1000</p>
              </div>
              <p className="text-sm text-gray-500 mt-2">Estimated delivery: 3-5 business days</p>
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <Button variant="outline" className="flex-1 gap-2" onClick={() => router.push("/shop")}>
              <ShoppingBag className="h-4 w-4" />
              Continue Shopping
            </Button>
            <Button className="flex-1 gap-2" onClick={() => router.push("/home")}>
              <Home className="h-4 w-4" />
              Go to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

