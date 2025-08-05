"use client"

import { usePathname, useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import { BarChart3, Package, ShoppingCart, MessageSquare, TrendingUp, LogOut, Settings } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"

const sidebarItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    href: "/dashboard",
  },
  {
    id: "orders",
    label: "Order",
    icon: ShoppingCart,
    href: "/dashboard/orders",
  },
  {
    id: "active-products",
    label: "My Products",
    icon: Package,
    href: "/dashboard/active-product",
  },
  // {
  //   id: "pending-products",
  //   label: "Pending Product List",
  //   icon: PackageSearch,
  //   href: "/dashboard/pending-product",
  // },
  {
    id: "messages",
    label: "Message",
    icon: MessageSquare,
    href: "/dashboard/message",
  },
  {
    id: "sales",
    label: "My Sales",
    icon: TrendingUp,
    href: "/dashboard/my-sales",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings ,
    href: "/dashboard/settings",
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard"
    }
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return (
    <Sidebar className="!bg-[#014A14] text-white p-2">
      <SidebarHeader className="p-4 !bg-[#014A14]">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/asset/logo.png"
            width={40}
            height={53}
            alt="Table Fresh Logo"
            className="h-[53px] w-[40px]"
            priority
          />
          <div className="flex flex-col">
            <div className="">
              <p className="text-[16px] font-semibold text-white">TABLE</p>
              <p className="text-[16px] font-normal text-[#039B06]">FRESH</p>
            </div>
            <span className="text-[6px] font-medium leading-[120%] space-x-[5%] text-[#8F8F8F]">Fresh & Healthy</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="!bg-[#014A14]">
        <SidebarMenu>
          {sidebarItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => router.push(item.href)}
                isActive={isActive(item.href)}
                className="text-white text-[18px] cursor-pointer font-normal h-[50px] hover:bg-[#038C05] hover:text-white data-[active=true]:bg-[#038C05] !duration-300"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p- !bg-[#014A14]">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-white hover:bg-green-600 h-[50px] hover:text-white font-normal text-[18px] my-4 cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}