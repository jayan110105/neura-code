'use server'

import { db } from '@/db'
import { todos } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
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
  reminderTime?: string
  category?: 'Work' | 'Health' | 'Personal' | 'Finance' | null
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [newTodo] = await db
    .insert(todos)
    .values({
      title: formData.title,
      priority: formData.priority,
      dueDate: formData.dueDate,
      reminderTime: formData.reminderTime,
      category: formData.category,
      userId: session.user.id,
    })
    .returning()

  revalidatePath('/')
  revalidatePath('/todo')
  return newTodo
}

export async function updateTodo(
  id: number,
  formData: {
    title: string
    priority: 'High' | 'Medium' | 'Low'
    dueDate?: Date
    reminderTime?: string
    completed?: boolean
    category?: 'Work' | 'Health' | 'Personal' | 'Finance' | null
  },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [updatedTodo] = await db
    .update(todos)
    .set({
      title: formData.title,
      priority: formData.priority,
      dueDate: formData.dueDate,
      reminderTime: formData.reminderTime,
      completed: formData.completed,
      category: formData.category,
    })
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)))
    .returning()

  revalidatePath('/')
  revalidatePath('/todo')
  return updatedTodo
}

export async function toggleTodo(id: number, completed: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [toggledTodo] = await db
    .update(todos)
    .set({ completed: !completed })
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)))
    .returning()

  revalidatePath('/')
  revalidatePath('/todo')
  return toggledTodo
}

export async function deleteTodo(id: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [deletedTodo] = await db
    .delete(todos)
    .where(and(eq(todos.id, id), eq(todos.userId, session.user.id)))
    .returning({ id: todos.id })

  revalidatePath('/')
  revalidatePath('/todo')
  return deletedTodo
}
