"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { IconPlus, IconExternalLink, IconClockFilled, IconTagFilled, IconWorld } from "@tabler/icons-react"

const mockBookmarks = [
  {
    id: 1,
    title: "The Future of AI in Product Design",
    url: "https://uxdesign.cc/future-ai-design",
    preview:
      "Exploring how artificial intelligence is reshaping the way we approach user experience and interface design...",
    tags: ["AI", "Design", "UX"],
    timestamp: "2024-01-15 16:20",
  },
  {
    id: 2,
    title: "Building Scalable React Applications",
    url: "https://react.dev/learn/scaling-up",
    preview:
      "Best practices for structuring large React applications with proper state management and component architecture...",
    tags: ["React", "Development", "Architecture"],
    timestamp: "2024-01-15 12:45",
  },
  {
    id: 3,
    title: "Notion's Design System Deep Dive",
    url: "https://notion.so/design-system",
    preview: "An in-depth look at how Notion built their cohesive design system and component library...",
    tags: ["Design System", "Notion", "UI"],
    timestamp: "2024-01-14 20:30",
  },
]

export function BookmarksSection() {
  return (
    <div className="p-6 pt-0 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[26px] font-bold text-foreground mb-1">Bookmarks</h1>
          <p className="text-muted-foreground text-lg">Save and organize your favorite links</p>
        </div>
        <Button className="text-sm !h-10 py-2 px-3" variant="outline">
          <IconPlus className="w-4 h-4 mr-2" />
          Add Bookmark
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {mockBookmarks.map((bookmark) => (
          <Card
            key={bookmark.id}
            className="bg-card border-card hover:bg-card/80 transition-colors group cursor-pointer"
            onClick={() => window.open(bookmark.url, "_blank")}
          >
            <CardHeader className="px-4 pt-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground text-sm leading-tight mb-1 line-clamp-2">{bookmark.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IconWorld className="w-3 h-3" />
                    <span className="truncate">{new URL(bookmark.url).hostname}</span>
                  </div>
                </div>
                <div className="flex gap-1">
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
            <CardContent className="pt-0 px-4 pb-4">
              <p className="text-muted-foreground text-xs mb-3 line-clamp-2">{bookmark.preview}</p>
              <div className="flex flex-wrap gap-1 mb-2">
                {bookmark.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs border-border text-muted-foreground bg-transparent">
                    <IconTagFilled className="w-2 h-2 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
