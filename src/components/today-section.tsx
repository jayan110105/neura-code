'use client'

import { Card, CardContent } from '@/components/ui/card'
import { NotesGrid } from '@/components/today/notes-grid'
import { BookmarksGrid } from '@/components/today/bookmarks-grid'
import { TodosList } from '@/components/today/todos-list'
import { RemindersList } from '@/components/today/reminders-list'
import { Todo, Reminder, Note, Bookmark } from '@/types'

type TodaySectionProps = {
  todos: Todo[]
  reminders: Reminder[]
  notes: Note[]
  bookmarks: Bookmark[]
}

export function TodaySection({
  todos,
  reminders,
  notes,
  bookmarks,
}: TodaySectionProps) {
  const totalItems =
    notes.length + bookmarks.length + todos.length + reminders.length
  const aiSummary = `You have ${notes.length} notes, ${bookmarks.length} bookmarks, ${todos.length} todos, and ${reminders.length} reminders. A total of ${totalItems} items to manage.`

  const handleNoteClick = (noteId: number) => {
    console.log('Navigate to notes tab with note:', noteId)
  }

  const handleBookmarkClick = (bookmark: any) => {
    if (bookmark.url) {
      window.open(bookmark.url, '_blank')
    }
  }

  const handleTodoClick = (todo: any) => {
    console.log('Todo clicked:', todo.id)
  }

  const handleTodoToggle = (todoId: number) => {
    console.log('Todo toggled:', todoId)
  }

  const handleReminderClick = (reminder: any) => {
    console.log('Reminder clicked:', reminder.id)
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      <div className="mb-8">
        <h1 className="text-foreground mb-1 text-[26px] font-bold">Today</h1>
        <p className="text-muted-foreground mb-6 text-lg">
          Your captured content organized by type
        </p>

        <Card className="bg-card border-none">
          <CardContent className="px-6">
            <h3 className="text-foreground mb-2 font-medium">Daily Log</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              {aiSummary}
            </p>
          </CardContent>
        </Card>
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
