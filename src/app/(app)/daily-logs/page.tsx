import { getDailyLogs } from '@/lib/actions/daily-logs'
import { DailyLogsSection } from '@/components/daily-logs-section'

export default async function DailyLogsPage() {
  const dailyLogs = await getDailyLogs()

  return <DailyLogsSection dailyLogs={dailyLogs} />
} 