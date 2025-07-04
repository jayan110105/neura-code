import { getTodos } from '@/lib/actions/todos'
import { getReminders } from '@/lib/actions/reminders'
import { getNotes } from '@/lib/actions/notes'
import { getBookmarks } from '@/lib/actions/bookmarks'
import { TodaySection } from '@/components/today-section'
import { Todo, Reminder, Note, Bookmark } from '@/types'

export default async function TodayPage() {
  const [allTodos, allReminders, allNotes, allBookmarks] = await Promise.all([
    getTodos(),
    getReminders(),
    getNotes(),
    getBookmarks(),
  ])

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isToday = (date: Date | null | undefined) => {
    if (!date) return false
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === today.getTime()
  }

  const isReminderForToday = (reminder: Reminder) => {
    if (!reminder.enabled || !reminder.date) {
      return false
    }

    const reminderDate = new Date(reminder.date)
    reminderDate.setHours(0, 0, 0, 0)

    if (reminderDate.getTime() > today.getTime()) {
      return false
    }

    switch (reminder.repeat) {
      case 'Daily':
        return true
      case 'Weekly':
        return reminderDate.getDay() === today.getDay()
      case 'Monthly':
        return reminderDate.getDate() === today.getDate()
      case 'None':
      default:
        return reminderDate.getTime() === today.getTime()
    }
  }

  const todos = allTodos.filter((todo: Todo) => isToday(todo.dueDate))
  const reminders = allReminders.filter(isReminderForToday)
  const notes = allNotes.filter((note: Note) => isToday(note.timestamp))
  const bookmarks = allBookmarks.filter((bookmark: Bookmark) =>
    isToday(bookmark.timestamp),
  )

  return (
    <TodaySection
      todos={todos}
      reminders={reminders}
      notes={notes}
      bookmarks={bookmarks}
    />
  )
} 