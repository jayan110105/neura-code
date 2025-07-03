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
