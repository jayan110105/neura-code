import { getReminders } from '@/lib/actions/reminders'
import { RemindersSection } from '@/components/reminders-section'

export default async function RemindersPage() {
  const reminders = await getReminders()

  return <RemindersSection reminders={reminders} />
} 