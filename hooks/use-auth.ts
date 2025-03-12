"use client"

import { useAuth as useAuthFromContext } from "@/contexts/auth-context"

// Re-export the hook from the context
export const useAuth = useAuthFromContext

