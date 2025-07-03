'use server'

import { db } from '@/db'
import { notes } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
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
    return { error: 'Not authenticated' }
  }

  await db.insert(notes).values({
    title: formData.title,
    content: formData.content,
    userId: session.user.id,
  })

  revalidatePath('/')
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
    return { error: 'Not authenticated' }
  }

  await db
    .update(notes)
    .set({
      title: formData.title,
      content: formData.content,
    })
    .where(eq(notes.id, id))

  revalidatePath('/')
}

export async function deleteNote(id: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db.delete(notes).where(eq(notes.id, id))

  revalidatePath('/')
}
