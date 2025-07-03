export interface Reminder {
  id: number
  title: string
  description: string | null
  time: string | null
  date: string | null
  repeat: 'Daily' | 'Weekly' | 'Monthly' | 'None' | null
  enabled: boolean
  category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
}
