'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { IconNote, IconSparkles, IconLoader2 } from '@tabler/icons-react'
import type { DailyLog, DailySummary } from '@/types'
import { Button } from '@/components/ui/button'
import { generateTodaysSummaryAction } from '@/lib/actions/daily-summaries'
import { useFormStatus } from 'react-dom'

interface DailyLogsSummaryProps {
  dailyLogs: DailyLog[]
  dailySummary: DailySummary | null
}

function GenerateButton({ hasExistingSummary }: { hasExistingSummary: boolean }) {
  const { pending } = useFormStatus()
  
  return (
    <Button type="submit" size="sm" variant="outline" disabled={pending}>
      {pending ? (
        <IconLoader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <IconSparkles className="h-4 w-4 mr-2" />
      )}
      {pending ? 'Generating...' : hasExistingSummary ? 'Regenerate' : 'Generate'}
    </Button>
  )
}

export function DailyLogsSummary({ dailyLogs, dailySummary }: DailyLogsSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconNote className="h-5 w-5" />
            <CardTitle>Today&apos;s Logs</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {dailyLogs.length > 0 && (
              <form action={generateTodaysSummaryAction}>
                <GenerateButton hasExistingSummary={!!dailySummary?.summary} />
              </form>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {dailySummary?.summary ? (
          <p className="text-muted-foreground leading-relaxed">{dailySummary.summary}</p>
        ) : dailyLogs.length > 0 ? (
          <p className="text-muted-foreground text-sm">
            No summary generated yet for today&apos;s logs.
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">No logs for today yet</p>
        )}
      </CardContent>
    </Card>
  )
} 