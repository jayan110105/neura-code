import { tool } from 'ai'
import { z } from 'zod'
import { createTodoFromAgent } from '@/lib/actions/todos'
import { createBookmarkFromAgent } from '@/lib/actions/bookmarks'
import { createNoteFromAgent } from '@/lib/actions/notes'
import { createReminderFromAgent } from '@/lib/actions/reminders'

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
      description:
        'Create a daily log, which is a note with a specific title format.',
      parameters: z.object({
        content: z.string().describe('The content of the daily log.'),
      }),
      execute: async ({ content }) => {
        const today = new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
        await createNoteFromAgent(userId, `Daily Log - ${today}`, content)
        return `Daily log for ${today} created.`
      },
    }),
  }
} 