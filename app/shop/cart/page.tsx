"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Trash2, Plus, Minus, ShoppingBag, CreditCard } from "lucide-react"
import Image from "next/image"
import { useAuth } from "@/contexts/auth-context"
import { getCartItems, type Product } from "@/lib/data-service"
import { toast } from "@/hooks/use-toast"

interface CartItem {
  product: Product
  quantity: number
}

export default function CartPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCart() {
      if (!user) return

      try {
        setLoading(true)
        const items = await getCartItems(user.uid)
        setCartItems(items)
      } catch (error) {
        console.error("Error loading cart:", error)
        toast({
          title: "Error",
          description: "Failed to load your cart. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [user])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const handleQuantityChange = (productId: string, change: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: Math.max(1, item.quantity + change) } : item,
      ),
    )
  }

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId))
    toast({
      title: "Item Removed",
      description: "Product has been removed from your cart",
    })
  }

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0)
  }

  const calculateShipping = () => {
    const subtotal = calculateSubtotal()
    return subtotal > 5000 ? 0 : 150
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateShipping()
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to your cart before checking out",
        variant: "destructive",
      })
      return
    }

    router.push("/shop/checkout")
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Shopping Cart</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((_, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded animate-pulse" />
                    <div className="flex-1">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
                      <div className="flex justify-between">
                        <div className="h-8 bg-gray-200 rounded w-24 animate-pulse" />
                        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-5 bg-gray-200 rounded w-24 animate-pulse" />
                    <div className="h-5 bg-gray-200 rounded w-20 animate-pulse" />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-10 bg-gray-200 rounded w-full animate-pulse" />
              </CardFooter>
            </Card>
          </div>
        ) : (
          <>
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.product.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          width={80}
                          height={80}
                          className="rounded object-cover w-20 h-20"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium mb-1">{item.product.name}</h3>
                          <p className="text-sm text-gray-500 mb-2">{formatCurrency(item.product.price)}</p>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center border rounded">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => handleQuantityChange(item.product.id, -1)}
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center">{item.quantity}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-none"
                                onClick={() => handleQuantityChange(item.product.id, 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{formatCurrency(item.product.price * item.quantity)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700"
                                onClick={() => handleRemoveItem(item.product.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping</span>
                        <span>{calculateShipping() === 0 ? "Free" : formatCurrency(calculateShipping())}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-2 border-t">
                        <span>Total</span>
                        <span>{formatCurrency(calculateTotal())}</span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full" onClick={handleCheckout}>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Checkout
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            ) : (
              <div className="text-center py-10">
                <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Add items to your cart to continue shopping</p>
                <Button onClick={() => router.push("/shop")}>Continue Shopping</Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

