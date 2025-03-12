"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, Check, Star, CreditCard } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"

interface PlanFeature {
  name: string
  included: boolean
}

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: string
  description: string
  features: PlanFeature[]
  popular?: boolean
}

export default function SubscriptionPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const plans: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 0,
      period: "month",
      description: "Essential features for beginners",
      features: [
        { name: "Basic marketing tools", included: true },
        { name: "Limited analytics", included: true },
        { name: "Standard support", included: true },
        { name: "1 team member", included: true },
        { name: "Premium marketing tools", included: false },
        { name: "Advanced analytics", included: false },
        { name: "Priority support", included: false },
        { name: "Unlimited team members", included: false },
      ],
    },
    {
      id: "pro",
      name: "Pro",
      price: 999,
      period: "month",
      description: "Advanced features for professionals",
      features: [
        { name: "Basic marketing tools", included: true },
        { name: "Limited analytics", included: true },
        { name: "Standard support", included: true },
        { name: "5 team members", included: true },
        { name: "Premium marketing tools", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: false },
        { name: "Unlimited team members", included: false },
      ],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: 2999,
      period: "month",
      description: "Complete solution for businesses",
      features: [
        { name: "Basic marketing tools", included: true },
        { name: "Limited analytics", included: true },
        { name: "Standard support", included: true },
        { name: "Unlimited team members", included: true },
        { name: "Premium marketing tools", included: true },
        { name: "Advanced analytics", included: true },
        { name: "Priority support", included: true },
        { name: "Dedicated account manager", included: true },
      ],
    },
  ]

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe",
        variant: "destructive",
      })
      return
    }

    setSelectedPlan(planId)
    setLoading(true)

    try {
      // In a real app, this would process the subscription
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "Subscription Successful",
        description: `You are now subscribed to the ${plans.find((p) => p.id === planId)?.name} plan`,
      })

      router.push("/home")
    } catch (error) {
      console.error("Error processing subscription:", error)
      toast({
        title: "Subscription Failed",
        description: "There was a problem processing your subscription. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Subscription Plans</h1>
        <div className="w-9"></div>
      </header>

      <div className="p-4 content-area">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Choose Your Plan</h2>
          <p className="text-gray-500">Select the plan that best fits your needs</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className={`relative ${plan.popular ? "border-primary shadow-md" : ""}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white px-3 py-1 text-xs font-medium rounded-bl-lg rounded-tr-lg">
                  Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center">
                  {plan.name}
                  {plan.id !== "basic" && <Star className="h-4 w-4 ml-1 text-yellow-500 fill-yellow-500" />}
                </CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">{plan.price === 0 ? "Free" : `₱${plan.price}`}</span>
                  {plan.price > 0 && <span className="text-sm text-gray-500 ml-1">/{plan.period}</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className={`h-4 w-4 mr-2 ${feature.included ? "text-green-500" : "text-gray-300"}`} />
                      <span className={feature.included ? "" : "text-gray-400"}>{feature.name}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.id === "basic" ? "outline" : "default"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading && selectedPlan === plan.id}
                >
                  {loading && selectedPlan === plan.id ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      {plan.id === "basic" ? (
                        "Current Plan"
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Subscribe
                        </>
                      )}
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>All plans include access to the Magnetar mobile app</p>
          <p>Need help choosing? Contact our support team</p>
        </div>
      </div>
    </div>
  )
}

