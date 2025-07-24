'use client'

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import {
  IconFileText,
  IconFileTextFilled,
  IconBookmark,
  IconBookmarkFilled,
  IconCalendar,
  IconCalendarFilled,
  IconBrain,
  IconSearch,
  IconAlarm,
  IconAlarmFilled,
  IconCopyCheck,
  IconCopyCheckFilled,
  IconLogout,
  IconNotebook,
} from '@tabler/icons-react'
import { authClient } from '@/lib/auth-client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useFeatureFlags } from '@/lib/feature-flags'

const menuItems = [
  {
    id: 'search',
    title: 'Search',
    icon: IconSearch,
    iconFilled: IconSearch,
    href: '/search',
    flagKey: 'showSearch' as const,
  },
  {
    id: 'today',
    title: 'Today',
    icon: IconCalendar,
    iconFilled: IconCalendarFilled,
    href: '/today',
  },
  {
    id: 'notes',
    title: 'Notes',
    icon: IconFileText,
    iconFilled: IconFileTextFilled,
    href: '/notes',
  },
  {
    id: 'daily-logs',
    title: 'Daily Logs',
    icon: IconNotebook,
    iconFilled: IconNotebook,
    href: '/daily-logs',
    flagKey: 'showLogs' as const,
  },
  {
    id: 'bookmarks',
    title: 'Bookmarks',
    icon: IconBookmark,
    iconFilled: IconBookmarkFilled,
    href: '/bookmarks',
  },
  {
    id: 'todos',
    title: 'Todo',
    icon: IconCopyCheck,
    iconFilled: IconCopyCheckFilled,
    href: '/todos',
  },
  {
    id: 'reminders',
    title: 'Reminders',
    icon: IconAlarm,
    iconFilled: IconAlarmFilled,
    href: '/reminders',
  },
  {
    id: 'testing',
    title: 'Testing',
    icon: IconFileText,
    iconFilled: IconFileTextFilled,
    href: '/testing',
    flagKey: 'showTesting' as const,
  },
]

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const featureFlags = useFeatureFlags()

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push('/sign-in')
        },
      },
    })
  }

  const visibleMenuItems = menuItems.filter((item) => {
    if (item.flagKey) {
      return featureFlags[item.flagKey]
    }
    return true
  })

  return (
    <Sidebar className="bg-sidebar border-r border-none">
      <SidebarHeader className="p-3 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBrain className="text-primary h-6 w-6" />
            <h1 className="text-sidebar-foreground text-lg font-medium">
              Neura
            </h1>
          </div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-1">
        <SidebarMenu>
          {visibleMenuItems.map((item) => {
            const isActive = pathname === item.href
            const IconComponent = isActive ? item.iconFilled : item.icon

            const handleLinkClick = () => {
              if (isMobile) {
                setOpenMobile(false)
              }
            }

            const button = (
              <SidebarMenuButton
                isActive={isActive}
                className={`!h-9 w-full justify-start gap-3 rounded-sm px-3 text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent'
                }`}
                onClick={handleLinkClick}
              >
                <IconComponent className="!size-6" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            )

            return (
              <SidebarMenuItem key={item.id}>
                <Link href={item.href} passHref>
                  {button}
                </Link>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="text-muted-foreground hover:bg-sidebar-accent !h-9 w-full justify-start gap-3 rounded-sm px-3 text-sm font-medium transition-all duration-150"
            >
              <IconLogout className="!size-6" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
