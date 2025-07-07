import { type Metadata } from 'next'
import { getBookmarks } from '@/lib/actions/bookmarks'
import { BookmarksSection } from '@/components/bookmarks-section'

export const metadata: Metadata = {
  title: 'Bookmarks',
  description: 'Save and organize your favorite websites and links. Keep track of useful resources with tags and descriptions.',
}

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks()

  return <BookmarksSection bookmarks={bookmarks} />
} 