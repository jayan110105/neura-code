"use client"

import { Card, CardContent } from "@/components/ui/card"
import { IconFileTextFilled } from "@tabler/icons-react"

interface Note {
  id: number
  type: "note"
  title: string
  preview: string
  timestamp: string
  source: string
}

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
      console.log("Navigate to notes tab with note:", noteId)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-foreground mb-4">Notes</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {notes.map((note) => (
          <Card 
            key={note.id} 
            className="bg-card border-none hover:bg-card/80 transition-colors cursor-pointer" 
            onClick={() => handleNoteClick(note.id)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col gap-4">
                <IconFileTextFilled className="w-6 h-6" />
                <h3 className="font-medium text-foreground text-xs leading-tight line-clamp-2 min-w-0">
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