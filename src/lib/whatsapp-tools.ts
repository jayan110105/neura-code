import { tool } from 'ai'
import { z } from 'zod'
import { createTodoFromAgent } from '@/lib/actions/todos'
import { createBookmarkFromAgent } from '@/lib/actions/bookmarks'
import { createNoteFromAgent } from '@/lib/actions/notes'
import { createReminderFromAgent } from '@/lib/actions/reminders'
import { createDailyLogFromAgent } from '@/lib/actions/daily-logs'
import { getContextualContent } from '@/lib/actions/embedding-actions'
import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
})

export const getWhatsappTools = (userId: string) => {
  return {
    createTodo: tool({
      description: 'Create a new todo item. A due date can be provided.',
      parameters: z.object({
        title: z.string().describe('The title of the todo.'),
        dueDate: z
          .string()
          .optional()
          .describe(
            'The due date for the todo in YYYY-MM-DD format (e.g., "2024-07-26").',
          ),
      }),
      execute: async ({ title, dueDate }) => {
        await createTodoFromAgent(userId, title, dueDate)
        if (dueDate) {
          return `Todo "${title}" created with due date ${dueDate}.`
        }
        return `Todo "${title}" created.`
      },
    }),
    createBookmark: tool({
      description:
        'Saves a new bookmark with a URL and a title. The title should be descriptive and summarize the content of the URL. This tool should be used for saving links and not for conversational responses.',
      parameters: z.object({
        url: z.string().describe('The URL of the bookmark to save.'),
        title: z
          .string()
          .describe(
            'The title for the bookmark. This should be a concise summary of the content at the URL.',
          ),
      }),
      execute: async ({ url, title }) => {
        await createBookmarkFromAgent(userId, title, url)
        return `Bookmark "${title}" created.`
      },
    }),
    createNote: tool({
      description: 'Create a new note.',
      parameters: z.object({
        title: z.string().describe('The title of the note.'),
        content: z.string().describe('The content of the note.'),
      }),
      execute: async ({ title, content }) => {
        await createNoteFromAgent(userId, title, content)
        return `Note "${title}" created.`
      },
    }),
    createReminder: tool({
      description: 'Create a new reminder with a specific date and time.',
      parameters: z.object({
        title: z.string().describe('The title of the reminder.'),
        date: z
          .string()
          .describe(
            'The date for the reminder in YYYY-MM-DD format (e.g., "2024-07-26").',
          ),
        time: z
          .string()
          .describe(
            'The time for the reminder in HH:MM:SS format (e.g., "15:30:00").',
          ),
      }),
      execute: async ({ title, date, time }) => {
        await createReminderFromAgent(userId, title, date, time)
        return `Reminder for "${title}" set for ${date} at ${time}.`
      },
    }),
    dailyLog: tool({
      description: 'Create a new daily log entry for today.',
      parameters: z.object({
        description: z.string().describe('The content of the daily log.'),
      }),
      execute: async ({ description }) => {
        const today = new Date()
        const date = today.toISOString().split('T')[0]
        const formattedDate = today.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        await createDailyLogFromAgent(userId, description, date)
        return `Daily log for ${formattedDate} created.`
      },
    }),
    ragSearch: tool({
      description: 'Search through the user\'s knowledge base (notes, bookmarks, todos, daily logs) to find relevant information and provide context-aware answers. Use this when the user asks questions about their existing content or wants to find/recall something they\'ve stored.',
      parameters: z.object({
        query: z.string().describe('The search query or question to find relevant content in the user\'s knowledge base'),
        maxResults: z.number().optional().describe('Maximum number of results to return (default: 5)'),
      }),
      execute: async ({ query, maxResults = 5 }) => {
        try {
          const contextualContent = await getContextualContent(userId, query, maxResults)
          
          if (contextualContent === 'No relevant content found.') {
            return "I couldn't find any relevant content in your knowledge base for that query. You might want to add some notes, bookmarks, or other content first."
          }
          
          const { text } = await generateText({
            model: google('models/gemini-2.5-flash'),
            system: `You are Neura, helping the user by searching their personal knowledge base. Use the provided context to give a helpful, accurate response. Be conversational and reference the specific content you found. If the context contains multiple relevant items, summarize them clearly.`,
            prompt: `User query: "${query}"\n\nRelevant content from their knowledge base:\n${contextualContent}\n\nPlease provide a helpful response based on this information.`,
            maxTokens: 800,
          })
          
          return text
        } catch (error) {
          console.error('RAG search error:', error)
          return "I couldn't search your knowledge base right now. Please try again later."
        }
      },
    }),
  }
} 