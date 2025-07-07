import { type Metadata } from 'next'
import { getDailyLogs } from '@/lib/actions/daily-logs'
import { DailyLogsSection } from '@/components/daily-logs-section'

export const metadata: Metadata = {
  title: 'Daily Logs',
  description: 'Track your daily activities, mood, and reflections. Keep a personal journal and monitor your daily progress.',
}

export default async function DailyLogsPage() {
  const dailyLogs = await getDailyLogs()

  return <DailyLogsSection dailyLogs={dailyLogs} />
} 