'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  IconCheck,
  IconCopy,
  IconExternalLink,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react'
import type { TweetIdea } from '@/types'

interface TweetIdeaCardProps {
  tweet: TweetIdea
  isCopied: boolean
  onCopy: (content: string, id: number) => void
  onOpenComposer: (content: string) => void
  onMarkAsUsed: (id: number) => void
  onDelete: (id: number) => void
}

export function TweetIdeaCard({
  tweet,
  isCopied,
  onCopy,
  onOpenComposer,
  onMarkAsUsed,
  onDelete,
}: TweetIdeaCardProps) {
  const getCharacterCount = (content: string) => content.length
  const isOverLimit = (content: string) => getCharacterCount(content) > 280

  return (
    <Card className={`border-none transition-all ${tweet.isUsed ? 'opacity-50' : ''}`}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {tweet.content}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-xs ${
                    isOverLimit(tweet.content)
                      ? 'text-destructive'
                      : getCharacterCount(tweet.content) > 250
                      ? 'text-amber-600'
                      : 'text-muted-foreground'
                  }`}
                >
                  {getCharacterCount(tweet.content)}/280
                </span>
                {tweet.isUsed && (
                  <Badge variant="secondary" className="text-xs">
                    Used
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onCopy(tweet.content, tweet.id)}
                className="h-8 w-8 p-0"
              >
                {isCopied ? (
                  <IconCheck className="h-4 w-4 text-green-600" />
                ) : (
                  <IconCopy className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenComposer(tweet.content)}
                className="h-8 w-8 p-0"
                title="Open in Twitter"
              >
                <IconExternalLink className="h-4 w-4" />
              </Button>
              {!tweet.isUsed && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onMarkAsUsed(tweet.id)}
                  className="h-8 w-8 p-0"
                  title="Mark as used"
                >
                  <IconCheck className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(tweet.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                title="Delete"
              >
                <IconTrash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface TweetIdeasListProps {
    tweets: TweetIdea[]
    copiedId: number | null
    onCopy: (content: string, id: number) => void
    onOpenComposer: (content: string) => void
    onMarkAsUsed: (id: number) => void
    onDelete: (id: number) => void
    onGenerate: () => void
    isGenerating: boolean
    hasSourceData: boolean
}

export function TweetIdeasList({ 
    tweets, 
    copiedId,
    onCopy,
    onOpenComposer,
    onMarkAsUsed,
    onDelete,
    onGenerate,
    isGenerating,
    hasSourceData
}: TweetIdeasListProps) {
  if (tweets.length === 0 && hasSourceData) {
    return (
        <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted bg-card p-12 text-center">
            <h3 className="text-xl font-semibold tracking-tight">
                No tweet ideas
            </h3>
            <p className="text-muted-foreground mt-2 mb-4 text-sm">
                You haven&apos;t generated any tweet ideas yet.
            </p>
            <Button variant="outline" onClick={onGenerate}>
                <IconSparkles className="mr-2 h-4 w-4" />
                Generate
            </Button>
        </div>
    )
  }

  if(tweets.length === 0) {
      return null
  }

  return (
    <div className="space-y-4">
      {tweets.map((tweet) => (
        <TweetIdeaCard
          key={tweet.id}
          tweet={tweet}
          isCopied={copiedId === tweet.id}
          onCopy={onCopy}
          onOpenComposer={onOpenComposer}
          onMarkAsUsed={onMarkAsUsed}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
} 