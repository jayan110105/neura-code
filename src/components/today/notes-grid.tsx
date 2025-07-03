'use client'

import { Card, CardContent } from '@/components/ui/card'
import { IconFileTextFilled } from '@tabler/icons-react'
import { Note } from '@/types'

interface NotesGridProps {
  notes: Note[]
  onNoteClick?: (noteId: number) => void
}

export function NotesGrid({ notes, onNoteClick }: NotesGridProps) {
  if (notes.length === 0) return null

  const handleNoteClick = (noteId: number) => {
    if (onNoteClick) {
      onNoteClick(noteId)
    } else {
      // Default behavior - log for now
      console.log('Navigate to notes tab with note:', noteId)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-foreground mb-4 text-xl font-semibold">Notes</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="bg-card hover:bg-card/80 cursor-pointer border-none transition-colors"
            onClick={() => handleNoteClick(note.id)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col gap-4">
                <IconFileTextFilled className="h-6 w-6" />
                <h3 className="text-foreground line-clamp-2 min-w-0 text-sm leading-tight font-medium">
                  {note.title}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
