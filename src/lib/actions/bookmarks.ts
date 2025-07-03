'use server'

import { db } from '@/db'
import { bookmarks } from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'

export async function getBookmarks() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return []
  }
  const userBookmarks = await db.query.bookmarks.findMany({
    where: eq(bookmarks.userId, session.user.id),
    orderBy: (bookmarks, { desc }) => [desc(bookmarks.timestamp)],
  })

  return userBookmarks
}

export async function createBookmark(formData: {
  title: string
  url: string
  description: string | null
  tags: string[] | null
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db.insert(bookmarks).values({
    ...formData,
    userId: session.user.id,
  })

  revalidatePath('/')
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
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db
    .update(bookmarks)
    .set({
      ...formData,
    })
    .where(eq(bookmarks.id, id))

  revalidatePath('/')
}

export async function deleteBookmark(id: number) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  await db.delete(bookmarks).where(eq(bookmarks.id, id))

  revalidatePath('/')
}
