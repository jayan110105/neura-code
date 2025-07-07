'use server'

import { db } from '@/db'
import { dailyLogs } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { getCachedSession } from '../session'
import { storeEmbedding, deleteEmbedding } from './embedding-actions'
import { prepareTextForEmbedding } from '../embedding-service'
import { formatLocalDate } from '../utils'

export const getCachedDailyLogs = cache(async (userId: string) => {
  const userDailyLogs = await db.query.dailyLogs.findMany({
    where: eq(dailyLogs.userId, userId),
    orderBy: [desc(dailyLogs.date)],
  })
  return userDailyLogs
})

export const getCachedDailyLogsForDate = cache(async (userId: string, date: string) => {
  const logsForDate = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.userId, userId),
      eq(dailyLogs.date, date)
    ),
  })
  return logsForDate
})

export async function getDailyLogs() {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    return []
  }
  return getCachedDailyLogs(session.user.id)
}

export async function createDailyLog(formData: {
  date: string
  description: string | null
}) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [newDailyLog] = await db
    .insert(dailyLogs)
    .values({
      ...formData,
      userId: session.user.id,
    })
    .returning()

  try {
    if (formData.description) {
      const embeddingContent = prepareTextForEmbedding(formData.description, `Daily Log - ${formData.date}`)
      await storeEmbedding(session.user.id, embeddingContent, 'daily_log', newDailyLog.id)
    }
  } catch (error) {
    console.error('Error storing embedding for daily log:', error)
  }

  revalidatePath('/')
  revalidatePath('/daily-logs')
  revalidatePath('/today')
  return newDailyLog
}

export async function updateDailyLog(
  id: number,
  formData: {
    date: string
    description: string | null
  },
) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [updatedDailyLog] = await db
    .update(dailyLogs)
    .set({
      ...formData,
    })
    .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, session.user.id)))
    .returning()

  try {
    if (formData.description) {
      const embeddingContent = prepareTextForEmbedding(formData.description, `Daily Log - ${formData.date}`)
      await storeEmbedding(session.user.id, embeddingContent, 'daily_log', id)
    } else {
      await deleteEmbedding(session.user.id, 'daily_log', id)
    }
  } catch (error) {
    console.error('Error updating embedding for daily log:', error)
  }

  revalidatePath('/')
  revalidatePath('/daily-logs')
  revalidatePath('/today')
  return updatedDailyLog
}

export async function deleteDailyLog(id: number) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [logToDelete] = await db
    .select({ date: dailyLogs.date })
    .from(dailyLogs)
    .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, session.user.id)))
    .limit(1)

  const [deletedDailyLog] = await db
    .delete(dailyLogs)
    .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, session.user.id)))
    .returning({ id: dailyLogs.id })

  try {
    await deleteEmbedding(session.user.id, 'daily_log', id)
  } catch (error) {
    console.error('Error deleting embedding for daily log:', error)
  }

  revalidatePath('/')
  revalidatePath('/daily-logs')
  revalidatePath('/today')
  return deletedDailyLog
}

export const getCachedTodaysDailyLogs = cache(async (userId: string, today: string) => {
  const todaysLogs = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.userId, userId),
      eq(dailyLogs.date, today),
    ),
    orderBy: [desc(dailyLogs.createdAt)],
  })
  return todaysLogs
})

export async function getTodaysDailyLogs() {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    return []
  }

  const today = formatLocalDate(new Date())
  return getCachedTodaysDailyLogs(session.user.id, today)
}

export async function createDailyLogFromAgent(
  userId: string,
  description: string,
  date: string,
) {
  const [newDailyLog] = await db
    .insert(dailyLogs)
    .values({
      userId,
      description,
      date,
    })
    .returning()

  try {
    const embeddingContent = prepareTextForEmbedding(description, `Daily Log - ${date}`)
    await storeEmbedding(userId, embeddingContent, 'daily_log', newDailyLog.id)
  } catch (error) {
    console.error('Error storing embedding for daily log:', error)
  }

  revalidatePath('/')
  revalidatePath('/today')

  return newDailyLog
} 