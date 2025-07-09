'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useState } from 'react'
import type { TweetStyleReference } from '@/types'

interface AddEditStyleReferenceDialogProps {
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onSubmit: (e: React.FormEvent) => void
  referenceToEdit: TweetStyleReference | null
  formData: {
    tweetText: string
    tweetUrl: string
    author: string
    notes: string
  }
  setFormData: (formData: any) => void
}

export function AddEditStyleReferenceDialog({
  isOpen,
  onOpenChange,
  onSubmit,
  referenceToEdit,
  formData,
  setFormData,
}: AddEditStyleReferenceDialogProps) {
  useEffect(() => {
    if (referenceToEdit) {
      setFormData({
        tweetText: referenceToEdit.tweetText,
        tweetUrl: referenceToEdit.tweetUrl || '',
        author: referenceToEdit.author || '',
        notes: referenceToEdit.notes || '',
      })
    }
  }, [referenceToEdit, setFormData])
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {referenceToEdit ? 'Edit' : 'Add'} Tweet Style Reference
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tweetText">Tweet Text *</Label>
            <Textarea
              id="tweetText"
              placeholder="Enter the tweet text you want to use as a style reference..."
              value={formData.tweetText}
              onChange={(e) =>
                setFormData({ ...formData, tweetText: e.target.value })
              }
              className="min-h-[100px]"
              required
            />
            <div className="text-right text-xs text-muted-foreground">
              {formData.tweetText.length}/280
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="tweetUrl">Tweet URL (optional)</Label>
            <Input
              id="tweetUrl"
              type="url"
              placeholder="https://x.com/..."
              value={formData.tweetUrl}
              onChange={(e) =>
                setFormData({ ...formData, tweetUrl: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="author">Author (optional)</Label>
            <Input
              id="author"
              placeholder="@username or Full Name"
              value={formData.author}
              onChange={(e) =>
                setFormData({ ...formData, author: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Why do you like this tweet style? What makes it effective?"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              className="min-h-[80px]"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {referenceToEdit ? 'Update' : 'Add'} Reference
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
} 