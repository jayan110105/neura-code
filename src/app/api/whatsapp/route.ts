import { NextRequest, NextResponse } from 'next/server';

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

    // Process the webhook payload here.
    // For example, you could save messages to your database.

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ status: 'error', message: 'Internal Server Error' }, { status: 500 });
  }
} 