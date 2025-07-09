export interface TweetIdea {
  id: number
  content: string
  sourceData: string | null
  isUsed: boolean
  generatedAt: Date
  userId: string
}

export interface TweetStyleReference {
  id: number
  tweetText: string
  tweetUrl: string | null
  author: string | null
  notes: string | null
  isActive: boolean
  addedAt: Date
  userId: string
}

export interface TweetGenerationSource {
  todos: Array<{ title: string; completed: boolean; priority?: string }>
  notes: Array<{ title: string; content?: string }>
  dailyLogs: Array<{ description: string }>
  dailySummary: string | null
  bookmarks: Array<{ title: string; url: string; description?: string }>
  reminders: Array<{ title: string; description?: string }>
} 