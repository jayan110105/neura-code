'use client'

import { useState } from 'react'
import { createNote, deleteNote, updateNote } from '@/lib/actions/notes'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { IconPlus, IconTrash } from '@tabler/icons-react'
import { Note } from '@/types'

export function NotesSection({ notes }: { notes: Note[] }) {
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '' })

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setEditForm({ title: note.title, content: note.content || '' })
    setIsEditDialogOpen(true)
  }

  const handleNewNote = () => {
    setEditingNote(null)
    setEditForm({ title: '', content: '' })
    setIsEditDialogOpen(true)
  }

  const handleSaveNote = async () => {
    if (editingNote) {
      await updateNote(editingNote.id, {
        title: editForm.title,
        content: editForm.content,
      })
    } else {
      await createNote({
        title: editForm.title || 'Untitled Note',
        content: editForm.content,
      })
    }
    setIsEditDialogOpen(false)
    setEditingNote(null)
  }

  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-1 text-[26px] font-bold">Notes</h1>
          <p className="text-muted-foreground text-lg">
            Capture and organize your thoughts
          </p>
        </div>
        <Button
          className="!h-10 px-3 py-2 text-sm"
          variant="outline"
          onClick={handleNewNote}
        >
          <IconPlus className="h-4 w-4" />
          New Note
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 space-y-3 md:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Card
            key={note.id}
            className="bg-card group h-72 cursor-pointer border-none transition-shadow hover:shadow-md"
            onClick={() => handleEditNote(note)}
          >
            <CardHeader className="flex items-start justify-between gap-2">
              <h3 className="text-foreground line-clamp-2 min-w-0 flex-1 text-lg font-medium">
                {note.title}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-destructive shrink-0 p-0 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  deleteNote(note.id)
                }}
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground line-clamp-6 text-sm leading-relaxed">
                {note.content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[80vh] max-w-[600px]">
          <div tabIndex={0} className="sr-only" />
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Input
                id="title"
                tabIndex={-1}
                style={{ fontSize: '1.25rem' }}
                className="border-none font-medium outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                value={editForm.title}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={'Title'}
              />
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-4 overflow-y-auto">
            <Textarea
              id="content"
              value={editForm.content}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, content: e.target.value }))
              }
              placeholder={'Take a note...'}
              className="min-h-[300px] resize-none border-none outline-none focus-visible:border-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              onClick={handleSaveNote}
              variant="ghost"
              className="text-foreground hover:text-foreground"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
