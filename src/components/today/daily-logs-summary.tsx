import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconNote } from '@tabler/icons-react'
import type { DailyLog, DailySummary } from '@/types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DailyLogsSummaryProps {
  dailyLogs: DailyLog[]
  dailySummary: DailySummary | null
}

export function DailyLogsSummary({ dailyLogs, dailySummary }: DailyLogsSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconNote className="h-5 w-5" />
            <CardTitle>Today's Logs</CardTitle>
          </div>
          <Button asChild variant="link" className="text-sm">
            <Link href="/daily-logs">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {dailySummary?.summary ? (
          <p className="text-muted-foreground leading-relaxed">{dailySummary.summary}</p>
        ) : dailyLogs.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            Summary will be generated automatically when you add logs.
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">No logs for today yet</p>
        )}
      </CardContent>
    </Card>
  )
} 