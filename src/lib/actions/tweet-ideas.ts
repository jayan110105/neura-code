'use server'

import { db } from '@/db'
import { tweetIdeas, tweetStyleReferences } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { getCachedSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import type { TweetIdea, TweetStyleReference, TweetGenerationSource } from '@/types'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

export async function getTweetIdeas(): Promise<TweetIdea[]> {
  const session = await getCachedSession()
  if (!session?.user?.id) return []

  const ideas = await db.query.tweetIdeas.findMany({
    where: eq(tweetIdeas.userId, session.user.id),
    orderBy: [desc(tweetIdeas.generatedAt)],
  })

  return ideas
}

export async function getTweetStyleReferences(): Promise<TweetStyleReference[]> {
  const session = await getCachedSession()
  if (!session?.user?.id) return []

  const references = await db.query.tweetStyleReferences.findMany({
    where: and(
      eq(tweetStyleReferences.userId, session.user.id),
      eq(tweetStyleReferences.isActive, true)
    ),
    orderBy: [desc(tweetStyleReferences.addedAt)],
  })

  return references
}

export async function generateTweetIdeas(sourceData: TweetGenerationSource) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  // Get user's style references to inform the AI
  const styleReferences = await getTweetStyleReferences()
  
  const styleContext = styleReferences.length > 0 
    ? `\n\nUser's preferred tweet styles (use these as inspiration for tone, structure, and approach):\n${styleReferences.map(ref => 
        `- ${ref.tweetText}${ref.notes ? ` (User notes: ${ref.notes})` : ''}`
      ).join('\n')}`
    : ''

  const prompt = `You are helping a user generate engaging tweet ideas based on their daily activities and content. 

Today's data:
${sourceData.dailySummary ? `Daily Summary: ${sourceData.dailySummary}\n` : ''}
${sourceData.todos.length > 0 ? `Todos: ${sourceData.todos.map(t => `${t.completed ? '✅' : '⏳'} ${t.title}${t.priority ? ` (${t.priority} priority)` : ''}`).join(', ')}\n` : ''}
${sourceData.notes.length > 0 ? `Notes: ${sourceData.notes.map(n => `${n.title}${n.content ? `: ${n.content.slice(0, 100)}${n.content.length > 100 ? '...' : ''}` : ''}`).join(', ')}\n` : ''}
${sourceData.dailyLogs.length > 0 ? `Daily Activities: ${sourceData.dailyLogs.map(l => l.description).join(', ')}\n` : ''}
${sourceData.bookmarks.length > 0 ? `Bookmarks: ${sourceData.bookmarks.map(b => `${b.title}${b.description ? ` (${b.description})` : ''}`).join(', ')}\n` : ''}
${sourceData.reminders.length > 0 ? `Reminders: ${sourceData.reminders.map(r => `${r.title}${r.description ? `: ${r.description}` : ''}`).join(', ')}\n` : ''}
${styleContext}

Generate 2-3 engaging tweet ideas based on this data. Each tweet should:
- Be authentic and personal (as if the user is sharing their own experience)
- Stay within Twitter's character limit (280 characters)
- Be engaging and valuable to followers
- Transform daily activities into interesting insights, lessons, or observations
- Use a natural, conversational tone
- Do NOT include any hashtags

Focus on:
- Productivity insights from todos/accomplishments
- Interesting learnings or thoughts from notes
- Behind-the-scenes glimpses of daily work/life
- Lessons learned or reflections
- Useful resources from bookmarks
- Motivational content from completed tasks

Return only the tweet content, one per line, without numbering or bullets.`

  try {
    const { text } = await generateText({
      model: google('models/gemini-2.5-flash'),
      prompt,
    })

    const tweetTexts = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0 && line.length <= 280)
      .slice(0, 8) // Limit to 8 tweets max

    // Store the generated tweets in the database
    const newTweetIdeas = await Promise.all(
      tweetTexts.map(async (content) => {
        const [tweetIdea] = await db
          .insert(tweetIdeas)
          .values({
            content,
            sourceData: JSON.stringify(sourceData),
            userId: session.user.id,
          })
          .returning()
        return tweetIdea
      })
    )

    revalidatePath('/tweet-ideas')
    return newTweetIdeas
  } catch (error) {
    console.error('Error generating tweet ideas:', error)
    throw new Error('Failed to generate tweet ideas')
  }
}

export async function markTweetAsUsed(id: number) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  await db
    .update(tweetIdeas)
    .set({ isUsed: true })
    .where(and(eq(tweetIdeas.id, id), eq(tweetIdeas.userId, session.user.id)))

  revalidatePath('/tweet-ideas')
}

export async function deleteTweetIdea(id: number) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  await db
    .delete(tweetIdeas)
    .where(and(eq(tweetIdeas.id, id), eq(tweetIdeas.userId, session.user.id)))

  revalidatePath('/tweet-ideas')
}

export async function createTweetStyleReference(formData: {
  tweetText: string
  tweetUrl?: string
  author?: string
  notes?: string
}) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [styleReference] = await db
    .insert(tweetStyleReferences)
    .values({
      ...formData,
      userId: session.user.id,
    })
    .returning()

  revalidatePath('/tweet-ideas')
  return styleReference
}

export async function updateTweetStyleReference(
  id: number,
  formData: {
    tweetText?: string
    tweetUrl?: string
    author?: string
    notes?: string
    isActive?: boolean
  }
) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  const [updatedReference] = await db
    .update(tweetStyleReferences)
    .set(formData)
    .where(and(eq(tweetStyleReferences.id, id), eq(tweetStyleReferences.userId, session.user.id)))
    .returning()

  revalidatePath('/tweet-ideas')
  return updatedReference
}

export async function deleteTweetStyleReference(id: number) {
  const session = await getCachedSession()
  if (!session?.user?.id) {
    throw new Error('Not authenticated')
  }

  await db
    .delete(tweetStyleReferences)
    .where(and(eq(tweetStyleReferences.id, id), eq(tweetStyleReferences.userId, session.user.id)))

  revalidatePath('/tweet-ideas')
} 