"use client"

import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"

interface UserProfile {
  name?: string
  username?: string
  role?: string
  avatar?: {
    url?: string
  }
}

interface ProfileApiResponse {
  data: UserProfile
}

export function DashboardHeader() {
  const { data: session } = useSession()
  const token = (session as { accessToken?: string })?.accessToken

  const { data, isLoading, isError } = useQuery<ProfileApiResponse>({
    queryKey: ['userProfile', token],
    queryFn: async () => {
      if (!token) throw new Error("No access token available")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!res.ok) throw new Error('Failed to fetch user profile')

      return res.json()
    },
    enabled: !!token,
  })

  const user = data?.data
  const userName =
    user?.name ||
    user?.username ||
    (typeof session?.user === "object" && "name" in (session?.user ?? {}) ? (session.user as { name?: string }).name : undefined) ||
    "User"
  const userRole = user?.role
  const userAvatar = user?.avatar?.url
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-[#014A14] px-6">
      <div className="flex items-center gap-3 ml-auto">
        {isLoading ? (
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-white">Loading...</span>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-white">Error loading user</span>
          </div>
        ) : (
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-white">{userName}</span>
            {userRole && (
              <span className="text-[10px] text-gray-300 capitalize">{userRole}</span>
            )}
          </div>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
              <Link href="/dashboard/settings" className="relative h-8 w-8 rounded-full p-0">
              <Avatar className="h-8 w-8">
                {userAvatar ? (
                  <AvatarImage src={userAvatar} alt={userName} />
                ) : (
                  <AvatarFallback>{userInitial}</AvatarFallback>
                )}
              </Avatar>
              </Link>
            </Button>
          </DropdownMenuTrigger>
        </DropdownMenu>
      </div>
    </header>
  )
}
