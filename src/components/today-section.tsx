"use client"

import { Card, CardContent } from "@/components/ui/card"
import { NotesGrid } from "@/components/today/notes-grid"
import { BookmarksGrid } from "@/components/today/bookmarks-grid"
import { TodosList } from "@/components/today/todos-list"
import { RemindersList } from "@/components/today/reminders-list"
import { mockNotes } from "@/data/notes"
import { mockBookmarks } from "@/data/bookmarks"
import { mockTodos } from "@/data/todos"
import { mockReminders } from "@/data/reminders"

export function TodaySection() {
  const todos = [...mockTodos.today, ...mockTodos.upcoming]

  const totalItems = mockNotes.length + mockBookmarks.length + todos.length + mockReminders.length
  const aiSummary = `You have ${mockNotes.length} notes, ${mockBookmarks.length} bookmarks, ${todos.length} todos, and ${mockReminders.length} reminders. A total of ${totalItems} items to manage.`

  const handleNoteClick = (noteId: number) => {
    console.log("Navigate to notes tab with note:", noteId)
  }

  const handleBookmarkClick = (bookmark: any) => {
    if (bookmark.url) {
      window.open(bookmark.url, '_blank')
    }
  }

  const handleTodoClick = (todo: any) => {
    console.log("Todo clicked:", todo.id)
  }

  const handleTodoToggle = (todoId: number) => {
    console.log("Todo toggled:", todoId)
  }

  const handleReminderClick = (reminder: any) => {
    console.log("Reminder clicked:", reminder.id)
  }

  return (
    <div className="p-6 pt-0 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-[26px] font-bold text-foreground mb-1">Today</h1>
        <p className="text-muted-foreground text-lg mb-6">Your captured content organized by type</p>

        <Card className="bg-card border-none">
          <CardContent className="px-6">
            <h3 className="font-medium text-foreground mb-2">Daily Log</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{aiSummary}</p>
          </CardContent>
        </Card>
      </div>

      <NotesGrid notes={mockNotes} onNoteClick={handleNoteClick} />
      <BookmarksGrid bookmarks={mockBookmarks} onBookmarkClick={handleBookmarkClick} />
      <TodosList todos={todos} onTodoClick={handleTodoClick} onTodoToggle={handleTodoToggle} />
      <RemindersList reminders={mockReminders} onReminderClick={handleReminderClick} />
    </div>
  )
} 