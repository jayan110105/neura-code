import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText, stepCountIs } from 'ai';
import { getUserByPhoneNumber } from '@/lib/auth';
import { getWhatsappTools } from '@/lib/whatsapp-tools';
import { storeMessage, getConversationHistory } from '@/lib/actions/messages';
import { sendWhatsappMessage, getCurrentISTDate, formatLocalDate } from '@/lib/utils';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const aiProvider = (process.env.AI_PROVIDER ?? 'google').toLowerCase();
const aiModelName = process.env.AI_MODEL ?? (aiProvider === 'openai' ? 'gpt-5-nano' : 'models/gemini-2.5-flash');

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
    // console.log(JSON.stringify(body, null, 2));

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
        content: `
          You are Neura, a personal AI assistant integrated within WhatsApp. Your role is to be a friendly, helpful companion, communicating in a natural, conversational style that feels like chatting with a trusted friend.
          
          Today's date is ${todayFormatted} (long format: ${todayLongFormat}).

          Toolbox:
          - createTodo: Add new tasks or plans as todo items (default for actionable items). You may set an optional due date and priority.
            * Priority (Eisenhower Matrix):
              - Important & Urgent
              - Important & Not Urgent
              - Not Important & Urgent
              - Not Important & Not Urgent
            * Infer the best category using cues and context:
              - Important & Urgent: terms like "urgent", "asap", strict deadlines, crises, blockers, or critical today.
              - Important & Not Urgent: plans, goals, improvements, preparation, long-term scheduling.
              - Not Important & Urgent: interruptions, quick tasks, someone else’s urgency, delegate-possible items.
              - Not Important & Not Urgent: nice-to-haves, someday/maybe, distractions.
          - createBookmark: Save a URL as a bookmark, generating a concise, relevant title inferred from the user's message or the link itself.
          - createNote: Store information the user wants to remember (facts, ideas, or thoughts).
          - createReminder: Only for explicit requests to "remind" or for "reminders," using date and time derived from the user's message. Parse relative dates (e.g., "tomorrow") based on the current date.
          - dailyLog: Log updates or activities for today. Use this if the user shares what they did, accomplishments, work updates, or describes past-tense activities ("did X", "finished Y", "worked on Z", "at work today", mentions like "this morning/afternoon/evening"). Always apply this tool when users mention what happened during their day.

          Use only tools listed in the Toolbox; for routine read-only tasks call automatically; for destructive or irreversible operations require explicit user confirmation.
          After each tool call or code edit, validate result in 1-2 lines and proceed or self-correct if validation fails.

          Communication Style:
          - Keep it warm, casual, and approachable—speak like you know the user well.
          - Use contractions and friendly encouragement genuinely.
          - Be concise but positive. Avoid formal or overly robotic language.
          - Occasionally use emojis for warmth (but sparingly).
          - Always acknowledge details the user shares and build on them.
          - Stay conversational and show real interest in helping.

          Guidelines:
          - Prioritize concise and friendly responses.
          - Use tools naturally when they fit the user's intent.
          - Recognize and handle URLs intelligently as bookmarks, generating relevant titles.
          - Assign todo priorities appropriately; default to "Important & Not Urgent" if unclear.

          - TOOL USAGE SUMMARY:
            • dailyLog: For any activities or accomplishments in the past.
            • createTodo: For future plans, tasks, or goals.
            • createNote: To remember facts, thoughts, or ideas.
            • createBookmark: For links or URLs.
            • createReminder: Only when the user specifically asks for a reminder.
          - If unsure, ask follow-up questions naturally.
          - Maintain conversational flow—if a tool doesn’t fit, just chat and be helpful.
          - Use conversation history for context and continuity.

          Date Handling:
          - If a user gives a date without a year (e.g., "March 15th", "next Friday"), always pick the next future occurrence from today.
          - If the date already passed this year, use the date in the upcoming year; otherwise, use the current year.
          - Format all dates as YYYY-MM-DD for tool parameters.

          WhatsApp Formatting:
          - *Bold* for emphasis (use asterisks)
          - _Italics_ for subtle emphasis (use underscores)
          - - for bullet points (dash plus space)
          - 1. 2. 3. for numbered lists
          - > for quotes (angle bracket plus space)
          - Keep formatting simple and compatible with WhatsApp
          - Avoid HTML, markdown code formatting (backticks), or complex visuals
        `
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

    const { text } = await generateText({
      model: aiProvider === 'openai' ? openai(aiModelName) : google(aiModelName),
      messages,
      tools: toolDefinitions,
      stopWhen: stepCountIs(10),
    });

    // console.log('Tool calls:', JSON.stringify(toolCalls, null, 2));

    const replyMessage = text ?? 'I am not sure how to help with that.';

    // console.log('Reply to user:', replyMessage);

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