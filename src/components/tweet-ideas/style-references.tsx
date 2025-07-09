'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import {
  IconEdit,
  IconExternalLink,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react'
import type { TweetStyleReference } from '@/types'

interface StyleReferenceCardProps {
  reference: TweetStyleReference
  onEdit: (reference: TweetStyleReference) => void
  onDelete: (id: number) => void
  onToggleActive: (id: number, isActive: boolean) => void
  onOpenUrl: (url: string) => void
}

export function StyleReferenceCard({
  reference,
  onEdit,
  onDelete,
  onToggleActive,
  onOpenUrl,
}: StyleReferenceCardProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="pt-3 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="text-xs leading-relaxed whitespace-pre-wrap italic">
              "{reference.tweetText}"
            </p>
            {reference.author && (
              <p className="text-xs text-muted-foreground mt-1">
                — {reference.author}
              </p>
            )}
            {reference.notes && (
              <div className="mt-2 p-2 bg-muted/30 rounded-sm">
                <p className="text-xs text-muted-foreground">
                  <strong>Notes:</strong> {reference.notes}
                </p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={reference.isActive}
              onCheckedChange={(checked) =>
                onToggleActive(reference.id, checked)
              }
            />
            <div className="flex items-center gap-1">
              {reference.tweetUrl && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenUrl(reference.tweetUrl!)}
                  className="h-6 w-6 p-0"
                  title="View original tweet"
                >
                  <IconExternalLink className="h-3 w-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(reference)}
                className="h-6 w-6 p-0"
                title="Edit"
              >
                <IconEdit className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(reference.id)}
                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                title="Delete"
              >
                <IconTrash className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface StyleReferencesListProps {
    references: TweetStyleReference[]
    onEdit: (reference: TweetStyleReference) => void
    onDelete: (id: number) => void
    onToggleActive: (id: number, isActive: boolean) => void
    onOpenUrl: (url: string) => void
    onOpenCreateModal: () => void
}

export function StyleReferencesList({
  references,
  onEdit,
  onDelete,
  onToggleActive,
  onOpenUrl,
  onOpenCreateModal
}: StyleReferencesListProps) {
  if (references.length === 0) {
    return (
      <div className="text-center py-6">
        <h3 className="text-sm font-medium mb-2">No style references yet</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Add example tweets that represent the writing style you want AI to
          emulate
        </p>
        <Button size="sm" onClick={onOpenCreateModal}>
          <IconPlus className="mr-2 h-3 w-3" />
          Add Your First Reference
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {references.map((reference) => (
        <StyleReferenceCard
          key={reference.id}
          reference={reference}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleActive={onToggleActive}
          onOpenUrl={onOpenUrl}
        />
      ))}
    </div>
  )
} 