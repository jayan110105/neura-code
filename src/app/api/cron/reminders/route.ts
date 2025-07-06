import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reminders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendWhatsappMessage } from '@/lib/utils';

function shouldSendReminder(reminder: any, currentDate: string, currentTime: string): boolean {
  if (!reminder.enabled) return false;

  const reminderDate = reminder.date;
  const reminderTime = reminder.time || '00:00:00';
  const lastSent = reminder.lastSent ? new Date(reminder.lastSent) : null;
  const now = new Date(`${currentDate}T${currentTime}`);

  let shouldSend = false;
  
  switch (reminder.repeat) {
    case 'None':
      shouldSend = reminderDate === currentDate && reminderTime <= currentTime && !lastSent;
      break;
    
    case 'Daily':
      shouldSend = reminderTime <= currentTime;
      if (shouldSend && lastSent) {
        const lastSentDate = lastSent.toISOString().split('T')[0];
        shouldSend = lastSentDate !== currentDate;
      }
      break;
    
    case 'Weekly':
      const reminderDayOfWeek = new Date(reminderDate).getDay();
      const currentDayOfWeek = new Date(currentDate).getDay();
      shouldSend = reminderDayOfWeek === currentDayOfWeek && reminderTime <= currentTime;
      if (shouldSend && lastSent) {
        const weeksDiff = Math.floor((now.getTime() - lastSent.getTime()) / (7 * 24 * 60 * 60 * 1000));
        shouldSend = weeksDiff >= 1;
      }
      break;
    
    case 'Monthly':
      const reminderDay = new Date(reminderDate).getDate();
      const currentDay = new Date(currentDate).getDate();
      shouldSend = reminderDay === currentDay && reminderTime <= currentTime;
      if (shouldSend && lastSent) {
        const lastSentMonth = lastSent.getMonth();
        const lastSentYear = lastSent.getFullYear();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        shouldSend = !(lastSentMonth === currentMonth && lastSentYear === currentYear);
      }
      break;
    
    default:
      shouldSend = false;
  }

  return shouldSend;
}

async function processReminders() {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    
    const allReminders = await db.query.reminders.findMany({
      where: eq(reminders.enabled, true),
      with: {
        user: true
      }
    });

    console.log(`Found ${allReminders.length} enabled reminders to check`);

    let processedCount = 0;

    for (const reminder of allReminders) {
      if (!reminder.user?.phoneNumber) {
        console.log(`Skipping reminder ${reminder.id} - no phone number`);
        continue;
      }

      if (!shouldSendReminder(reminder, currentDate, currentTime)) {
        continue;
      }

      const scheduledDateTime = reminder.time 
        ? `${reminder.date} at ${reminder.time}`
        : reminder.date;
      
      const repeatInfo = reminder.repeat !== 'None' ? ` (${reminder.repeat})` : '';
      const message = `🔔 *Reminder*${repeatInfo}\n\n${reminder.title}${reminder.description ? `\n\n${reminder.description}` : ''}\n\n_Originally scheduled for ${scheduledDateTime}_`;

      await sendWhatsappMessage(reminder.user.phoneNumber, message);

      await db
        .update(reminders)
        .set({ lastSent: new Date() })
        .where(eq(reminders.id, reminder.id));

      console.log(`Sent reminder: ${reminder.title} to ${reminder.user.phoneNumber} (${reminder.repeat})`);
      processedCount++;
    }

    return { processed: processedCount, success: true };
  } catch (error) {
    console.error('Error processing reminders:', error);
    return { processed: 0, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    if (process.env.CRON_SECRET_TOKEN && token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = NextResponse.json({ 
      status: 'accepted', 
      message: 'Reminder processing started',
      timestamp: new Date().toISOString()
    });

    processReminders().then((result) => {
      console.log('Background reminder processing completed:', result);
    }).catch((error) => {
      console.error('Background reminder processing failed:', error);
    });

    return response;
  } catch (error) {
    console.error('Cron endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  return GET(request);
} 