export interface Bookmark {
  id: number
  title: string
  url: string
  description: string | null
  tags: string[] | null
  timestamp: Date
}
