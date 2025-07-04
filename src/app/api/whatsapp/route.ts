import { NextRequest, NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import { generateObject } from 'ai';

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

    const message = body.entry[0].changes[0].value.messages[0];
    const userMessage = message.text.body;
    const from = message.from;

    const { object: category } = await generateObject({
      model: google('models/gemini-2.5-flash'),
      system: `You are a message classifier. Classify the user's message into one of the following categories: Daily Log, Notes, Bookmark, Todo, or Reminder.`,
      prompt: userMessage,
      schema: z.object({
        category: z.enum(['Daily Log', 'Notes', 'Bookmark', 'Todo', 'Reminder']),
      }),
    });

    const typedCategory = category as { category: 'Daily Log' | 'Notes' | 'Bookmark' | 'Todo' | 'Reminder' };

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
        to: from,
        text: { body: `Categorized as: ${typedCategory.category}` },
      }),
    });

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { status: 'error', message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 