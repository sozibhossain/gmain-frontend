"use client"

import { useSession as useNextAuthSession } from "next-auth/react"

export function useSession() {
  const { data: session, status } = useNextAuthSession()

  return {
    session,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    user: session?.user,
    accessToken: session?.accessToken,
    refreshToken: session?.refreshToken,
  }
}
