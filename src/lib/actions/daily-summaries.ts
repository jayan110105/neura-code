'use server'

import { db } from '@/db'
import { dailySummaries } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCachedSession } from '@/lib/session'
import { generateDailySummary } from './summary'
import type { DailySummary } from '@/types'

export async function createOrUpdateDailySummary(
  date: string,
  descriptions: (string | null)[],
): Promise<DailySummary | null> {
  const session = await getCachedSession()
  if (!session?.user?.id) return null

  const summaryText = await generateDailySummary(descriptions)
  
  const existingSummary = await db
    .select()
    .from(dailySummaries)
    .where(
      and(
        eq(dailySummaries.userId, session.user.id),
        eq(dailySummaries.date, date)
      )
    )
    .limit(1)

  if (existingSummary.length > 0) {
    const [updated] = await db
      .update(dailySummaries)
      .set({
        summary: summaryText,
        updatedAt: new Date(),
      })
      .where(eq(dailySummaries.id, existingSummary[0].id))
      .returning()
    
    return updated
  } else {
    const [created] = await db
      .insert(dailySummaries)
      .values({
        date,
        summary: summaryText,
        userId: session.user.id,
      })
      .returning()
    
    return created
  }
}

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

export async function deleteDailySummary(date: string): Promise<boolean> {
  const session = await getCachedSession()
  if (!session?.user?.id) return false

  await db
    .delete(dailySummaries)
    .where(
      and(
        eq(dailySummaries.userId, session.user.id),
        eq(dailySummaries.date, date)
      )
    )

  return true
} 