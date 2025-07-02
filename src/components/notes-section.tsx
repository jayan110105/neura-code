"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { IconPlus, IconTrash } from "@tabler/icons-react"
import { mockNotes } from "@/data/notes"
import { Note } from "@/types"

export function NotesSection() {
  const [notes, setNotes] = useState(mockNotes)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({ title: "", content: "" })

  const handleEditNote = (note: Note) => {
    setEditingNote(note)
    setEditForm({ title: note.title, content: note.content })
    setIsEditDialogOpen(true)
  }

  const handleNewNote = () => {
    setEditingNote(null)
    setEditForm({ title: "", content: "" })
    setIsEditDialogOpen(true)
  }

  const handleSaveNote = () => {
    if (editingNote) {
      // Editing existing note
      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, title: editForm.title, content: editForm.content, timestamp: new Date().toLocaleString('sv-SE', { timeZone: 'UTC' }).replace('T', ' ').slice(0, 16) }
          : note
      ))
    } else {
      // Creating new note
      const newNote = {
        id: Math.max(...notes.map(n => n.id)) + 1,
        title: editForm.title || "Untitled Note",
        content: editForm.content,
        timestamp: new Date().toLocaleString('sv-SE', { timeZone: 'UTC' }).replace('T', ' ').slice(0, 16)
      }
      setNotes([newNote, ...notes])
    }
    setIsEditDialogOpen(false)
    setEditingNote(null)
  }

  const handleDeleteNote = (id: number) => {
    setNotes(notes.filter(note => note.id !== id))
  }

  return (
    <div className="p-6 pt-0 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-foreground mb-1">Notes</h1>
          <p className="text-muted-foreground text-lg">Capture and organize your thoughts</p>
        </div>
          <Button className="text-sm !h-10 py-2 px-3" variant="outline" onClick={handleNewNote}>
           <IconPlus className="w-4 h-4" />
           New Note
         </Button>
      </div>

      <div className="space-y-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="bg-card border-none h-72 cursor-pointer hover:shadow-md transition-shadow group" onClick={() => handleEditNote(note)}>
            <CardHeader className="flex justify-between items-start gap-2">
              <h3 className="text-lg font-medium text-foreground line-clamp-2 flex-1 min-w-0">{note.title}</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-muted-foreground hover:text-destructive p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteNote(note.id)
                }}
              >
                <IconTrash className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-6">{note.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-[600px] max-h-[80vh]">
          <div tabIndex={0} className="sr-only" />
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
                <Input
                  id="title"
                  tabIndex={-1}
                  style={{ fontSize: '1.25rem' }}
                  className="font-medium border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent outline-none"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder={"Title"}
                />
             </DialogTitle>
           </DialogHeader>
          
          <div className="flex flex-col gap-4 overflow-y-auto">
            <Textarea
              id="content"
              value={editForm.content}
              onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
              placeholder={"Take a note..."}
              className="min-h-[300px] resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-transparent outline-none"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button onClick={handleSaveNote} variant="ghost" className="text-foreground hover:text-foreground">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
