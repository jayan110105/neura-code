"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar"
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
  IconCopyCheckFilled
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"

const menuItems = [
  {
    id: "search",
    title: "Search",
    icon: IconSearch,
    iconFilled: IconSearch,
  },
  {
    id: "today",
    title: "Today",
    icon: IconCalendar,
    iconFilled: IconCalendarFilled,
  },
  {
    id: "notes",
    title: "Notes",
    icon: IconFileText,
    iconFilled: IconFileTextFilled,
  },
  {
    id: "bookmarks",
    title: "Bookmarks",
    icon: IconBookmark,
    iconFilled: IconBookmarkFilled,
  },
  {
    id: "todo",
    title: "Todo",
    icon: IconCopyCheck,
    iconFilled: IconCopyCheckFilled,
  },
  {
    id: "reminders",
    title: "Reminders",
    icon: IconAlarm,
    iconFilled: IconAlarmFilled,
  },
]

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-none bg-sidebar">
      <SidebarHeader className="p-3 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconBrain className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-medium text-sidebar-foreground">Neura</h1>
          </div>
          <SidebarTrigger className="ml-auto" />
        </div>
      </SidebarHeader>

      <SidebarContent className="py-1 px-3">
        <SidebarMenu>
          {menuItems.map((item) => {
            const IconComponent = activeSection === item.id ? item.iconFilled : item.icon;
            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => setActiveSection(item.id)}
                  isActive={activeSection === item.id}
                  className={`w-full rounded-sm justify-start gap-3 px-3 !h-9 transition-all duration-150 text-sm font-medium ${
                    activeSection === item.id
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-sidebar-accent"
                  }`}
                >
                  <IconComponent className="!size-6" />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
