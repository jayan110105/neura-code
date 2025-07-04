import { getBookmarks } from '@/lib/actions/bookmarks'
import { BookmarksSection } from '@/components/bookmarks-section'

export default async function BookmarksPage() {
  const bookmarks = await getBookmarks()

  return <BookmarksSection bookmarks={bookmarks} />
} 