'use server'

import { db } from '@/db'
import { bookmarks } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { getCachedSession } from '../session'
import { storeEmbedding, deleteEmbedding } from './embedding-actions'
import { prepareTextForEmbedding } from '../embedding-service'

export const getCachedBookmarks = cache(async (userId: string) => {
  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, userId),
    orderBy: (bookmarks, { desc }) => [desc(bookmarks.timestamp)],
  })

  return userBookmarks
})

export async function getBookmarks() {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    return []
  }
  return getCachedBookmarks(session.user.id)
}

export async function createBookmark(formData: {
  title: string
  url: string
  description: string | null
  tags: string[] | null
}) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [newBookmark] = await db
    .insert(bookmarks)
    .values({
      ...formData,
      userId: session.user.id,
    })
    .returning()

  try {
    const content = `${formData.description || ''} ${formData.tags?.join(' ') || ''} ${formData.url}`.trim()
    const embeddingContent = prepareTextForEmbedding(content, formData.title)
    await storeEmbedding(session.user.id, embeddingContent, 'bookmark', newBookmark.id)
  } catch (error) {
    console.error('Error storing embedding for bookmark:', error)
  }

  revalidatePath('/')
  revalidatePath('/bookmarks')
  return newBookmark
}

export async function updateBookmark(
  id: number,
  formData: {
    title: string
    url: string
    description: string | null
    tags: string[] | null
  },
) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [updatedBookmark] = await db
    .update(bookmarks)
    .set({
      ...formData,
    })
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, session.user.id)))
    .returning()

  try {
    const content = `${formData.description || ''} ${formData.tags?.join(' ') || ''} ${formData.url}`.trim()
    const embeddingContent = prepareTextForEmbedding(content, formData.title)
    await storeEmbedding(session.user.id, embeddingContent, 'bookmark', id)
  } catch (error) {
    console.error('Error updating embedding for bookmark:', error)
  }

  revalidatePath('/')
  revalidatePath('/bookmarks')
  return updatedBookmark
}

export async function deleteBookmark(id: number) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [deletedBookmark] = await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.id, id), eq(bookmarks.userId, session.user.id)))
    .returning({ id: bookmarks.id })

  try {
    await deleteEmbedding(session.user.id, 'bookmark', id)
  } catch (error) {
    console.error('Error deleting embedding for bookmark:', error)
  }

  revalidatePath('/')
  revalidatePath('/bookmarks')
  return deletedBookmark
}

export async function createBookmarkFromAgent(
  userId: string,
  title: string,
  url: string,
) {
  const [newBookmark] = await db
    .insert(bookmarks)
    .values({
      userId,
      title,
      url,
    })
    .returning()

  try {
    const embeddingContent = prepareTextForEmbedding(url, title)
    await storeEmbedding(userId, embeddingContent, 'bookmark', newBookmark.id)
  } catch (error) {
    console.error('Error storing embedding for bookmark:', error)
  }

  revalidatePath('/')
  revalidatePath('/bookmarks')
  return newBookmark
}
