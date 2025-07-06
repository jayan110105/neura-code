import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reminders } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendWhatsappMessage } from '@/lib/utils';

function shouldSendReminder(reminder: any, currentDate: string, currentTime: string): boolean {
  if (!reminder.enabled) {
    console.log(`Reminder ${reminder.id} is disabled`);
    return false;
  }

  const reminderDate = reminder.date;
  const reminderTime = reminder.time || '00:00:00';
  const lastSent = reminder.lastSent ? new Date(reminder.lastSent) : null;
  const now = new Date(`${currentDate}T${currentTime}`);

  console.log(`Checking reminder ${reminder.id}: date=${reminderDate}, time=${reminderTime}, repeat=${reminder.repeat}, lastSent=${lastSent?.toISOString()}`);
  console.log(`Current: date=${currentDate}, time=${currentTime}`);

  let shouldSend = false;
  
  switch (reminder.repeat) {
    case 'None':
      shouldSend = reminderDate === currentDate && reminderTime <= currentTime && !lastSent;
      console.log(`None repeat: dateMatch=${reminderDate === currentDate}, timeMatch=${reminderTime <= currentTime}, notSent=${!lastSent}, shouldSend=${shouldSend}`);
      break;
    
    case 'Daily':
      shouldSend = reminderTime <= currentTime;
      if (shouldSend && lastSent) {
        const lastSentDate = lastSent.toISOString().split('T')[0];
        shouldSend = lastSentDate !== currentDate;
        console.log(`Daily repeat: timeMatch=${reminderTime <= currentTime}, lastSentDate=${lastSentDate}, currentDate=${currentDate}, shouldSend=${shouldSend}`);
      } else {
        console.log(`Daily repeat: timeMatch=${reminderTime <= currentTime}, noLastSent=${!lastSent}, shouldSend=${shouldSend}`);
      }
      break;
    
    case 'Weekly':
      const reminderDayOfWeek = new Date(reminderDate).getDay();
      const currentDayOfWeek = new Date(currentDate).getDay();
      shouldSend = reminderDayOfWeek === currentDayOfWeek && reminderTime <= currentTime;
      if (shouldSend && lastSent) {
        const weeksDiff = Math.floor((now.getTime() - lastSent.getTime()) / (7 * 24 * 60 * 60 * 1000));
        shouldSend = weeksDiff >= 1;
        console.log(`Weekly repeat: dayMatch=${reminderDayOfWeek === currentDayOfWeek}, timeMatch=${reminderTime <= currentTime}, weeksDiff=${weeksDiff}, shouldSend=${shouldSend}`);
      } else {
        console.log(`Weekly repeat: dayMatch=${reminderDayOfWeek === currentDayOfWeek}, timeMatch=${reminderTime <= currentTime}, noLastSent=${!lastSent}, shouldSend=${shouldSend}`);
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
        console.log(`Monthly repeat: dayMatch=${reminderDay === currentDay}, timeMatch=${reminderTime <= currentTime}, monthMatch=${!(lastSentMonth === currentMonth && lastSentYear === currentYear)}, shouldSend=${shouldSend}`);
      } else {
        console.log(`Monthly repeat: dayMatch=${reminderDay === currentDay}, timeMatch=${reminderTime <= currentTime}, noLastSent=${!lastSent}, shouldSend=${shouldSend}`);
      }
      break;
    
    default:
      console.log(`Unknown repeat type: ${reminder.repeat}`);
      shouldSend = false;
  }

  console.log(`Final decision for reminder ${reminder.id}: shouldSend=${shouldSend}`);
  return shouldSend;
}

async function processReminders() {
  try {
    const now = new Date();
    const currentDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
    
    console.log(`Processing reminders at ${currentDate} ${currentTime}`);
    
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
        console.log(`Skipping reminder ${reminder.id} - not time to send`);
        continue;
      }

      const scheduledDateTime = reminder.time 
        ? `${reminder.date} at ${reminder.time}`
        : reminder.date;
      
      const repeatInfo = reminder.repeat !== 'None' ? ` (${reminder.repeat})` : '';
      const message = `🔔 *Reminder*${repeatInfo}\n\n${reminder.title}${reminder.description ? `\n\n${reminder.description}` : ''}\n\n_Originally scheduled for ${scheduledDateTime}_`;

      console.log(`Attempting to send reminder: ${reminder.title} to ${reminder.user.phoneNumber}`);
      
      await sendWhatsappMessage(reminder.user.phoneNumber, message);
      
      await db
        .update(reminders)
        .set({ lastSent: new Date() })
        .where(eq(reminders.id, reminder.id));

      console.log(`Successfully sent reminder: ${reminder.title} to ${reminder.user.phoneNumber} (${reminder.repeat})`);
      processedCount++;
    }

    console.log(`Reminder processing completed. Processed: ${processedCount}`);
    return { processed: processedCount, success: true };
  } catch (error) {
    console.error('Error processing reminders:', error);
    return { processed: 0, success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    
    // Only allow internal calls or authenticated calls
    if (process.env.CRON_SECRET_TOKEN && token !== process.env.CRON_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting reminder processing...');
    const result = await processReminders();
    
    if (result.success) {
      console.log(`Reminder processing completed successfully. Processed: ${result.processed}`);
      return NextResponse.json({ 
        status: 'completed', 
        message: `Reminder processing completed successfully`,
        processed: result.processed,
        timestamp: new Date().toISOString()
      });
    } else {
      console.error('Reminder processing failed:', result.error);
      return NextResponse.json({ 
        status: 'failed', 
        message: 'Reminder processing failed',
        error: result.error,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Processing endpoint error:', error);
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