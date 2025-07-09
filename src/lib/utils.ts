import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { toZonedTime, fromZonedTime, format } from 'date-fns-tz'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatTime(timeString: string | null) {
  if (!timeString) return ''
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const minute = parseInt(minutes, 10)

  if (isNaN(hour) || isNaN(minute)) {
    return timeString
  }

  const ampm = hour >= 12 ? 'PM' : 'AM'
  const formattedHour = hour % 12 || 12
  const formattedMinutes = minute.toString().padStart(2, '0')

  return `${formattedHour}:${formattedMinutes} ${ampm}`
}

export function to24HourFormat(time: string | null): string | null {
  if (!time) return null
  const [hourMinute, period] = time.split(' ')
  const [parsedHour, minute] = hourMinute.split(':').map(Number)
  let hour = parsedHour
  if (period.toLowerCase() === 'pm' && hour !== 12) {
    hour += 12
  } else if (period.toLowerCase() === 'am' && hour === 12) {
    hour = 0
  }
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`
}

export async function sendWhatsappMessage(to: string, text: string) {
  const whatsappApiToken = process.env.WHATSAPP_API_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!whatsappApiToken || !phoneNumberId) {
    console.error('WhatsApp credentials not configured');
    return;
  }

  try {
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
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
  }
}

const IST_TIMEZONE = 'Asia/Kolkata'

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: IST_TIMEZONE
  };
  return date.toLocaleDateString('en-US', options);
}

export function formatDateTime(dateString: string, timeString: string): string {
  const formattedDate = formatDate(dateString);
  const formattedTime = formatTime(timeString);
  
  return `${formattedDate} at ${formattedTime}`;
}

export function formatLocalDate(date: Date): string {
  const istDate = toZonedTime(date, IST_TIMEZONE)
  return format(istDate, 'yyyy-MM-dd', { timeZone: IST_TIMEZONE })
}

export function getCurrentISTDate(): Date {
  return toZonedTime(new Date(), IST_TIMEZONE)
}
