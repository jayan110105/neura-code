import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getNotes } from '@/lib/actions/notes'
import { NotesSection } from '@/components/notes-section'

export default async function NotesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const notes = await getNotes()

  return <NotesSection notes={notes} />
} 