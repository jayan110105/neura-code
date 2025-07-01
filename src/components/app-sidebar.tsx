"use client"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { 
  IconFileTextFilled, 
  IconBookmarkFilled, 
  IconSquareCheckFilled, 
  IconCalendarFilled, 
  IconBrain, 
  IconSearch,
  IconAlarmFilled
} from "@tabler/icons-react"
import { Input } from "@/components/ui/input"

const menuItems = [
  {
    id: "today",
    title: "Today",
    icon: IconCalendarFilled,
  },
  {
    id: "notes",
    title: "Notes",
    icon: IconFileTextFilled,
  },
  {
    id: "bookmarks",
    title: "Bookmarks",
    icon: IconBookmarkFilled,
  },
  {
    id: "todo",
    title: "TODO",
    icon: IconSquareCheckFilled,
  },
  {
    id: "reminders",
    title: "Reminders",
    icon: IconAlarmFilled,
  },
]

interface AppSidebarProps {
  activeSection: string
  setActiveSection: (section: string) => void
}

export function AppSidebar({ activeSection, setActiveSection }: AppSidebarProps) {
  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar w-64">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-primary-foreground rounded flex items-center justify-center">
            <IconBrain className="w-4 h-4 text-primary" />
          </div>
          <h1 className="text-lg font-medium text-sidebar-foreground">Neura</h1>
        </div>

        {/* Search */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search"
            className="pl-10 bg-sidebar border-sidebar-border text-sidebar-foreground placeholder:text-muted-foreground focus:border-ring h-8"
          />
        </div>
      </SidebarHeader>

      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => setActiveSection(item.id)}
                isActive={activeSection === item.id}
                className={`w-full justify-start gap-3 px-3 py-2 rounded-md transition-all duration-150 text-sm font-medium ${
                  activeSection === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent"
                }`}
              >
                <item.icon className="!size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  )
}
