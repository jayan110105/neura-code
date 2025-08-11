import { type Category } from '@/lib/categories'

export interface Todo {
  id: number
  title: string
  completed: boolean
  completedDate: Date | null
  priority:
    | 'Important & Urgent'
    | 'Important & Not Urgent'
    | 'Not Important & Urgent'
    | 'Not Important & Not Urgent'
    | null
  dueDate: Date | null
  reminderTime: string | null
  category: Category
}
