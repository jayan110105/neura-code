export interface Reminder {
  id: number
  title: string
  description: string | null
  time: string | null
  date: Date | null
  repeat: 'Daily' | 'Weekly' | 'Monthly' | 'None' | null
  enabled: boolean
  category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
}
