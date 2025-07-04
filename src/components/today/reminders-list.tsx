'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  IconAlarmFilled,
  IconRepeat,
  IconTagFilled,
  IconCalendarFilled,
} from '@tabler/icons-react'
import { Reminder } from '@/types'
import { formatTime } from '@/lib/utils'

interface RemindersListProps {
  reminders: Reminder[]
  onReminderClick?: (reminder: Reminder) => void
  onReminderToggle?: (reminderId: number) => void
}

export function RemindersList({
  reminders,
  onReminderClick,
}: RemindersListProps) {
  if (reminders.length === 0) return null

  const getRepeatColorClass = (repeat: string) => {
    switch (repeat) {
      case 'Daily':
        return 'text-[#2383e2]'
      case 'Weekly':
        return 'text-[#22c55e]'
      case 'Monthly':
        return 'text-[#a855f7]'
      case 'None':
        return 'text-muted-foreground'
    }
  }

  const getCategoryColorClass = (category: string) => {
    switch (category) {
      case 'Work':
        return 'text-[#ffb110]'
      case 'Health':
        return 'text-[#de5550]'
      case 'Personal':
        return 'text-[#22c55e]'
      case 'Finance':
        return 'text-[#2383e2]'
    }
  }

  const handleReminderClick = (reminder: Reminder) => {
    if (onReminderClick) {
      onReminderClick(reminder)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-foreground mb-4 flex flex-col gap-2 text-xl font-medium">
        Reminders
      </h2>
      <Card className="bg-card border-none">
        <CardContent className="px-4">
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className={`hover:bg-muted/50 flex cursor-pointer items-start justify-between rounded-md p-2 transition-colors`}
                onClick={() => handleReminderClick(reminder)}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <h3 className="text-foreground truncate text-sm font-medium">
                        {reminder.title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {reminder.date && (
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <IconCalendarFilled className="h-3 w-3" />
                          <span>
                            {new Date(reminder.date).toLocaleDateString(
                              'en-GB',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              },
                            )}
                          </span>
                        </div>
                      )}
                      {reminder.time && (
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <IconAlarmFilled className="h-3 w-3" />
                          <span>{formatTime(reminder.time)}</span>
                        </div>
                      )}
                      {reminder.repeat && reminder.repeat !== 'None' && (
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <IconRepeat
                            className={`h-3 w-3 ${getRepeatColorClass(reminder.repeat)}`}
                          />
                          {reminder.repeat}
                        </div>
                      )}
                      {reminder.category && (
                        <div className="text-muted-foreground flex items-center gap-1 text-xs">
                          <IconTagFilled
                            className={`h-3 w-3 ${getCategoryColorClass(reminder.category)}`}
                          />
                          {reminder.category}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
