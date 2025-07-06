import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (process.env.CRON_SECRET_TOKEN && token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL
    
    if (!baseUrl) {
      return NextResponse.json({ 
        status: 'error', 
        message: 'Base URL not configured',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
    
    const processUrl = `${baseUrl}/api/cron/reminders/process${token ? `?token=${token}` : ''}`;
    
    // Improved fetch with timeout and retry logic
    const triggerProcessing = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      try {
        const response = await fetch(processUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        console.log('Process endpoint triggered successfully');
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Failed to trigger reminder processing:', error);
        
        // Retry once after 2 seconds
        setTimeout(async () => {
          try {
            console.log('Retrying process endpoint...');
            const retryResponse = await fetch(processUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (retryResponse.ok) {
              console.log('Process endpoint retry succeeded');
            } else {
              console.error('Process endpoint retry failed:', retryResponse.status);
            }
          } catch (retryError) {
            console.error('Process endpoint retry error:', retryError);
          }
        }, 2000);
      }
    };
    
    // Fire and forget with improved error handling
    triggerProcessing();

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