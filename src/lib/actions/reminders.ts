'use server'

import { db } from '@/db'
import { reminders } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { Reminder } from '@/types'
import { cache } from 'react'
import { getCachedSession } from '../session'

export const getCachedReminders = cache(async (userId: string): Promise<Reminder[]> => {
  const userReminders = await db.query.reminders.findMany({
    where: eq(reminders.userId, userId),
    orderBy: (reminders, { desc }) => [desc(reminders.id)],
  })

  return userReminders.map((reminder) => ({
    ...reminder,
    date: reminder.date ? new Date(reminder.date) : null,
  }))
})

export async function getReminders(): Promise<Reminder[]> {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    return []
  }
  return getCachedReminders(session.user.id)
}

export async function createReminder(formData: {
  title: string
  description: string | null
  time: string | null
  date: Date | null
  repeat: 'Daily' | 'Weekly' | 'Monthly' | 'None' | null
  category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
}) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [newReminder] = await db
    .insert(reminders)
    .values({
      ...formData,
      date: formData.date ? formData.date.toISOString().split('T')[0] : null,
      userId: session.user.id,
    })
    .returning()

  revalidatePath('/')
  revalidatePath('/reminders')
  return {
    ...newReminder,
    date: newReminder.date ? new Date(newReminder.date) : null,
  }
}

export async function updateReminder(
  id: number,
  formData: {
    title: string
    description: string | null
    time: string | null
    date: Date | null
    repeat: 'Daily' | 'Weekly' | 'Monthly' | 'None' | null
    category: 'Work' | 'Health' | 'Personal' | 'Finance' | null
  },
) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [updatedReminder] = await db
    .update(reminders)
    .set({
      ...formData,
      date: formData.date ? formData.date.toISOString().split('T')[0] : null,
    })
    .where(and(eq(reminders.id, id), eq(reminders.userId, session.user.id)))
    .returning()

  revalidatePath('/')
  revalidatePath('/reminders')
  return {
    ...updatedReminder,
    date: updatedReminder.date ? new Date(updatedReminder.date) : null,
  }
}

export async function toggleReminder(id: number, enabled: boolean) {
  const session = await getCachedSession()
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
  return {
    ...toggledReminder,
    date: toggledReminder.date ? new Date(toggledReminder.date) : null,
  }
}

export async function deleteReminder(id: number) {
  const session = await getCachedSession()
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
