'use server'

import { db } from '@/db'
import { notes } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, and } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function getNotes() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return []
  }
  const userNotes = await db.query.notes.findMany({
    where: eq(notes.userId, session.user.id),
    orderBy: (notes, { desc }) => [desc(notes.timestamp)],
  })

  return userNotes
}

export async function createNote(formData: { title: string; content: string }) {
  const session = await auth.api.getSession({ headers: await headers() })
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
  const session = await auth.api.getSession({ headers: await headers() })
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
  const session = await auth.api.getSession({ headers: await headers() })
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
