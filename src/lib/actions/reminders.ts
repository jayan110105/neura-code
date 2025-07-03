'use server'

import { db } from '@/db'
import { reminders } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function getReminders() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return []
  }
  const userReminders = await db.query.reminders.findMany({
    where: eq(reminders.userId, session.user.id),
    orderBy: (reminders, { desc }) => [desc(reminders.id)],
  })

  return userReminders
}

export async function createReminder(formData: {
  title: string
  description: string | null
  time: string | null
  date: string | null
  repeat: 'Daily' | 'Weekly' | 'Monthly' | 'None' | null
  category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [newReminder] = await db
    .insert(reminders)
    .values({
      ...formData,
      userId: session.user.id,
    })
    .returning()

  revalidatePath('/')
  revalidatePath('/reminders')
  return newReminder
}

export async function updateReminder(
  id: number,
  formData: {
    title: string
    description: string | null
    time: string | null
    date: string | null
    repeat: 'Daily' | 'Weekly' | 'Monthly' | 'None' | null
    category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
  },
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [updatedReminder] = await db
    .update(reminders)
    .set({
      ...formData,
    })
    .where(and(eq(reminders.id, id), eq(reminders.userId, session.user.id)))
    .returning()

  revalidatePath('/')
  revalidatePath('/reminders')
  return updatedReminder
}

export async function toggleReminder(id: number, enabled: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [toggledReminder] = await db
    .update(reminders)
    .set({ enabled: !enabled })
    .where(and(eq(reminders.id, id), eq(reminders.userId, session.user.id)))
    .returning()

  revalidatePath('/')
  revalidatePath('/reminders')
  return toggledReminder
}

export async function deleteReminder(id: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [deletedReminder] = await db
    .delete(reminders)
    .where(and(eq(reminders.id, id), eq(reminders.userId, session.user.id)))
    .returning({ id: reminders.id })

  revalidatePath('/')
  revalidatePath('/reminders')
  return deletedReminder
}
