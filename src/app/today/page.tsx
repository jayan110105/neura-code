import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTodos } from '@/lib/actions/todos'
import { getReminders } from '@/lib/actions/reminders'
import { getNotes } from '@/lib/actions/notes'
import { getBookmarks } from '@/lib/actions/bookmarks'
import { TodaySection } from '@/components/today-section'

export default async function TodayPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const [todos, reminders, notes, bookmarks] = await Promise.all([
    getTodos(),
    getReminders(),
    getNotes(),
    getBookmarks(),
  ])

  return (
    <TodaySection
      todos={todos}
      reminders={reminders}
      notes={notes}
      bookmarks={bookmarks}
    />
  )
} 