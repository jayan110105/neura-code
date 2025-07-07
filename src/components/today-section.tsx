'use client'

import { useRouter } from 'next/navigation'
import { NotesGrid } from '@/components/today/notes-grid'
import { BookmarksGrid } from '@/components/today/bookmarks-grid'
import { TodosList } from '@/components/today/todos-list'
import { RemindersList } from '@/components/today/reminders-list'
import { DailyLogsSummary } from '@/components/today/daily-logs-summary'
import { Todo, Reminder, Note, Bookmark, DailyLog, DailySummary } from '@/types'

interface TodaySectionProps {
  todos: Todo[]
  reminders: Reminder[]
  notes: Note[]
  bookmarks: Bookmark[]
  dailyLogs: DailyLog[]
  dailySummary: DailySummary | null
}

export function TodaySection({
  todos,
  reminders,
  notes,
  bookmarks,
  dailyLogs,
  dailySummary,
}: TodaySectionProps) {
  const router = useRouter()

  const handleNoteClick = (noteId: number) => {
    router.push(`/notes?id=${noteId}`)
  }

  const handleBookmarkClick = (bookmark: Bookmark) => {
    router.push(`/bookmarks?id=${bookmark.id}`)
  }

  const handleTodoClick = (todo: Todo) => {
    router.push(`/todos?id=${todo.id}`)
  }

  const handleReminderClick = (reminder: Reminder) => {
    router.push(`/reminders?id=${reminder.id}`)
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      <div className="mb-8">
        <h1 className="text-foreground mb-1 text-[26px] font-bold select-none">Today</h1>
        <p className="text-muted-foreground mb-6 text-lg select-none">
          Your captured content organized by type
        </p>

        <DailyLogsSummary dailyLogs={dailyLogs} dailySummary={dailySummary} />
      </div>

      <NotesGrid notes={notes} onNoteClick={handleNoteClick} />
      <BookmarksGrid
        bookmarks={bookmarks}
        onBookmarkClick={handleBookmarkClick}
      />
      <TodosList todos={todos} onTodoClick={handleTodoClick} />
      <RemindersList
        reminders={reminders}
        onReminderClick={handleReminderClick}
      />
    </div>
  )
}
