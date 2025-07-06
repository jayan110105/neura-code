'use client'

import { useState, useRef, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { IconArrowUp, IconLoader, IconBrain, IconSearch, IconExternalLink } from '@tabler/icons-react'
import { useCurrentUser } from '@/hooks/use-current-user'

interface SearchResult {
  type: 'note' | 'bookmark' | 'todo' | 'daily_log'
  title?: string
  similarity: number
  content: string
  url?: string
}

interface RAGResponse {
  response: string
  context: {
    found: boolean
    results: SearchResult[]
  } | null
}

export function RAGSearch() {
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState<RAGResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [searchMode, setSearchMode] = useState<'rag' | 'search'>('rag')
  const formRef = useRef<HTMLFormElement>(null)
  const { user } = useCurrentUser()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (isLoading || !query.trim()) return

    setIsLoading(true)
    setResponse(null)

    try {
      if (searchMode === 'rag') {
        // RAG mode - get AI response with context
        const res = await fetch('/api/rag', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: query,
            includeContext: true,
            maxContext: 5,
          }),
        })

        if (!res.ok) {
          throw new Error('Failed to get RAG response')
        }

        const data = await res.json()
        setResponse(data)
      } else {
        // Search mode - semantic search only
        const res = await fetch(`/api/rag?q=${encodeURIComponent(query)}&limit=10`)
        
        if (!res.ok) {
          throw new Error('Failed to perform search')
        }

        const data = await res.json()
        setResponse({
          response: `Found ${data.total} relevant items in your knowledge base.`,
          context: {
            found: data.total > 0,
            results: data.results.map((result: any) => ({
              type: result.type,
              title: result.title,
              similarity: result.similarity,
              content: result.content,
              url: result.url,
            })),
          },
        })
      }
    } catch (error) {
      console.error('Error:', error)
      setResponse({
        response: 'Sorry, there was an error processing your request. Please try again.',
        context: null,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'note':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'bookmark':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'todo':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
      case 'daily_log':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'note':
        return 'Note'
      case 'bookmark':
        return 'Bookmark'
      case 'todo':
        return 'Todo'
      case 'daily_log':
        return 'Daily Log'
      default:
        return type
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <IconBrain className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Knowledge Assistant</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Ask questions about your notes, bookmarks, todos, and daily logs
        </p>
      </div>

      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="flex bg-muted rounded-lg p-1">
          <Button
            variant={searchMode === 'rag' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSearchMode('rag')}
            className="flex items-center gap-2"
          >
            <IconBrain className="h-4 w-4" />
            AI Assistant
          </Button>
          <Button
            variant={searchMode === 'search' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSearchMode('search')}
            className="flex items-center gap-2"
          >
            <IconSearch className="h-4 w-4" />
            Semantic Search
          </Button>
        </div>
      </div>

      {/* Search Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="relative">
        <div className="flex w-full items-center rounded-2xl border bg-card">
          <Textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchMode === 'rag'
                ? "Ask anything about your content... e.g., 'What did I learn about React?' or 'What are my work todos?'"
                : "Search for content... e.g., 'React components' or 'meeting notes'"
            }
            className="min-h-[120px] flex-1 resize-none border-none bg-transparent p-4 focus-visible:ring-0"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                if (!isLoading && query.trim()) {
                  formRef.current?.requestSubmit()
                }
              }
            }}
          />
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !user || !query.trim()}
            className="absolute bottom-3 right-3 shrink-0 rounded-full"
          >
            {isLoading ? (
              <IconLoader className="h-4 w-4 animate-spin" />
            ) : (
              <IconArrowUp className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Response */}
      {response && (
        <div className="space-y-6">
          {/* AI Response */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <IconBrain className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold">
                    {searchMode === 'rag' ? 'AI Response' : 'Search Results'}
                  </h3>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {response.response.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Context Sources */}
          {response.context && response.context.found && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <IconSearch className="h-5 w-5" />
                Sources from Your Knowledge Base
              </h3>
              <div className="grid gap-4">
                {response.context.results.map((result, index) => (
                  <Card key={index} className="hover:bg-muted/50 transition-colors">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge className={getTypeColor(result.type)}>
                              {getTypeLabel(result.type)}
                            </Badge>
                            {result.title && (
                              <h4 className="font-medium line-clamp-1">
                                {result.title}
                              </h4>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{(result.similarity * 100).toFixed(1)}% match</span>
                            {result.url && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => window.open(result.url, '_blank')}
                              >
                                <IconExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {result.content}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* No results message */}
          {response.context && !response.context.found && (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="space-y-2">
                  <IconSearch className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="font-semibold">No relevant content found</h3>
                  <p className="text-muted-foreground">
                    Try rephrasing your query or adding more content to your knowledge base.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Help Text */}
      {!response && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">How to use your Knowledge Assistant:</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <IconBrain className="h-4 w-4 text-primary" />
                    AI Assistant Mode
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Ask natural language questions</li>
                    <li>• Get AI-powered answers with context</li>
                    <li>• Perfect for research and insights</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <IconSearch className="h-4 w-4 text-primary" />
                    Semantic Search Mode
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Find content by meaning, not just keywords</li>
                    <li>• Browse relevant items with similarity scores</li>
                    <li>• Great for discovering related content</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 