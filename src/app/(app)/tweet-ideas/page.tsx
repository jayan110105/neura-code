import { type Metadata } from 'next'
import { getTodos } from '@/lib/actions/todos'
import { getReminders } from '@/lib/actions/reminders'
import { getNotes } from '@/lib/actions/notes'
import { getBookmarks } from '@/lib/actions/bookmarks'
import { getTodaysDailyLogs } from '@/lib/actions/daily-logs'
import { getDailySummary } from '@/lib/actions/daily-summaries'
import { getTweetIdeas, getTweetStyleReferences } from '@/lib/actions/tweet-ideas'
import { TweetIdeasSection } from '@/components/tweet-ideas-section'
import { formatLocalDate, getCurrentISTDate } from '@/lib/utils'
import type { TweetGenerationSource } from '@/types'

export const metadata: Metadata = {
  title: 'Tweet Ideas',
  description: 'AI-generated tweet ideas based on your daily activities and content.',
}

export default async function TweetIdeasPage() {
  const today = formatLocalDate(new Date())
  
  const [allTodos, allReminders, allNotes, allBookmarks, dailyLogs, dailySummary, existingTweetIdeas, tweetStyleReferences] = await Promise.all([
    getTodos(),
    getReminders(),
    getNotes(),
    getBookmarks(),
    getTodaysDailyLogs(),
    getDailySummary(today),
    getTweetIdeas(),
    getTweetStyleReferences(),
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

  // Filter today's data
  const todayTodos = allTodos.filter(todo => !todo.dueDate || isToday(todo.dueDate))
  const todayNotes = allNotes.filter(note => isToday(note.timestamp))
  const todayBookmarks = allBookmarks.filter(bookmark => isToday(bookmark.timestamp))
  
  const todayReminders = allReminders.filter(reminder => {
    if (!reminder.enabled || !reminder.date) return false
    const reminderDate = new Date(reminder.date)
    reminderDate.setHours(0, 0, 0, 0)
    const reminderTime = reminderDate.getTime()
    
    if (reminderTime > todayTime) return false
    
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
  })

  // Prepare source data for tweet generation
  const sourceData: TweetGenerationSource = {
    todos: todayTodos.map(todo => ({
      title: todo.title,
      completed: todo.completed,
      priority: todo.priority || undefined,
    })),
    notes: todayNotes.map(note => ({
      title: note.title,
      content: note.content || undefined,
    })),
    dailyLogs: dailyLogs.map(log => ({
      description: log.description || '',
    })),
    dailySummary: dailySummary?.summary || null,
    bookmarks: todayBookmarks.map(bookmark => ({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description || undefined,
    })),
    reminders: todayReminders.map(reminder => ({
      title: reminder.title,
      description: reminder.description || undefined,
    })),
  }

  return (
    <TweetIdeasSection 
      sourceData={sourceData}
      existingTweetIdeas={existingTweetIdeas}
      tweetStyleReferences={tweetStyleReferences}
    />
  )
} 