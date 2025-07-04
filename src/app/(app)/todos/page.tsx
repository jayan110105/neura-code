import { getTodos } from '@/lib/actions/todos'
import { TodoSection } from '@/components/todo-section'

export default async function TodosPage() {
  const todos = await getTodos()

  return <TodoSection todos={todos} />
} 