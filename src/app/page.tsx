"use client"

import { useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger, useSidebar } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { NotesSection } from "@/components/notes-section"
import { BookmarksSection } from "@/components/bookmarks-section"
import { TodoSection } from "@/components/todo-section"
import { RemindersSection } from "@/components/reminders-section"
import { TodaySection } from "@/components/today-section"

function AppContent({ activeSection, setActiveSection }: { activeSection: string, setActiveSection: (section: string) => void }) {
  const { open } = useSidebar()

  const renderActiveSection = () => {
    switch (activeSection) {
      case "notes":
        return <NotesSection />
      case "bookmarks":
        return <BookmarksSection />
      case "todo":
        return <TodoSection />
      case "reminders":
        return <RemindersSection />
      case "today":
        return <TodaySection />
      default:
        return <TodaySection />
    }
  }

  return (
    <SidebarInset>
      <div className="h-[55px] flex items-center px-4">
        {!open && <SidebarTrigger/>}
      </div>
      <main className="flex-1">{renderActiveSection()}</main>
    </SidebarInset>
  )
}

export default function NeuraApp() {
  const [activeSection, setActiveSection] = useState("today")

  return (
    <div className="min-h-screen">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <AppContent activeSection={activeSection} setActiveSection={setActiveSection} />
      </SidebarProvider>
    </div>
  )
}
