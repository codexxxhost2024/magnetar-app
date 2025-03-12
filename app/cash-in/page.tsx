"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, CreditCard, Building, Smartphone, Wallet } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { processCashIn } from "@/lib/finance-service"
import { useAuth } from "@/contexts/auth-context"

export default function CashInPage() {
  const router = useRouter()
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  const handleCashIn = async (method: string) => {
    if (!amount || isNaN(Number(amount)) || !user) return

    setLoading(true)
    try {
      // Call the real cash-in function
      await processCashIn(user.uid, Number(amount), method)

      // Show success and redirect
      alert(`Successfully deposited ₱${amount} via ${method}`)
      router.push("/home")
    } catch (error) {
      console.error("Error processing cash in:", error)
      alert("Failed to process your cash in. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const presetAmounts = [100, 500, 1000, 5000]

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Cash In</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Enter Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative mb-4">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">₱</div>
              <Input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ""))}
                className="pl-8 text-xl font-bold"
                placeholder="0.00"
              />
            </div>

            <div className="grid grid-cols-4 gap-2 mb-4">
              {presetAmounts.map((preset) => (
                <Button
                  key={preset}
                  variant="outline"
                  onClick={() => setAmount(preset.toString())}
                  className="font-medium"
                >
                  ₱{preset}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="bank" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="bank">Bank</TabsTrigger>
            <TabsTrigger value="card">Card</TabsTrigger>
            <TabsTrigger value="mobile">Mobile</TabsTrigger>
          </TabsList>

          <TabsContent value="bank">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCashIn("BDO")}
                >
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">BDO</h3>
                    <p className="text-sm text-gray-500">No fees</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                </div>

                <div
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCashIn("BPI")}
                >
                  <div className="bg-red-100 p-2 rounded-full mr-3">
                    <Building className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">BPI</h3>
                    <p className="text-sm text-gray-500">No fees</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                </div>

                <div
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCashIn("Metrobank")}
                >
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <Building className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Metrobank</h3>
                    <p className="text-sm text-gray-500">No fees</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="card">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCashIn("Visa")}
                >
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <CreditCard className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Visa</h3>
                    <p className="text-sm text-gray-500">2.5% fee</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                </div>

                <div
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCashIn("Mastercard")}
                >
                  <div className="bg-orange-100 p-2 rounded-full mr-3">
                    <CreditCard className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Mastercard</h3>
                    <p className="text-sm text-gray-500">2.5% fee</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="mobile">
            <Card>
              <CardContent className="p-4 space-y-4">
                <div
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCashIn("GCash")}
                >
                  <div className="bg-blue-100 p-2 rounded-full mr-3">
                    <Smartphone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">GCash</h3>
                    <p className="text-sm text-gray-500">2% fee</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                </div>

                <div
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCashIn("PayMaya")}
                >
                  <div className="bg-purple-100 p-2 rounded-full mr-3">
                    <Smartphone className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">PayMaya</h3>
                    <p className="text-sm text-gray-500">2% fee</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                </div>

                <div
                  className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                  onClick={() => handleCashIn("Coins.ph")}
                >
                  <div className="bg-green-100 p-2 rounded-full mr-3">
                    <Wallet className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Coins.ph</h3>
                    <p className="text-sm text-gray-500">1.5% fee</p>
                  </div>
                  <ChevronLeft className="h-5 w-5 ml-auto transform rotate-180" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500 mt-4">
          <p>Need help? Contact our support team</p>
          <p>Available 24/7</p>
        </div>
      </div>
    </div>
  )
}

