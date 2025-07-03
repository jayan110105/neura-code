'use client'

import { useState } from 'react'
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { NotesSection } from '@/components/notes-section'
import { BookmarksSection } from '@/components/bookmarks-section'
import { TodoSection } from '@/components/todo-section'
import { RemindersSection } from '@/components/reminders-section'
import { TodaySection } from '@/components/today-section'
import { Todo, Reminder, Note, Bookmark } from '@/types'

type AppContentProps = {
  todos: Todo[]
  reminders: Reminder[]
  notes: Note[]
  bookmarks: Bookmark[]
}

export function AppContent({
  todos,
  reminders,
  notes,
  bookmarks,
}: AppContentProps) {
  const [activeSection, setActiveSection] = useState('today')

  function PageContent({ activeSection }: { activeSection: string }) {
    const { open } = useSidebar()

    const renderActiveSection = () => {
      switch (activeSection) {
        case 'notes':
          return <NotesSection notes={notes} />
        case 'bookmarks':
          return <BookmarksSection bookmarks={bookmarks} />
        case 'todo':
          return <TodoSection todos={todos} />
        case 'reminders':
          return <RemindersSection reminders={reminders} />
        case 'today':
          return (
            <TodaySection
              todos={todos}
              reminders={reminders}
              notes={notes}
              bookmarks={bookmarks}
            />
          )
        default:
          return (
            <TodaySection
              todos={todos}
              reminders={reminders}
              notes={notes}
              bookmarks={bookmarks}
            />
          )
      }
    }

    return (
      <SidebarInset>
        <div className="flex h-[55px] items-center px-4">
          {!open && <SidebarTrigger />}
        </div>
        <main className="flex-1">{renderActiveSection()}</main>
      </SidebarInset>
    )
  }

  return (
    <div className="min-h-screen">
      <SidebarProvider defaultOpen={true}>
        <AppSidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
        />
        <PageContent activeSection={activeSection} />
      </SidebarProvider>
    </div>
  )
}
