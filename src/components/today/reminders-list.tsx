"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IconAlarmFilled, IconRepeat } from "@tabler/icons-react"
import { Reminder } from "@/data/reminders"

interface RemindersListProps {
  reminders: Reminder[]
  onReminderClick?: (reminder: Reminder) => void
  onReminderToggle?: (reminderId: number) => void
}

export function RemindersList({ reminders, onReminderClick }: RemindersListProps) {
  if (reminders.length === 0) return null

  const getRepeatVariant = (repeat?: string) => {
    switch (repeat) {
      case "Daily":
        return "info"
      case "Weekly":
        return "success"
      case "Monthly":
        return "accent"
      case "None":
      case "Once":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getCategoryVariant = (category?: string) => {
    switch (category) {
      case "Work":
        return "warning"
      case "Health":
        return "destructive"
      case "Personal":
        return "success"
      case "Finance":
        return "info"
      default:
        return "secondary"
    }
  }

  const handleReminderClick = (reminder: Reminder) => {
    if (onReminderClick) {
      onReminderClick(reminder)
    }
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-medium text-foreground mb-4 flex flex-col gap-2">
        Reminders
      </h2>
      <Card className="bg-card border-none">
        <CardContent className="px-4">
          <div className="space-y-2">
            {reminders.map((reminder, index) => (
              <div 
                key={reminder.id} 
                className={`flex items-start justify-between p-2 rounded-md hover:bg-muted/50 transition-colors cursor-pointer`}
                onClick={() => handleReminderClick(reminder)}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-foreground text-sm truncate">{reminder.title}</h3>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {reminder.time && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconAlarmFilled className="w-3 h-3" />
                          <span>{reminder.time}</span>
                        </div>
                      )}
                      {reminder.repeat && reminder.repeat !== "None" && (
                        <Badge variant={getRepeatVariant(reminder.repeat) as any} className="text-xs border">
                          <IconRepeat className="w-3 h-3 mr-1" />
                          {reminder.repeat}
                        </Badge>
                      )}
                      {reminder.category && (
                        <Badge variant={getCategoryVariant(reminder.category) as any} className="text-xs border-0">
                          {reminder.category}
                        </Badge>
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