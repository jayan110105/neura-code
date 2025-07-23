export interface Todo {
  id: number
  title: string
  completed: boolean
  completedDate: Date | null
  priority: 'High' | 'Medium' | 'Low' | null
  dueDate: Date | null
  reminderTime: string | null
  category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
}
