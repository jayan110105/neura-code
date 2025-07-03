export interface Todo {
  id: number
  title: string
  completed: boolean
  priority: 'High' | 'Medium' | 'Low' | null
  dueDate: Date | null
  reminderTime: string | null
  category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
}
