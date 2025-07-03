'use server'

import { db } from '@/db'
import { reminders } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
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
    return { error: 'Not authenticated' }
  }

  await db.insert(reminders).values({
    ...formData,
    userId: session.user.id,
  })

  revalidatePath('/')
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
    return { error: 'Not authenticated' }
  }

  await db
    .update(reminders)
    .set({
      ...formData,
    })
    .where(eq(reminders.id, id))

  revalidatePath('/')
}

export async function toggleReminder(id: number, enabled: boolean) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db
    .update(reminders)
    .set({ enabled: !enabled })
    .where(eq(reminders.id, id))

  revalidatePath('/')
}

export async function deleteReminder(id: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db.delete(reminders).where(eq(reminders.id, id))

  revalidatePath('/')
}
