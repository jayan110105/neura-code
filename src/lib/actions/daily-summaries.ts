'use server'

import { db } from '@/db'
import { dailySummaries, dailyLogs } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCachedSession } from '@/lib/session'
import { generateDailySummary } from './summary'
import { formatLocalDate } from '@/lib/utils'
import { revalidatePath } from 'next/cache'
import type { DailySummary } from '@/types'

export async function getDailySummary(date: string): Promise<DailySummary | null> {
  const session = await getCachedSession()
  if (!session?.user?.id) return null

  const [summary] = await db
    .select()
    .from(dailySummaries)
    .where(
      and(
        eq(dailySummaries.userId, session.user.id),
        eq(dailySummaries.date, date)
      )
    )
    .limit(1)

  return summary || null
}

export async function generateTodaysSummaryAction() {
  'use server'
  
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const today = formatLocalDate(new Date())
  
  const logsForDate = await db.query.dailyLogs.findMany({
    where: and(
      eq(dailyLogs.userId, session.user.id),
      eq(dailyLogs.date, today)
    ),
  })
  
  const descriptions = logsForDate.map(log => log.description).filter(Boolean)
  
  if (descriptions.length === 0) {
    return
  }

  const summaryText = await generateDailySummary(descriptions)
  
  const existingSummary = await db
    .select()
    .from(dailySummaries)
    .where(
      and(
        eq(dailySummaries.userId, session.user.id),
        eq(dailySummaries.date, today)
      )
    )
    .limit(1)

  if (existingSummary.length > 0) {
    await db
      .update(dailySummaries)
      .set({
        summary: summaryText,
        updatedAt: new Date(),
      })
      .where(eq(dailySummaries.id, existingSummary[0].id))
  } else {
    await db
      .insert(dailySummaries)
      .values({
        date: today,
        summary: summaryText,
        userId: session.user.id,
      })
  }
  
  revalidatePath('/today')
} 