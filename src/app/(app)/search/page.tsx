import { type Metadata } from 'next'
import { RAGSearch } from '@/components/rag-search'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search through your notes, todos, bookmarks, and other content with AI-powered intelligent search.',
}

export default function SearchPage() {
  return (
    <div className="min-h-screen bg-background">
      <RAGSearch />
    </div>
  )
} 