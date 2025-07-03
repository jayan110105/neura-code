import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppContent } from './app-content'
import { getTodos } from '@/lib/actions/todos'
import { getReminders } from '@/lib/actions/reminders'
import { getNotes } from '@/lib/actions/notes'
import { getBookmarks } from '@/lib/actions/bookmarks'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const todos = await getTodos()
  const reminders = await getReminders()
  const notes = await getNotes()
  const bookmarks = await getBookmarks()

  return (
    <AppContent
      todos={todos}
      reminders={reminders}
      notes={notes}
      bookmarks={bookmarks}
    />
  )
}
