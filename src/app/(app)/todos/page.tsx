import { type Metadata } from 'next'
import { getTodos } from '@/lib/actions/todos'
import { TodoSection } from '@/components/todo-section'

export const metadata: Metadata = {
  title: 'Todos',
  description: 'Manage your tasks and to-do items. Stay organized and track your progress with priority levels and due dates.',
}

export default async function TodosPage() {
  const todos = await getTodos()

  return <TodoSection todos={todos} />
} 