import { embed, embedMany } from 'ai'
import { createGoogleGenerativeAI } from '@ai-sdk/google'

if (!process.env.GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is required')
}

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

const embeddingModel = google.textEmbeddingModel('text-embedding-004', {
  taskType: 'RETRIEVAL_QUERY',
  outputDimensionality: 512,
})


export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Text content cannot be empty')
  }

  const input = text.replaceAll('\\n', ' ')
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  })
  
  return embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: texts,
  })
  
  return embeddings
}

export function prepareTextForEmbedding(content: string, title?: string): string {
  const fullText = title ? `${title}: ${content}` : content
  
  const cleaned = fullText
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s.,!?-]/g, '')
    .trim()
  
  if (cleaned.length > 8000) {
    const truncated = cleaned.slice(0, 8000)
    const lastSentence = truncated.lastIndexOf('.')
    if (lastSentence > 6000) {
      return truncated.slice(0, lastSentence + 1)
    }
    return truncated + '...'
  }
  
  return cleaned
} 