import { type Metadata } from 'next'
import { getReminders } from '@/lib/actions/reminders'
import { RemindersSection } from '@/components/reminders-section'

export const metadata: Metadata = {
  title: 'Reminders',
  description: 'Set up and manage your reminders. Never miss important events, tasks, or appointments with customizable notifications.',
}

export default async function RemindersPage() {
  const reminders = await getReminders()

  return <RemindersSection reminders={reminders} />
} 