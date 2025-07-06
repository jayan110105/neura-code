import { NextRequest, NextResponse } from 'next/server'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { getCachedSession } from '@/lib/session'
import { getContextualContent, semanticSearch } from '@/lib/actions/embedding-actions'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { message, includeContext = true, contextTypes, maxContext = 5 } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      )
    }

    // Get the current user session
    const session = await getCachedSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let contextualContent = ''
    let searchResults: any[] = []

    if (includeContext) {
      try {
        // Get relevant context from user's content
        contextualContent = await getContextualContent(session.user.id, message, maxContext)
        
        // Also get the raw search results for the response
        searchResults = await semanticSearch(session.user.id, message, maxContext, contextTypes)
      } catch (error) {
        console.error('Error retrieving context:', error)
        // Continue without context if there's an error
        contextualContent = 'No relevant context found.'
      }
    }

    // Prepare the system message with context
    const systemMessage = `You are Neura, a personal AI assistant with access to the user's personal knowledge base. You help users find information and answer questions based on their stored content.

Current user query: "${message}"

${includeContext && contextualContent ? `
RELEVANT CONTEXT FROM USER'S KNOWLEDGE BASE:
${contextualContent}

Instructions:
- Use the provided context to answer the user's question when relevant
- If the context contains relevant information, reference it in your response
- If the context doesn't contain relevant information, say so and provide a general response
- Always be helpful and conversational
- You can suggest creating new content (notes, todos, bookmarks) if the user needs to store information
` : `
You don't have access to the user's knowledge base for this query. Provide a helpful general response and suggest ways the user could organize their information using your tools.
`}`

    // Generate response using Google's AI with context
    const { text } = await generateText({
      model: google('models/gemini-2.5-flash'),
      system: systemMessage,
      prompt: message,
      maxTokens: 1000,
    })

    return NextResponse.json({
      response: text,
      context: includeContext ? {
        found: searchResults.length > 0,
        results: searchResults.map(result => ({
          type: result.contentType,
          title: result.title,
          similarity: result.similarity,
          content: result.content.slice(0, 200) + (result.content.length > 200 ? '...' : ''),
        })),
      } : null,
    })

  } catch (error) {
    console.error('RAG API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const limit = parseInt(searchParams.get('limit') || '10')
    const types = searchParams.get('types')?.split(',') as ('note' | 'bookmark' | 'todo' | 'daily_log')[] | undefined

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    // Get the current user session
    const session = await getCachedSession()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Perform semantic search
    const results = await semanticSearch(session.user.id, query, limit, types)

    return NextResponse.json({
      query,
      results: results.map(result => ({
        id: result.id,
        type: result.contentType,
        title: result.title,
        content: result.content,
        similarity: result.similarity,
        url: result.url,
        createdAt: result.createdAt,
      })),
      total: results.length,
    })

  } catch (error) {
    console.error('Semantic search API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 