'use client'

import { useTransition, useEffect, useState } from "react"
import { Home, LogOut, Package, ShoppingCart, Users, FolderTree, Building2, ArrowLeftRight, Tags } from "lucide-react"
import { useRouter } from 'next/navigation'
import { AuthUser, verifyAuth } from "@/app/lib/auth"
import { logout } from '@/app/actions/auth'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [hasAccess, setHasAccess] = useState<AuthUser | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    startTransition(async () => {
      try {
        const result = await verifyAuth()
        setHasAccess(result)
      } catch (error) {
        console.error(error)
        setHasAccess(null)
      } finally {
        setIsLoaded(true)
      }
    })
  }, [])

  const handleLogout = async () => {
    startTransition(async () => {
      try {
        await logout()
        router.push('/login')
        router.refresh()
      } catch (error) {
        console.error('Logout failed:', error)
      }
    })
  }

  const items = [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
      hasPermission: hasAccess,
    },
    {
      title: "Product",
      url: "product",
      icon: Package,
      hasPermission: hasAccess,
    },
    {
      title: "Order",
      url: "order",
      icon: ShoppingCart,
      hasPermission: hasAccess,
    },
    {
      title: "User",
      url: "user",
      icon: Users,
      hasPermission: hasAccess,
    },
    {
      title: "Category",
      url: "category",
      icon: FolderTree,
      hasPermission: hasAccess,
    },
    {
      title: "Supplier",
      url: "supplier",
      icon: Building2,
      hasPermission: hasAccess,
    },
    {
      title: "Transactions",
      url: "inventory-transaction",
      icon: ArrowLeftRight,
      hasPermission: hasAccess,
    },
    {
      title: "Transaction Types",
      url: "transaction-type",
      icon: Tags,
      hasPermission: hasAccess,
    },
    {
      title: "Logout",
      icon: LogOut,
      onClick: handleLogout,
      hasPermission: true,
    }
  ]

  return (
    <Sidebar>
      <div className="flex flex-col h-full">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Application</SidebarGroupLabel>
            <SidebarGroupContent className={cn(
              "transition-opacity duration-300",
              !isLoaded && "opacity-0",
              isLoaded && "opacity-100"
            )}>
              <SidebarMenu>
                {items.filter(item => item.title !== 'Logout').map((item) => (
                  <SidebarMenuItem key={item.title}>
                    {((item.hasPermission === true) || (item.hasPermission === hasAccess)) && (
                      <SidebarMenuButton asChild>
                        <a href={item.url}>
                          <item.icon />
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    )}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <div className="mt-auto flex items-center justify-center p-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-[95%] justify-start text-red-500 hover:text-red-600 hover:bg-red-100/50 dark:hover:bg-red-900/50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </Sidebar>
  )
}
