"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { IconPlus, IconExternalLink, IconTagFilled, IconWorld, IconX, IconTrash } from "@tabler/icons-react"
import { useState } from "react"
import TextareaAutosize from "react-textarea-autosize"
import { mockBookmarks } from "@/data/bookmarks"
import { Bookmark } from "@/types"

type BookmarkForm = {
  title: string
  url: string
  description: string
  tags: string[]
}


export function BookmarksSection() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([...mockBookmarks])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)

  const [formData, setFormData] = useState<BookmarkForm>({
    title: "",
    url: "",
    description: "",
    tags: [],
  })

  const openCreateModal = () => {
    setEditingBookmark(null)
    setFormData({ title: "", url: "", description: "", tags: [] })
    setIsModalOpen(true)
  }

  const openEditModal = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      tags: bookmark.tags,
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBookmark(null)
  }

  const deleteBookmark = (id: number) => {
    setBookmarks(prev => prev.filter(b => b.id !== id))
    closeModal()
  }

  const saveBookmark = () => {
    if (!formData.title.trim() || !formData.url.trim()) return

    if (editingBookmark) {
      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === editingBookmark.id
            ? { ...b, title: formData.title, url: formData.url, description: formData.description, tags: formData.tags }
            : b
        )
      )
    } else {
      const newBookmark: Bookmark = {
        id: Date.now(),
        title: formData.title,
        url: formData.url,
        description: formData.description,
        tags: formData.tags,
        timestamp: new Date().toISOString(),
      }
      setBookmarks((prev) => [...prev, newBookmark])
    }

    closeModal()
  }

  const isEditMode = Boolean(editingBookmark)

  return (
    <div className="p-6 pt-0 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-foreground mb-1">Bookmarks</h1>
          <p className="text-muted-foreground text-lg">Save and organize your favorite links</p>
        </div>
        <Button className="text-sm !h-10 py-2 px-3" variant="outline" onClick={openCreateModal}>
          <IconPlus className="w-4 h-4 mr-2" />
          Add Bookmark
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {bookmarks.map((bookmark) => (
          <Card
            key={bookmark.id}
            className="bg-card border-card hover:bg-card/80 transition-colors group cursor-pointer"
            onClick={() => openEditModal(bookmark)}
          >
            <CardHeader className="px-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm leading-tight mb-1 line-clamp-2">
                    {bookmark.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IconWorld className="w-3 h-3" />
                    <span className="truncate">{new URL(bookmark.url).hostname}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-muted-foreground hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteBookmark(bookmark.id)
                    }}
                  >
                    <IconTrash className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-muted-foreground hover:text-foreground"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(bookmark.url, "_blank")
                    }}
                  >
                    <IconExternalLink className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-4">
              <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{bookmark.description}</p>
              <div className="flex flex-wrap gap-1">
                {bookmark.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs h-7 rounded-sm border-border text-muted-foreground bg-transparent"
                  >
                    <IconTagFilled className="w-2 h-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[500px] border-none">
          <DialogHeader>
            <DialogTitle className="text-left text-lg">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                className="border-none !text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex items-center w-full rounded-md h-9 px-3 text-sm shadow-xs">
              <IconWorld className="h-4 w-4 text-muted-foreground" />
              <input
                placeholder="URL"
                value={formData.url}
                onChange={(e) => setFormData((prev) => ({ ...prev, url: e.target.value }))}
                className="w-full p-2 bg-transparent outline-none placeholder:text-muted-foreground"
              />
            </div>
            <TextareaAutosize
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="flex w-full rounded-md bg-transparent px-3 pb-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
              minRows={1}
            />
            <div className="flex w-full rounded-md bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 border-none focus-visible:ring-0 focus-visible:ring-offset-0 items-center flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs h-7 rounded-smborder-border text-muted-foreground bg-transparent">
                  <IconTagFilled className="w-2 h-2 mr-1" />
                  {tag}
                  <button onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags.filter((_, i) => i !== index) }))} className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                    <IconX className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                  </button>
                </Badge>
              ))}
              <input
                type="text"
                className="flex-1 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add tags"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const newTag = e.currentTarget.value.trim();
                    if (newTag && !formData.tags.includes(newTag)) {
                      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
                      e.currentTarget.value = "";
                    }
                  } else if (e.key === 'Backspace' && e.currentTarget.value === '') {
                    setFormData(prev => ({...prev, tags: prev.tags.slice(0, -1)}));
                  }
                }}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <div>
              {isEditMode && editingBookmark && (
                  <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => deleteBookmark(editingBookmark.id)}>
                      Delete
                  </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={saveBookmark}
                disabled={!formData.title.trim() || !formData.url.trim()}
                variant="outline"
              >
                {isEditMode ? "Save" : "Add bookmark"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
