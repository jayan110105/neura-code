export interface Reminder {
  id: number
  title: string
  description: string
  time: string
  date: string
  repeat: "Daily" | "Weekly" | "Monthly" | "None"
  enabled: boolean
  category: "Work" | "Health" | "Personal" | "Finance"
} 