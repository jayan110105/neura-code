"use client"

import { useState } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { NotesSection } from "@/components/notes-section"
import { BookmarksSection } from "@/components/bookmarks-section"
import { TodoSection } from "@/components/todo-section"
import { RemindersSection } from "@/components/reminders-section"
import { TodaySection } from "@/components/today-section"

export default function NeuraApp() {
  const [activeSection, setActiveSection] = useState("notes")

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
        return <NotesSection />
    }
  }

  return (
    <div className="min-h-screen">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
        <main className="flex-1">{renderActiveSection()}</main>
      </SidebarProvider>
    </div>
  )
}
