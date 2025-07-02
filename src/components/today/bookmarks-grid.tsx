"use client"

import { Card, CardContent } from "@/components/ui/card"
import { IconBookmarkFilled } from "@tabler/icons-react"
import { Bookmark } from "@/data/bookmarks"

interface BookmarksGridProps {
  bookmarks: Bookmark[]
  onBookmarkClick?: (bookmark: Bookmark) => void
}

export function BookmarksGrid({ bookmarks, onBookmarkClick }: BookmarksGridProps) {
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
      <h2 className="text-xl font-semibold text-foreground mb-4">Bookmarks</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {bookmarks.map((bookmark) => (
          <Card 
            key={bookmark.id} 
            className="bg-card border-none hover:bg-card/80 transition-colors cursor-pointer" 
            onClick={() => handleBookmarkClick(bookmark)}
          >
            <CardContent className="p-3">
              <div className="flex flex-col gap-4">
                <IconBookmarkFilled className="w-6 h-6" />
                <h3 className="font-medium text-foreground text-xs leading-tight line-clamp-2 min-w-0">
                  {bookmark.title}
                </h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 