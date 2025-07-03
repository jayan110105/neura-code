'use client'

import { Card, CardContent } from '@/components/ui/card'
import { IconBookmarkFilled, IconExternalLink } from '@tabler/icons-react'
import { Bookmark } from '@/types'

interface BookmarksGridProps {
  bookmarks: Bookmark[]
  onBookmarkClick?: (bookmark: Bookmark) => void
}

export function BookmarksGrid({
  bookmarks,
  onBookmarkClick,
}: BookmarksGridProps) {
  if (bookmarks.length === 0) return null

  const handleBookmarkClick = (bookmark: Bookmark) => {
    if (onBookmarkClick) {
      onBookmarkClick(bookmark)
    } else if (bookmark.url) {
      // Default behavior - open in new tab
      window.open(bookmark.url, '_blank')
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-foreground mb-4 text-xl font-semibold">Bookmarks</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {bookmarks.map((bookmark) => (
          <Card
            key={bookmark.id}
            className="group relative cursor-pointer border-none bg-card transition-colors hover:bg-card/80"
            onClick={() => handleBookmarkClick(bookmark)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col gap-4">
                <IconBookmarkFilled className="h-6 w-6" />
                <h3 className="text-foreground line-clamp-2 min-w-0 text-sm font-medium leading-tight">
                  {bookmark.title}
                </h3>
              </div>
            </CardContent>
            {bookmark.url && (
              <button
                aria-label="Open bookmark in new tab"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(bookmark.url, '_blank', 'noopener,noreferrer')
                }}
                className="cursor-pointer absolute right-1.5 top-1.5 z-10 rounded-full p-1.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-muted/50"
              >
                <IconExternalLink className="h-4 w-4" />
              </button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
