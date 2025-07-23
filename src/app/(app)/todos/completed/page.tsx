import { type Metadata } from 'next'
import { getCompletedTodos } from '@/lib/actions/todos'
import { CompletedTodosSection } from '@/components/completed-todos-section'

export const metadata: Metadata = {
  title: 'Completed Todos',
  description: 'View your completed tasks and accomplished goals. Track your productivity and celebrate your achievements.',
}

export default async function CompletedTodosPage() {
  const completedTodos = await getCompletedTodos()

  return <CompletedTodosSection todos={completedTodos} />
} 