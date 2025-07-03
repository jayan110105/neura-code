'use client'

import {
  createBookmark,
  deleteBookmark,
  updateBookmark,
} from '@/lib/actions/bookmarks'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  IconPlus,
  IconExternalLink,
  IconTagFilled,
  IconWorld,
  IconX,
  IconTrash,
} from '@tabler/icons-react'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import TextareaAutosize from 'react-textarea-autosize'
import { toast } from 'sonner'
import { Bookmark } from '@/types'
import { useOptimistic, useTransition } from 'react'

type BookmarkForm = {
  title: string
  url: string
  description: string
  tags: string[]
}

type Action =
  | { type: 'add'; bookmark: Bookmark }
  | { type: 'update'; bookmark: Bookmark }
  | { type: 'delete'; id: number }

function optimisticReducer(
  state: Bookmark[],
  { type, bookmark, id }: { type: Action['type']; bookmark?: Bookmark; id?: number },
) {
  switch (type) {
    case 'add':
      return [bookmark as Bookmark, ...state]
    case 'update':
      return state.map((b) =>
        b.id === (bookmark as Bookmark).id ? { ...b, ...bookmark } : b,
      )
    case 'delete':
      return state.filter((b) => b.id !== id)
    default:
      return state
  }
}

export function BookmarksSection({ bookmarks }: { bookmarks: Bookmark[] }) {
  const [optimisticBookmarks, addOptimisticBookmark] = useOptimistic(
    bookmarks,
    optimisticReducer,
  )
  const [isPending, startTransition] = useTransition()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null)
  const searchParams = useSearchParams()

  const [formData, setFormData] = useState<BookmarkForm>({
    title: '',
    url: '',
    description: '',
    tags: [],
  })

  useEffect(() => {
    const bookmarkId = searchParams.get('id')
    if (bookmarkId) {
      const bookmarkToEdit = bookmarks.find(
        (bookmark) => bookmark.id === Number(bookmarkId),
      )
      if (bookmarkToEdit) {
        openEditModal(bookmarkToEdit)
      }
    }
  }, [searchParams, bookmarks])

  const openCreateModal = () => {
    setEditingBookmark(null)
    setFormData({ title: '', url: '', description: '', tags: [] })
    setIsModalOpen(true)
  }

  const openEditModal = (bookmark: Bookmark) => {
    setEditingBookmark(bookmark)
    setFormData({
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description || '',
      tags: bookmark.tags || [],
    })
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingBookmark(null)
  }

  const handleDeleteBookmark = async (id: number) => {
    startTransition(async () => {
      addOptimisticBookmark({ type: 'delete', id })
      await deleteBookmark(id)
      closeModal()
    })
  }

  const handleSaveBookmark = async () => {
    if (!formData.title.trim() || !formData.url.trim()) return

    try {
      new URL(formData.url)
    } catch {
      toast.error('Please enter a valid URL')
      return
    }

    closeModal()

    if (editingBookmark) {
      const updatedBookmark = {
        ...editingBookmark,
        ...formData,
      }
      startTransition(async () => {
        addOptimisticBookmark({ type: 'update', bookmark: updatedBookmark })
        await updateBookmark(editingBookmark.id, formData)
      })
    } else {
      const newBookmark = {
        id: Date.now(),
        ...formData,
        userId: '',
        timestamp: new Date().toISOString(),
      }
      startTransition(async () => {
        addOptimisticBookmark({
          type: 'add',
          bookmark: newBookmark as unknown as Bookmark,
        })
        await createBookmark(formData)
      })
    }
  }

  const isEditMode = Boolean(editingBookmark)

  return (
    <div className="mx-auto max-w-4xl p-6 pt-0">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-foreground mb-1 text-[26px] font-bold">
            Bookmarks
          </h1>
          <p className="text-muted-foreground text-lg">
            Save and organize your favorite links
          </p>
        </div>
        <Button
          className="!h-10 px-3 py-2 text-sm"
          variant="outline"
          onClick={openCreateModal}
        >
          <IconPlus className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {optimisticBookmarks.length > 0 ? (
          optimisticBookmarks.map((bookmark) => (
            <Card
              key={bookmark.id}
              className="bg-card border-card hover:bg-card/80 group cursor-pointer transition-colors gap-2"
              onClick={() => openEditModal(bookmark)}
            >
              <CardHeader className="px-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-foreground mb-2 line-clamp-2 text-sm leading-tight font-medium">
                      {bookmark.title}
                    </h3>
                    <div className="text-muted-foreground flex items-center gap-2 text-xs">
                      <IconWorld className="h-3 w-3" />
                      <span className="truncate">
                        {new URL(bookmark.url).hostname}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-destructive h-auto p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteBookmark(bookmark.id)
                      }}
                    >
                      <IconTrash className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-auto p-1 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation()
                        window.open(bookmark.url, '_blank')
                      }}
                    >
                      <IconExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pt-0">
                <p className="text-muted-foreground mb-3 line-clamp-2 text-xs">
                  {bookmark.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {bookmark.tags?.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="border-border text-muted-foreground h-7 rounded-sm bg-transparent text-xs"
                    >
                      <IconTagFilled className="mr-1 h-2 w-2" />
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
            <h3 className="text-xl font-semibold tracking-tight">
              No bookmarks found
            </h3>
            <p className="text-muted-foreground mt-2 mb-4 text-sm">
              You haven&apos;t saved any bookmarks yet.
            </p>
            <Button variant="outline" onClick={openCreateModal}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Bookmark
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-none sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-left text-lg">
              <Input
                placeholder="Title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                className="border-none !text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex h-9 w-full items-center rounded-md px-3 text-sm shadow-xs">
              <IconWorld className="text-muted-foreground h-4 w-4" />
              <input
                placeholder="URL"
                value={formData.url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, url: e.target.value }))
                }
                className="placeholder:text-muted-foreground flex-1 bg-transparent p-2 outline-none"
              />
              {isEditMode && formData.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-auto p-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    try {
                      new URL(formData.url)
                      window.open(formData.url, '_blank')
                    } catch {
                      toast.error('Invalid URL')
                    }
                  }}
                >
                  <IconExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
            <TextareaAutosize
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="placeholder:text-muted-foreground flex w-full resize-none rounded-md border-none bg-transparent px-3 pb-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              minRows={1}
            />
            <div className="placeholder:text-muted-foreground flex w-full flex-wrap items-center gap-2 rounded-md border-none bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50">
              {formData.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="rounded-smborder-border text-muted-foreground h-7 bg-transparent text-xs"
                >
                  <IconTagFilled className="mr-1 h-2 w-2" />
                  {tag}
                  <button
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        tags: prev.tags.filter((_, i) => i !== index),
                      }))
                    }
                    className="focus:ring-ring ml-1 rounded-full outline-none focus:ring-2 focus:ring-offset-2"
                  >
                    <IconX className="text-muted-foreground hover:text-foreground h-3 w-3" />
                  </button>
                </Badge>
              ))}
              <input
                type="text"
                className="placeholder:text-muted-foreground flex-1 bg-transparent outline-none disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Add tags"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault()
                    const newTag = e.currentTarget.value.trim()
                    if (newTag && !formData.tags.includes(newTag)) {
                      setFormData((prev) => ({
                        ...prev,
                        tags: [...prev.tags, newTag],
                      }))
                      e.currentTarget.value = ''
                    }
                  } else if (
                    e.key === 'Backspace' &&
                    e.currentTarget.value === ''
                  ) {
                    setFormData((prev) => ({
                      ...prev,
                      tags: prev.tags.slice(0, -1),
                    }))
                  }
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div>
              {isEditMode && editingBookmark && (
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteBookmark(editingBookmark.id)}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={closeModal}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveBookmark}
                disabled={!formData.title.trim() || !formData.url.trim()}
                variant="outline"
              >
                {isEditMode ? 'Save' : 'Add bookmark'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
