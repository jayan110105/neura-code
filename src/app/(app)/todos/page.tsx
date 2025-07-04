import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getTodos } from '@/lib/actions/todos'
import { TodoSection } from '@/components/todo-section'

export default async function TodosPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const todos = await getTodos()

  return <TodoSection todos={todos} />
} 