'use server'

import { db } from '@/db'
import { messages } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { cache } from 'react'

export const getCachedMessages = cache(async (userId: string, limit: number = 10) => {
  const userMessages = await db.query.messages.findMany({
    where: eq(messages.userId, userId),
    orderBy: [desc(messages.createdAt)],
    limit,
  })
  return userMessages.reverse()
})

export async function getRecentMessages(userId: string, limit: number = 10) {
  return getCachedMessages(userId, limit)
}

export async function storeMessage(
  userId: string,
  content: string,
  role: 'user' | 'assistant'
) {
  const [newMessage] = await db
    .insert(messages)
    .values({
      userId,
      content,
      role,
    })
    .returning()

  return newMessage
}

export async function getConversationHistory(userId: string, limit: number = 10) {
  const recentMessages = await getRecentMessages(userId, limit)
  
  return recentMessages.map(msg => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
    timestamp: msg.createdAt,
  }))
}

export async function clearAllMessages(userId: string) {
  await db
    .delete(messages)
    .where(eq(messages.userId, userId))
  
  return { success: true, message: 'All messages cleared successfully' }
} 