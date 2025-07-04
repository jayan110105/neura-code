import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { getReminders } from '@/lib/actions/reminders'
import { RemindersSection } from '@/components/reminders-section'

export default async function RemindersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const reminders = await getReminders()

  return <RemindersSection reminders={reminders} />
} 