'use server'

import { db } from '@/db'
import { dailyLogs } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { getCachedSession } from '../session'
import { createOrUpdateDailySummary } from './daily-summaries'

export const getCachedDailyLogs = cache(async (userId: string) => {
  const userDailyLogs = await db.query.dailyLogs.findMany({
    where: eq(dailyLogs.userId, userId),
    orderBy: [desc(dailyLogs.date)],
  })
  return userDailyLogs
})

async function updateSummaryInBackground(date: string, userId: string) {
  // Run this in the background without blocking
  Promise.resolve().then(async () => {
    try {
      // Get all logs for this date
      const logsForDate = await db.query.dailyLogs.findMany({
        where: and(
          eq(dailyLogs.userId, userId),
          eq(dailyLogs.date, date)
        ),
      })
      
      // Extract descriptions
      const descriptions = logsForDate.map(log => log.description)
      
      // Update or create summary
      if (descriptions.length > 0) {
        await createOrUpdateDailySummary(date, descriptions)
      }
    } catch (error) {
      console.error('Background summary update failed:', error)
      // Don't throw - this is background work
    }
  })
}

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

  // Update summary in background - don't wait for it
  updateSummaryInBackground(formData.date, session.user.id)

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

  // Update summary in background - don't wait for it
  updateSummaryInBackground(formData.date, session.user.id)

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

  // Get the log first to know which date to update
  const [logToDelete] = await db
    .select({ date: dailyLogs.date })
    .from(dailyLogs)
    .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, session.user.id)))
    .limit(1)

  const [deletedDailyLog] = await db
    .delete(dailyLogs)
    .where(and(eq(dailyLogs.id, id), eq(dailyLogs.userId, session.user.id)))
    .returning({ id: dailyLogs.id })

  // Update summary in background if we found the log
  if (logToDelete) {
    updateSummaryInBackground(logToDelete.date, session.user.id)
  }

  revalidatePath('/')
  revalidatePath('/daily-logs')
  revalidatePath('/today')
  return deletedDailyLog
}

export async function getTodaysDailyLogs() {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    return []
  }

  const today = new Date().toISOString().split('T')[0]
  const todaysLogs = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.userId, session.user.id),
      eq(dailyLogs.date, today),
    ),
    orderBy: [desc(dailyLogs.createdAt)],
  })
  return todaysLogs
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

  // Update summary in background - don't wait for it
  updateSummaryInBackground(date, userId)

  revalidatePath('/')
  revalidatePath('/today')

  return newDailyLog
} 