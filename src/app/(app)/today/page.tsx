import { type Metadata } from 'next'
import { getTodos } from '@/lib/actions/todos'
import { getReminders } from '@/lib/actions/reminders'
import { getNotes } from '@/lib/actions/notes'
import { getBookmarks } from '@/lib/actions/bookmarks'
import { getTodaysDailyLogs } from '@/lib/actions/daily-logs'
import { getDailySummary } from '@/lib/actions/daily-summaries'
import { TodaySection } from '@/components/today-section'
import { Todo, Reminder, Note, Bookmark } from '@/types'
import { formatLocalDate, getCurrentISTDate } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Today',
  description: 'Your daily overview with today\'s todos, reminders, notes, bookmarks, and daily logs. Start your day organized.',
}

export default async function TodayPage() {
  const today = formatLocalDate(new Date())
  
  const [allTodos, allReminders, allNotes, allBookmarks, dailyLogs, dailySummary] = await Promise.all([
    getTodos(),
    getReminders(),
    getNotes(),
    getBookmarks(),
    getTodaysDailyLogs(),
    getDailySummary(today),
  ])

  const todayDate = getCurrentISTDate()
  todayDate.setHours(0, 0, 0, 0)
  const todayTime = todayDate.getTime()

  const isToday = (date: Date | null | undefined) => {
    if (!date) return false
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d.getTime() === todayTime
  }

  const isTodoForToday = (todo: Todo) => {
    return !todo.dueDate || isToday(todo.dueDate)
  }

  const isReminderForToday = (reminder: Reminder) => {
    if (!reminder.enabled || !reminder.date) {
      return false
    }

    const reminderDate = new Date(reminder.date)
    reminderDate.setHours(0, 0, 0, 0)
    const reminderTime = reminderDate.getTime()

    if (reminderTime > todayTime) {
      return false
    }

    switch (reminder.repeat) {
      case 'Daily':
        return true
      case 'Weekly':
        return reminderDate.getDay() === todayDate.getDay()
      case 'Monthly':
        return reminderDate.getDate() === todayDate.getDate()
      case 'None':
      default:
        return reminderTime === todayTime
    }
  }

  const todos = allTodos
    .filter(isTodoForToday)
    .sort((a, b) => {
      const aHasToday = a.dueDate && isToday(a.dueDate)
      const bHasToday = b.dueDate && isToday(b.dueDate)
      
      if (aHasToday && !bHasToday) return -1
      if (!aHasToday && bHasToday) return 1
      return 0
    })
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
      dailyLogs={dailyLogs}
      dailySummary={dailySummary}
    />
  )
} 