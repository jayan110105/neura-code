'use server'

import { db } from '@/db'
import { todos } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function getTodos() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return []
  }
  const userTodos = await db.query.todos.findMany({
    where: eq(todos.userId, session.user.id),
    orderBy: (todos, { desc }) => [desc(todos.id)],
  })

  return userTodos
}

export async function createTodo(formData: {
  title: string
  priority: 'High' | 'Medium' | 'Low'
  dueDate?: Date
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db.insert(todos).values({
    title: formData.title,
    priority: formData.priority,
    dueDate: formData.dueDate,
    userId: session.user.id,
  })

  revalidatePath('/')
}

export async function updateTodo(
  id: number,
  formData: {
    title: string
    priority: 'High' | 'Medium' | 'Low'
    dueDate?: Date
    completed?: boolean
  },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db
    .update(todos)
    .set({
      title: formData.title,
      priority: formData.priority,
      dueDate: formData.dueDate,
      completed: formData.completed,
    })
    .where(eq(todos.id, id))

  revalidatePath('/')
}

export async function toggleTodo(id: number, completed: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db.update(todos).set({ completed: !completed }).where(eq(todos.id, id))

  revalidatePath('/')
}

export async function deleteTodo(id: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db.delete(todos).where(eq(todos.id, id))

  revalidatePath('/')
}
