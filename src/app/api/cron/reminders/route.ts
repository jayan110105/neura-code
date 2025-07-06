import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (process.env.CRON_SECRET_TOKEN && token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL
    
    const processUrl = `${baseUrl}/api/cron/reminders/process${token ? `?token=${token}` : ''}`;
    
    fetch(processUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    }).catch((error) => {
      console.error('Failed to trigger reminder processing:', error);
    });

    return NextResponse.json({ 
      status: 'accepted', 
      message: 'Reminder processing triggered',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron endpoint error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
} 