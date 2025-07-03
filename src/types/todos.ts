export interface Todo {
  id: number
  title: string
  completed: boolean
  priority: 'High' | 'Medium' | 'Low' | null
  dueDate: Date | null
  category: string | null
}
