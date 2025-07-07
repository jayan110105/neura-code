import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getUserByPhoneNumber } from '@/lib/auth';
import { getWhatsappTools } from '@/lib/whatsapp-tools';
import { storeMessage, getConversationHistory } from '@/lib/actions/messages';
import { sendWhatsappMessage, getCurrentISTDate, formatLocalDate } from '@/lib/utils';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WhatsApp webhook verified');
    return new NextResponse(challenge, { status: 200 });
  } else {
    console.error('Failed webhook verification');
    return new NextResponse('Failed validation. Make sure the validation tokens match.', { status: 403 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log(JSON.stringify(body, null, 2));

    const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

    if (!message || !message.text?.body) {
      return NextResponse.json({ status: 'success' }, { status: 200 });
    }

    const userMessage = message.text.body;
    const from = message.from;

    const user = await getUserByPhoneNumber(from);

    if (!user) {
      const reply = 'Please sign up to use this service.';
      await sendWhatsappMessage(from, reply);
      return NextResponse.json({ reply }, { status: 200 });
    }

    await storeMessage(user.id, userMessage, 'user');

    const conversationHistory = await getConversationHistory(user.id, 10);
    
    const currentISTDate = getCurrentISTDate();
    const todayFormatted = formatLocalDate(currentISTDate);
    const todayLongFormat = currentISTDate.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      timeZone: 'Asia/Kolkata'
    });
    
    const messages = [
      {
        role: 'system' as const,
        content: `You are Neura, a personal AI assistant integrated into WhatsApp. You're friendly, helpful, and speak naturally like a trusted personal assistant would.

The current date is ${todayFormatted} (today is ${todayLongFormat}).

You have access to the following tools:
- createTodo: Creates a new todo item for tasks and plans. This is your default choice for actionable items. You can optionally provide a due date and priority level.
  * Priority levels: High (urgent/important), Medium (default), Low (nice-to-have)
  * Infer priority from language cues: "urgent", "asap", "important", "critical" = High; "eventually", "someday", "when I have time" = Low; otherwise Medium
  * Consider context: work deadlines, health matters, time-sensitive tasks = High; routine tasks, general goals = Medium; optional improvements = Low
- createBookmark: Saves a URL as a bookmark.
- createNote: Creates a new note for information you want to remember.
- createReminder: Sets a new reminder with specific date and time. Only use this when the user explicitly mentions "remind" or "reminder" keywords. Use the current date to infer the correct date and time from the user's request (e.g., "tomorrow" should be calculated based on the current date).
- dailyLog: Creates a daily log entry for today. These entries are automatically combined into daily summaries.

Your Communication Style:
- Be warm, conversational, and natural - like a helpful friend who knows you well
- Use casual, friendly language instead of formal business speak
- Show enthusiasm and encouragement when appropriate
- Use contractions naturally (I'll, you're, can't, etc.)
- Acknowledge and build on what the user shares
- Use occasional emojis sparingly to add warmth, but don't overdo it
- Sound genuinely interested in helping, not robotic

Your Guidelines:
- Be concise but warm. Get to the point while maintaining a friendly tone.
- Use tools when appropriate. If a user's message maps to one of your tools, use it naturally.
- Handle links intelligently. If a user provides a URL, treat it as a bookmark. Generate a concise, descriptive title based on the user's message or by inferring from the URL itself.
- Assign smart priorities for todos:
  * HIGH: "I need to", "urgent", "asap", "by [soon date]", "important", "critical", "must do", work deadlines, health-related tasks
  * LOW: "someday", "eventually", "when I have time", "would be nice to", "maybe", optional improvements
  * MEDIUM: everything else (default for most regular tasks)
- When you're unsure, ask naturally - like a friend would
- Keep conversations flowing naturally. If no tool seems right, just chat naturally and helpfully
- Use conversation history to be contextual and remember what you've talked about

CRITICAL - Date Handling Rules:
- When users mention dates without a year (e.g., "March 15th", "next Friday"), ALWAYS assume they mean the NEXT occurrence of that date from today.
- If the mentioned date has already passed this year, use the NEXT year. If it hasn't passed yet, use the CURRENT year.
- For example, if today is December 2024 and user says "March 15th", use 2025-03-15.
- If today is January 2025 and user says "March 15th", use 2025-03-15.
- Always format dates as YYYY-MM-DD for tool parameters.

IMPORTANT - WhatsApp Formatting Rules:
- Use *bold* for emphasis (wrap text with asterisks)
- Use _italics_ for subtle emphasis (wrap text with underscores)
- Use - for bullet points (dash followed by space)
- Use 1. 2. 3. for numbered lists (number, period, space)
- Use > for quotes (angle bracket, space)
- Keep formatting simple and WhatsApp-compatible
- Avoid HTML, markdown backticks, or complex formatting`
      },
      ...conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: userMessage
      }
    ];

    const toolDefinitions = getWhatsappTools(user.id);

    const { toolCalls, text } = await generateText({
      model: google('models/gemini-2.5-flash'),
      messages,
      tools: toolDefinitions,
      maxSteps: 10,
    });

    console.log('Tool calls:', JSON.stringify(toolCalls, null, 2));

    let replyMessage: string;

    if (toolCalls?.length > 0) {
      const toolCall = toolCalls[0];
      const tool = toolDefinitions[
        toolCall.toolName as keyof typeof toolDefinitions
      ];

      if (tool) {
        replyMessage = await (tool as any).execute(toolCall.args);
      } else {
        replyMessage = 'I am not sure how to help with that.';
      }
    } else {
      replyMessage = text ?? 'I am not sure how to help with that.';
    }

    console.log('Reply to user:', replyMessage);

    await storeMessage(user.id, replyMessage, 'assistant');

    await sendWhatsappMessage(from, replyMessage);

    return NextResponse.json({ reply: replyMessage }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal Server Error' },
      { status: 500 },
    );
  }
} 