import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getBookmarks } from '@/lib/actions/bookmarks'
import { BookmarksSection } from '@/components/bookmarks-section'

export default async function BookmarksPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const bookmarks = await getBookmarks()

  return <BookmarksSection bookmarks={bookmarks} />
} 