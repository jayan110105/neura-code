'use server'

import { db } from '@/db'
import { notes } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { getCachedSession } from '../session'
import { storeEmbedding, deleteEmbedding } from './embedding-actions'
import { prepareTextForEmbedding } from '../embedding-service'

export const getCachedNotes = cache(async (userId: string) => {
  const userNotes = await db.query.notes.findMany({
    where: eq(notes.userId, userId),
    orderBy: (notes, { desc }) => [desc(notes.timestamp)],
  })
  return userNotes
})

export async function getNotes() {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    return []
  }
  return getCachedNotes(session.user.id)
}

export async function createNote(formData: { title: string; content: string }) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [newNote] = await db
    .insert(notes)
    .values({
      title: formData.title,
      content: formData.content,
      userId: session.user.id,
    })
    .returning()

  try {
    const content = prepareTextForEmbedding(formData.content || '', formData.title)
    await storeEmbedding(session.user.id, content, 'note', newNote.id)
  } catch (error) {
    console.error('Error storing embedding for note:', error)
  }

  revalidatePath('/')
  revalidatePath('/notes')
  return newNote
}

export async function updateNote(
  id: number,
  formData: {
    title: string
    content: string
  },
) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [updatedNote] = await db
    .update(notes)
    .set({
      title: formData.title,
      content: formData.content,
    })
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
    .returning()

  try {
    const content = prepareTextForEmbedding(formData.content || '', formData.title)
    await storeEmbedding(session.user.id, content, 'note', id)
  } catch (error) {
    console.error('Error updating embedding for note:', error)
  }

  revalidatePath('/')
  revalidatePath('/notes')
  return updatedNote
}

export async function deleteNote(id: number) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [deletedNote] = await db
    .delete(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, session.user.id)))
    .returning({ id: notes.id })

  try {
    await deleteEmbedding(session.user.id, 'note', id)
  } catch (error) {
    console.error('Error deleting embedding for note:', error)
  }

  revalidatePath('/')
  revalidatePath('/notes')
  return deletedNote
}

export async function createNoteFromAgent(
  userId: string,
  title: string,
  content: string,
) {
  const [newNote] = await db
    .insert(notes)
    .values({
      userId,
      title,
      content,
    })
    .returning()

  try {
    const embeddingContent = prepareTextForEmbedding(content || '', title)
    await storeEmbedding(userId, embeddingContent, 'note', newNote.id)
  } catch (error) {
    console.error('Error storing embedding for note:', error)
  }

  revalidatePath('/')
  revalidatePath('/notes')
  return newNote
}
