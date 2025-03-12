import { ref, push, set, get, update, serverTimestamp } from "firebase/database"
import { database } from "./firebase"

interface Transaction {
  userId: string
  type: "cash_in" | "transfer" | "commission" | "bonus" | "withdrawal"
  amount: number
  description: string
  recipientId?: string
  recipientName?: string
  method?: string
  status: "pending" | "completed" | "failed"
  timestamp: any
}

// Process a cash in (deposit) transaction
export async function processCashIn(userId: string, amount: number, method: string): Promise<string> {
  try {
    // Create transaction record
    const transaction: Transaction = {
      userId,
      type: "cash_in",
      amount,
      description: `Cash in via ${method}`,
      method,
      status: "completed",
      timestamp: serverTimestamp(),
    }

    const transactionRef = ref(database, "transactions")
    const newTransactionRef = push(transactionRef)
    await set(newTransactionRef, transaction)

    // Update user balance
    const userWalletRef = ref(database, `users/${userId}/wallet`)
    const walletSnapshot = await get(userWalletRef)

    if (walletSnapshot.exists()) {
      const wallet = walletSnapshot.val()
      await update(userWalletRef, {
        balance: (wallet.balance || 0) + amount,
        lastTransaction: {
          type: "cash_in",
          amount,
          timestamp: new Date().toISOString(),
        },
      })
    } else {
      await set(userWalletRef, {
        balance: amount,
        currency: "PHP",
        lastTransaction: {
          type: "cash_in",
          amount,
          timestamp: new Date().toISOString(),
        },
      })
    }

    return newTransactionRef.key || ""
  } catch (error) {
    console.error("Error processing cash in:", error)
    throw error
  }
}

// Process a transfer between users
export async function processTransfer(
  senderId: string,
  recipientId: string,
  recipientName: string,
  amount: number,
  description = "Transfer",
): Promise<boolean> {
  try {
    // Check sender's balance
    const senderWalletRef = ref(database, `users/${senderId}/wallet`)
    const senderWalletSnapshot = await get(senderWalletRef)

    if (!senderWalletSnapshot.exists()) {
      throw new Error("Sender wallet not found")
    }

    const senderWallet = senderWalletSnapshot.val()
    if ((senderWallet.balance || 0) < amount) {
      throw new Error("Insufficient balance")
    }

    // Create transaction records
    const outgoingTransaction: Transaction = {
      userId: senderId,
      type: "transfer",
      amount: -amount, // negative for outgoing
      description,
      recipientId,
      recipientName,
      status: "completed",
      timestamp: serverTimestamp(),
    }

    const incomingTransaction: Transaction = {
      userId: recipientId,
      type: "transfer",
      amount: amount, // positive for incoming
      description,
      recipientId: senderId, // this becomes the sender ID for the recipient
      recipientName: "", // we'd need to fetch the sender's name
      status: "completed",
      timestamp: serverTimestamp(),
    }

    // Record both transactions
    const transactionsRef = ref(database, "transactions")
    const outgoingRef = push(transactionsRef)
    const incomingRef = push(transactionsRef)

    await set(outgoingRef, outgoingTransaction)
    await set(incomingRef, incomingTransaction)

    // Update sender balance
    await update(senderWalletRef, {
      balance: (senderWallet.balance || 0) - amount,
      lastTransaction: {
        type: "transfer_out",
        amount: -amount,
        recipientName,
        timestamp: new Date().toISOString(),
      },
    })

    // Update recipient balance
    const recipientWalletRef = ref(database, `users/${recipientId}/wallet`)
    const recipientWalletSnapshot = await get(recipientWalletRef)

    if (recipientWalletSnapshot.exists()) {
      const recipientWallet = recipientWalletSnapshot.val()
      await update(recipientWalletRef, {
        balance: (recipientWallet.balance || 0) + amount,
        lastTransaction: {
          type: "transfer_in",
          amount: amount,
          // We would need to fetch sender name here
          timestamp: new Date().toISOString(),
        },
      })
    } else {
      await set(recipientWalletRef, {
        balance: amount,
        currency: "PHP",
        lastTransaction: {
          type: "transfer_in",
          amount: amount,
          timestamp: new Date().toISOString(),
        },
      })
    }

    return true
  } catch (error) {
    console.error("Error processing transfer:", error)
    throw error
  }
}

// Get a user's transaction history
export async function getUserTransactions(userId: string): Promise<any[]> {
  try {
    const transactionsRef = ref(database, "transactions")
    const snapshot = await get(transactionsRef)

    if (!snapshot.exists()) {
      return []
    }

    const transactions: any[] = []
    const data = snapshot.val()

    for (const [id, transaction] of Object.entries(data)) {
      const txData = transaction as Transaction
      if (txData.userId === userId) {
        transactions.push({
          id,
          ...txData,
        })
      }
    }

    // Sort by timestamp (most recent first)
    return transactions.sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0

      // Handle server timestamps
      const timeA = typeof a.timestamp === "object" ? a.timestamp.toDate?.() || new Date() : new Date(a.timestamp)
      const timeB = typeof b.timestamp === "object" ? b.timestamp.toDate?.() || new Date() : new Date(b.timestamp)

      return timeB.getTime() - timeA.getTime()
    })
  } catch (error) {
    console.error("Error getting user transactions:", error)
    return []
  }
}

// Get wallet balance
export async function getWalletBalance(userId: string): Promise<number> {
  try {
    const walletRef = ref(database, `users/${userId}/wallet`)
    const snapshot = await get(walletRef)

    if (!snapshot.exists()) {
      return 0
    }

    const wallet = snapshot.val()
    return wallet.balance || 0
  } catch (error) {
    console.error("Error getting wallet balance:", error)
    return 0
  }
}

