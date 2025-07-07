import { type Metadata } from 'next'
import { getNotes } from '@/lib/actions/notes'
import { NotesSection } from '@/components/notes-section'

export const metadata: Metadata = {
  title: 'Notes',
  description: 'Create, organize and manage your personal notes. Capture ideas, thoughts, and important information in one place.',
}

export default async function NotesPage() {
  const notes = await getNotes()

  return <NotesSection notes={notes} />
} 