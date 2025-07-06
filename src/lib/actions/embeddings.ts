'use server'

import { db } from '@/db'
import { embeddings, notes, bookmarks, todos, dailyLogs, reminders } from '@/db/schema'
import { generateEmbedding, prepareTextForEmbedding } from '@/lib/embedding-service'
import { eq, and, sql, desc, gt, cosineDistance } from 'drizzle-orm'

export interface EmbeddingContent {
  id: number
  content: string
  contentType: 'note' | 'bookmark' | 'todo' | 'daily_log' | 'reminder'
  contentId: number
  similarity?: number
  title?: string
  url?: string
  createdAt: Date
}

export async function storeEmbedding(
  userId: string,
  content: string,
  contentType: 'note' | 'bookmark' | 'todo' | 'daily_log' | 'reminder',
  contentId: number
): Promise<void> {
  try {
    const preparedText = prepareTextForEmbedding(content)
    const embedding = await generateEmbedding(preparedText)

    const existingEmbedding = await db
      .select()
      .from(embeddings)
      .where(
        and(
          eq(embeddings.contentType, contentType),
          eq(embeddings.contentId, contentId),
          eq(embeddings.userId, userId)
        )
      )
      .limit(1)

    if (existingEmbedding.length > 0) {
      await db
        .update(embeddings)
        .set({
          content: preparedText,
          embedding: embedding,
          updatedAt: new Date(),
        })
        .where(eq(embeddings.id, existingEmbedding[0].id))
    } else {
      await db.insert(embeddings).values({
        content: preparedText,
        embedding: embedding,
        contentType,
        contentId,
        userId,
      })
    }
  } catch (error) {
    console.error('Error storing embedding:', error)
    throw new Error('Failed to store embedding')
  }
}

export async function deleteEmbedding(
  userId: string,
  contentType: 'note' | 'bookmark' | 'todo' | 'daily_log' | 'reminder',
  contentId: number
): Promise<void> {
  try {
    await db
      .delete(embeddings)
      .where(
        and(
          eq(embeddings.contentType, contentType),
          eq(embeddings.contentId, contentId),
          eq(embeddings.userId, userId)
        )
      )
  } catch (error) {
    console.error('Error deleting embedding:', error)
    throw new Error('Failed to delete embedding')
  }
}

export async function semanticSearch(
  userId: string,
  query: string,
  limit: number = 10,
  contentTypes?: ('note' | 'bookmark' | 'todo' | 'daily_log' | 'reminder')[]
): Promise<EmbeddingContent[]> {
  try {
    const queryEmbedding = await generateEmbedding(prepareTextForEmbedding(query))
    
    const whereConditions = [eq(embeddings.userId, userId)]
    if (contentTypes && contentTypes.length > 0) {
      whereConditions.push(sql`${embeddings.contentType} = ANY(${contentTypes})`)
    }

    const similarity = sql<number>`1 - (${cosineDistance(embeddings.embedding, queryEmbedding)})`

    const dbResults = await db
      .select({
        id: embeddings.id,
        content: embeddings.content,
        contentType: embeddings.contentType,
        contentId: embeddings.contentId,
        createdAt: embeddings.createdAt,
        similarity,
      })
      .from(embeddings)
      .where(and(...whereConditions, gt(similarity, 0.2)))
      .orderBy(desc(similarity))
      .limit(limit)

    const results: EmbeddingContent[] = dbResults.map(result => ({
      ...result,
      contentType: result.contentType as 'note' | 'bookmark' | 'todo' | 'daily_log' | 'reminder',
    }))

    const enrichedResults = await Promise.all(
      results.map(async (result) => {
        try {
          let enrichedData: Partial<EmbeddingContent> = {}

          switch (result.contentType) {
            case 'note':
              const note = await db
                .select({ title: notes.title })
                .from(notes)
                .where(eq(notes.id, result.contentId))
                .limit(1)
              if (note.length > 0) {
                enrichedData.title = note[0].title
              }
              break

            case 'bookmark':
              const bookmark = await db
                .select({ title: bookmarks.title, url: bookmarks.url })
                .from(bookmarks)
                .where(eq(bookmarks.id, result.contentId))
                .limit(1)
              if (bookmark.length > 0) {
                enrichedData.title = bookmark[0].title
                enrichedData.url = bookmark[0].url
              }
              break

            case 'todo':
              const todo = await db
                .select({ title: todos.title })
                .from(todos)
                .where(eq(todos.id, result.contentId))
                .limit(1)
              if (todo.length > 0) {
                enrichedData.title = todo[0].title
              }
              break

            case 'daily_log':
              const dailyLog = await db
                .select({ date: dailyLogs.date })
                .from(dailyLogs)
                .where(eq(dailyLogs.id, result.contentId))
                .limit(1)
              if (dailyLog.length > 0) {
                enrichedData.title = `Daily Log - ${dailyLog[0].date}`
              }
              break

            case 'reminder':
              const reminder = await db
                .select({ title: reminders.title })
                .from(reminders)
                .where(eq(reminders.id, result.contentId))
                .limit(1)
              if (reminder.length > 0) {
                enrichedData.title = reminder[0].title
              }
              break
          }

          return { ...result, ...enrichedData }
        } catch (error) {
          console.error(`Error enriching ${result.contentType} with ID ${result.contentId}:`, error)
          return result
        }
      })
    )

    return enrichedResults
  } catch (error) {
    console.error('Error performing semantic search:', error)
    throw new Error('Failed to perform semantic search')
  }
}

export async function getContextualContent(
  userId: string,
  query: string,
  maxResults: number = 5
): Promise<string> {
  try {
    const searchResults = await semanticSearch(userId, query, maxResults)
    
    if (searchResults.length === 0) {
      return 'No relevant content found.'
    }

    const contextParts = searchResults.map((result, index) => {
      const typeLabel = result.contentType.replace('_', ' ').toUpperCase()
      const title = result.title || 'Untitled'
      const similarity = result.similarity ? ` (similarity: ${(result.similarity * 100).toFixed(1)}%)` : ''
      
      return `[${typeLabel} ${index + 1}] ${title}${similarity}\n${result.content}`
    })

    return contextParts.join('\n\n---\n\n')
  } catch (error) {
    console.error('Error getting contextual content:', error)
    return 'Error retrieving contextual content.'
  }
} 