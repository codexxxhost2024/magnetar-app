"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft, TrendingUp, TrendingDown, Calendar, Filter, Download } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"
import { getUserTransactions } from "@/lib/finance-service"
import { onValue, ref } from "firebase/database"
import { database } from "@/lib/firebase"

interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  description: string
  date: string
  category: string
}

export default function FinancePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")

  const [transactions, setTransactions] = useState<any[]>([])
  const [walletBalance, setWalletBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expenses, setExpenses] = useState(0)

  useEffect(() => {
    if (!user) return

    if (!database) {
      throw new Error("Database instance is not initialized")
    }

    // Subscribe to wallet changes
    const walletRef = ref(database, `users/${user.uid}/wallet`)
    const walletUnsubscribe = onValue(walletRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val()
        setWalletBalance(data.balance || 0)
      }
    })

    // Load transaction history
    const loadTransactions = async () => {
      try {
        const userTransactions = await getUserTransactions(user.uid)
        setTransactions(userTransactions)

        // Calculate income and expenses
        let totalIncome = 0
        let totalExpense = 0

        userTransactions.forEach((tx) => {
          if (tx.amount > 0) {
            totalIncome += tx.amount
          } else {
            totalExpense += Math.abs(tx.amount)
          }
        })

        setIncome(totalIncome)
        setExpenses(totalExpense)
      } catch (error) {
        console.error("Error loading transactions:", error)
      }
    }

    loadTransactions()

    return () => {
      walletUnsubscribe()
    }
  }, [user])

  const totalIncome = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)

  const totalExpense = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0)

  const netIncome = walletBalance

  const incomeByCategory = {
    Commission: 8500,
    Bonus: 2500,
    Sales: 4200,
  }

  const expenseByCategory = {
    Marketing: 1200,
    Education: 800,
    Events: 1500,
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <div className="pb-16">
      <header className="app-header">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Finance</h1>
        <Button variant="ghost" size="icon">
          <Download className="h-5 w-5" />
        </Button>
      </header>

      <div className="p-4 content-area">
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Total Balance</h2>
              <span className="text-sm text-gray-500">March 2025</span>
            </div>
            <div className="text-3xl font-bold mb-4">{formatCurrency(netIncome)}</div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Income</p>
                  <p className="font-bold">{formatCurrency(totalIncome)}</p>
                </div>
              </div>

              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-full mr-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Expenses</p>
                  <p className="font-bold">{formatCurrency(totalExpense)}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center gap-4">
              <Button className="flex-1" onClick={() => router.push("/cash-in")}>
                Cash In
              </Button>
              <Button className="flex-1" onClick={() => router.push("/transfer")}>
                Transfer
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Recent Transactions</CardTitle>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Filter className="h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.length > 0 ? (
                    transactions.slice(0, 5).map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
                      >
                        <div className="flex items-center">
                          <div
                            className={`p-2 rounded-full mr-3 ${
                              transaction.amount > 0 ? "bg-green-100" : "bg-red-100"
                            }`}
                          >
                            {transaction.amount > 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.description}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className={`font-bold ${transaction.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                          {transaction.amount > 0 ? "+" : "-"}
                          {formatCurrency(Math.abs(transaction.amount))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-gray-500 py-4">No transactions yet</p>
                  )}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Transactions
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Income Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(incomeByCategory).map(([category, amount], index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span>{category}</span>
                        <span className="font-bold">{formatCurrency(amount)}</span>
                      </div>
                      <Progress value={(amount / totalIncome) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Income</span>
                    <span className="font-bold text-green-600">{formatCurrency(totalIncome)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Expense Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(expenseByCategory).map(([category, amount], index) => (
                    <div key={index}>
                      <div className="flex justify-between items-center mb-1">
                        <span>{category}</span>
                        <span className="font-bold">{formatCurrency(amount)}</span>
                      </div>
                      <Progress value={(amount / totalExpense) * 100} className="h-2" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Expenses</span>
                    <span className="font-bold text-red-600">{formatCurrency(totalExpense)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {activeTab === "overview" && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base">Financial Calendar</CardTitle>
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  March 2025
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-6">
                <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 mb-4">View your financial events and scheduled payments</p>
                <Button>Open Calendar</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

