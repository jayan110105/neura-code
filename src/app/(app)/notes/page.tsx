import { getNotes } from '@/lib/actions/notes'
import { NotesSection } from '@/components/notes-section'

export default async function NotesPage() {
  const notes = await getNotes()

  return <NotesSection notes={notes} />
} 