import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kolkata'
  };
  return date.toLocaleDateString('en-US', options);
}

export function formatDateTime(dateString: string, timeString: string): string {
  const formattedDate = formatDate(dateString);
  const formattedTime = formatTime(timeString);
  
  return `${formattedDate} at ${formattedTime}`;
}
