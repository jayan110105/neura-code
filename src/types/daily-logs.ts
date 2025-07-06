export interface DailyLog {
  id: number
  date: string
  description: string | null
  userId: string
  createdAt: Date
}

export interface DailySummary {
  id: number
  date: string
  summary: string
  userId: string
  createdAt: Date
  updatedAt: Date
} 