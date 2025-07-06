'use server'

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai'

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

export async function generateDailySummary(
  descriptions: (string | null)[],
): Promise<string> {
  const filteredDescriptions = descriptions
    .filter((d) => d && d.trim() !== '')
    .join('\n- ')

  if (!filteredDescriptions) {
    return 'No daily log entries were recorded today.'
  }

  const prompt = `Summarize these daily log entries in 2-3 simple sentences using first person (I, me, my). Use basic words but add a bit more detail:

Log entries:
- ${filteredDescriptions}

Summary:`

  try {
    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: `Create short, simple summaries of daily logs. Rules:
- Use basic, everyday words
- Keep it to 2-3 sentences
- Add a bit more detail and context
- No fancy language or big words
- Just state what happened and how it felt
- Write in first person (I, me, my) like it's your own diary
- Write like you're talking to a friend about your day`,
      prompt,
    })

    return text.trim()
  } catch (error) {
    console.error('Error generating summary:', error)
    return 'Unable to generate a summary at this time.'
  }
} 