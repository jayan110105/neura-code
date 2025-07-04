import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import { getUserByPhoneNumber } from '@/lib/auth';
import { getWhatsappTools } from '@/lib/whatsapp-tools';

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

async function sendWhatsappMessage(to: string, text: string) {
  const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${whatsappApiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: to,
      text: { body: text },
    }),
  });
}

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

    const toolDefinitions = getWhatsappTools(user.id);

    const { toolCalls, text } = await generateText({
      model: google('models/gemini-2.5-flash'),
      system: `You are Neura, a personal AI assistant integrated into WhatsApp. Your purpose is to help users capture and organize information seamlessly.
The current date is ${new Date().toLocaleDateString('en-CA')}.

You have access to the following tools:
- \`createTodo\`: Creates a new todo item. You can optionally provide a due date.
- \`createBookmark\`: Saves a URL as a bookmark.
- \`createNote\`: Creates a new note.
- \`createReminder\`: Sets a new reminder. For reminders, you must always provide a specific date and time. Use the current date to infer the correct date and time from the user's request (e.g., "tomorrow" should be calculated based on the current date).
- \`dailyLog\`: Creates a special note for the current day.

Your Guidelines:
- Your default action is to create a todo for any task or plan. Only use the \`createReminder\` tool if the user explicitly uses a keyword like "remind" or "reminder".
- Be concise and helpful. Get straight to the point.
- Use tools when appropriate. If a user's message maps to one of your tools, use it.
- Handle links intelligently. If a user provides a URL, treat it as a bookmark. You must generate a concise, descriptive title based on the user's message or by inferring from the URL itself. Then, call the \`createBookmark\` tool with the URL and the generated title.
- Clarify when needed. If you're unsure what the user wants, ask a clarifying question.
- Keep it conversational. If no tool seems right, just chat with the user.`,
      prompt: userMessage,
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