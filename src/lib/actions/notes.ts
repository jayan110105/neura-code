'use server'

import { db } from '@/db'
import { notes } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { cache } from 'react'
import { getCachedSession } from '../session'

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

  revalidatePath('/')
  revalidatePath('/notes')
  return newNote
}
